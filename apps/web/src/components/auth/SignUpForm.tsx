'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpSchema, type SignUpFormData } from '@/lib/schemas/auth.schema';
import { signup } from '@/lib/api/auth-api';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { OAuthButtons } from './OAuthButtons';

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange', // 실시간 유효성 검사
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // Supabase Auth에 사용자 생성
      const result = await signup(data.email, data.password);

      if (result.error) {
        setServerError(result.error.message);
        setIsLoading(false);
        return;
      }

      // 회원가입 성공 → 대시보드로 이동
      if (result.user) {
        // 프로필 생성 (public.profiles 테이블)
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { error: profileError } = await supabase.from('profiles').insert({
            id: result.user.id,
            email: data.email,
          });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        } catch (err) {
          console.error('Profile creation failed:', err);
        }

        // Zustand authStore에 사용자 정보 저장
        try {
          const { useAuthStore } = await import('@/stores/authStore');
          useAuthStore.setState({ user: result.user, isAuthenticated: true });
        } catch (err) {
          console.error('Store update failed:', err);
        }

        // 대시보드로 리다이렉트
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
        <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
        <p className="text-sm text-gray-600 mt-2">
          ContentFlow AI에 가입하여 시작하세요
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            비밀번호
          </label>
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

          {/* 비밀번호 강도 표시기 */}
          {passwordValue && (
            <div className="mt-3">
              <PasswordStrengthMeter
                password={passwordValue}
                showRequirements={true}
              />
            </div>
          )}
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
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* 가입하기 버튼 */}
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
              가입 중...
            </span>
          ) : (
            '가입하기'
          )}
        </button>

        {/* 또는 구분선 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">또는</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Google OAuth 버튼 */}
        <OAuthButtons />
      </form>

      {/* 로그인 링크 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            로그인
          </Link>
        </p>
      </div>

      {/* 이메일 인증 안내 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          ℹ️ 가입 후 이메일로 인증 링크가 발송됩니다. 메일을 확인하여 계정을 활성화해주세요.
        </p>
      </div>
    </div>
  );
}
