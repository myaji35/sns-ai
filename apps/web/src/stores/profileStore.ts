import { create } from 'zustand';
import { getCurrentUserProfile, updateProfile, uploadProfileAvatar, ProfileData } from '@/lib/api/profile-api';
import { createClient } from '@/lib/supabase/client';

interface ProfileState {
  // 상태
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  saving: boolean;

  // 액션
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<{ success: boolean; error: string | null }>;
  uploadAvatar: (file: File) => Promise<string | null>;
  deleteAvatar: (avatarUrl: string) => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * 프로필 상태 관리 Store (Zustand)
 *
 * 프로필 정보를 관리하고 CRUD 작업을 처리합니다.
 *
 * 사용 예:
 * const { profile, fetchProfile, updateProfile } = useProfileStore();
 */
export const useProfileStore = create<ProfileState>((set, get) => ({
  // 초기 상태
  profile: null,
  loading: false,
  error: null,
  saving: false,

  // 프로필 조회
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await getCurrentUserProfile();
      if (profile) {
        set({ profile, loading: false });
      } else {
        set({ error: '프로필을 찾을 수 없습니다', loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      set({ error: '프로필을 불러오는데 실패했습니다', loading: false });
    }
  },

  // 프로필 업데이트
  updateProfile: async (data: ProfileData) => {
    set({ saving: true, error: null });
    try {
      const result = await updateProfile(data);
      if (result.success) {
        set({ profile: data, saving: false });
        return { success: true, error: null };
      } else {
        set({ error: result.error, saving: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMsg = '프로필 수정에 실패했습니다';
      set({ error: errorMsg, saving: false });
      return { success: false, error: errorMsg };
    }
  },

  // 프로필 사진 업로드
  uploadAvatar: async (file: File) => {
    try {
      const avatarUrl = await uploadProfileAvatar(file);
      return avatarUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      set({ error: '프로필 사진 업로드에 실패했습니다' });
      return null;
    }
  },

  // 프로필 사진 삭제
  deleteAvatar: async (avatarUrl: string) => {
    try {
      const supabase = createClient();

      // Storage에서 파일 경로 추출
      // avatarUrl 형식: https://{project}.supabase.co/storage/v1/object/public/avatars/{userId}/{timestamp}.{ext}
      const urlParts = avatarUrl.split('/avatars/');
      if (urlParts.length !== 2) {
        console.error('Invalid avatar URL format');
        return;
      }

      const filePath = urlParts[1];

      // Storage에서 파일 삭제
      const { error } = await supabase.storage.from('avatars').remove([filePath]);

      if (error) {
        console.error('Failed to delete avatar from storage:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      set({ error: '프로필 사진 삭제에 실패했습니다' });
    }
  },

  // 에러 설정
  setError: (error: string | null) => set({ error }),

  // 상태 초기화
  reset: () =>
    set({
      profile: null,
      loading: false,
      error: null,
      saving: false,
    }),
}));

export type { ProfileState, ProfileData };
