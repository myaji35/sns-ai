'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  // 토큰이 없거나 유효하지 않은 경우
  if (!token || isTokenInvalid) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            유효하지 않은 링크
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            비밀번호 재설정 링크가 올바르지 않거나 만료되었습니다.
          </p>
          <a
            href="/forgot-password"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            다시 요청하기
          </a>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm onTokenInvalid={() => setIsTokenInvalid(true)} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Suspense fallback={<div className="text-center">로딩 중...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
