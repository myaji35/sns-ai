'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GoogleSheetsConnectButton from '@/components/integrations/GoogleSheetsConnectButton';
import ConnectedAccountCard from '@/components/integrations/ConnectedAccountCard';

interface ConnectedAccount {
  id: string;
  platform: string;
  account_name: string;
  is_active: boolean;
  created_at: string;
  token_expires_at: string | null;
}

/**
 * 연동 관리 페이지
 *
 * Google Sheets 연동 상태를 관리하고 OAuth 플로우 결과를 처리
 */
export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const searchParams = useSearchParams();
  const supabase = createClient();

  // OAuth 콜백 결과 처리
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (success === 'true' && message) {
      setToast({ type: 'success', message: decodeURIComponent(message) });
      // URL에서 파라미터 제거
      window.history.replaceState({}, '', '/settings/integrations');
    } else if (error) {
      setToast({ type: 'error', message: decodeURIComponent(error) });
      window.history.replaceState({}, '', '/settings/integrations');
    }
  }, [searchParams]);

  // 연동된 계정 목록 로드
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('platform', 'google_sheets')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('계정 목록 로드 오류:', error);
      setToast({ type: 'error', message: '연동 계정을 불러오는데 실패했습니다' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // 토스트 자동 숨김
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const activeAccount = accounts.find(acc => acc.is_active);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">연동 관리</h1>
          <p className="mt-2 text-gray-600">
            외부 서비스와 연동하여 ContentFlow AI의 기능을 확장하세요.
          </p>
        </div>

        {/* 토스트 알림 */}
        {toast && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              toast.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Google Sheets 섹션 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Google Sheets</h2>
            <p className="text-sm text-gray-600">
              Google Sheets와 연동하여 콘텐츠 캘린더를 관리하고 AI가 생성한 콘텐츠를 자동으로 업데이트합니다.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeAccount ? (
            <ConnectedAccountCard
              account={activeAccount}
              onDisconnect={() => {
                loadAccounts();
                setToast({ type: 'success', message: '연동이 해제되었습니다' });
              }}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                아직 Google Sheets를 연동하지 않았습니다. 연동하여 콘텐츠 기획을 시작하세요.
              </p>
              <GoogleSheetsConnectButton />
            </div>
          )}
        </div>

        {/* 다른 연동 서비스 (향후 추가) */}
        <div className="bg-white shadow rounded-lg p-6 opacity-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">다른 서비스</h2>
          <p className="text-sm text-gray-600">
            더 많은 연동 서비스가 곧 추가될 예정입니다.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <span>Microsoft Excel (준비 중)</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <span>Notion (준비 중)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}