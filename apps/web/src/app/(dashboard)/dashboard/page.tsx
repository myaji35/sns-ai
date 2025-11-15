'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// 샘플 데이터
const SAMPLE_STATS = {
  contents_generated: 24,
  contents_in_review: 3,
  distributions_published: 18,
  ai_requests_this_month: 156,
  approval_rate: 87.5,
};

const SAMPLE_WEEKLY_DATA = [
  { day: '월', contents: 4 },
  { day: '화', contents: 6 },
  { day: '수', contents: 3 },
  { day: '목', contents: 5 },
  { day: '금', contents: 4 },
  { day: '토', contents: 1 },
  { day: '일', contents: 1 },
];

const SAMPLE_RECENT_ACTIVITIES = [
  { id: 1, type: 'content_generated', title: 'AI 트렌드 2025: 주목해야 할 5가지 기술', time: '10분 전' },
  { id: 2, type: 'content_approved', title: '효율적인 콘텐츠 마케팅 전략', time: '1시간 전' },
  { id: 3, type: 'distribution_published', title: 'SNS 마케팅 성공 사례 분석', platform: 'Instagram', time: '2시간 전' },
  { id: 4, type: 'content_generated', title: '데이터 분석으로 보는 소비자 트렌드', time: '3시간 전' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(SAMPLE_STATS);
  const [weeklyData, setWeeklyData] = useState(SAMPLE_WEEKLY_DATA);
  const [recentActivities, setRecentActivities] = useState(SAMPLE_RECENT_ACTIVITIES);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profileData);

        // TODO: Load real stats from usage_stats table
        // For now, using sample data
      } else {
        // 데모 모드: 샘플 프로필 사용
        setProfile({
          company_name: '데모 회사',
          industry: 'IT/Tech',
          business_type: 'small_business',
          business_number: '123-45-67890',
        });
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-indigo-600">ContentFlow AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile?.company_name || user?.email}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {profile?.industry && <span>{profile.industry}</span>}
                {profile?.business_type && (
                  <>
                    <span>•</span>
                    <span>
                      {profile.business_type === 'individual' && '개인'}
                      {profile.business_type === 'small_business' && '소상공인'}
                      {profile.business_type === 'medium_business' && '중소기업'}
                      {profile.business_type === 'enterprise' && '대기업'}
                    </span>
                  </>
                )}
                {profile?.business_number && (
                  <>
                    <span>•</span>
                    <span>{profile.business_number}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push('/management')}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition shadow-md"
            >
              회원사 관리
            </button>
            <button
              onClick={() => router.push('/organization')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              조직 관리
            </button>
            <button
              onClick={() => router.push('/analytics')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              분석
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              AI 설정
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              프로필 편집
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1920px] mx-auto">
        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900">
                안녕하세요, {profile?.company_name || '사용자'}님!
              </h2>
              <p className="text-gray-600 mt-2">
                내실있고 자연스러운 콘텐츠를 AI로 자동 생성하세요
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">생성된 콘텐츠</h3>
                    <p className="text-4xl font-bold text-indigo-600">{stats.contents_generated}</p>
                    <p className="text-xs text-gray-500 mt-1">이번 달</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
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

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">검토 대기</h3>
                    <p className="text-4xl font-bold text-amber-600">{stats.contents_in_review}</p>
                    <p className="text-xs text-gray-500 mt-1">대기 중</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">배포 완료</h3>
                    <p className="text-4xl font-bold text-green-600">{stats.distributions_published}</p>
                    <p className="text-xs text-gray-500 mt-1">이번 달</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
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

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">승인율</h3>
                    <p className="text-4xl font-bold text-blue-600">{stats.approval_rate}%</p>
                    <p className="text-xs text-gray-500 mt-1">평균 품질</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Chart & Usage Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Activity Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">주간 활동</h2>
                <div className="flex items-end justify-between h-48 gap-2">
                  {weeklyData.map((day) => {
                    const maxContents = Math.max(...weeklyData.map(d => d.contents));
                    const height = (day.contents / maxContents) * 100;
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-indigo-100 rounded-t-lg relative group cursor-pointer hover:bg-indigo-200 transition-colors">
                          <div
                            className="w-full bg-indigo-600 rounded-t-lg transition-all"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          >
                          </div>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.contents}개
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">이번 달 사용량</h2>
                <div className="space-y-4">
                  {/* AI Requests */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">AI 요청</span>
                      <span className="font-medium text-gray-900">{stats.ai_requests_this_month} / 1,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${(stats.ai_requests_this_month / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Contents */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">콘텐츠 생성</span>
                      <span className="font-medium text-gray-900">{stats.contents_generated} / 100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                        style={{ width: `${(stats.contents_generated / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Distributions */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">배포</span>
                      <span className="font-medium text-gray-900">{stats.distributions_published} / 500</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full"
                        style={{ width: `${(stats.distributions_published / 500) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      다음 리셋: {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                <h2 className="text-xl font-bold mb-2">AI 콘텐츠 생성</h2>
                <p className="text-indigo-100 mb-4 text-sm">AI로 블로그 포스트를 자동 생성하세요</p>
                <button
                  onClick={() => router.push('/generate')}
                  className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition shadow-md"
                >
                  콘텐츠 생성하기 🚀
                </button>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-md p-6 text-white">
                <h2 className="text-xl font-bold mb-2">콘텐츠 관리</h2>
                <p className="text-rose-100 mb-4 text-sm">생성된 콘텐츠를 관리하고 발행하세요</p>
                <button
                  onClick={() => router.push('/content')}
                  className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition shadow-md"
                >
                  콘텐츠 관리
                </button>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
                <h2 className="text-xl font-bold mb-2">Google Sheets 연동</h2>
                <p className="text-emerald-100 mb-4 text-sm">
                  콘텐츠 아이디어를 자동으로 가져오세요
                </p>
                <button
                  onClick={() => router.push('/connect')}
                  className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition shadow-md"
                >
                  연결하기
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
                <h2 className="text-xl font-bold mb-2">콘텐츠 Import</h2>
                <p className="text-amber-100 mb-4 text-sm">Google Sheets에서 콘텐츠 가져오기</p>
                <button
                  onClick={() => router.push('/calendar')}
                  className="px-6 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition shadow-md"
                >
                  Import 하기
                </button>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 활동</h2>
              {recentActivities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                  <p className="text-sm">아직 생성된 콘텐츠가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'content_generated':
                          return { icon: '✨', color: 'bg-indigo-100 text-indigo-600' };
                        case 'content_approved':
                          return { icon: '✅', color: 'bg-green-100 text-green-600' };
                        case 'distribution_published':
                          return { icon: '🚀', color: 'bg-blue-100 text-blue-600' };
                        default:
                          return { icon: '📝', color: 'bg-gray-100 text-gray-600' };
                      }
                    };

                    const { icon, color } = getActivityIcon(activity.type);

                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-lg flex-shrink-0`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{activity.time}</span>
                            {activity.type === 'distribution_published' && activity.platform && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {activity.platform}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Google Ads Sidebar */}
        <aside className="hidden xl:block w-80 bg-white border-l border-gray-200 p-6">
          <div className="sticky top-6 space-y-6">
            {/* Ad Slot 1 - Skyscraper */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
                <p className="text-xs text-gray-500 font-medium">Google AdSense</p>
                <p className="text-xs text-gray-400 mt-1">300x600</p>
              </div>
            </div>

            {/* Ad Slot 2 - Medium Rectangle */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300 h-[250px] flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-10 h-10 mx-auto mb-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
                <p className="text-xs text-gray-500 font-medium">Google AdSense</p>
                <p className="text-xs text-gray-400 mt-1">300x250</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
