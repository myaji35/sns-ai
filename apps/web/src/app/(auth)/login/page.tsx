import { LogInForm } from '@/components/auth/LogInForm';

export const metadata = {
  title: '로그인 | ContentFlow AI',
  description: 'ContentFlow AI에 로그인하세요',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <LogInForm />
    </div>
  );
}
