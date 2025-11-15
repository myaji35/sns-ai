import { createClient } from '@/lib/supabase/client';
import type { User, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

/**
 * 인증 응답 타입
 */
export interface AuthResponse {
  user: User | null;
  session: any | null;
  error: AuthError | null;
}

/**
 * 인증 에러 타입
 */
export interface AuthError {
  code: string;
  message: string;
  status?: number;
}

/**
 * 에러 메시지 매핑
 * Supabase에서 반환하는 영문 에러를 한글로 변환
 */
const errorMessageMap: Record<string, string> = {
  'User already registered': '이미 가입된 이메일입니다',
  'Invalid email': '유효하지 않은 이메일 주소입니다',
  'Password should be at least 8 characters': '비밀번호는 최소 8자 이상이어야 합니다',
  'Invalid login credentials': '이메일 또는 비밀번호가 틀렸습니다',
  'Email rate limit exceeded': '이메일 요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
  'Token has expired or is invalid': '세션이 만료되었습니다. 다시 로그인해주세요',
  'Invalid API Key': 'API 설정 오류가 발생했습니다. 관리자에게 문의하세요',
  'Signup disabled': '현재 회원가입이 비활성화되어 있습니다',
  'OAuth error: popup_blocked': '팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요',
  'User cancelled': 'Google 로그인이 취소되었습니다',
  'access_denied': 'Google 계정 접근 권한이 거부되었습니다',
  'over_request_rate_limit': '너무 많은 요청입니다. 잠시 후 다시 시도해주세요',
  'invalid_grant': '올바른 링크가 아닙니다',
};

/**
 * 에러 코드를 한글 메시지로 변환
 */
function translateErrorMessage(error: SupabaseAuthError | Error): string {
  const errorMessage = error.message || String(error);

  // 정확한 매핑 확인
  if (errorMessageMap[errorMessage]) {
    return errorMessageMap[errorMessage];
  }

  // 부분적인 매핑 확인
  for (const [key, value] of Object.entries(errorMessageMap)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // 기본 메시지 (영문 에러일 경우 그대로 반환)
  return errorMessage || '알 수 없는 오류가 발생했습니다';
}

/**
 * 회원가입
 * @param email - 사용자 이메일
 * @param password - 사용자 비밀번호
 * @returns AuthResponse
 */
export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // Supabase Auth에 사용자 생성
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });

    if (signUpError) {
      return {
        user: null,
        session: null,
        error: {
          code: signUpError.status?.toString() || 'signup_error',
          message: translateErrorMessage(signUpError),
          status: signUpError.status,
        },
      };
    }

    // 회원가입 성공 시 자동 로그인
    if (data.user) {
      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    }

    return {
      user: null,
      session: null,
      error: {
        code: 'unknown_error',
        message: '회원가입에 실패했습니다. 다시 시도해주세요',
      },
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        code: 'network_error',
        message: '네트워크 연결을 확인해주세요',
      },
    };
  }
}

/**
 * 로그인
 * @param email - 사용자 이메일
 * @param password - 사용자 비밀번호
 * @returns AuthResponse
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return {
        user: null,
        session: null,
        error: {
          code: signInError.status?.toString() || 'signin_error',
          message: translateErrorMessage(signInError),
          status: signInError.status,
        },
      };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        code: 'network_error',
        message: '네트워크 연결을 확인해주세요',
      },
    };
  }
}

/**
 * 로그아웃
 * @returns AuthResponse
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      return {
        user: null,
        session: null,
        error: {
          code: 'signout_error',
          message: translateErrorMessage(signOutError),
        },
      };
    }

    return {
      user: null,
      session: null,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        code: 'network_error',
        message: '로그아웃에 실패했습니다',
      },
    };
  }
}

/**
 * 현재 세션 가져오기
 * @returns 현재 세션 또는 null
 */
export async function getSession() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return null;
    }

    return data.session;
  } catch (error) {
    return null;
  }
}

/**
 * 현재 사용자 가져오기
 * @returns 현재 사용자 또는 null
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch (error) {
    return null;
  }
}

/**
 * 비밀번호 재설정 이메일 발송
 * @param email - 사용자 이메일
 * @returns 성공 여부
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
    });

    if (resetError) {
      return {
        user: null,
        session: null,
        error: {
          code: 'reset_error',
          message: translateErrorMessage(resetError),
        },
      };
    }

    return {
      user: null,
      session: null,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        code: 'network_error',
        message: '네트워크 연결을 확인해주세요',
      },
    };
  }
}

/**
 * 새로운 비밀번호로 업데이트 (재설정)
 * @param newPassword - 새로운 비밀번호
 * @returns AuthResponse
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return {
        user: null,
        session: null,
        error: {
          code: 'update_password_error',
          message: translateErrorMessage(updateError),
        },
      };
    }

    return {
      user: data.user,
      session: null,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        code: 'network_error',
        message: '네트워크 연결을 확인해주세요',
      },
    };
  }
}

/**
 * Google OAuth로 로그인/회원가입
 * @returns AuthResponse
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/v1/callback`,
      },
    });

    if (oauthError) {
      return {
        user: null,
        session: null,
        error: {
          code: oauthError.status?.toString() || 'oauth_error',
          message: translateErrorMessage(oauthError),
          status: oauthError.status,
        },
      };
    }

    // OAuth 플로우는 리다이렉트되므로 즉시 응답 반환 (실제 로그인은 콜백에서 처리)
    return {
      user: null,
      session: null,
      error: null,
    };
  } catch (error) {
    // 사용자가 팝업을 취소한 경우
    const errorStr = String(error);
    if (errorStr.includes('popup') || errorStr.includes('closed')) {
      return {
        user: null,
        session: null,
        error: {
          code: 'popup_blocked',
          message: '팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요',
        },
      };
    }

    return {
      user: null,
      session: null,
      error: {
        code: 'oauth_error',
        message: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요',
      },
    };
  }
}
