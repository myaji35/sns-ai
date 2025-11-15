'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * 데모 페이지
 * 로그인 없이 기능을 테스트할 수 있습니다
 */
export default function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<string>('');

  const demos = [
    {
      id: 'content',
      title: '콘텐츠 관리',
      description: 'AI 생성된 콘텐츠 목록 및 관리',
      icon: '📝',
      path: '/content',
    },
    {
      id: 'review',
      title: '검토 큐',
      description: '콘텐츠 검토 및 승인 워크플로우',
      icon: '✅',
      path: '/review',
    },
    {
      id: 'distribution',
      title: '배포 현황',
      description: '멀티 채널 배포 상태 모니터링',
      icon: '🚀',
      path: '/distribution',
    },
    {
      id: 'settings',
      title: '연결된 계정',
      description: 'SNS 플랫폼 계정 관리',
      icon: '🔗',
      path: '/settings/connected-accounts',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ContentFlow AI - 데모
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            AI 기반 콘텐츠 생성 및 멀티 채널 배포 플랫폼
          </p>
          <p className="text-sm text-gray-500">
            로그인 없이 주요 기능을 둘러보세요
          </p>
        </div>

        {/* 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              href={demo.path}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-8 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{demo.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {demo.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {demo.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>둘러보기</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Epic 완료 현황 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">구현 완료 현황</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Epic 4: AI Content Generation Engine</h3>
                <p className="text-sm text-gray-600">멀티 LLM 통합, 콘텐츠 생성 및 관리</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">완료</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Epic 5: Review & Approval Workflow</h3>
                <p className="text-sm text-gray-600">검토 큐, 편집기, 승인 워크플로우, 실시간 알림</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">완료</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Epic 6: Multi-Channel Distribution</h3>
                <p className="text-sm text-gray-600">SNS 플랫폼 연동, 배포 스케줄링, 상태 모니터링</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">완료</span>
            </div>
          </div>
        </div>

        {/* 기술 스택 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">기술 스택</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⚛️</div>
              <h3 className="font-semibold text-gray-900 mb-1">Next.js 15</h3>
              <p className="text-xs text-gray-600">App Router</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">🗄️</div>
              <h3 className="font-semibold text-gray-900 mb-1">Supabase</h3>
              <p className="text-xs text-gray-600">PostgreSQL + Realtime</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold text-gray-900 mb-1">Multi-LLM</h3>
              <p className="text-xs text-gray-600">GPT-4, Claude, Gemini</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-1">Tailwind CSS</h3>
              <p className="text-xs text-gray-600">Responsive Design</p>
            </div>
          </div>
        </div>

        {/* 참고 사항 */}
        <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">💡 참고사항</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 이 데모는 실제 로그인 없이 UI를 둘러볼 수 있도록 만들어졌습니다.</li>
            <li>• 일부 기능은 인증이 필요하여 실제로 작동하지 않을 수 있습니다.</li>
            <li>• 실제 환경에서는 Supabase Auth를 통한 로그인이 필요합니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
