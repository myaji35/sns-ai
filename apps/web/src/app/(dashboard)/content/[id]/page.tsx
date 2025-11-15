'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  platform: string;
  scheduled_date: string | null;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
  review_status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  reviewer_notes?: string;
  generated_content?: string;
  created_at: string;
}

interface Review {
  id: string;
  reviewer_id: string;
  review_status: string;
  notes: string;
  created_at: string;
}

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState<ContentItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [platform, setPlatform] = useState('blog');
  const [generatedContent, setGeneratedContent] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

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
      await fetchContent();
    };

    loadData();
  }, [router, contentId]);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('id', contentId)
        .single();

      if (fetchError) throw fetchError;

      setContent(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setPlatform(data.platform || 'blog');
      setGeneratedContent(data.generated_content || '');

      if (data.scheduled_date) {
        // Convert to datetime-local format
        const date = new Date(data.scheduled_date);
        const formatted = date.toISOString().slice(0, 16);
        setScheduledDate(formatted);
      }
    } catch (err: any) {
      setError(err.message || '콘텐츠를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('content_calendar')
        .update({
          title,
          description,
          platform,
          scheduled_date: scheduledDate || null,
          generated_content: generatedContent,
          status: scheduledDate ? 'scheduled' : 'pending',
        })
        .eq('id', contentId);

      if (updateError) throw updateError;

      setSuccess('✅ 저장되었습니다!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchContent();
    } catch (err: any) {
      setError(err.message || '저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title,
          provider: 'anthropic', // Default to Anthropic for quality
          tone: 'professional',
          industry: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      // Extract content from first available provider
      const firstResult = Object.values(data.results)[0] as any;
      if (firstResult?.content) {
        setGeneratedContent(firstResult.content);
      } else {
        throw new Error('No content generated');
      }
    } catch (err: any) {
      setError(err.message || 'AI 콘텐츠 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          platform,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish');
      }

      setSuccess('✅ 발행되었습니다!');
      setTimeout(() => {
        router.push('/content');
      }, 2000);
    } catch (err: any) {
      setError(err.message || '발행에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">콘텐츠 로딩 중...</p>
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
              onClick={() => router.push('/content')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← 콘텐츠 목록
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">콘텐츠 편집</h1>
          <p className="text-gray-600">콘텐츠를 편집하고 발행 일정을 설정하세요</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Content Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="콘텐츠 제목"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="콘텐츠 설명"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">플랫폼</label>
                <select
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="blog">블로그</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">발행 예정일</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">생성된 콘텐츠</label>
                <button
                  onClick={handleGenerateContent}
                  disabled={isGenerating || !title}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                      AI 생성 중...
                    </span>
                  ) : (
                    '🤖 AI로 콘텐츠 생성'
                  )}
                </button>
              </div>
              <textarea
                value={generatedContent}
                onChange={e => setGeneratedContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder="AI로 생성된 콘텐츠가 여기 표시됩니다..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/content')}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            취소
          </button>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>

            <button
              onClick={handlePublish}
              disabled={isSaving || !generatedContent}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '발행 중...' : '즉시 발행'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
