'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { z } from 'zod';
import { resetPassword } from '@/lib/api/auth-api';

// 이메일 검증 스키마
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '이메일 주소를 입력해주세요')
    .email('유효한 이메일 주소를 입력해주세요')
    .toLowerCase()
    .trim(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSubmitSuccess(false);

    try {
      const result = await resetPassword(data.email);

      if (result.error) {
        setServerError(result.error.message);
        setIsLoading(false);
        return;
      }

      // 성공: 메시지 표시
      setSubmitSuccess(true);
      reset();

      // 3초 후 폼 초기화
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      setServerError('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h1>
        <p className="text-sm text-gray-600 mt-2">
          가입하신 이메일 주소를 입력하세요
        </p>
      </div>

      {/* 성공 메시지 */}
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            ✓ 비밀번호 재설정 링크를 이메일로 발송했습니다. 이메일을 확인해주세요.
          </p>
        </div>
      )}

      {/* 서버 에러 메시지 */}
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 이메일 입력 */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이메일 주소
          </label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* 재설정 링크 발송 버튼 */}
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
              발송 중...
            </span>
          ) : (
            '재설정 링크 발송'
          )}
        </button>
      </form>

      {/* 로그인 링크 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          기억났으신가요?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            로그인
          </Link>
        </p>
      </div>

      {/* 회원가입 링크 */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
