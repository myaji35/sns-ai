'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ConnectedAccount {
  id: string;
  platform: string;
  account_name: string | null;
  account_email: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
}

/**
 * 연결된 계정 관리 페이지 (Story 6.4)
 *
 * SNS 플랫폼 OAuth 연동 및 관리
 */
export default function ConnectedAccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAccounts(data);
      }
    } catch (error) {
      console.error('계정 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    // OAuth 플로우 시작
    const redirectUrl = `${window.location.origin}/api/auth/${platform}/callback`;

    // 플랫폼별 OAuth URL (실제로는 각 플랫폼의 OAuth 설정 필요)
    const oauthUrls: Record<string, string> = {
      instagram: `https://api.instagram.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUrl}&scope=user_profile,user_media&response_type=code`,
      facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUrl}&scope=pages_manage_posts,pages_read_engagement&response_type=code`,
      naver_blog: `https://nid.naver.com/oauth2.0/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUrl}&response_type=code&state=RANDOM_STATE`,
    };

    // 개발 모드에서는 임시 계정 추가
    if (process.env.NODE_ENV === 'development') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          platform,
          account_name: `${platform}_test_account`,
          account_email: `test@${platform}.com`,
          is_active: true,
        });

      if (!error) {
        loadConnectedAccounts();
      }
    } else {
      // 실제 OAuth 플로우
      window.location.href = oauthUrls[platform] || '#';
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('이 계정 연결을 해제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('connected_accounts')
        .delete()
        .eq('id', accountId);

      if (!error) {
        setAccounts(accounts.filter(a => a.id !== accountId));
      }
    } catch (error) {
      console.error('연결 해제 오류:', error);
    }
  };

  const handleToggleActive = async (accountId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('connected_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', accountId);

      if (!error) {
        setAccounts(accounts.map(a =>
          a.id === accountId ? { ...a, is_active: !currentStatus } : a
        ));
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
    }
  };

  const getPlatformInfo = (platform: string) => {
    const platforms: Record<string, { name: string; icon: string; color: string }> = {
      instagram: { name: 'Instagram', icon: '📷', color: 'bg-gradient-to-br from-purple-600 to-pink-500' },
      facebook: { name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
      naver_blog: { name: 'Naver Blog', icon: '📝', color: 'bg-green-600' },
      linkedin: { name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
      twitter: { name: 'Twitter', icon: '🐦', color: 'bg-sky-500' },
    };

    return platforms[platform] || { name: platform, icon: '🔗', color: 'bg-gray-600' };
  };

  const availablePlatforms = ['instagram', 'facebook', 'naver_blog'];
  const connectedPlatforms = new Set(accounts.map(a => a.platform));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">연결된 계정</h1>
          <p className="mt-2 text-gray-600">
            SNS 플랫폼을 연결하여 자동으로 콘텐츠를 게시하세요.
          </p>
        </div>

        {/* 플랫폼 연결 카드 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">플랫폼 연결</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availablePlatforms.map((platform) => {
              const info = getPlatformInfo(platform);
              const isConnected = connectedPlatforms.has(platform);

              return (
                <div
                  key={platform}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className={`w-12 h-12 ${info.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {info.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {isConnected ? '연결됨' : '연결되지 않음'}
                  </p>
                  <button
                    onClick={() => handleConnect(platform)}
                    disabled={isConnected}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      isConnected
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isConnected ? '이미 연결됨' : '연결하기'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 연결된 계정 목록 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            연결된 계정 ({accounts.length})
          </h2>

          {accounts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-4">🔗</div>
              <p className="text-gray-600 mb-4">
                연결된 계정이 없습니다.
              </p>
              <p className="text-sm text-gray-500">
                위에서 플랫폼을 선택하여 계정을 연결하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => {
                const info = getPlatformInfo(account.platform);

                return (
                  <div
                    key={account.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${info.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {info.name}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                account.is_active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {account.is_active ? '활성' : '비활성'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {account.account_name && (
                              <p>계정명: {account.account_name}</p>
                            )}
                            {account.account_email && (
                              <p>이메일: {account.account_email}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              연결됨: {new Date(account.created_at).toLocaleDateString('ko-KR')}
                            </p>
                            {account.last_synced_at && (
                              <p className="text-xs text-gray-500">
                                마지막 동기화: {new Date(account.last_synced_at).toLocaleString('ko-KR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(account.id, account.is_active)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            account.is_active
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {account.is_active ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleDisconnect(account.id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          연결 해제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 도움말 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 참고사항</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 계정을 연결하면 승인된 콘텐츠를 자동으로 해당 플랫폼에 게시할 수 있습니다.</li>
            <li>• 비활성화된 계정은 자동 게시에서 제외됩니다.</li>
            <li>• OAuth 토큰은 안전하게 암호화되어 저장됩니다.</li>
            <li>• 토큰은 만료 전 자동으로 갱신됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
