'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ConnectAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check for success/error messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      setMessage({ type: 'success', text: 'Google Sheets가 성공적으로 연결되었습니다!' });
      setTimeout(() => setMessage(null), 5000);
    } else if (error) {
      const errorMessages: { [key: string]: string } = {
        access_denied: 'Google 계정 연결이 취소되었습니다',
        no_code: '인증 코드가 없습니다',
        auth_failed: 'Google 인증에 실패했습니다',
        not_authenticated: '먼저 로그인해주세요',
      };
      setMessage({
        type: 'error',
        text: errorMessages[error] || '알 수 없는 오류가 발생했습니다',
      });
      setTimeout(() => setMessage(null), 5000);
    }

    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load connected accounts
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id);

      setConnectedAccounts(accounts || []);
      setIsLoading(false);
    };

    loadUser();
  }, [router, searchParams]);

  const handleConnectGoogleSheets = async () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google-sheets';
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('정말로 연결을 해제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('connected_accounts').delete().eq('id', accountId);

    if (!error) {
      setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== accountId));
    }
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

  const googleSheetsAccount = connectedAccounts.find(acc => acc.platform === 'google_sheets');

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
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">외부 계정 연동</h1>
            <p className="text-gray-600">Google Sheets를 연결하여 콘텐츠 기획을 시작하세요</p>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Google Sheets Integration */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Google Sheets Icon */}
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fill="#43A047"
                        d="M37,45H11c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h19l10,10v29C40,43.657,38.657,45,37,45z"
                      />
                      <path fill="#C8E6C9" d="M40 13L30 13 30 3z" />
                      <path fill="#2E7D32" d="M30 13L40 23 40 13z" />
                      <path
                        fill="#E8F5E9"
                        d="M31,23H17c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1,1-1h14c0.552,0,1,0.448,1,1v8C32,22.552,31.552,23,31,23z"
                      />
                      <rect x="20" y="16" fill="#43A047" width="2" height="5" />
                      <rect x="24" y="16" fill="#43A047" width="2" height="5" />
                      <rect x="28" y="16" fill="#43A047" width="2" height="5" />
                      <path
                        fill="#E8F5E9"
                        d="M31,35H17c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1,1-1h14c0.552,0,1,0.448,1,1v8C32,34.552,31.552,35,31,35z"
                      />
                      <rect x="20" y="28" fill="#43A047" width="2" height="5" />
                      <rect x="24" y="28" fill="#43A047" width="2" height="5" />
                      <rect x="28" y="28" fill="#43A047" width="2" height="5" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Google Sheets</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      콘텐츠 기획 시트를 연결하여 자동으로 주제와 일정을 가져옵니다
                    </p>

                    {googleSheetsAccount ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          연결됨
                        </span>
                        <span className="text-sm text-gray-500">
                          {googleSheetsAccount.account_name || '계정 연결됨'}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        연결 안됨
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {googleSheetsAccount ? (
                    <button
                      onClick={() => handleDisconnect(googleSheetsAccount.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      연결 해제
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectGoogleSheets}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                    >
                      연결하기
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Coming Soon: Other Platforms */}
            <div className="border border-gray-200 rounded-lg p-6 opacity-60">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Facebook</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      자동으로 Facebook 페이지에 콘텐츠를 게시합니다
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      곧 출시
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 opacity-60">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Instagram</h3>
                    <p className="text-sm text-gray-600 mb-3">Instagram에 자동으로 포스팅합니다</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      곧 출시
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
