'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard page - Redirects to management page
 * Management page shows all member companies and their metrics
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to management page for member company overview
    router.replace('/management');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">회원사 대시보드로 이동 중...</p>
      </div>
    </div>
  );
}
