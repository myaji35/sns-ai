interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3;
}

/**
 * 온보딩 진행도 표시기
 * 1/3 → 2/3 → 3/3 형태로 표시
 */
export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const progress = (currentStep / 3) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>프로필 설정</span>
        <span>{currentStep}/3</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={3}
        />
      </div>
    </div>
  );
}
