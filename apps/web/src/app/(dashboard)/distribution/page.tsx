'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface DistributionJob {
  id: string;
  content_id: string;
  platform: string;
  status: string;
  scheduled_for: string | null;
  published_at: string | null;
  error_message: string | null;
  platform_url: string | null;
  created_at: string;
  generated_contents: {
    title: string | null;
    main_topic: string | null;
  } | null;
  connected_accounts: {
    account_name: string | null;
  } | null;
}

/**
 * 배포 상태 모니터링 페이지 (Story 6.10)
 *
 * 배포 작업 추적 및 관리
 */
export default function DistributionPage() {
  const [jobs, setJobs] = useState<DistributionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'failed'>('all');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadDistributionJobs();
    subscribeToUpdates();
  }, [filter]);

  const loadDistributionJobs = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      let query = supabase
        .from('distribution_jobs')
        .select(`
          *,
          generated_contents (title, main_topic),
          connected_accounts (account_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (!error && data) {
        setJobs(data);
      }
    } catch (error) {
      console.error('배포 작업 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('distribution-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'distribution_jobs',
        },
        () => {
          loadDistributionJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRetry = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('distribution_jobs')
        .update({
          status: 'pending',
          error_message: null,
          error_details: null,
        })
        .eq('id', jobId);

      if (!error) {
        loadDistributionJobs();
      }
    } catch (error) {
      console.error('재시도 오류:', error);
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!confirm('이 배포 작업을 취소하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('distribution_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      if (!error) {
        loadDistributionJobs();
      }
    } catch (error) {
      console.error('취소 오류:', error);
    }
  };

  const getPlatformInfo = (platform: string) => {
    const platforms: Record<string, { name: string; icon: string; color: string }> = {
      instagram: { name: 'Instagram', icon: '📷', color: 'bg-gradient-to-br from-purple-600 to-pink-500' },
      facebook: { name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
      naver_blog: { name: 'Naver Blog', icon: '📝', color: 'bg-green-600' },
    };
    return platforms[platform] || { name: platform, icon: '🔗', color: 'bg-gray-600' };
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-700', text: '대기중', icon: '⏱️' },
      processing: { color: 'bg-blue-100 text-blue-700', text: '처리중', icon: '⚡' },
      published: { color: 'bg-green-100 text-green-700', text: '게시됨', icon: '✅' },
      failed: { color: 'bg-red-100 text-red-700', text: '실패', icon: '❌' },
      cancelled: { color: 'bg-gray-100 text-gray-700', text: '취소됨', icon: '🚫' },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badge.color} flex items-center gap-1`}>
        <span>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    published: jobs.filter(j => j.status === 'published').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">배포 현황</h1>
          <p className="mt-2 text-gray-600">
            콘텐츠 배포 작업을 추적하고 관리하세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">전체 작업</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">대기중</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">게시 완료</div>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">실패</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'published', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'all' && '전체'}
              {status === 'pending' && '대기중'}
              {status === 'published' && '게시 완료'}
              {status === 'failed' && '실패'}
            </button>
          ))}
        </div>

        {/* 배포 작업 목록 */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <p className="text-gray-600 mb-4">
              {filter === 'all' ? '배포 작업이 없습니다.' : `${filter} 상태의 작업이 없습니다.`}
            </p>
            <Link
              href="/content"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              콘텐츠 보러가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const platformInfo = getPlatformInfo(job.platform);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* 플랫폼 아이콘 */}
                    <div className={`w-12 h-12 ${platformInfo.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                      {platformInfo.icon}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.generated_contents?.title || job.generated_contents?.main_topic || '제목 없음'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            {getStatusBadge(job.status)}
                            <span className="text-sm text-gray-600">{platformInfo.name}</span>
                            {job.connected_accounts?.account_name && (
                              <span className="text-sm text-gray-500">
                                {job.connected_accounts.account_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 스케줄 정보 */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span>생성:</span>
                          <span>{new Date(job.created_at).toLocaleString('ko-KR')}</span>
                        </div>
                        {job.scheduled_for && (
                          <div className="flex items-center gap-2">
                            <span>⏰ 예약:</span>
                            <span className="font-medium">
                              {new Date(job.scheduled_for).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        )}
                        {job.published_at && (
                          <div className="flex items-center gap-2">
                            <span>✅ 게시됨:</span>
                            <span className="font-medium">
                              {new Date(job.published_at).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        )}
                        {job.platform_url && (
                          <div className="flex items-center gap-2">
                            <a
                              href={job.platform_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <span>🔗 게시물 보기</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* 에러 메시지 */}
                      {job.error_message && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700">{job.error_message}</p>
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-2">
                      {job.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(job.id)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          🔄 재시도
                        </button>
                      )}
                      {job.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(job.id)}
                          className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          취소
                        </button>
                      )}
                      <Link
                        href={`/content/edit/${job.content_id}`}
                        className="px-4 py-2 text-sm text-center border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        콘텐츠 보기
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
