'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInSchema, type SignInFormData } from '@/lib/schemas/auth.schema';
import { signIn } from '@/lib/api/auth-api';
import { useAuthStore } from '@/stores/authStore';
import { OAuthButtons } from './OAuthButtons';

export function LogInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await signIn(data.email, data.password);

      if (result.error) {
        setServerError(result.error.message);
        setIsLoading(false);
        return;
      }

      // 로그인 성공 → authStore 업데이트 → 대시보드로 이동
      if (result.user) {
        setUser(result.user);
        router.push('/dashboard');
      }
    } catch (error) {
      setServerError('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="text-sm text-gray-600 mt-2">
          ContentFlow AI에 로그인하세요
        </p>
      </div>

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

        {/* 비밀번호 입력 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              잊으셨나요?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            {...register('password')}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* 로그인 버튼 */}
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
              로그인 중...
            </span>
          ) : (
            '로그인'
          )}
        </button>
      </form>

      {/* 또는 구분선 */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-sm text-gray-500">또는</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Google OAuth 버튼 */}
      <OAuthButtons />

      {/* 회원가입 링크 */}
      <div className="mt-6 text-center">
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
