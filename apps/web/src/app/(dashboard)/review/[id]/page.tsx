'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface GeneratedContent {
  id: string;
  type: string;
  main_topic: string | null;
  content: string;
  title: string | null;
  platform: string | null;
  status: string;
  quality_score: number | null;
  created_at: string;
  updated_at: string;
  metadata: any;
  hashtags: string[] | null;
  versions: any;
  feedback: string | null;
}

/**
 * 상세 검토 페이지 (Story 5.2, 5.3, 5.4, 5.5, 5.6)
 *
 * 마크다운 편집기 + 미리보기 분할 뷰
 * 콘텐츠 편집 및 저장
 * 승인/거부 기능
 * 품질 피드백 수집
 */
export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [selectedVersion, setSelectedVersion] = useState(0);

  // Story 5.6: 품질 피드백
  const [qualityRating, setQualityRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false);

  const supabase = createClient();
  const contentId = params.id as string;

  useEffect(() => {
    loadContent();
  }, [contentId]);

  // 키보드 단축키 (Story 5.8)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S: 저장
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Cmd/Ctrl + Enter: 승인
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleApprove();
      }
      // Cmd/Ctrl + R: 거부
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        handleReject();
      }
      // Cmd/Ctrl + E: 편집 모드
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setViewMode('edit');
      }
      // Cmd/Ctrl + P: 미리보기 모드
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setViewMode('preview');
      }
      // Cmd/Ctrl + D: 분할 모드
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setViewMode('split');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editedContent, editedTitle]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('generated_contents')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) {
        console.error('콘텐츠 로드 오류:', error);
        router.push('/review');
        return;
      }

      setContent(data);
      setEditedContent(data.content);
      setEditedTitle(data.title || '');
      setFeedback(data.feedback || '');
      if (data.quality_score) {
        setQualityRating(Math.round(data.quality_score / 20)); // 100점 만점을 5점 만점으로 변환
      }
    } catch (error) {
      console.error('콘텐츠 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({
          content: editedContent,
          title: editedTitle,
          feedback,
          quality_score: qualityRating > 0 ? qualityRating * 20 : content?.quality_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      if (!error && content) {
        setContent({
          ...content,
          content: editedContent,
          title: editedTitle,
          feedback,
        });
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  }, [editedContent, editedTitle, feedback, qualityRating, contentId]);

  const handleApprove = async () => {
    // 먼저 저장
    await handleSave();

    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      if (!error) {
        router.push('/review');
      }
    } catch (error) {
      console.error('승인 오류:', error);
      alert('승인 중 오류가 발생했습니다');
    }
  };

  const handleReject = async () => {
    if (!confirm('이 콘텐츠를 거부하시겠습니까? 피드백을 입력하면 재생성 시 참고됩니다.')) {
      return;
    }

    setShowFeedbackPanel(true);
  };

  const handleRejectWithFeedback = async () => {
    // 먼저 저장
    await handleSave();

    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      if (!error) {
        router.push('/review');
      }
    } catch (error) {
      console.error('거부 오류:', error);
      alert('거부 중 오류가 발생했습니다');
    }
  };

  const handleRegenerate = async () => {
    if (!content) return;

    try {
      // 기존 피드백을 포함하여 재생성 요청
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: content.type,
          mainTopic: content.main_topic,
          platform: content.platform,
          contentLength: content.metadata?.contentLength || 'medium',
          brandContext: {
            feedback: content.feedback, // 이전 피드백 포함
          },
        }),
      });

      if (!response.ok) {
        throw new Error('재생성 실패');
      }

      const data = await response.json();

      // 새로운 콘텐츠로 교체
      setEditedContent(data.content.content);
      setEditedTitle(data.content.title || editedTitle);

      alert('콘텐츠가 재생성되었습니다. 검토 후 저장해주세요.');
    } catch (error) {
      console.error('재생성 오류:', error);
      alert('재생성 중 오류가 발생했습니다');
    }
  };

  const handleVersionSwitch = (versionIndex: number) => {
    if (content?.versions && content.versions[versionIndex]) {
      setEditedContent(content.versions[versionIndex].content);
      setSelectedVersion(versionIndex);
    }
  };

  const renderMarkdownPreview = (markdown: string) => {
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/^\* (.+)/gim, '<li class="ml-6 mb-1">• $1</li>')
      .replace(/^\d+\. (.+)/gim, '<li class="ml-6 mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');

    return `<div class="prose prose-lg max-w-none"><p class="mb-4">${html}</p></div>`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">콘텐츠를 찾을 수 없습니다</p>
          <Link href="/review" className="text-blue-600 hover:underline">
            검토 큐로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 좌측: 네비게이션 */}
            <div className="flex items-center gap-4">
              <Link
                href="/review"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                검토 큐
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-sm text-gray-600">
                {content.type === 'blog_post' ? '📝 블로그' : '📱 SNS'}
              </span>
            </div>

            {/* 중앙: 뷰 모드 스위치 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Cmd+E"
              >
                편집
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Cmd+D"
              >
                분할
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Cmd+P"
              >
                미리보기
              </button>
            </div>

            {/* 우측: 액션 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFeedbackPanel(!showFeedbackPanel)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                title="품질 피드백"
              >
                ⭐ 피드백
              </button>

              {content.versions && content.versions.length > 1 && (
                <select
                  value={selectedVersion}
                  onChange={(e) => handleVersionSwitch(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                >
                  {content.versions.map((v: any, i: number) => (
                    <option key={i} value={i}>
                      {v.provider} ({v.quality}%)
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50"
                title="Cmd+S"
              >
                {saving ? '저장 중...' : '저장'}
              </button>

              <button
                onClick={handleReject}
                className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                title="Cmd+R"
              >
                거부
              </button>

              <button
                onClick={handleApprove}
                className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                title="Cmd+Enter"
              >
                승인
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 품질 피드백 패널 */}
      {showFeedbackPanel && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start gap-6">
              {/* 별점 평가 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  품질 평가
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setQualityRating(star)}
                      className="text-2xl transition-all hover:scale-110"
                    >
                      {star <= qualityRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 피드백 텍스트 */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  피드백 (선택사항)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="개선이 필요한 부분을 입력하세요. 재생성 시 참고됩니다."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>

              {/* 닫기 버튼 */}
              <button
                onClick={() => setShowFeedbackPanel(false)}
                className="mt-6 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 제목 입력 */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 p-6">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full text-2xl font-bold text-gray-900 border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
            disabled={viewMode === 'preview'}
          />
          {content.metadata && (
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              {content.metadata.wordCount && (
                <span>📝 {content.metadata.wordCount}단어</span>
              )}
              {content.metadata.readingTime && (
                <span>⏱️ {content.metadata.readingTime}분</span>
              )}
              {content.quality_score && (
                <span>⭐ 품질: {content.quality_score}%</span>
              )}
              <span>📅 {new Date(content.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          )}
        </div>

        {/* 편집기/미리보기 영역 */}
        <div className="bg-white rounded-b-xl shadow-sm border-x border-b border-gray-200">
          <div className={`grid ${viewMode === 'split' ? 'grid-cols-2 divide-x divide-gray-200' : 'grid-cols-1'}`}>
            {/* 편집기 */}
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">편집</h3>
                  <button
                    onClick={handleRegenerate}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    🔄 재생성
                  </button>
                </div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full min-h-[600px] p-4 font-mono text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder="콘텐츠를 입력하세요..."
                />
              </div>
            )}

            {/* 미리보기 */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">미리보기</h3>
                <div className="min-h-[600px] p-4 bg-gray-50 rounded-lg overflow-auto">
                  {content.type === 'blog_post' ? (
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(editedContent) }}
                    />
                  ) : (
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="whitespace-pre-wrap text-gray-800">{editedContent}</div>
                        {content.hashtags && content.hashtags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {content.hashtags.map((tag, index) => (
                              <span key={index} className="text-blue-600 text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 키보드 단축키 안내 */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
          <strong>키보드 단축키:</strong> ⌘+S 저장 | ⌘+Enter 승인 | ⌘+R 거부 | ⌘+E 편집 | ⌘+P 미리보기 | ⌘+D 분할
        </div>
      </div>

      {/* 거부 확인 모달 */}
      {showFeedbackPanel && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
          <h3 className="font-semibold text-gray-900 mb-2">콘텐츠 거부</h3>
          <p className="text-sm text-gray-600 mb-4">
            피드백을 입력하면 재생성 시 참고됩니다.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFeedbackPanel(false)}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleRejectWithFeedback}
              className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              거부 확정
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
