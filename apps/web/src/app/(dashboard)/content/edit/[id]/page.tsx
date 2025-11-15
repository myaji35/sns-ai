'use client';

import { useState, useEffect } from 'react';
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
  metadata: any;
  hashtags: string[] | null;
  versions: any;
}

/**
 * 콘텐츠 편집 및 미리보기 페이지
 *
 * Story 4.5: 블로그 포스트 미리보기 구현
 */
export default function ContentEditPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showVersions, setShowVersions] = useState(false);

  const supabase = createClient();
  const contentId = params.id as string;

  useEffect(() => {
    loadContent();
  }, [contentId]);

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
        router.push('/content');
        return;
      }

      setContent(data);
      setEditedContent(data.content);
      setEditedTitle(data.title || '');
    } catch (error) {
      console.error('콘텐츠 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({
          content: editedContent,
          title: editedTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      if (!error) {
        // 로컬 상태 업데이트
        if (content) {
          setContent({
            ...content,
            content: editedContent,
            title: editedTitle,
          });
        }
        alert('저장되었습니다');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({ status: newStatus })
        .eq('id', contentId);

      if (!error && content) {
        setContent({ ...content, status: newStatus });
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
    }
  };

  const handleVersionSwitch = (versionIndex: number) => {
    if (content?.versions && content.versions[versionIndex]) {
      setEditedContent(content.versions[versionIndex].content);
      setSelectedVersion(versionIndex);
      setShowVersions(false);
    }
  };

  const renderMarkdownPreview = (markdown: string) => {
    // 간단한 마크다운 렌더링 (실제로는 marked나 react-markdown 사용 권장)
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // Lists
      .replace(/^\* (.+)/gim, '<li class="ml-6 mb-1">• $1</li>')
      .replace(/^\d+\. (.+)/gim, '<li class="ml-6 mb-1">$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Line breaks
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
          <Link href="/content" className="text-blue-600 hover:underline">
            목록으로 돌아가기
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
                href="/content"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                목록으로
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
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                편집
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                미리보기
              </button>
            </div>

            {/* 우측: 액션 버튼 */}
            <div className="flex items-center gap-3">
              {/* 상태 변경 드롭다운 */}
              <select
                value={content.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">📝 초안</option>
                <option value="review">👀 검토중</option>
                <option value="approved">✅ 승인됨</option>
                <option value="published">🚀 게시됨</option>
              </select>

              {/* 버전 선택 버튼 */}
              {content.versions && content.versions.length > 1 && (
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  버전 ({content.versions.length})
                </button>
              )}

              {/* 저장 버튼 */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 버전 선택 패널 */}
      {showVersions && content.versions && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">버전 선택:</span>
              {content.versions.map((version: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleVersionSwitch(index)}
                  className={`px-3 py-1 text-sm rounded-lg border ${
                    selectedVersion === index
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {version.provider} (품질: {version.quality}%)
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* 제목 입력 */}
          <div className="p-6 border-b border-gray-200">
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
                  <span>⭐ 품질점수: {content.quality_score}%</span>
                )}
                <span>📅 {new Date(content.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
            )}
          </div>

          {/* 콘텐츠 편집/미리보기 */}
          <div className="p-6">
            {viewMode === 'edit' ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[600px] p-4 font-mono text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="콘텐츠를 입력하세요..."
              />
            ) : (
              <div className="min-h-[600px] p-4 bg-gray-50 rounded-lg">
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
            )}
          </div>

          {/* 하단 액션 바 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {content.type === 'blog_post' && (
                  <>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                      SEO 설정
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                      이미지 추가
                    </button>
                  </>
                )}
                {content.platform && (
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                    {content.platform} 미리보기
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/content')}
                  className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-300 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  저장 & 게시
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}