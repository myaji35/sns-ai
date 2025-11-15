'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { validateImage, fileToDataURL, cropImageToSquare } from '@/lib/utils/image';

interface ProfileImageUploadProps {
  currentImage?: string;
  onChange: (file: File | null) => void;
  onPreviewChange?: (preview: string | null) => void;
}

/**
 * 프로필 이미지 업로드 컴포넌트
 *
 * 기능:
 * - 이미지 업로드 (드래그앤드롭, 클릭)
 * - 이미지 미리보기
 * - 이미지 제거
 * - 파일 검증 (크기, 형식)
 */
export default function ProfileImageUpload({
  currentImage,
  onChange,
  onPreviewChange,
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // 파일 검증
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // 이미지 크롭 (정사각형)
      const croppedBlob = await cropImageToSquare(file, 400);
      const croppedFile = new File([croppedBlob], file.name, {
        type: croppedBlob.type,
        lastModified: Date.now(),
      });

      // 미리보기 생성
      const dataUrl = await fileToDataURL(croppedFile);
      setPreview(dataUrl);
      setError(null);

      // 부모 컴포넌트에 전달
      onChange(croppedFile);
      onPreviewChange?.(dataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
      setError('이미지 처리에 실패했습니다');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null);
    onPreviewChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* 현재 이미지 또는 업로드 영역 */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-40 h-40 mx-auto rounded-full border-2 border-dashed cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="프로필 미리보기"
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">변경</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
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
            <p className="text-sm text-gray-600">클릭 또는 드래그</p>
          </div>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 제거 버튼 */}
      {preview && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            사진 제거
          </button>
        </div>
      )}

      {/* 안내 텍스트 */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          JPG, PNG, WebP (최대 5MB)
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
