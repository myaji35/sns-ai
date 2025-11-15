'use client';

import { useState } from 'react';
import { ContentGenerationRequest } from '@/lib/ai/types';

interface ContentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainTopic?: string;
  subtopics?: string[];
  onSuccess?: (content: any) => void;
}

/**
 * AI 콘텐츠 생성 모달
 *
 * 콘텐츠 타입과 플랫폼을 선택하고 AI로 콘텐츠 생성
 */
export default function ContentGeneratorModal({
  isOpen,
  onClose,
  mainTopic = '',
  subtopics = [],
  onSuccess
}: ContentGeneratorModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [contentType, setContentType] = useState<ContentGenerationRequest['type']>('blog_post');
  const [platform, setPlatform] = useState<ContentGenerationRequest['platform']>('blog');
  const [contentLength, setContentLength] = useState<ContentGenerationRequest['contentLength']>('medium');
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>(subtopics);
  const [customKeywords, setCustomKeywords] = useState('');

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState(0);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const request: ContentGenerationRequest = {
        type: contentType,
        mainTopic,
        subtopics: selectedSubtopics.length > 0 ? selectedSubtopics : undefined,
        platform: contentType === 'social_media' ? platform : undefined,
        contentLength,
        brandContext: {
          keywords: customKeywords ? customKeywords.split(',').map(k => k.trim()) : undefined,
        },
      };

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '콘텐츠 생성 실패');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setCurrentStep(3);

      // 성공 콜백
      onSuccess?.(data.content);
    } catch (err) {
      console.error('콘텐츠 생성 오류:', err);
      setError(err instanceof Error ? err.message : '콘텐츠 생성 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* 콘텐츠 타입 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          콘텐츠 타입
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setContentType('blog_post')}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              contentType === 'blog_post'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="font-medium">블로그 포스트</div>
            <div className="text-xs text-gray-500 mt-1">SEO 최적화된 긴 글</div>
          </button>

          <button
            onClick={() => setContentType('social_media')}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              contentType === 'social_media'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">📱</div>
            <div className="font-medium">SNS 콘텐츠</div>
            <div className="text-xs text-gray-500 mt-1">짧고 임팩트 있는 글</div>
          </button>
        </div>
      </div>

      {/* 플랫폼 선택 (SNS인 경우) */}
      {contentType === 'social_media' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            플랫폼
          </label>
          <div className="flex gap-2">
            {(['instagram', 'facebook', 'linkedin'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  platform === p
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {p === 'instagram' && '📷 인스타그램'}
                {p === 'facebook' && '👥 페이스북'}
                {p === 'linkedin' && '💼 링크드인'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 콘텐츠 길이 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          콘텐츠 길이
        </label>
        <div className="flex gap-2">
          {(['short', 'medium', 'long'] as const).map((length) => (
            <button
              key={length}
              onClick={() => setContentLength(length)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                contentLength === length
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {length === 'short' && '짧게'}
              {length === 'medium' && '보통'}
              {length === 'long' && '길게'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setCurrentStep(2)}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        다음 단계
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* 주제 정보 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-1">메인 주제</div>
        <div className="font-medium text-gray-900">{mainTopic || '없음'}</div>
      </div>

      {/* 하위 주제 선택 */}
      {subtopics.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            포함할 하위 주제 선택 (선택사항)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {subtopics.map((topic, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSubtopics.includes(topic)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSubtopics([...selectedSubtopics, topic]);
                    } else {
                      setSelectedSubtopics(selectedSubtopics.filter(t => t !== topic));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{topic}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 커스텀 키워드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          키워드 (선택사항)
        </label>
        <input
          type="text"
          value={customKeywords}
          onChange={(e) => setCustomKeywords(e.target.value)}
          placeholder="예: AI, 자동화, 효율성 (쉼표로 구분)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI 생성 중...
            </>
          ) : (
            <>
              <span>✨</span>
              콘텐츠 생성
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* 생성된 콘텐츠 프리뷰 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">생성된 콘텐츠</h3>
          {generatedContent?.versions && generatedContent.versions.length > 1 && (
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {generatedContent.versions.map((v: any, i: number) => (
                <option key={i} value={i}>
                  {v.provider} (품질: {v.quality}%)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {generatedContent?.versions?.[selectedVersion]?.content || generatedContent?.content}
          </div>
        </div>

        {/* 메타데이터 */}
        {generatedContent?.metadata && (
          <div className="flex gap-4 text-sm text-gray-600">
            {generatedContent.metadata.wordCount && (
              <span>단어 수: {generatedContent.metadata.wordCount}</span>
            )}
            {generatedContent.metadata.readingTime && (
              <span>읽기 시간: {generatedContent.metadata.readingTime}분</span>
            )}
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setCurrentStep(1);
            setGeneratedContent(null);
          }}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          다시 생성
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          저장하고 닫기
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              AI 콘텐츠 생성
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 단계 표시 */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full transition-all ${
                  currentStep >= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
}