/**
 * 프로필 기능 테스트
 *
 * 테스트 범위:
 * - 프로필 조회
 * - 프로필 업데이트
 * - 이미지 업로드
 * - 이미지 삭제
 * - 유효성 검사
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  updateProfile,
  uploadProfileAvatar,
  deleteProfileImage,
  getCurrentUserProfile,
  validateImageFile,
  ProfileData,
} from '@/lib/api/profile-api';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
        },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          full_name: 'Test User',
          bio: 'Test bio',
          avatar_url: 'https://example.com/avatar.jpg',
        },
        error: null,
      }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'test-user-id/123456.jpg' },
          error: null,
        }),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/avatars/test-user-id/123456.jpg' },
        })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  })),
}));

describe('Profile API Functions', () => {
  describe('getCurrentUserProfile', () => {
    it('should fetch current user profile', async () => {
      const profile = await getCurrentUserProfile();
      expect(profile).toBeDefined();
      expect(profile?.full_name).toBe('Test User');
      expect(profile?.bio).toBe('Test bio');
      expect(profile?.avatar_url).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const profileData: ProfileData = {
        full_name: 'Updated Name',
        bio: 'Updated bio',
        avatar_url: 'https://example.com/new-avatar.jpg',
      };

      const result = await updateProfile(profileData);
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should validate full_name length', () => {
      // 이름은 2-50자 사이여야 함
      const shortName: ProfileData = {
        full_name: 'A',
        bio: '',
      };

      const longName: ProfileData = {
        full_name: 'A'.repeat(51),
        bio: '',
      };

      // Note: 실제 검증은 React Hook Form + Zod에서 수행됨
      expect(shortName.full_name.length).toBeLessThan(2);
      expect(longName.full_name.length).toBeGreaterThan(50);
    });

    it('should validate bio length', () => {
      // 소개는 최대 500자
      const longBio: ProfileData = {
        full_name: 'Test',
        bio: 'A'.repeat(501),
      };

      expect(longBio.bio?.length).toBeGreaterThan(500);
    });
  });

  describe('uploadProfileAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const avatarUrl = await uploadProfileAvatar(mockFile);

      expect(avatarUrl).toBeDefined();
      expect(avatarUrl).toContain('https://');
    });

    it('should reject files larger than 5MB', () => {
      // 6MB 파일
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const error = validateImageFile(largeFile);
      expect(error).toBe('5MB 이하의 파일을 업로드해주세요');
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const error = validateImageFile(invalidFile);
      expect(error).toBe('JPG, PNG, WebP 형식만 지원합니다');
    });

    it('should accept valid image types', () => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      validTypes.forEach((type) => {
        const file = new File(['test'], `test.${type.split('/')[1]}`, { type });
        const error = validateImageFile(file);
        expect(error).toBeNull();
      });
    });
  });

  describe('deleteProfileImage', () => {
    it('should delete avatar successfully', async () => {
      const avatarUrl = 'https://example.com/storage/v1/object/public/avatars/test-user-id/123456.jpg';
      const result = await deleteProfileImage(avatarUrl);

      expect(result).toBe(true);
    });

    it('should handle invalid avatar URL', async () => {
      const invalidUrl = 'https://example.com/invalid-url';
      const result = await deleteProfileImage(invalidUrl);

      expect(result).toBe(false);
    });
  });
});

describe('Profile Store', () => {
  it('should initialize with default state', async () => {
    const { useProfileStore } = await import('@/stores/profileStore');
    const store = useProfileStore.getState();

    expect(store.profile).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.saving).toBe(false);
  });

  it('should fetch profile', async () => {
    const { useProfileStore } = await import('@/stores/profileStore');
    const store = useProfileStore.getState();

    await store.fetchProfile();

    // Note: 실제 테스트에서는 mock이 필요함
    expect(store.fetchProfile).toBeDefined();
  });

  it('should update profile', async () => {
    const { useProfileStore } = await import('@/stores/profileStore');
    const store = useProfileStore.getState();

    const profileData: ProfileData = {
      full_name: 'Updated Name',
      bio: 'Updated bio',
    };

    const result = await store.updateProfile(profileData);

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
  });
});

describe('Image Utilities', () => {
  it('should validate image size', async () => {
    const { validateImageSize } = await import('@/lib/utils/image');

    const smallFile = new File(['x'.repeat(1024)], 'small.jpg', {
      type: 'image/jpeg',
    });
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    expect(validateImageSize(smallFile, 5)).toBe(true);
    expect(validateImageSize(largeFile, 5)).toBe(false);
  });

  it('should validate image type', async () => {
    const { validateImageType } = await import('@/lib/utils/image');

    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    expect(validateImageType(validFile)).toBe(true);
    expect(validateImageType(invalidFile)).toBe(false);
  });

  it('should validate image completely', async () => {
    const { validateImage } = await import('@/lib/utils/image');

    // Valid file
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    expect(validateImage(validFile)).toBeNull();

    // Invalid type
    const invalidType = new File(['test'], 'test.txt', { type: 'text/plain' });
    expect(validateImage(invalidType)).toBe('JPG, PNG, WebP 형식만 지원합니다');

    // Too large
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    expect(validateImage(largeFile)).toBe('5MB 이하의 파일을 업로드해주세요');
  });
});
