'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ContentGeneratorModal from '@/components/content/ContentGeneratorModal';

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
}

/**
 * 콘텐츠 관리 페이지
 *
 * AI로 생성된 콘텐츠 목록 및 관리
 */
export default function ContentPage() {
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'blog_post' | 'social_media'>('all');
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Sample data for demo
  const SAMPLE_CONTENTS: GeneratedContent[] = [
    {
      id: '1',
      type: 'blog_post',
      main_topic: '맛있는 베이커리 신메뉴 소개',
      content: '안녕하세요, 맛있는 베이커리입니다! 이번 주 새로운 시즌 메뉴를 선보입니다. 따뜻한 봄을 맞아 딸기 크림 크루아상과 제주 말차 케이크를 출시했습니다. 신선한 제철 딸기를 듬뿍 사용한 크림 크루아상은 달콤하면서도 상큼한 맛이 일품입니다...',
      title: '봄 시즌 신메뉴 - 딸기 크림 크루아상 & 제주 말차 케이크',
      platform: 'instagram',
      status: 'approved',
      quality_score: 92,
      created_at: '2025-03-15T10:30:00Z',
      metadata: { wordCount: 245, readingTime: 2 }
    },
    {
      id: '2',
      type: 'social_media',
      main_topic: '스마트 카페 이벤트',
      content: '☕️ 봄맞이 특별 이벤트! 🌸\n\n스마트 카페에서 봄을 맞아 특별한 이벤트를 준비했습니다!\n\n📍 기간: 3월 15일 - 3월 31일\n🎁 혜택: 아메리카노 2잔 주문 시 1잔 무료!\n💝 추가: 신규 회원 가입 시 케이크 10% 할인\n\n#스마트카페 #봄이벤트 #커피',
      title: '봄맞이 특별 이벤트',
      platform: 'instagram',
      status: 'published',
      quality_score: 88,
      created_at: '2025-03-14T15:20:00Z',
      metadata: { wordCount: 85, readingTime: 1 }
    },
    {
      id: '3',
      type: 'blog_post',
      main_topic: '테크 스타트업 채용 공고',
      content: '테크 스타트업이 새로운 팀원을 찾습니다! 우리는 혁신적인 기술로 세상을 변화시키는 것을 목표로 하는 스타트업입니다. 현재 프론트엔드 개발자, 백엔드 개발자, UI/UX 디자이너를 모집하고 있습니다. 자유로운 근무 환경과 경쟁력 있는 연봉, 그리고 성장할 수 있는 기회를 제공합니다...',
      title: '함께 성장할 개발자를 찾습니다',
      platform: 'blog',
      status: 'review',
      quality_score: 85,
      created_at: '2025-03-13T09:15:00Z',
      metadata: { wordCount: 320, readingTime: 3 }
    },
    {
      id: '4',
      type: 'social_media',
      main_topic: '패션 부티크 신상 소개',
      content: '✨ NEW ARRIVAL ✨\n\n봄 신상이 입고되었습니다! 🌸\n트렌디한 디자인과 편안한 착용감을 동시에!\n\n지금 매장 방문하시면 신규 회원 20% 할인 혜택!\n\n#패션부티크 #신상 #봄패션 #데일리룩',
      title: '봄 신상 컬렉션',
      platform: 'instagram',
      status: 'draft',
      quality_score: 78,
      created_at: '2025-03-12T14:45:00Z',
      metadata: { wordCount: 52, readingTime: 1 }
    }
  ];

  useEffect(() => {
    loadContents();
  }, [filter]);

  const loadContents = async () => {
    setLoading(true);
    try {
      // Demo mode: Use sample data instead of fetching from database
      let filteredContents = SAMPLE_CONTENTS;

      if (filter !== 'all') {
        filteredContents = SAMPLE_CONTENTS.filter(c => c.type === filter);
      }

      setContents(filteredContents);
    } catch (error) {
      console.error('콘텐츠 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contentId: string, newStatus: string) => {
    try {
      // Demo mode: Update status in local state
      setContents(contents.map(c =>
        c.id === contentId ? { ...c, status: newStatus } : c
      ));
    } catch (error) {
      console.error('상태 변경 오류:', error);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('정말 이 콘텐츠를 삭제하시겠습니까?')) {
      return;
    }

    try {
      // Demo mode: Remove from local state
      setContents(contents.filter(c => c.id !== contentId));
    } catch (error) {
      console.error('삭제 오류:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog_post':
        return '📝';
      case 'social_media':
        return '📱';
      case 'subtopics':
        return '🔤';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-2xl font-bold text-gray-900">생성된 콘텐츠</h1>
              <p className="mt-2 text-gray-600">
                AI로 생성된 콘텐츠를 관리하고 편집하세요.
              </p>
            </div>
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>✨</span>
              새 콘텐츠 생성
            </button>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-6">
          {(['all', 'blog_post', 'social_media'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type === 'all' && '전체'}
              {type === 'blog_post' && '📝 블로그'}
              {type === 'social_media' && '📱 SNS'}
              {type === 'all' && ` (${contents.length})`}
            </button>
          ))}
        </div>

        {/* 콘텐츠 목록 */}
        {contents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-gray-600 mb-4">
              아직 생성된 콘텐츠가 없습니다.
            </p>
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 콘텐츠 생성하기
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {contents.map((content) => (
              <div
                key={content.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 헤더 */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getTypeIcon(content.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {content.title || content.main_topic || '제목 없음'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(content.status)}`}>
                            {content.status}
                          </span>
                          {content.platform && (
                            <span className="text-xs text-gray-500">
                              {content.platform}
                            </span>
                          )}
                          {content.quality_score && (
                            <span className="text-xs text-gray-500">
                              품질: {content.quality_score}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 콘텐츠 프리뷰 */}
                    <div className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {content.content}
                    </div>

                    {/* 메타데이터 */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(content.created_at).toLocaleDateString('ko-KR')}</span>
                      {content.metadata?.wordCount && (
                        <span>{content.metadata.wordCount}단어</span>
                      )}
                      {content.metadata?.readingTime && (
                        <span>읽기 {content.metadata.readingTime}분</span>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedContent(content)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="미리보기"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => router.push(`/content/${content.id}/edit`)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="편집"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(content.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 콘텐츠 생성 모달 */}
        <ContentGeneratorModal
          isOpen={showGeneratorModal}
          onClose={() => setShowGeneratorModal(false)}
          onSuccess={() => {
            setShowGeneratorModal(false);
            loadContents();
          }}
        />

        {/* 콘텐츠 미리보기 모달 */}
        {selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  콘텐츠 미리보기
                </h2>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap">{selectedContent.content}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}