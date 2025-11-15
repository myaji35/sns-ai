'use client';

import { useState } from 'react';

interface CalendarTopic {
  id: string;
  calendar_id: string;
  category: string | null;
  main_topic: string;
  subtopics: string[] | null;
  publish_frequency: string | null;
  status: string;
  ai_generated: boolean;
}

interface CalendarTopicCardProps {
  topic: CalendarTopic;
  onUpdate: () => void;
}

/**
 * 캘린더 토픽 카드 컴포넌트
 *
 * 각 토픽의 정보를 표시하고 AI 하위 주제 생성 기능 제공
 */
export default function CalendarTopicCard({ topic, onUpdate }: CalendarTopicCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSubtopics = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          mainTopic: topic.main_topic,
          category: topic.category,
          writeBack: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`${result.count}개의 하위 주제가 생성되었습니다`);
        onUpdate();
      } else {
        alert('생성 실패: ' + result.error);
      }
    } catch (error) {
      console.error('하위 주제 생성 오류:', error);
      alert('생성 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AI 생성 완료':
        return 'bg-green-100 text-green-800';
      case 'AI 생성 대기':
        return 'bg-yellow-100 text-yellow-800';
      case '발행 완료':
        return 'bg-blue-100 text-blue-800';
      case '기획중':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* 헤더 */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {topic.category && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                  {topic.category}
                </span>
              )}
              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(topic.status)}`}>
                {topic.status}
              </span>
              {topic.ai_generated && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">
                  AI 생성됨
                </span>
              )}
              {topic.publish_frequency && (
                <span className="text-xs text-gray-500">
                  {topic.publish_frequency}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {topic.main_topic}
            </h3>
            {topic.subtopics && topic.subtopics.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {topic.subtopics.length}개 하위 주제
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!topic.ai_generated && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateSubtopics();
                }}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI 생성
                  </>
                )}
              </button>
            )}

            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 확장 콘텐츠 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {topic.subtopics && topic.subtopics.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">하위 주제</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topic.subtopics.map((subtopic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-600 text-xs font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{subtopic}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-8 bg-gray-50 rounded-lg text-center">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-500 mb-3">아직 하위 주제가 없습니다</p>
              {!topic.ai_generated && (
                <button
                  onClick={handleGenerateSubtopics}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  AI로 하위 주제 생성
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}