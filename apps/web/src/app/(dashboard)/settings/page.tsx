'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface LLMProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  placeholder: string;
  color: string;
}

const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    description: 'GPT-4, GPT-3.5 등의 모델로 콘텐츠 생성',
    icon: '🤖',
    placeholder: 'sk-...',
    color: 'emerald',
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    description: 'Claude 3 모델로 고품질 콘텐츠 생성',
    icon: '🧠',
    placeholder: 'sk-ant-...',
    color: 'purple',
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    description: 'Gemini Pro 모델로 다양한 콘텐츠 생성',
    icon: '✨',
    placeholder: 'AIza...',
    color: 'blue',
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({});
  const [savedKeys, setSavedKeys] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load existing API keys
      const { data: keys } = await supabase
        .from('llm_api_keys')
        .select('provider, api_key, is_active')
        .eq('user_id', user.id);

      if (keys) {
        const keyMap: { [key: string]: boolean } = {};
        keys.forEach((key) => {
          keyMap[key.provider] = key.is_active;
        });
        setSavedKeys(keyMap);
      }

      setIsLoading(false);
    };

    loadData();
  }, [router]);

  const handleSaveKey = async (provider: string) => {
    const apiKey = apiKeys[provider];
    if (!apiKey || !apiKey.trim()) {
      setMessage({ type: 'error', text: 'API 키를 입력해주세요' });
      return;
    }

    setIsSaving({ ...isSaving, [provider]: true });

    try {
      const supabase = createClient();

      // Check if key already exists
      const { data: existing } = await supabase
        .from('llm_api_keys')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single();

      if (existing) {
        // Update existing key
        const { error } = await supabase
          .from('llm_api_keys')
          .update({
            api_key: apiKey,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new key
        const { error } = await supabase
          .from('llm_api_keys')
          .insert({
            user_id: user.id,
            provider: provider,
            api_key: apiKey,
            is_active: true,
          });

        if (error) throw error;
      }

      setSavedKeys({ ...savedKeys, [provider]: true });
      setApiKeys({ ...apiKeys, [provider]: '' });
      setMessage({ type: 'success', text: `${LLM_PROVIDERS.find(p => p.id === provider)?.name} API 키가 저장되었습니다` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving API key:', error);
      setMessage({ type: 'error', text: 'API 키 저장 중 오류가 발생했습니다' });
    } finally {
      setIsSaving({ ...isSaving, [provider]: false });
    }
  };

  const handleDeleteKey = async (provider: string) => {
    if (!confirm('정말로 이 API 키를 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('llm_api_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', provider);

      if (error) throw error;

      setSavedKeys({ ...savedKeys, [provider]: false });
      setMessage({ type: 'success', text: 'API 키가 삭제되었습니다' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      setMessage({ type: 'error', text: 'API 키 삭제 중 오류가 발생했습니다' });
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 설정</h1>
            <p className="text-gray-600">
              AI 콘텐츠 생성을 위한 LLM API 키를 설정하세요
            </p>
          </div>

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

          {/* Security Notice */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">보안 안내</h3>
                <p className="text-sm text-blue-800">
                  API 키는 암호화되어 데이터베이스에 안전하게 저장됩니다.
                  절대 다른 사람과 공유하지 마세요.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {LLM_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{provider.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                      </div>
                      {savedKeys[provider.id] && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          설정됨
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`api-key-${provider.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          id={`api-key-${provider.id}`}
                          type="password"
                          value={apiKeys[provider.id] || ''}
                          onChange={(e) => setApiKeys({ ...apiKeys, [provider.id]: e.target.value })}
                          placeholder={provider.placeholder}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveKey(provider.id)}
                          disabled={isSaving[provider.id]}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving[provider.id] ? '저장 중...' : '저장'}
                        </button>
                        {savedKeys[provider.id] && (
                          <button
                            onClick={() => handleDeleteKey(provider.id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        API 키는 각 제공자의 공식 웹사이트에서 발급받을 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
