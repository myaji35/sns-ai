import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  // 상태
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 액션
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

/**
 * 인증 상태 관리 Store (Zustand)
 *
 * 사용 예:
 * const { user, isAuthenticated } = useAuthStore();
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // 사용자 정보 설정
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      // 인증 상태 설정
      setAuthenticated: (isAuthenticated) =>
        set({
          isAuthenticated,
        }),

      // 로딩 상태 설정
      setLoading: (isLoading) =>
        set({
          isLoading,
        }),

      // 로그아웃
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-storage', // localStorage 키 이름
      partialize: (state) => ({
        // 로컬스토리지에 저장할 상태 선택 (user 정보는 Supabase에서 관리하므로 저장 안 함)
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export type { AuthState };
