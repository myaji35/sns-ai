'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
              <p className="text-xs text-gray-500">{profile?.industry}</p>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">생성된 콘텐츠</h3>
                    <p className="text-4xl font-bold text-indigo-600">0</p>
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
                    <p className="text-4xl font-bold text-amber-600">0</p>
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
                    <p className="text-4xl font-bold text-green-600">0</p>
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
