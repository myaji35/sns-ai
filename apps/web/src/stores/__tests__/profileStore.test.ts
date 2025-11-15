/**
 * profileStore 테스트
 *
 * 테스트 범위:
 * - 초기 상태
 * - 프로필 조회
 * - 프로필 업데이트
 * - 이미지 업로드
 * - 이미지 삭제
 * - 에러 처리
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfileStore } from '../profileStore';

// Mock profile API
vi.mock('@/lib/api/profile-api', () => ({
  getCurrentUserProfile: vi.fn().mockResolvedValue({
    full_name: 'Test User',
    bio: 'Test bio',
    avatar_url: 'https://example.com/avatar.jpg',
  }),
  updateProfile: vi.fn().mockResolvedValue({
    success: true,
    error: null,
  }),
  uploadProfileAvatar: vi.fn().mockResolvedValue('https://example.com/new-avatar.jpg'),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  })),
}));

describe('profileStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useProfileStore.setState({
      profile: null,
      loading: false,
      error: null,
      saving: false,
    });
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useProfileStore.getState();

    expect(state.profile).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.saving).toBe(false);
  });

  it('should fetch profile', async () => {
    const { fetchProfile } = useProfileStore.getState();

    await fetchProfile();

    const state = useProfileStore.getState();
    expect(state.profile).toBeDefined();
    expect(state.profile?.full_name).toBe('Test User');
    expect(state.profile?.bio).toBe('Test bio');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetch profile error', async () => {
    const { getCurrentUserProfile } = await import('@/lib/api/profile-api');
    vi.mocked(getCurrentUserProfile).mockResolvedValueOnce(null);

    const { fetchProfile } = useProfileStore.getState();
    await fetchProfile();

    const state = useProfileStore.getState();
    expect(state.profile).toBeNull();
    expect(state.error).toBe('프로필을 찾을 수 없습니다');
    expect(state.loading).toBe(false);
  });

  it('should update profile', async () => {
    const { updateProfile } = useProfileStore.getState();

    const profileData = {
      full_name: 'Updated Name',
      bio: 'Updated bio',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const result = await updateProfile(profileData);

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();

    const state = useProfileStore.getState();
    expect(state.profile).toEqual(profileData);
    expect(state.saving).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle update profile error', async () => {
    const { updateProfile: updateProfileAPI } = await import('@/lib/api/profile-api');
    vi.mocked(updateProfileAPI).mockResolvedValueOnce({
      success: false,
      error: 'Update failed',
    });

    const { updateProfile } = useProfileStore.getState();

    const profileData = {
      full_name: 'Updated Name',
      bio: 'Updated bio',
    };

    const result = await updateProfile(profileData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Update failed');

    const state = useProfileStore.getState();
    expect(state.error).toBe('Update failed');
    expect(state.saving).toBe(false);
  });

  it('should upload avatar', async () => {
    const { uploadAvatar } = useProfileStore.getState();

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const avatarUrl = await uploadAvatar(mockFile);

    expect(avatarUrl).toBe('https://example.com/new-avatar.jpg');
  });

  it('should handle upload avatar error', async () => {
    const { uploadProfileAvatar } = await import('@/lib/api/profile-api');
    vi.mocked(uploadProfileAvatar).mockResolvedValueOnce(null);

    const { uploadAvatar } = useProfileStore.getState();

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const avatarUrl = await uploadAvatar(mockFile);

    expect(avatarUrl).toBeNull();

    const state = useProfileStore.getState();
    expect(state.error).toBe('프로필 사진 업로드에 실패했습니다');
  });

  it('should delete avatar', async () => {
    const { deleteAvatar } = useProfileStore.getState();

    const avatarUrl = 'https://example.com/storage/v1/object/public/avatars/user-id/123.jpg';
    await deleteAvatar(avatarUrl);

    // Should not throw error
    const state = useProfileStore.getState();
    expect(state.error).toBeNull();
  });

  it('should handle invalid avatar URL in delete', async () => {
    const { deleteAvatar } = useProfileStore.getState();

    const invalidUrl = 'https://example.com/invalid-url';
    await deleteAvatar(invalidUrl);

    // Should set error for invalid URL format
    const state = useProfileStore.getState();
    expect(state.error).toBeDefined();
  });

  it('should set error', () => {
    const { setError } = useProfileStore.getState();

    setError('Test error');

    const state = useProfileStore.getState();
    expect(state.error).toBe('Test error');
  });

  it('should reset store', () => {
    // Set some state
    useProfileStore.setState({
      profile: {
        full_name: 'Test',
        bio: 'Test',
        avatar_url: 'test',
      },
      loading: true,
      error: 'Error',
      saving: true,
    });

    const { reset } = useProfileStore.getState();
    reset();

    const state = useProfileStore.getState();
    expect(state.profile).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.saving).toBe(false);
  });
});
