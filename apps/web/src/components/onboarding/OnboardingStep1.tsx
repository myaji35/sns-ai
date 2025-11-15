'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/api/auth-api';

const step1Schema = z.object({
  fullName: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다')
    .trim(),
});

type Step1FormData = z.infer<typeof step1Schema>;

interface OnboardingStep1Props {
  onNext: () => void;
}

/**
 * 온보딩 Step 1: 기본 정보 입력
 * - 이름 입력 (필수, 2-50자)
 * - 이메일 표시 (읽기 전용)
 */
export function OnboardingStep1({ onNext }: OnboardingStep1Props) {
  const { fullName, setFullName } = useOnboardingStore();
  const [userEmail, setUserEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName,
    },
  });

  // 사용자 이메일 가져오기
  useEffect(() => {
    async function fetchUserEmail() {
      const user = await getCurrentUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    fetchUserEmail();
  }, []);

  // 저장된 fullName 값 복원
  useEffect(() => {
    if (fullName) {
      setValue('fullName', fullName);
    }
  }, [fullName, setValue]);

  const onSubmit = (data: Step1FormData) => {
    setFullName(data.fullName);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">기본 정보</h2>
        <p className="text-gray-600">프로필에 표시될 이름을 입력해주세요</p>
      </div>

      {/* 이메일 (읽기 전용) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={userEmail}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* 이름 입력 */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          {...register('fullName')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="예: 홍길동"
          autoFocus
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      {/* 다음 버튼 */}
      <button
        type="submit"
        className="w-full min-h-[44px] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
      >
        다음
      </button>
    </form>
  );
}
