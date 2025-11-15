'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MemberCompany {
  id: string;
  name: string;
  email: string;
  business_number: string | null;
  business_type: string;
  industry: string | null;
  plan_type: string;
  user_count: number;
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

  const SAMPLE_COMPANIES: MemberCompany[] = [
    {
      id: '1',
      name: '맛있는 베이커리',
      email: 'bakery@example.com',
      business_number: '123-45-67890',
      business_type: 'small_business',
      industry: '음식/음료',
      plan_type: 'starter',
      user_count: 3,
      created_at: '2025-01-15',
    },
    {
      id: '2',
      name: '스마트 카페',
      email: 'cafe@example.com',
      business_number: '234-56-78901',
      business_type: 'small_business',
      industry: '음식/음료',
      plan_type: 'business',
      user_count: 5,
      created_at: '2025-02-01',
    },
    {
      id: '3',
      name: '테크 스타트업',
      email: 'startup@example.com',
      business_number: '345-67-89012',
      business_type: 'medium_business',
      industry: 'IT/Tech',
      plan_type: 'business',
      user_count: 12,
      created_at: '2025-02-10',
    },
    {
      id: '4',
      name: '패션 부티크',
      email: 'boutique@example.com',
      business_number: '456-78-90123',
      business_type: 'individual',
      industry: '패션/의류',
      plan_type: 'free',
      user_count: 1,
      created_at: '2025-03-01',
    },
  ];

  const SAMPLE_STATS: Stats = {
    total_member_companies: 4,
    active_members: 4,
    individual_count: 1,
    small_business_count: 2,
    medium_business_count: 1,
    total_users: 21,
  };

  useEffect(() => {
    setMemberCompanies(SAMPLE_COMPANIES);
    setStats(SAMPLE_STATS);
    setIsLoading(false);
  }, []);

  const filteredCompanies = memberCompanies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.business_number && company.business_number.includes(searchQuery));
    const matchesFilter = filterType === 'all' || company.business_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">회원사 통합 관리 대시보드</h1>
            <p className="mt-2 text-gray-600">전체 회원사의 현황과 지표를 한눈에 관리하세요</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">홈으로</Link>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600 mb-1">총 회원사</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_member_companies}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600 mb-1">총 사용자</p>
              <p className="text-3xl font-bold text-green-600">{stats.total_users}</p>
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사업자번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">플랜</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
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
                  <td className="px-6 py-4 text-sm text-gray-900">{company.business_number || '-'}</td>
                  <td className="px-6 py-4 text-sm">{company.business_type}</td>
                  <td className="px-6 py-4 text-sm">{company.plan_type}</td>
                  <td className="px-6 py-4 text-sm">{company.user_count}명</td>
                  <td className="px-6 py-4">
                    <Link href={`/management/${company.id}`} className="text-blue-600 hover:text-blue-700">상세보기</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
