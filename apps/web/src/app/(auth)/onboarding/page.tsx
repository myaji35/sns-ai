'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { OnboardingStep1 } from '@/components/onboarding/OnboardingStep1';
import { OnboardingStep2 } from '@/components/onboarding/OnboardingStep2';
import { OnboardingStep3 } from '@/components/onboarding/OnboardingStep3';
import { updateProfile, uploadProfileAvatar } from '@/lib/api/profile-api';
import { cropImageToSquare } from '@/lib/utils/image';

/**
 * 프로필 등록 온보딩 페이지
 * 3단계: 이름 → 소개 → 프로필 사진
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { currentStep, fullName, bio, avatarFile, nextStep, prevStep, reset } =
    useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleNext = () => {
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleSkip = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 최소한의 정보만으로 프로필 업데이트
      const response = await updateProfile({
        full_name: '사용자',
        bio: '',
      });

      if (!response.success) {
        setError(response.error || '프로필 저장에 실패했습니다');
        setIsLoading(false);
        return;
      }

      // 온보딩 상태 초기화
      reset();

      // 대시보드로 리다이렉트
      router.push('/dashboard');
    } catch (err) {
      setError('연결 실패. 다시 시도해주세요');
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let avatarUrl: string | null = null;

      // 1. 프로필 사진 업로드 (선택사항)
      if (avatarFile) {
        // 이미지를 정사각형으로 자동 크롭
        const croppedBlob = await cropImageToSquare(avatarFile, 400);
        const croppedFile = new File([croppedBlob], avatarFile.name, {
          type: croppedBlob.type,
          lastModified: Date.now(),
        });

        avatarUrl = await uploadProfileAvatar(croppedFile);
        if (!avatarUrl) {
          setError('프로필 사진 업로드에 실패했습니다');
          setIsLoading(false);
          return;
        }
      }

      // 2. 프로필 정보 업데이트
      const response = await updateProfile({
        full_name: fullName,
        bio,
        avatar_url: avatarUrl || undefined,
      });

      if (!response.success) {
        setError(response.error || '프로필 저장에 실패했습니다');
        setIsLoading(false);
        return;
      }

      // 3. 성공 메시지 표시
      setSuccessMessage('프로필 설정이 완료되었습니다');

      // 4. 온보딩 상태 초기화
      reset();

      // 5. 잠시 후 대시보드로 리다이렉트
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('연결 실패. 다시 시도해주세요');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        {/* 헤더: 뒤로가기 버튼 */}
        {currentStep > 1 && (
          <button
            onClick={prevStep}
            className="text-gray-600 hover:text-gray-900 transition"
            aria-label="이전 단계"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* 진행도 표시기 */}
        <ProgressIndicator currentStep={currentStep} />

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 성공 메시지 */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {successMessage}
          </div>
        )}

        {/* 단계별 컴포넌트 */}
        {currentStep === 1 && <OnboardingStep1 onNext={handleNext} />}
        {currentStep === 2 && (
          <OnboardingStep2 onNext={handleNext} onPrev={handlePrev} />
        )}
        {currentStep === 3 && (
          <OnboardingStep3
            onComplete={handleComplete}
            onPrev={handlePrev}
            isLoading={isLoading}
          />
        )}

        {/* 건너뛰기 버튼 (3단계 제외) */}
        {currentStep < 3 && !isLoading && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition"
          >
            나중에 설정하기
          </button>
        )}
      </div>
    </div>
  );
}