'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface GoogleSheet {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for success message
    const importStatus = searchParams.get('import');
    const count = searchParams.get('count');
    if (importStatus === 'success' && count) {
      setSuccessMessage(`✅ ${count}개의 콘텐츠 항목이 성공적으로 import되었습니다!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Check if Google Sheets is connected
      const { data: account } = await supabase
        .from('connected_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'google_sheets')
        .eq('is_active', true)
        .single();

      if (!account) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      setIsConnected(true);

      // Fetch Google Sheets list
      try {
        const response = await fetch('/api/sheets/list');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch sheets');
        }

        const data = await response.json();
        setSheets(data.sheets || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← 대시보드로 돌아가기
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              로그아웃
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Google Sheets 연결 필요</h2>
            <p className="text-gray-600 mb-6">
              콘텐츠 캘린더를 사용하려면 먼저 Google Sheets를 연결해주세요
            </p>
            <button
              onClick={() => router.push('/connect')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
            >
              Google Sheets 연결하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← 대시보드로 돌아가기
            </button>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">콘텐츠 캘린더</h1>
          <p className="text-gray-600">
            Google Sheets에서 콘텐츠 기획 시트를 선택하세요
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {sheets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-4">Google Sheets를 찾을 수 없습니다</p>
            <p className="text-sm text-gray-500">
              Google Drive에 스프레드시트를 만들어주세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sheets.map((sheet) => (
              <div
                key={sheet.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition cursor-pointer"
                onClick={() => {
                  router.push(`/calendar/import/${sheet.id}`);
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#43A047" d="M37,45H11c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h19l10,10v29C40,43.657,38.657,45,37,45z"/>
                      <path fill="#C8E6C9" d="M40 13L30 13 30 3z"/>
                      <path fill="#2E7D32" d="M30 13L40 23 40 13z"/>
                      <rect x="20" y="16" fill="#E8F5E9" width="2" height="5"/>
                      <rect x="24" y="16" fill="#43A047" width="2" height="5"/>
                      <rect x="28" y="16" fill="#43A047" width="2" height="5"/>
                      <rect x="20" y="28" fill="#E8F5E9" width="2" height="5"/>
                      <rect x="24" y="28" fill="#43A047" width="2" height="5"/>
                      <rect x="28" y="28" fill="#43A047" width="2" height="5"/>
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {sheet.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      수정: {new Date(sheet.modifiedTime).toLocaleDateString('ko-KR')}
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={sheet.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Google Sheets에서 열기 →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
