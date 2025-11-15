'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// 샘플 분석 데이터
const SAMPLE_MONTHLY_DATA = [
  { month: '6월', contents: 15, approved: 12, published: 10 },
  { month: '7월', contents: 22, approved: 19, published: 16 },
  { month: '8월', contents: 18, approved: 16, published: 14 },
  { month: '9월', contents: 25, approved: 22, published: 19 },
  { month: '10월', contents: 20, approved: 18, published: 15 },
  { month: '11월', contents: 24, approved: 21, published: 18 },
];

const SAMPLE_PLATFORM_STATS = [
  { platform: 'Instagram', posts: 45, engagement: 1250, color: 'from-purple-500 to-pink-500' },
  { platform: 'Facebook', posts: 38, engagement: 890, color: 'from-blue-500 to-blue-600' },
  { platform: 'Naver Blog', posts: 32, engagement: 670, color: 'from-green-500 to-green-600' },
];

const SAMPLE_TOP_CONTENTS = [
  { title: 'AI 트렌드 2025: 주목해야 할 5가지 기술', views: 2340, engagement: 145, platform: 'Instagram' },
  { title: '효율적인 콘텐츠 마케팅 전략', views: 1890, engagement: 128, platform: 'Facebook' },
  { title: 'SNS 마케팅 성공 사례 분석', views: 1650, engagement: 112, platform: 'Naver Blog' },
  { title: '데이터 분석으로 보는 소비자 트렌드', views: 1420, engagement: 98, platform: 'Instagram' },
  { title: '2025년 디지털 마케팅 전망', views: 1380, engagement: 87, platform: 'Facebook' },
];

/**
 * 분석 대시보드 페이지 (Story 7.5)
 * 콘텐츠 성과, 트렌드, 플랫폼별 통계
 */
export default function AnalyticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    // TODO: Load real analytics data from usage_stats
    setIsLoading(false);
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalContents = SAMPLE_MONTHLY_DATA.reduce((sum, d) => sum + d.contents, 0);
  const totalApproved = SAMPLE_MONTHLY_DATA.reduce((sum, d) => sum + d.approved, 0);
  const totalPublished = SAMPLE_MONTHLY_DATA.reduce((sum, d) => sum + d.published, 0);
  const approvalRate = totalContents > 0 ? ((totalApproved / totalContents) * 100).toFixed(1) : '0.0';
  const publishRate = totalContents > 0 ? ((totalPublished / totalContents) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">분석</h1>
            <p className="mt-2 text-gray-600">콘텐츠 성과 및 트렌드 분석</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            ← 대시보드로
          </Link>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={\`px-4 py-2 rounded-lg font-medium text-sm transition-all \${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }\`}
            >
              {range === 'week' && '주간'}
              {range === 'month' && '월간'}
              {range === 'year' && '연간'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">총 생성</h3>
            <p className="text-3xl font-bold text-gray-900">{totalContents}</p>
            <p className="text-xs text-gray-500 mt-1">지난 6개월</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">승인률</h3>
            <p className="text-3xl font-bold text-green-600">{approvalRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{totalApproved}개 승인</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">배포율</h3>
            <p className="text-3xl font-bold text-blue-600">{publishRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{totalPublished}개 배포</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">평균 참여도</h3>
            <p className="text-3xl font-bold text-purple-600">
              {(SAMPLE_PLATFORM_STATS.reduce((sum, p) => sum + p.engagement, 0) / SAMPLE_PLATFORM_STATS.length).toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">플랫폼 평균</p>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">월별 트렌드</h2>
          <div className="space-y-4">
            {SAMPLE_MONTHLY_DATA.map((month) => {
              const maxValue = Math.max(...SAMPLE_MONTHLY_DATA.map(d => d.contents));
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 w-12">{month.month}</span>
                    <div className="flex-1 mx-4 space-y-1">
                      {/* Generated */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-6 rounded-full flex items-center justify-end px-2"
                            style={{ width: \`\${(month.contents / maxValue) * 100}%\` }}
                          >
                            <span className="text-xs text-white font-medium">{month.contents}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 w-16">생성</span>
                      </div>
                      {/* Approved */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full flex items-center justify-end px-2"
                            style={{ width: \`\${(month.approved / maxValue) * 100}%\` }}
                          >
                            <span className="text-xs text-white font-medium">{month.approved}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 w-16">승인</span>
                      </div>
                      {/* Published */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end px-2"
                            style={{ width: \`\${(month.published / maxValue) * 100}%\` }}
                          >
                            <span className="text-xs text-white font-medium">{month.published}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 w-16">배포</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Performance & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Platform Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">플랫폼별 성과</h2>
            <div className="space-y-4">
              {SAMPLE_PLATFORM_STATS.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className={\`h-2 w-full bg-gradient-to-r \${platform.color} rounded-full\`}></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{platform.platform}</span>
                    <span className="text-xs text-gray-500">{platform.posts}개 게시</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>평균 참여도: {platform.engagement}</span>
                    <span className="font-medium text-green-600">
                      {((platform.engagement / platform.posts) * 100 / 100).toFixed(1)}% 참여율
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">빠른 통계</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm text-gray-700">이번 주 생성</span>
                <span className="text-lg font-bold text-indigo-600">24</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">이번 주 승인</span>
                <span className="text-lg font-bold text-green-600">21</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">이번 주 배포</span>
                <span className="text-lg font-bold text-blue-600">18</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700">총 조회수</span>
                <span className="text-lg font-bold text-purple-600">9,500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Contents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">인기 콘텐츠</h2>
          <div className="space-y-4">
            {SAMPLE_TOP_CONTENTS.map((content, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{content.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {content.platform}
                    </span>
                    <span className="text-xs text-gray-500">조회 {content.views.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">참여 {content.engagement}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-medium">High</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
