'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SheetData {
  title: string;
  headers: string[];
  data: any[];
  rowCount: number;
}

export default function ImportPage() {
  const router = useRouter();
  const params = useParams();
  const sheetId = params.sheetId as string;

  const [user, setUser] = useState<any>(null);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState('Sheet1!A:F');

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
      await fetchSheetData();
    };

    loadData();
  }, [router]);

  const fetchSheetData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sheets/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: sheetId,
          range: selectedRange,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to read sheet');
      }

      setSheetData(data);
    } catch (err: any) {
      setError(err.message || '시트 데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!sheetData) return;

    setIsImporting(true);
    setError(null);

    try {
      const response = await fetch('/api/sheets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: sheetId,
          sheetTitle: sheetData.title,
          data: sheetData.data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import');
      }

      // Redirect to calendar with success message
      router.push('/calendar?import=success&count=' + result.imported);
    } catch (err: any) {
      setError(err.message || '데이터 import에 실패했습니다');
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">시트 데이터 로딩 중...</p>
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
              onClick={() => router.push('/calendar')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← 캘린더로 돌아가기
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {sheetData?.title || '시트 데이터 Import'}
          </h1>
          <p className="text-gray-600">아래 데이터를 검토한 후 콘텐츠 캘린더로 import하세요</p>
        </div>

        {/* Range Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="range" className="text-sm font-medium text-gray-700">
              데이터 범위:
            </label>
            <input
              id="range"
              type="text"
              value={selectedRange}
              onChange={e => setSelectedRange(e.target.value)}
              placeholder="Sheet1!A:F"
              className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={fetchSheetData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              다시 불러오기
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {sheetData && (
          <>
            {/* Data Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                데이터 프리뷰 ({sheetData.rowCount}개 행)
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {sheetData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sheetData.data.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {sheetData.headers.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sheetData.data.length > 10 && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                  ... 그 외 {sheetData.data.length - 10}개 행
                </p>
              )}
            </div>

            {/* Column Mapping Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">컬럼 매핑 정보</h3>
              <p className="text-sm text-blue-800 mb-2">
                다음 컬럼명을 사용하면 자동으로 매핑됩니다:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>
                  <strong>제목/Title/title</strong> → 콘텐츠 제목
                </li>
                <li>
                  <strong>설명/Description/description</strong> → 콘텐츠 설명
                </li>
                <li>
                  <strong>타입/Type/type</strong> → 콘텐츠 타입 (blog, social 등)
                </li>
                <li>
                  <strong>플랫폼/Platform/platform</strong> → 플랫폼 (blog, instagram 등)
                </li>
                <li>
                  <strong>날짜/Date/date</strong> → 예약 날짜
                </li>
              </ul>
            </div>

            {/* Import Button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.push('/calendar')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || !sheetData.data.length}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <span className="flex items-center gap-2">
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
                    Import 중...
                  </span>
                ) : (
                  `${sheetData.rowCount}개 항목 Import하기`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
