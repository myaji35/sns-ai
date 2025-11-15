'use client';

import { useOnboardingStore } from '@/stores/onboardingStore';
import { useState, useRef } from 'react';
import { validateImage, fileToDataURL } from '@/lib/utils/image';

interface OnboardingStep3Props {
  onComplete: () => Promise<void>;
  onPrev: () => void;
  isLoading: boolean;
}

/**
 * 온보딩 Step 3: 프로필 사진 업로드
 * - 드래그앤드롭 이미지 업로드
 * - 이미지 미리보기
 * - 파일 유효성 검사 (크기, 형식)
 */
export function OnboardingStep3({ onComplete, onPrev, isLoading }: OnboardingStep3Props) {
  const { avatarFile, avatarPreview, setAvatarFile, setAvatarPreview } = useOnboardingStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // 파일 검증
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 파일 저장
    setAvatarFile(file);

    // 미리보기 생성
    try {
      const dataURL = await fileToDataURL(file);
      setAvatarPreview(dataURL);
    } catch (err) {
      setError('이미지 미리보기 생성에 실패했습니다');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">프로필 사진</h2>
        <p className="text-gray-600">프로필 사진을 업로드해주세요 (선택사항)</p>
      </div>

      {/* 이미지 업로드 영역 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">프로필 사진</label>

        {avatarPreview ? (
          // 이미지 미리보기
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={avatarPreview}
                  alt="프로필 미리보기"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-100"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                  aria-label="이미지 제거"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              다른 사진 선택
            </button>
          </div>
        ) : (
          // 드래그앤드롭 영역
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  사진을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG, WebP (최대 5MB)
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* 이전/완료 버튼 */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={isLoading}
          className="flex-1 min-h-[44px] py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 min-h-[44px] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '저장 중...' : '완료'}
        </button>
      </div>
    </form>
  );
}
