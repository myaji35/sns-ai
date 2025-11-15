'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateCalendarButtonProps {
  brandName?: string;
  onSuccess?: (data: any) => void;
}

/**
 * 콘텐츠 캘린더 생성 버튼 컴포넌트
 *
 * Google Sheets 템플릿을 자동으로 생성
 */
export default function CreateCalendarButton({
  brandName = 'My Brand',
  onSuccess
}: CreateCalendarButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [customBrandName, setCustomBrandName] = useState(brandName);
  const [addSampleData, setAddSampleData] = useState(true);
  const router = useRouter();

  const handleCreateCalendar = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sheets/create-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName: customBrandName,
          addSampleData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '캘린더 생성 실패');
      }

      const data = await response.json();

      // 성공 콜백 호출
      onSuccess?.(data);

      // 모달 닫기
      setShowModal(false);

      // 성공 메시지와 함께 Sheets URL 열기 옵션 제공
      if (data.calendar?.spreadsheetUrl) {
        const openSheets = confirm(
          '콘텐츠 캘린더가 생성되었습니다!\n지금 Google Sheets에서 열어보시겠습니까?'
        );
        if (openSheets) {
          window.open(data.calendar.spreadsheetUrl, '_blank');
        }
      }

      // 페이지 새로고침으로 캘린더 목록 업데이트
      router.refresh();
    } catch (err) {
      console.error('캘린더 생성 오류:', err);
      setError(err instanceof Error ? err.message : '캘린더 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 생성 버튼 */}
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        새 콘텐츠 캘린더 만들기
      </button>

      {/* 생성 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">새 콘텐츠 캘린더 생성</h2>

            <div className="space-y-4">
              {/* 브랜드명 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  브랜드명
                </label>
                <input
                  type="text"
                  value={customBrandName}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  placeholder="예: ContentFlow AI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* 샘플 데이터 옵션 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sampleData"
                  checked={addSampleData}
                  onChange={(e) => setAddSampleData(e.target.checked)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <label htmlFor="sampleData" className="text-sm text-gray-700">
                  샘플 데이터 추가 (참고용 예시 콘텐츠)
                </label>
              </div>

              {/* 안내 메시지 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Google Sheets에 콘텐츠 캘린더 템플릿이 자동으로 생성됩니다.
                  생성 후 Sheets에서 직접 주제를 입력하고 관리할 수 있습니다.
                </p>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateCalendar}
                  disabled={isLoading || !customBrandName.trim()}
                  className={`
                    px-6 py-2 bg-blue-600 text-white font-medium rounded-lg
                    hover:bg-blue-700 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2
                  `}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                          fill="#0F9D58"
                        />
                        <path d="M14 2V8H20" fill="#87CEAC" />
                        <path
                          d="M8 13H16M8 17H16M8 9H10"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      캘린더 생성
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}