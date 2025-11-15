import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: '비밀번호 찾기 | ContentFlow AI',
  description: 'ContentFlow AI 비밀번호를 재설정하세요',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <ForgotPasswordForm />
    </div>
  );
}
