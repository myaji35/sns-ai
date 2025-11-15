'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';
import ProfileEditForm from '@/components/profile/ProfileEditForm';

/**
 * 프로필 편집 페이지
 *
 * 기능:
 * - 프로필 정보 수정
 * - 프로필 사진 변경
 * - 변경사항 감지 및 확인
 * - 저장 후 프로필 페이지로 리다이렉트
 */
export default function ProfileEditPage() {
  const router = useRouter();
  const { profile, loading, fetchProfile } = useProfileStore();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 프로필 로드
    fetchProfile();
  }, [fetchProfile]);

  const handleSuccess = () => {
    setIsLeaving(true);
    // 성공 메시지 표시 (간단한 알림)
    alert('프로필이 수정되었습니다');
    // 프로필 페이지로 리다이렉트
    router.push('/profile');
  };

  const handleCancel = () => {
    setIsLeaving(true);
    router.push('/profile');
  };

  // 페이지 이탈 방지 (변경사항이 있을 때)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isLeaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLeaving]);

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

  // 프로필이 없는 경우
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            프로필을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            프로필 설정을 먼저 완료해주세요.
          </p>
          <button
            onClick={() => router.push('/profile-onboarding')}
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
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">프로필 편집</h1>
          <p className="mt-2 text-gray-600">
            프로필 정보를 수정할 수 있습니다.
          </p>
        </div>

        {/* 편집 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <ProfileEditForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}
