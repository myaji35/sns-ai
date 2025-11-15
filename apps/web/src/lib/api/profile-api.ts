import { createClient } from '@/lib/supabase/client';

/**
 * 프로필 업데이트 응답 타입
 */
export interface ProfileUpdateResponse {
  success: boolean;
  error: string | null;
}

/**
 * 프로필 데이터 타입
 */
export interface ProfileData {
  full_name: string;
  bio?: string;
  avatar_url?: string;
}

/**
 * 에러 메시지 매핑
 */
const errorMessageMap: Record<string, string> = {
  'Failed to update profile': '프로필 업데이트에 실패했습니다',
  'Failed to upload avatar': '프로필 사진 업로드에 실패했습니다',
  'Network error': '네트워크 연결을 확인해주세요',
  'File size too large': '5MB 이하의 파일을 업로드해주세요',
  'Invalid file type': 'JPG, PNG, WebP 형식만 지원합니다',
};

/**
 * 에러 메시지 변환
 */
function translateErrorMessage(error: string): string {
  return errorMessageMap[error] || error || '알 수 없는 오류가 발생했습니다';
}

/**
 * 프로필 정보 업데이트
 * @param data - 프로필 데이터 (이름, 소개, 프로필 사진 URL)
 * @returns ProfileUpdateResponse
 */
export async function updateProfile(data: ProfileData): Promise<ProfileUpdateResponse> {
  try {
    const supabase = createClient();

    // 현재 사용자 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: '사용자 정보를 찾을 수 없습니다',
      };
    }

    // 프로필 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        bio: data.bio || null,
        avatar_url: data.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return {
        success: false,
        error: translateErrorMessage('Failed to update profile'),
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: translateErrorMessage('Network error'),
    };
  }
}

/**
 * 프로필 사진 업로드
 * @param file - 업로드할 이미지 파일
 * @returns 업로드된 이미지의 공개 URL 또는 null
 */
export async function uploadProfileAvatar(file: File): Promise<string | null> {
  try {
    const supabase = createClient();

    // 현재 사용자 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User not found');
      return null;
    }

    // 파일 검증
    const validationError = validateImageFile(file);
    if (validationError) {
      console.error('File validation error:', validationError);
      return null;
    }

    // 파일 이름 생성 (userId/timestamp.ext)
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${timestamp}.${fileExt}`;

    // Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Avatar upload error:', error);
    return null;
  }
}

/**
 * 이미지 파일 검증
 * @param file - 검증할 파일
 * @returns 에러 메시지 또는 null
 */
export function validateImageFile(file: File): string | null {
  // 파일 크기 검증 (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    return translateErrorMessage('File size too large');
  }

  // 파일 형식 검증 (JPG, PNG, WebP)
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return translateErrorMessage('Invalid file type');
  }

  return null;
}

/**
 * 현재 사용자 프로필 가져오기
 * @returns 프로필 데이터 또는 null
 */
export async function getCurrentUserProfile(): Promise<ProfileData | null> {
  try {
    const supabase = createClient();

    // 현재 사용자 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // 프로필 조회
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, bio, avatar_url')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      full_name: data.full_name || '',
      bio: data.bio || '',
      avatar_url: data.avatar_url || '',
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

/**
 * 프로필 이미지 삭제
 * @param avatarUrl - 삭제할 이미지의 공개 URL
 * @returns 성공 여부
 */
export async function deleteProfileImage(avatarUrl: string): Promise<boolean> {
  try {
    const supabase = createClient();

    // Storage에서 파일 경로 추출
    // avatarUrl 형식: https://{project}.supabase.co/storage/v1/object/public/avatars/{userId}/{timestamp}.{ext}
    const urlParts = avatarUrl.split('/avatars/');
    if (urlParts.length !== 2) {
      console.error('Invalid avatar URL format');
      return false;
    }

    const filePath = urlParts[1];

    // Storage에서 파일 삭제
    const { error } = await supabase.storage.from('avatars').remove([filePath]);

    if (error) {
      console.error('Failed to delete avatar from storage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete avatar:', error);
    return false;
  }
}

/**
 * 사용자의 모든 프로필 이미지 삭제
 * 계정 삭제 시 사용자의 Storage 폴더(avatars/{userId})를 완전히 삭제
 *
 * @param userId - 삭제할 사용자 ID
 * @returns 성공 여부
 */
export async function deleteAllUserProfileImages(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();

    // 사용자 폴더 내의 모든 파일 목록 가져오기
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (listError) {
      console.error('Failed to list user files:', listError);
      return false;
    }

    // 파일이 없으면 성공으로 간주
    if (!files || files.length === 0) {
      return true;
    }

    // 모든 파일의 전체 경로 생성
    const filePaths = files.map((file) => `${userId}/${file.name}`);

    // Storage에서 모든 파일 삭제
    const { error: removeError } = await supabase.storage
      .from('avatars')
      .remove(filePaths);

    if (removeError) {
      console.error('Failed to delete user files from storage:', removeError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete all user profile images:', error);
    return false;
  }
}
