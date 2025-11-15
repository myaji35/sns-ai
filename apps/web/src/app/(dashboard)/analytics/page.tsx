'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Analytics {
  totalContents: number;
  publishedContents: number;
  pendingContents: number;
  scheduledContents: number;
  approvedContents: number;
  rejectedContents: number;
  platformBreakdown: { [key: string]: number };
  statusBreakdown: { [key: string]: number };
  reviewStatusBreakdown: { [key: string]: number };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      await fetchAnalytics();
    };

    loadData();
  }, [router]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Fetch all contents
      const { data: contents, error: fetchError } = await supabase
        .from('content_calendar')
        .select('*');

      if (fetchError) throw fetchError;

      // Calculate analytics
      const total = contents?.length || 0;
      const published = contents?.filter(c => c.status === 'published').length || 0;
      const pending = contents?.filter(c => c.status === 'pending').length || 0;
      const scheduled = contents?.filter(c => c.status === 'scheduled').length || 0;
      const approved = contents?.filter(c => c.review_status === 'approved').length || 0;
      const rejected = contents?.filter(c => c.review_status === 'rejected').length || 0;

      // Platform breakdown
      const platformBreakdown: { [key: string]: number } = {};
      contents?.forEach(c => {
        const platform = c.platform || 'unknown';
        platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
      });

      // Status breakdown
      const statusBreakdown: { [key: string]: number } = {};
      contents?.forEach(c => {
        const status = c.status || 'unknown';
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });

      // Review status breakdown
      const reviewStatusBreakdown: { [key: string]: number } = {};
      contents?.forEach(c => {
        const reviewStatus = c.review_status || 'draft';
        reviewStatusBreakdown[reviewStatus] = (reviewStatusBreakdown[reviewStatus] || 0) + 1;
      });

      setAnalytics({
        totalContents: total,
        publishedContents: published,
        pendingContents: pending,
        scheduledContents: scheduled,
        approvedContents: approved,
        rejectedContents: rejected,
        platformBreakdown,
        statusBreakdown,
        reviewStatusBreakdown,
      });
    } catch (err: any) {
      setError(err.message || '통계 데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">분석 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← 대시보드로 돌아가기
            </button>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">콘텐츠 분석 대시보드</h1>
          <p className="text-gray-600">콘텐츠 생성 및 발행 현황을 한눈에 확인하세요</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {analytics && (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">전체 콘텐츠</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalContents}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">발행 완료</p>
                    <p className="text-3xl font-bold text-green-600">
                      {analytics.publishedContents}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">예약됨</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {analytics.scheduledContents}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">대기 중</p>
                    <p className="text-3xl font-bold text-amber-600">{analytics.pendingContents}</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">플랫폼별 분포</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.platformBreakdown).map(([platform, count]) => (
                    <div key={platform} className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {platform}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.totalContents) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">검토 상태</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.reviewStatusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {status === 'draft' && '초안'}
                            {status === 'pending_review' && '검토 대기'}
                            {status === 'approved' && '승인됨'}
                            {status === 'rejected' && '거부됨'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === 'approved'
                                ? 'bg-green-600'
                                : status === 'rejected'
                                  ? 'bg-red-600'
                                  : status === 'pending_review'
                                    ? 'bg-amber-600'
                                    : 'bg-gray-400'
                            }`}
                            style={{
                              width: `${(count / analytics.totalContents) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">발행 상태 분포</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 capitalize mt-1">
                      {status === 'pending' && '대기'}
                      {status === 'scheduled' && '예약됨'}
                      {status === 'published' && '발행됨'}
                      {status === 'failed' && '실패'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
