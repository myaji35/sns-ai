import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">ContentFlow AI</h1>
        <p className="text-xl text-gray-600 mb-8">올인원 콘텐츠 마케팅 자동화 플랫폼</p>
        <p className="text-gray-500 mb-12">내실있고 자연스러운 콘텐츠를 AI로 자동 생성하세요</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            대시보드 보기
          </Link>
          <Link
            href="/content"
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border-2 border-blue-600"
          >
            컨텐츠 관리
          </Link>
          <Link
            href="/management"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            회원사 관리
          </Link>
        </div>
      </div>
    </div>
  );
}
