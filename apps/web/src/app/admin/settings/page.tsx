'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: currentPassword,
      });

      if (signInError) {
        setError('현재 비밀번호가 올바르지 않습니다.');
        setIsLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError('비밀번호 변경에 실패했습니다: ' + updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 설정</h1>
            <p className="text-gray-600 mt-1">비밀번호를 변경하세요</p>
          </div>
          <Link
            href="/management"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
          >
            ← 회원사 관리로 돌아가기
          </Link>
        </div>

        {/* Password Change Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">비밀번호 변경</h2>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                현재 비밀번호 *
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                placeholder="현재 비밀번호를 입력하세요"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호 *
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호 확인 *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/management')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm">
            <strong>보안 권장사항:</strong> 비밀번호는 최소 8자 이상, 영문/숫자/특수문자를 조합하여 사용하시기를 권장합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
