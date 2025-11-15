'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';
import { createClient } from '@/lib/supabase/client';
import ProfileDisplay from '@/components/profile/ProfileDisplay';

/**
 * 프로필 페이지
 *
 * 기능:
 * - 현재 사용자의 프로필 정보 표시
 * - 프로필 편집 페이지로 이동
 * - 설정 페이지로 이동
 * - 계정 삭제 (TODO)
 */
export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, error, fetchProfile } = useProfileStore();
  const [userEmail, setUserEmail] = useState<string | undefined>();

  useEffect(() => {
    // 프로필 로드
    fetchProfile();

    // 사용자 이메일 가져오기
    const loadUserEmail = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    loadUserEmail();
  }, [fetchProfile]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              프로필을 불러올 수 없습니다
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
          <button
            onClick={() => fetchProfile()}
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 프로필이 없는 경우
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            프로필을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            프로필 설정을 완료해주세요.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            프로필 설정하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
          <p className="mt-2 text-gray-600">
            프로필 정보를 확인하고 수정할 수 있습니다.
          </p>
        </div>

        {/* 프로필 표시 */}
        <ProfileDisplay profile={profile} userEmail={userEmail} />
      </div>
    </div>
  );
}
