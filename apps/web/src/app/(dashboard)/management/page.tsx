'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import QuotaRechargeModal from '@/components/QuotaRechargeModal';

interface MemberCompany {
  id: string;
  name: string;
  email: string;
  business_number: string | null;
  business_type: string;
  industry: string | null;
  plan_type: string;
  user_count: number;
  content_quota: number; // 월간 컨텐츠 쿼터 (한도)
  current_quota: number; // 현재 남은 쿼터
  unit_price: number; // 컨텐츠 생성 단가 (원)
  created_at: string;
}

interface Stats {
  total_member_companies: number;
  active_members: number;
  individual_count: number;
  small_business_count: number;
  medium_business_count: number;
  total_users: number;
}

export default function ManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [memberCompanies, setMemberCompanies] = useState<MemberCompany[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<MemberCompany | null>(null);
  const [managementCompanyId, setManagementCompanyId] = useState<string | null>(null);

  const supabase = createClient();

  // 요약 정보 생성 함수
  const getSummary = (company: MemberCompany) => {
    const planTypeMap: Record<string, string> = {
      'free': 'Free',
      'starter': 'Starter',
      'business': 'Business',
      'enterprise': 'Enterprise',
    };
    const businessTypeMap: Record<string, string> = {
      'individual': '개인',
      'small_business': '소상공인',
      'medium_business': '중소기업',
    };

    const parts = [
      planTypeMap[company.plan_type] || company.plan_type,
      businessTypeMap[company.business_type] || company.business_type,
      `${company.user_count}명`,
    ];

    if (company.business_number) {
      parts.push(company.business_number);
    }

    return parts.join(' / ');
  };

  // 현재 사용자의 management company ID 가져오기
  const fetchManagementCompanyId = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    // 사용자가 로그인한 경우
    if (user) {
      const { data, error } = await supabase
        .from('organization_members')
        .select('organization_id, organizations!inner(id, organization_type)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('organizations.organization_type', 'management')
        .single();

      if (!error && data) {
        return data.organization_id;
      }
    }

    // 로그인하지 않았거나 organization을 찾지 못한 경우: 데모 모드
    // 첫 번째 management 조직을 사용
    const { data: demoOrg, error: demoError } = await supabase
      .from('organizations')
      .select('id')
      .eq('organization_type', 'management')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (demoError || !demoOrg) {
      console.error('No management organization found:', demoError);
      return null;
    }

    console.log('Using demo mode with organization:', demoOrg.id);
    return demoOrg.id;
  };

  // 회원사 목록 로드
  const loadMemberCompanies = async () => {
    if (!managementCompanyId) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('member_company_detail')
        .select('*')
        .eq('management_company_id', managementCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const companies: MemberCompany[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        business_number: item.business_number,
        business_type: item.business_type,
        industry: item.industry,
        plan_type: item.plan_type,
        user_count: item.user_count || 0,
        content_quota: item.monthly_contents_limit || 100,
        current_quota: item.current_quota || 0,
        unit_price: 5000, // TODO: organizations 테이블에 unit_price 컬럼 추가 필요
        created_at: item.created_at,
      }));

      setMemberCompanies(companies);
      updateStats(companies);
    } catch (error) {
      console.error('Error loading member companies:', error);
      alert('회원사 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 통계 계산
  const calculateStats = (companies: MemberCompany[]): Stats => {
    const individual = companies.filter(c => c.business_type === 'individual').length;
    const smallBusiness = companies.filter(c => c.business_type === 'small_business').length;
    const mediumBusiness = companies.filter(c => c.business_type === 'medium_business').length;

    return {
      total_member_companies: companies.length,
      active_members: companies.length, // TODO: subscription_status 필터 추가
      individual_count: individual,
      small_business_count: smallBusiness,
      medium_business_count: mediumBusiness,
      total_users: companies.reduce((sum, c) => sum + c.user_count, 0),
    };
  };

  const updateStats = (companies: MemberCompany[]) => {
    setStats(calculateStats(companies));
  };

  // 회원사 추가
  const handleAddCompany = async (formData: any) => {
    if (!managementCompanyId) {
      alert('관리 회사 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          parent_id: managementCompanyId,
          organization_type: 'member',
          name: formData.name,
          email: formData.email,
          business_number: formData.business_number || null,
          business_type: formData.business_type,
          industry: formData.industry || null,
          plan_type: formData.plan_type,
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString().split('T')[0],
          monthly_contents_limit: parseInt(formData.content_quota) || 100,
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      setShowAddModal(false);
      alert('회원사가 추가되었습니다.');
      await loadMemberCompanies();
    } catch (error: any) {
      console.error('Error adding member company:', error);

      let errorMessage = '회원사 추가 중 오류가 발생했습니다.';
      if (error?.message) {
        errorMessage += `\n\n상세: ${error.message}`;
      }
      if (error?.code === 'PGRST301') {
        errorMessage = '추가 권한이 없습니다. 관리자에게 문의하세요.';
      }

      alert(errorMessage);
    }
  };

  // 회원사 수정
  const handleEditCompany = async (formData: any) => {
    if (!selectedCompany) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          email: formData.email,
          business_number: formData.business_number || null,
          business_type: formData.business_type,
          industry: formData.industry || null,
          plan_type: formData.plan_type,
          monthly_contents_limit: parseInt(formData.content_quota) || 100,
          // TODO: unit_price 컬럼 추가 필요
        })
        .eq('id', selectedCompany.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedCompany(null);
      alert('회원사 정보가 수정되었습니다.');
      await loadMemberCompanies();
    } catch (error) {
      console.error('Error updating member company:', error);
      alert('회원사 수정 중 오류가 발생했습니다.');
    }
  };

  // 회원사 삭제
  const handleDeleteCompany = async (id: string) => {
    if (!confirm('정말로 이 회원사를 삭제하시겠습니까?\n\n관련된 모든 데이터(SNS 계정, 구글시트 연동 등)가 함께 삭제됩니다.')) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id)
        .eq('organization_type', 'member');

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      alert('회원사가 삭제되었습니다.');
      await loadMemberCompanies();
    } catch (error: any) {
      console.error('Error deleting member company:', error);

      // 에러 메시지를 더 자세히 표시
      let errorMessage = '회원사 삭제 중 오류가 발생했습니다.';
      if (error?.message) {
        errorMessage += `\n\n상세: ${error.message}`;
      }
      if (error?.code === 'PGRST301') {
        errorMessage = '삭제 권한이 없습니다. 관리자에게 문의하세요.';
      }

      alert(errorMessage);
    }
  };

  const openEditModal = (company: MemberCompany) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  // 필터링된 회원사 목록
  const filteredCompanies = memberCompanies.filter(company => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.business_number && company.business_number.includes(searchQuery));

    const matchesFilter = filterType === 'all' || company.business_type === filterType;

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    const init = async () => {
      const mgmtId = await fetchManagementCompanyId();
      setManagementCompanyId(mgmtId);

      // management company가 없으면 에러 표시
      if (!mgmtId) {
        console.error('No management company found for current user.');
        alert('관리 회사를 찾을 수 없습니다. 계정 설정을 확인해주세요.');
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (managementCompanyId) {
      loadMemberCompanies();
    }
  }, [managementCompanyId]);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">회원사 통합 관리 대시보드</h1>
            <p className="text-gray-600 mt-2">전체 회원사의 현황과 지표를 한눈에 관리하세요</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + 회원사 추가
            </button>
            <Link
              href="/admin/settings"
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              설정
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              홈으로
            </Link>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600 mb-1">총 회원사</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_member_companies}</p>
              <p className="text-xs text-gray-500 mt-1">개인 + 소상공인 + 중소기업</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600 mb-1">개인 사업자</p>
              <p className="text-3xl font-bold text-blue-600">{stats.individual_count}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600 mb-1">소상공인</p>
              <p className="text-3xl font-bold text-purple-600">{stats.small_business_count}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600 mb-1">중소기업</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.medium_business_count}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="회원사 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setFilterType('all')} className={filterType === 'all' ? 'px-4 py-2 rounded-lg bg-blue-600 text-white' : 'px-4 py-2 rounded-lg bg-white border border-gray-300'}>전체</button>
              <button onClick={() => setFilterType('small_business')} className={filterType === 'small_business' ? 'px-4 py-2 rounded-lg bg-blue-600 text-white' : 'px-4 py-2 rounded-lg bg-white border border-gray-300'}>소상공인</button>
              <button onClick={() => setFilterType('medium_business')} className={filterType === 'medium_business' ? 'px-4 py-2 rounded-lg bg-blue-600 text-white' : 'px-4 py-2 rounded-lg bg-white border border-gray-300'}>중소기업</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">회원사명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요약</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{getSummary(company)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 items-center">
                      <Link
                        href={`/management/${company.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="상세보기"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => openEditModal(company)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="수정"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowQuotaModal(true);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          (company.current_quota / company.content_quota) * 100 <= 10
                            ? 'text-red-600 hover:bg-red-50 animate-pulse'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title="쿼터 충전"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 회원사 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">회원사 추가</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddCompany(Object.fromEntries(formData));
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">회원사명 *</label>
                    <input type="text" name="name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                    <input type="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">사업자번호</label>
                    <input type="text" name="business_number" placeholder="123-45-67890" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">사업자 유형 *</label>
                    <select name="business_type" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="individual">개인</option>
                      <option value="small_business">소상공인</option>
                      <option value="medium_business">중소기업</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">산업/업종</label>
                    <input type="text" name="industry" placeholder="예: IT/Tech" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">구독 플랜 *</label>
                    <select name="plan_type" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="business">Business</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">컨텐츠 쿼터 (건/월)</label>
                    <input type="number" name="content_quota" defaultValue="100" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">생성 단가 (원/건)</label>
                    <input type="number" name="unit_price" placeholder="0" min="0" step="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 회원사 수정 모달 */}
        {showEditModal && selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">회원사 수정</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEditCompany(Object.fromEntries(formData));
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">회원사명 *</label>
                    <input type="text" name="name" defaultValue={selectedCompany.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                    <input type="email" name="email" defaultValue={selectedCompany.email} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">사업자번호</label>
                    <input type="text" name="business_number" defaultValue={selectedCompany.business_number || ''} placeholder="123-45-67890" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">사업자 유형 *</label>
                    <select name="business_type" defaultValue={selectedCompany.business_type} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="individual">개인</option>
                      <option value="small_business">소상공인</option>
                      <option value="medium_business">중소기업</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">산업/업종</label>
                    <input type="text" name="industry" defaultValue={selectedCompany.industry || ''} placeholder="예: IT/Tech" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">구독 플랜 *</label>
                    <select name="plan_type" defaultValue={selectedCompany.plan_type} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="business">Business</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">컨텐츠 쿼터 (건/월)</label>
                    <input type="number" name="content_quota" defaultValue={selectedCompany.content_quota} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">생성 단가 (원/건)</label>
                    <input type="number" name="unit_price" defaultValue={selectedCompany.unit_price} placeholder="0" min="0" step="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCompany(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 쿼터 충전 모달 */}
        {showQuotaModal && selectedCompany && (
          <QuotaRechargeModal
            isOpen={showQuotaModal}
            onClose={() => {
              setShowQuotaModal(false);
              setSelectedCompany(null);
            }}
            organizationId={selectedCompany.id}
            organizationName={selectedCompany.name}
            currentQuota={selectedCompany.current_quota}
            monthlyLimit={selectedCompany.content_quota}
            onSuccess={() => {
              setShowQuotaModal(false);
              setSelectedCompany(null);
              loadMemberCompanies();
            }}
          />
        )}
      </div>
    </div>
  );
}
