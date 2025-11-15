'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ConnectedAccount {
  id: string;
  platform: string;
  account_name: string;
  is_active: boolean;
  created_at: string;
  token_expires_at: string | null;
}

interface ConnectedAccountCardProps {
  account: ConnectedAccount;
  onDisconnect?: () => void;
}

/**
 * 연동된 계정 정보 표시 컴포넌트
 *
 * Google Sheets 연동 계정 정보를 표시하고 연동 해제 기능 제공
 */
export default function ConnectedAccountCard({ account, onDisconnect }: ConnectedAccountCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const supabase = createClient();

  const handleDisconnect = async () => {
    if (!confirm('정말 Google Sheets 연동을 해제하시겠습니까?')) {
      return;
    }

    setIsDisconnecting(true);

    try {
      const { error } = await supabase
        .from('connected_accounts')
        .update({ is_active: false })
        .eq('id', account.id);

      if (error) throw error;

      // 성공 시 콜백 호출
      onDisconnect?.();
    } catch (error) {
      console.error('연동 해제 오류:', error);
      alert('연동 해제 중 오류가 발생했습니다');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // 토큰 만료 시간 계산
  const getTokenStatus = () => {
    if (!account.token_expires_at) {
      return { status: 'unknown', text: '상태 확인 불가' };
    }

    const expiresAt = new Date(account.token_expires_at);
    const now = new Date();
    const hoursLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (hoursLeft < 0) {
      return { status: 'expired', text: '토큰 만료됨' };
    } else if (hoursLeft < 1) {
      return { status: 'expiring', text: '곧 갱신 예정' };
    } else {
      return { status: 'active', text: `${hoursLeft}시간 후 갱신` };
    }
  };

  const tokenStatus = getTokenStatus();

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Google Sheets Icon */}
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                fill="#0F9D58"
              />
              <path d="M14 2V8H20" fill="#87CEAC" />
              <path
                d="M8 13H16M8 17H16M8 9H10"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Google Sheets</h3>
            <p className="text-sm text-gray-600 mt-1">{account.account_name}</p>

            <div className="flex items-center gap-4 mt-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  account.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {account.is_active ? '연동됨' : '비활성'}
              </span>

              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tokenStatus.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : tokenStatus.status === 'expiring'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {tokenStatus.text}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              연동일: {new Date(account.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
        >
          {isDisconnecting ? '해제 중...' : '연동 해제'}
        </button>
      </div>
    </div>
  );
}