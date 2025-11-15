'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/api/auth-api';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      // 로그아웃 처리
      await signOut();

      // Zustand authStore 초기화
      try {
        const { useAuthStore } = await import('@/stores/authStore');
        useAuthStore.setState({ user: null, isAuthenticated: false });
      } catch (err) {
        console.error('Store reset failed:', err);
      }

      // 로그인 페이지로 리다이렉트
      router.push('/login');
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center">
        <div className="animate-spin text-3xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">로그아웃 중...</h1>
        <p className="text-sm text-gray-600">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
