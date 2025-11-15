'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { updatePassword } from '@/lib/api/auth-api';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

// 비밀번호 검증 스키마 (Story 2.1과 일치)
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(/[A-Z]/, '대문자를 포함해야 합니다')
      .regex(/[0-9]/, '숫자를 포함해야 합니다')
      .regex(/[!@#$%^&*]/, '특수문자(!@#$%^&*)를 포함해야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onTokenInvalid?: () => void;
}

export function ResetPasswordForm({
  onTokenInvalid,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await updatePassword(data.newPassword);

      if (result.error) {
        setServerError(result.error.message);

        // 토큰이 유효하지 않은 경우
        if (result.error.code === 'invalid_grant' || result.error.message.includes('올바른 링크')) {
          onTokenInvalid?.();
        }

        setIsLoading(false);
        return;
      }

      // 성공: /login으로 리다이렉트
      router.push('/login');
    } catch (error) {
      setServerError('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 비밀번호 설정</h1>
        <p className="text-sm text-gray-600 mt-2">
          새로운 비밀번호를 입력해주세요
        </p>
      </div>

      {/* 서버 에러 메시지 */}
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{serverError}</p>
          {serverError.includes('올바른 링크') && (
            <Link href="/forgot-password" className="text-sm text-red-600 hover:text-red-700 mt-2 inline-block underline">
              다시 요청하기
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 새 비밀번호 입력 */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            새 비밀번호
          </label>
          <input
            id="newPassword"
            type="password"
            placeholder="새로운 비밀번호를 입력하세요"
            {...register('newPassword')}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.newPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
          )}
          {newPassword && <PasswordStrengthMeter password={newPassword} />}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            {...register('confirmPassword')}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* 비밀번호 변경 버튼 */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            !isValid || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              변경 중...
            </span>
          ) : (
            '비밀번호 변경'
          )}
        </button>
      </form>

      {/* 로그인 링크 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
