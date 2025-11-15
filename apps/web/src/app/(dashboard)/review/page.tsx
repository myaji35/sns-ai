'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface ContentForReview {
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
}

/**
 * 검토 큐 페이지 (Story 5.1)
 *
 * AI 생성 콘텐츠를 검토하고 승인/거부하는 워크플로우
 */
export default function ReviewQueuePage() {
  const [contents, setContents] = useState<ContentForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'review'>('review');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'quality'>('newest');

  // Story 5.9: 일괄 승인/거부
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadReviewQueue();
  }, [filter, sortBy]);

  const loadReviewQueue = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      let query = supabase
        .from('generated_contents')
        .select('*')
        .eq('user_id', user.id);

      // 필터 적용
      if (filter === 'review') {
        query = query.eq('status', 'review');
      } else if (filter === 'draft') {
        query = query.eq('status', 'draft');
      } else {
        // all: draft 또는 review 상태만 표시
        query = query.in('status', ['draft', 'review']);
      }

      // 정렬 적용
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'quality':
          query = query.order('quality_score', { ascending: false, nullsFirst: false });
          break;
      }

      const { data, error } = await query;

      if (!error && data) {
        setContents(data);
      }
    } catch (error) {
      console.error('검토 큐 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', contentId);

      if (!error) {
        setContents(contents.filter(c => c.id !== contentId));
      }
    } catch (error) {
      console.error('승인 오류:', error);
    }
  };

  const handleQuickReject = async (contentId: string) => {
    if (!confirm('이 콘텐츠를 거부하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', contentId);

      if (!error) {
        setContents(contents.filter(c => c.id !== contentId));
      }
    } catch (error) {
      console.error('거부 오류:', error);
    }
  };

  // Story 5.9: 일괄 처리 함수들
  const toggleSelect = (contentId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(contentId)) {
      newSelected.delete(contentId);
    } else {
      newSelected.add(contentId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === contents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contents.map(c => c.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`선택한 ${selectedIds.size}개의 콘텐츠를 승인하시겠습니까?`)) {
      return;
    }

    setBulkProcessing(true);
    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .in('id', Array.from(selectedIds));

      if (!error) {
        setContents(contents.filter(c => !selectedIds.has(c.id)));
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('일괄 승인 오류:', error);
      alert('일괄 승인 중 오류가 발생했습니다');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`선택한 ${selectedIds.size}개의 콘텐츠를 거부하시겠습니까?`)) {
      return;
    }

    setBulkProcessing(true);
    try {
      const { error } = await supabase
        .from('generated_contents')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .in('id', Array.from(selectedIds));

      if (!error) {
        setContents(contents.filter(c => !selectedIds.has(c.id)));
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('일괄 거부 오류:', error);
      alert('일괄 거부 중 오류가 발생했습니다');
    } finally {
      setBulkProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog_post':
        return '📝';
      case 'social_media':
        return '📱';
      default:
        return '📄';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700', text: '초안' },
      review: { color: 'bg-yellow-100 text-yellow-700', text: '검토중' },
      approved: { color: 'bg-green-100 text-green-700', text: '승인됨' },
      rejected: { color: 'bg-red-100 text-red-700', text: '거부됨' },
      published: { color: 'bg-blue-100 text-blue-700', text: '게시됨' },
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">검토 큐</h1>
              <p className="mt-2 text-gray-600">
                AI로 생성된 콘텐츠를 검토하고 승인하세요.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                총 {contents.length}개
              </span>
              <Link
                href="/content"
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                전체 콘텐츠 보기
              </Link>
            </div>
          </div>
        </div>

        {/* 필터 및 정렬 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            {/* 필터 탭 */}
            <div className="flex gap-2">
              {(['all', 'review', 'draft'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' && '전체'}
                  {status === 'review' && '검토 대기'}
                  {status === 'draft' && '초안'}
                </button>
              ))}
            </div>

            {/* 정렬 옵션 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="quality">품질 높은순</option>
              </select>
            </div>
          </div>

          {/* 일괄 작업 도구 (Story 5.9) */}
          {contents.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === contents.length && contents.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {selectedIds.size > 0 ? `${selectedIds.size}개 선택됨` : '전체 선택'}
                </span>
              </div>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={bulkProcessing}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {bulkProcessing ? '처리 중...' : `✓ ${selectedIds.size}개 승인`}
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={bulkProcessing}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {bulkProcessing ? '처리 중...' : `✕ ${selectedIds.size}개 거부`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 검토 큐 목록 */}
        {contents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-600 mb-4">
              {filter === 'review' ? '검토 대기 중인 콘텐츠가 없습니다.' : '콘텐츠가 없습니다.'}
            </p>
            <Link
              href="/content"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              콘텐츠 생성하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contents.map((content) => (
              <div
                key={content.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all ${
                  selectedIds.has(content.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* 체크박스 (Story 5.9) */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(content.id)}
                    onChange={() => toggleSelect(content.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  <div className="flex-1 flex items-start justify-between">
                    <div className="flex-1">
                    {/* 헤더 */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getTypeIcon(content.type)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {content.title || content.main_topic || '제목 없음'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {getStatusBadge(content.status)}
                          {content.platform && (
                            <span className="text-xs text-gray-500">
                              {content.platform}
                            </span>
                          )}
                          {content.quality_score && (
                            <span className="text-xs text-gray-500">
                              ⭐ {content.quality_score}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 콘텐츠 미리보기 */}
                    <div className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {content.content}
                    </div>

                    {/* 메타데이터 */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>생성: {new Date(content.created_at).toLocaleDateString('ko-KR')}</span>
                      {content.metadata?.wordCount && (
                        <span>{content.metadata.wordCount}단어</span>
                      )}
                      {content.metadata?.readingTime && (
                        <span>읽기 {content.metadata.readingTime}분</span>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/review/${content.id}`}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      상세 검토
                    </Link>
                    <button
                      onClick={() => handleQuickApprove(content.id)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✓ 빠른 승인
                    </button>
                    <button
                      onClick={() => handleQuickReject(content.id)}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ✕ 거부
                    </button>
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
