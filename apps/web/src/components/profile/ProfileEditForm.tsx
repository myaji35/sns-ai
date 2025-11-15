'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfileStore } from '@/stores/profileStore';
import { deleteProfileImage } from '@/lib/api/profile-api';
import ProfileImageUpload from './ProfileImageUpload';

// Zod 검증 스키마
const profileFormSchema = z.object({
  full_name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다'),
  bio: z.string().max(500, '소개는 최대 500자까지 입력 가능합니다').optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * 프로필 편집 폼 컴포넌트
 *
 * 기능:
 * - React Hook Form + Zod 검증
 * - 변경사항 감지 (isDirty)
 * - 프로필 이미지 업로드
 * - 기존 이미지 삭제
 */
export default function ProfileEditForm({
  onSuccess,
  onCancel,
}: ProfileEditFormProps) {
  const { profile, updateProfile, uploadAvatar, saving } = useProfileStore();
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
    },
    mode: 'onChange',
  });

  // 프로필 데이터 변경 시 폼 리셋
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
      });
      setAvatarPreview(null);
      setNewAvatarFile(null);
    }
  }, [profile, reset]);

  // 이미지 변경 감지
  const hasImageChange = newAvatarFile !== null || avatarPreview !== null;

  // 전체 변경사항 감지
  const hasChanges = isDirty || hasImageChange;

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError(null);

      let avatarUrl = profile?.avatar_url || '';

      // 새 이미지 업로드
      if (newAvatarFile) {
        // 기존 이미지 삭제
        if (profile?.avatar_url) {
          await deleteProfileImage(profile.avatar_url);
        }

        // 새 이미지 업로드
        const uploadedUrl = await uploadAvatar(newAvatarFile);
        if (!uploadedUrl) {
          setError('프로필 사진 업로드에 실패했습니다');
          return;
        }
        avatarUrl = uploadedUrl;
      }
      // 이미지 제거 (preview가 null이고 기존 이미지가 있었다면)
      else if (avatarPreview === null && profile?.avatar_url) {
        await deleteProfileImage(profile.avatar_url);
        avatarUrl = '';
      }

      // 프로필 업데이트
      const result = await updateProfile({
        full_name: data.full_name,
        bio: data.bio || '',
        avatar_url: avatarUrl,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || '프로필 수정에 실패했습니다');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('프로필 수정 중 오류가 발생했습니다');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = confirm('변경사항이 저장되지 않습니다. 계속하시겠습니까?');
      if (!confirmed) return;
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 프로필 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          프로필 사진
        </label>
        <ProfileImageUpload
          currentImage={profile?.avatar_url}
          onChange={setNewAvatarFile}
          onPreviewChange={setAvatarPreview}
        />
      </div>

      {/* 이름 필드 */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          {...register('full_name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="이름을 입력하세요"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      {/* 소개 필드 */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          소개
        </label>
        <textarea
          id="bio"
          {...register('bio')}
          rows={4}
          maxLength={500}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="자기소개를 입력하세요 (선택사항)"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 text-right">
          {register('bio').name && '최대 500자'}
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!hasChanges || !isValid || saving}
          className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      {/* 변경사항 안내 */}
      {!hasChanges && (
        <p className="text-sm text-gray-500 text-center">
          변경사항이 없습니다
        </p>
      )}
    </form>
  );
}
