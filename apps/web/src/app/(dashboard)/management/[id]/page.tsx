'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MemberCompany {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_number: string | null;
  business_type: string;
  industry: string | null;
  plan_type: string;
}

interface SNSAccount {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  status: string;
  follower_count: number;
  post_count: number;
}

interface GoogleSheet {
  id: string;
  sheet_name: string;
  sheet_url: string;
  publish_frequency: string;
  auto_publish: boolean;
  is_active: boolean;
  last_synced_at: string | null;
}

/**
 * 회원사 상세 페이지
 * SNS 계정 관리, 구글시트 연동, 모니터링
 */
export default function MemberCompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<MemberCompany | null>(null);
  const [snsAccounts, setSnsAccounts] = useState<SNSAccount[]>([]);
  const [googleSheets, setGoogleSheets] = useState<GoogleSheet[]>([]);
  const [selectedTab, setSelectedTab] = useState<'info' | 'sns' | 'sheets' | 'analytics'>('info');

  // 샘플 데이터
  const SAMPLE_COMPANY: MemberCompany = {
    id: '1',
    name: '맛있는 베이커리',
    email: 'bakery@example.com',
    phone: '02-1234-5678',
    business_number: '123-45-67890',
    business_type: 'small_business',
    industry: '식품/음료',
    plan_type: 'starter',
  };

  const SAMPLE_SNS: SNSAccount[] = [
    {
      id: '1',
      platform: 'instagram',
      account_name: '맛있는베이커리',
      account_id: 'tasty_bakery',
      status: 'active',
      follower_count: 2450,
      post_count: 234,
    },
    {
      id: '2',
      platform: 'facebook',
      account_name: '맛있는 베이커리',
      account_id: 'tastybakery123',
      status: 'active',
      follower_count: 1890,
      post_count: 156,
    },
    {
      id: '3',
      platform: 'naver_blog',
      account_name: '맛있는 베이커리 블로그',
      account_id: 'tastybakery',
      status: 'active',
      follower_count: 680,
      post_count: 89,
    },
  ];

  const SAMPLE_SHEETS: GoogleSheet[] = [
    {
      id: '1',
      sheet_name: '베이커리 콘텐츠 계획',
      sheet_url: 'https://docs.google.com/spreadsheets/d/abc123',
      publish_frequency: 'weekly',
      auto_publish: true,
      is_active: true,
      last_synced_at: new Date().toISOString(),
    },
  ];

  // 샘플 통계 데이터 (최근 7일)
  const SAMPLE_ANALYTICS = [
    { date: '11/09', visitors: 450, likes: 89, comments: 23, shares: 12 },
    { date: '11/10', visitors: 520, likes: 102, comments: 31, shares: 18 },
    { date: '11/11', visitors: 380, likes: 76, comments: 19, shares: 9 },
    { date: '11/12', visitors: 680, likes: 145, comments: 42, shares: 25 },
    { date: '11/13', visitors: 590, likes: 118, comments: 35, shares: 21 },
    { date: '11/14', visitors: 720, likes: 156, comments: 48, shares: 29 },
    { date: '11/15', visitors: 810, likes: 178, comments: 54, shares: 33 },
  ];

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    setIsLoading(true);
    try {
      // TODO: Load real data from DB
      setCompany(SAMPLE_COMPANY);
      setSnsAccounts(SAMPLE_SNS);
      setGoogleSheets(SAMPLE_SHEETS);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformInfo = (platform: string) => {
    const platforms: Record<string, { name: string; icon: string; color: string }> = {
      instagram: { name: 'Instagram', icon: '📷', color: 'from-purple-600 to-pink-500' },
      facebook: { name: 'Facebook', icon: '👥', color: 'from-blue-600 to-blue-700' },
      naver_blog: { name: 'Naver Blog', icon: '📝', color: 'from-green-600 to-green-700' },
      twitter: { name: 'Twitter', icon: '🐦', color: 'from-sky-500 to-sky-600' },
      youtube: { name: 'YouTube', icon: '▶️', color: 'from-red-600 to-red-700' },
    };
    return platforms[platform] || { name: platform, icon: '🔗', color: 'from-gray-600 to-gray-700' };
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      manual: '수동',
      daily: '매일',
      weekly: '주간',
      biweekly: '격주',
      monthly: '월간',
    };
    return labels[freq] || freq;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">회원사 정보를 찾을 수 없습니다.</p>
          <Link href="/management" className="mt-4 text-blue-600 hover:text-blue-700">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {company.business_type === 'small_business' && '소상공인'}
                {company.business_type === 'medium_business' && '중소기업'}
                {company.business_type === 'individual' && '개인'}
              </span>
            </div>
            <p className="text-gray-600">{company.email} • {company.business_number}</p>
          </div>
          <Link
            href="/management"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            ← 목록으로
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            {(['info', 'sns', 'sheets', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={\`pb-4 px-1 border-b-2 font-medium text-sm transition-colors \${
                  selectedTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                {tab === 'info' && '기본 정보'}
                {tab === 'sns' && 'SNS 계정'}
                {tab === 'sheets' && '구글시트'}
                {tab === 'analytics' && '모니터링'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'info' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">회원사 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">회원사명</label>
                <p className="text-gray-900">{company.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <p className="text-gray-900">{company.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <p className="text-gray-900">{company.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사업자번호</label>
                <p className="text-gray-900">{company.business_number || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">산업/업종</label>
                <p className="text-gray-900">{company.industry || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">구독 플랜</label>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {company.plan_type}
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'sns' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">SNS 계정 ({snsAccounts.length})</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + SNS 계정 추가
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snsAccounts.map((account) => {
                const platformInfo = getPlatformInfo(account.platform);
                return (
                  <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className={\`h-2 w-full bg-gradient-to-r \${platformInfo.color} rounded-full mb-4\`}></div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{platformInfo.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{platformInfo.name}</h3>
                        <p className="text-sm text-gray-500">@{account.account_id}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">계정명</span>
                        <span className="font-medium text-gray-900">{account.account_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">팔로워</span>
                        <span className="font-medium text-gray-900">{account.follower_count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">게시물</span>
                        <span className="font-medium text-gray-900">{account.post_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">상태</span>
                        <span className={\`px-2 py-1 rounded text-xs font-medium \${
                          account.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }\`}>
                          {account.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        수정
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        통계
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === 'sheets' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">구글시트 연동 ({googleSheets.length})</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + 시트 연동
              </button>
            </div>

            <div className="space-y-4">
              {googleSheets.map((sheet) => (
                <div key={sheet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{sheet.sheet_name}</h3>
                      <a
                        href={sheet.sheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 mb-4 block"
                      >
                        시트 열기 →
                      </a>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 block">발행 주기</span>
                          <span className="font-medium text-gray-900">{getFrequencyLabel(sheet.publish_frequency)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">자동 발행</span>
                          <span className={\`font-medium \${sheet.auto_publish ? 'text-green-600' : 'text-gray-900'}\`}>
                            {sheet.auto_publish ? '활성' : '비활성'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">상태</span>
                          <span className={\`font-medium \${sheet.is_active ? 'text-green-600' : 'text-red-600'}\`}>
                            {sheet.is_active ? '활성' : '비활성'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">마지막 동기화</span>
                          <span className="font-medium text-gray-900">
                            {sheet.last_synced_at ? new Date(sheet.last_synced_at).toLocaleTimeString('ko-KR') : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        설정
                      </button>
                      <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        동기화
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">최근 7일 방문자 추이</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={SAMPLE_ANALYTICS}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} name="방문자" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">최근 7일 참여 통계</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={SAMPLE_ANALYTICS}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="#10b981" name="좋아요" />
                  <Bar dataKey="comments" fill="#f59e0b" name="댓글" />
                  <Bar dataKey="shares" fill="#8b5cf6" name="공유" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 방문자</h3>
                <p className="text-3xl font-bold text-blue-600">4,150</p>
                <p className="text-xs text-green-600 mt-1">↑ 12.5% vs 지난주</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 좋아요</h3>
                <p className="text-3xl font-bold text-green-600">864</p>
                <p className="text-xs text-green-600 mt-1">↑ 8.3% vs 지난주</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 댓글</h3>
                <p className="text-3xl font-bold text-orange-600">252</p>
                <p className="text-xs text-green-600 mt-1">↑ 15.7% vs 지난주</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">평균 참여율</h3>
                <p className="text-3xl font-bold text-purple-600">6.8%</p>
                <p className="text-xs text-green-600 mt-1">↑ 2.1% vs 지난주</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
