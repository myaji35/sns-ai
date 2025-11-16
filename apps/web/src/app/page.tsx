import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">ForwardingFlow AI</h1>
        <p className="text-xl text-gray-600 mb-8">올인원 콘텐츠 마케팅 자동화 플랫폼</p>
        <p className="text-gray-500 mb-12">내실있고 자연스러운 콘텐츠를 AI로 자동 생성하세요</p>

        <Link
          href="/member-login"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          회원사 로그인
        </Link>
      </div>
    </div>
  );
}
