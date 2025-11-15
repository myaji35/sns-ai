'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface GeneratedContent {
  content: string;
  model: string;
  usage?: any;
  error?: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [topic, setTopic] = useState('');
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'google' | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ [key: string]: GeneratedContent } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
    };

    loadData();
  }, [router]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('주제를 입력해주세요');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          provider,
          industry: profile?.industry,
          tone: profile?.tone_and_manner?.[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message || '콘텐츠 생성 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 콘텐츠 생성</h1>
          <p className="text-gray-600">주제를 입력하고 AI가 블로그 포스트를 자동으로 생성합니다</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                콘텐츠 주제 <span className="text-red-500">*</span>
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="예: AI를 활용한 마케팅 자동화 방법"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                AI 모델 선택
              </label>
              <select
                id="provider"
                value={provider}
                onChange={e => setProvider(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="all">모든 모델 (비교용)</option>
                <option value="openai">OpenAI (GPT-4)</option>
                <option value="anthropic">Anthropic (Claude 3.5)</option>
                <option value="google">Google (Gemini Pro)</option>
              </select>
            </div>

            {profile?.industry && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>업종:</strong> {profile.industry} |
                  {profile.tone_and_manner && (
                    <span>
                      {' '}
                      <strong>톤:</strong> {JSON.parse(profile.tone_and_manner).join(', ')}
                    </span>
                  )}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  콘텐츠 생성 중...
                </span>
              ) : (
                '콘텐츠 생성하기 🚀'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">생성된 콘텐츠</h2>

            {Object.entries(results).map(([provider, result]) => (
              <div
                key={provider}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {provider === 'openai' && '🤖'}
                      {provider === 'anthropic' && '🧠'}
                      {provider === 'google' && '✨'}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider === 'openai' && 'OpenAI GPT-4'}
                        {provider === 'anthropic' && 'Anthropic Claude 3.5'}
                        {provider === 'google' && 'Google Gemini Pro'}
                      </h3>
                      {result.model && (
                        <p className="text-sm text-gray-500">Model: {result.model}</p>
                      )}
                    </div>
                  </div>
                  {result.usage && (
                    <div className="text-sm text-gray-500">Tokens: {result.usage.total_tokens}</div>
                  )}
                </div>

                {result.error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    오류: {result.error}
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm">
                      {result.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
