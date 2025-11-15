import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'ContentFlow AI - 회원가입',
  description: '이메일과 비밀번호로 ContentFlow AI 계정을 생성하세요',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <SignUpForm />
    </div>
  );
}
