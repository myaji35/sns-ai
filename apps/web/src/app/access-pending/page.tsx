'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccessPendingPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [introduction, setIntroduction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      }
    };
    getUserInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인 정보를 찾을 수 없습니다.');
        return;
      }

      // Insert access request
      const { error } = await supabase
        .from('member_access_requests')
        .insert({
          user_id: user.id,
          email: userEmail,
          full_name: fullName,
          introduction: introduction,
          status: 'pending',
        });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert('요청 전송 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">요청이 전송되었습니다</h1>
            <p className="text-gray-600">관리자가 검토 후 연락드릴 예정입니다</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-2">
              회원사 등록 요청이 성공적으로 전송되었습니다.
            </p>
            <p className="text-gray-700">
              관리자가 요청을 검토한 후 이메일로 연락드릴 예정입니다.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/member-login"
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              로그아웃
            </Link>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원사 등록 요청</h1>
          <p className="text-gray-600">관리자 승인이 필요합니다</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-2">
            <strong>{userEmail}</strong> 계정으로 로그인하셨습니다.
          </p>
          <p className="text-gray-700">
            현재 등록된 회원사를 찾을 수 없습니다. 아래 정보를 입력하여 회원사 등록을 요청해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 *
            </label>
            <input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              성명 *
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-2">
              자기소개 *
            </label>
            <textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="회사명, 직책, 업무 내용 등을 간단히 작성해주세요."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700 text-sm">
              관리자가 요청을 검토한 후 이메일로 연락드릴 예정입니다.
              빠른 처리를 원하시면 admin@example.com으로 문의해주세요.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/member-login"
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '전송 중...' : '등록 요청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
