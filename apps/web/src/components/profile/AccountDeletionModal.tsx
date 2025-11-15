'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AccountDeletionModalProps {
  isOpen: boolean;
  userEmail: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/**
 * 계정 삭제 확인 스키마
 * 사용자가 입력한 이메일이 실제 이메일과 일치하는지 검증
 */
const createDeletionSchema = (userEmail: string) =>
  z.object({
    email: z
      .string()
      .email('유효한 이메일 주소를 입력하세요')
      .refine((value) => value === userEmail, {
        message: '이메일이 일치하지 않습니다',
      }),
  });

type DeletionFormData = {
  email: string;
};

/**
 * 계정 삭제 확인 모달
 *
 * 기능:
 * - 계정 삭제 경고 메시지 표시
 * - 사용자 이메일 재확인
 * - 이메일이 일치해야 삭제 버튼 활성화
 * - 취소/확인 버튼
 */
export default function AccountDeletionModal({
  isOpen,
  userEmail,
  onConfirm,
  onCancel,
}: AccountDeletionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<DeletionFormData>({
    resolver: zodResolver(createDeletionSchema(userEmail)),
    mode: 'onChange',
  });

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      reset();
    } catch (error) {
      // 에러는 부모 컴포넌트에서 처리
      console.error('계정 삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit(handleConfirmDelete)}>
          <DialogHeader>
            <DialogTitle>계정 삭제</DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-4">
                {/* 경고 메시지 */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
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
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-900 mb-1">
                        주의: 되돌릴 수 없는 작업입니다
                      </h4>
                      <p className="text-sm text-red-800">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                        프로필 정보, 게시물, 설정 등이 모두 삭제되며 복구할 수
                        없습니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 사용자 이메일 표시 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-1">삭제할 계정:</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {userEmail}
                  </p>
                </div>

                {/* 이메일 재확인 입력 */}
                <div>
                  <label
                    htmlFor="email-confirm"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    계정 삭제를 확인하려면 이메일을 입력하세요
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email-confirm"
                    placeholder={userEmail}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* 삭제될 데이터 목록 */}
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">삭제될 데이터:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>프로필 정보 (이름, 소개, 프로필 사진)</li>
                    <li>계정 인증 정보</li>
                    <li>모든 게시물 및 콘텐츠 (향후 기능)</li>
                    <li>사용자 설정</li>
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isValid || isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  삭제 중...
                </>
              ) : (
                '계정 삭제'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
