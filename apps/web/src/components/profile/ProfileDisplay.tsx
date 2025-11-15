'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileData } from '@/lib/api/profile-api';
import { deleteAccount } from '@/lib/api/auth-api';
import Link from 'next/link';
import AccountDeletionModal from './AccountDeletionModal';

interface ProfileDisplayProps {
  profile: ProfileData;
  userEmail?: string;
}

/**
 * 프로필 정보 표시 컴포넌트
 *
 * 기능:
 * - 프로필 사진, 이름, 이메일, 소개 표시
 * - 편집 버튼
 * - 계정 삭제 버튼
 */
export default function ProfileDisplay({
  profile,
  userEmail,
}: ProfileDisplayProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    try {
      setDeleteError(null);

      // 계정 삭제 API 호출
      const response = await deleteAccount();

      if (response.error) {
        setDeleteError(response.error.message);
        return;
      }

      // 삭제 성공
      setIsDeleteModalOpen(false);

      // 성공 메시지 표시 후 로그인 페이지로 리다이렉트
      alert('계정이 삭제되었습니다.');
      router.push('/login');
    } catch (error) {
      console.error('계정 삭제 중 오류:', error);
      setDeleteError('계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* 프로필 사진 */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* 이름 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {profile.full_name}
          </h1>

          {/* 이메일 */}
          {userEmail && (
            <p className="text-sm text-gray-500 mb-4">{userEmail}</p>
          )}
        </div>

        {/* 소개 */}
        {profile.bio && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">소개</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="space-y-3">
          {/* 편집 버튼 */}
          <Link
            href="/profile/edit"
            className="block w-full px-6 py-3 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            프로필 편집
          </Link>

          {/* 설정으로 이동 */}
          <Link
            href="/settings"
            className="block w-full px-6 py-3 text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            설정
          </Link>

          {/* 계정 삭제 버튼 */}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full px-6 py-3 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            계정 삭제
          </button>
        </div>

        {/* 에러 메시지 표시 */}
        {deleteError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{deleteError}</p>
          </div>
        )}
      </div>

      {/* 계정 삭제 확인 모달 */}
      {userEmail && (
        <AccountDeletionModal
          isOpen={isDeleteModalOpen}
          userEmail={userEmail}
          onConfirm={handleDeleteAccount}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}
