'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Google Sheets 연동 버튼 컴포넌트
 *
 * OAuth 플로우를 시작하는 버튼
 */
export default function GoogleSheetsConnectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // OAuth URL 생성 요청
      const response = await fetch('/api/auth/google-sheets/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '연동 준비 실패');
      }

      const { authUrl } = await response.json();

      // Google OAuth 페이지로 리다이렉트
      window.location.href = authUrl;
    } catch (err) {
      console.error('Google Sheets 연동 오류:', err);
      setError(err instanceof Error ? err.message : '연동 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className={`
          flex items-center justify-center gap-3 px-6 py-3
          bg-white border border-gray-300 rounded-lg
          hover:bg-gray-50 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        `}
      >
        {/* Google Logo */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>

        <span className="font-medium text-gray-700">
          {isLoading ? '연동 준비 중...' : 'Google Sheets 연동'}
        </span>
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}