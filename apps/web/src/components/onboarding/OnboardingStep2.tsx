'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useEffect, useState } from 'react';

const step2Schema = z.object({
  bio: z
    .string()
    .max(500, '소개는 최대 500자까지 입력 가능합니다')
    .optional(),
});

type Step2FormData = z.infer<typeof step2Schema>;

interface OnboardingStep2Props {
  onNext: () => void;
  onPrev: () => void;
}

/**
 * 온보딩 Step 2: 프로필 소개 입력
 * - 소개 텍스트 에어리어 (선택, 최대 500자)
 * - 글자수 카운터
 */
export function OnboardingStep2({ onNext, onPrev }: OnboardingStep2Props) {
  const { bio, setBio } = useOnboardingStore();
  const [charCount, setCharCount] = useState(bio.length);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      bio: bio || '',
    },
  });

  // 저장된 bio 값 복원
  useEffect(() => {
    if (bio) {
      setValue('bio', bio);
    }
  }, [bio, setValue]);

  // 글자수 카운터 업데이트
  const bioValue = watch('bio');
  useEffect(() => {
    setCharCount(bioValue?.length || 0);
  }, [bioValue]);

  const onSubmit = (data: Step2FormData) => {
    setBio(data.bio || '');
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">프로필 소개</h2>
        <p className="text-gray-600">자신을 간단히 소개해주세요 (선택사항)</p>
      </div>

      {/* 소개 텍스트 에어리어 */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          소개
        </label>
        <textarea
          id="bio"
          {...register('bio')}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          placeholder="예: 안녕하세요! 콘텐츠 마케팅을 좋아하는 마케터입니다."
        />
        <div className="mt-1 flex justify-between items-center">
          <div>
            {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
          </div>
          <p className={`text-sm ${charCount > 500 ? 'text-red-600' : 'text-gray-500'}`}>
            {charCount}/500
          </p>
        </div>
      </div>

      {/* 이전/다음 버튼 */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 min-h-[44px] py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
        >
          이전
        </button>
        <button
          type="submit"
          className="flex-1 min-h-[44px] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
        >
          다음
        </button>
      </div>
    </form>
  );
}
