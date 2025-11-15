'use client';

import React, { useState } from 'react';
import { signInWithGoogle } from '@/lib/api/auth-api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface OAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function OAuthButtons({ onSuccess, onError }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();

      if (result.error) {
        setError(result.error.message);
        if (onError) {
          onError(result.error.message);
        }
        setIsLoading(false);
        return;
      }

      // Google OAuth 성공 (리다이렉트 처리)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = '알 수 없는 오류가 발생했습니다. 다시 시도해주세요';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Google 버튼 */}
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md font-medium text-gray-900 transition-colors flex items-center justify-center gap-2 ${
          isLoading
            ? 'bg-gray-200 cursor-not-allowed'
            : 'bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
        }`}
        type="button"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            Google 연결 중...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <image href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjIuNTYgMTIuMjVjMCAuNzgtLjA3IDEuNTMtLjIgMi4yNUgxMnY0LjI2aDUuOTJjLS4yNiAxLjM3LTEuMDQgMi41My0yLjIxIDMuMzF2Mi43N2g1LjU3YzIuMDgtMS45MiAzLjI4LTQuNzQgMy4yOC04LjA2eiIgZmlsbD0iIzQyODVGNCIvPjxwYXRoIGQ9Ik0xNiAyMC40NWMtLjk4LjY5LTIuMjMgMS4wOS0zLjcyIDEuMDktNC4zNSAwLTguMDQtMy4wMy04LjA0LTcuMDNzMy42OS03LjAzIDguMDQtNy4wM2MyLjA0IDAgMy44NyAxLjAyIDUuMDQgMi41OGwzLjk3LTMuOTdDMjAuODggMi4wMSAxNy43NDAgMTAgMTYuMzMgMTkuMDhjLTEuNTIgMS4wMS0zLjMyIDEuNTctNS4zNyAxLjU3LS40OCAwLS45NC0uMDQtMS4zOC0uMTJ2My4zMWgtMS4wMnYtOS45OGgtNC41djExaC40NXYtMTEuMDZoNC41djExbC45Mi0xLjMxaDMuNjNsLS45Mi0uNzdWMjAuNDV6IiBmaWxsPSIjRUE0MzM1Ii8+PHBhdGggZD0iTTEyIDMuMzNjLTIuMTQgMC00LjAyLjg3LTUuNDMgMi4zLTEuNDEgMS40My0yLjIzIDMuMzItMi4yMyA1LjQyIDAgMi4xIDAgNCAyLjIzIDUuNDJjMS40MSAxLjQzIDMuMjkgMi4zIDUuNDMgMi4zIDIuMTQgMCA0LjAyLS44NyA1LjQzLTIuM3MyLjIzLTMuMzIgMi4yMy01LjQyYzAtMi4xLS45LTQtMi4yMy01LjQyLTEuNDEtMS40My0zLjI5LTIuMy01LjQzLTIuM3oiIGZpbGw9IiMzNDQzMzEiLz48L3N2Zz4=" width="24" height="24" />
            </svg>
            Google로 계속하기
          </>
        )}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
