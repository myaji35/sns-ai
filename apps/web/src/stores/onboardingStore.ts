import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  // 상태
  currentStep: 1 | 2 | 3;
  fullName: string;
  bio: string;
  avatarFile: File | null;
  avatarPreview: string | null;

  // 액션
  setCurrentStep: (step: 1 | 2 | 3) => void;
  setFullName: (fullName: string) => void;
  setBio: (bio: string) => void;
  setAvatarFile: (file: File | null) => void;
  setAvatarPreview: (preview: string | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

/**
 * 온보딩 상태 관리 Store (Zustand)
 *
 * 페이지 새로고침 시에도 입력값이 유지됩니다 (sessionStorage 사용)
 *
 * 사용 예:
 * const { fullName, setFullName, nextStep } = useOnboardingStore();
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentStep: 1,
      fullName: '',
      bio: '',
      avatarFile: null,
      avatarPreview: null,

      // 현재 단계 설정
      setCurrentStep: (step) => set({ currentStep: step }),

      // 이름 설정
      setFullName: (fullName) => set({ fullName }),

      // 소개 설정
      setBio: (bio) => set({ bio }),

      // 프로필 사진 파일 설정
      setAvatarFile: (file) => set({ avatarFile: file }),

      // 프로필 사진 미리보기 URL 설정
      setAvatarPreview: (preview) => set({ avatarPreview: preview }),

      // 다음 단계로 이동
      nextStep: () => {
        const currentStep = get().currentStep;
        if (currentStep < 3) {
          set({ currentStep: (currentStep + 1) as 1 | 2 | 3 });
        }
      },

      // 이전 단계로 이동
      prevStep: () => {
        const currentStep = get().currentStep;
        if (currentStep > 1) {
          set({ currentStep: (currentStep - 1) as 1 | 2 | 3 });
        }
      },

      // 상태 초기화
      reset: () =>
        set({
          currentStep: 1,
          fullName: '',
          bio: '',
          avatarFile: null,
          avatarPreview: null,
        }),
    }),
    {
      name: 'onboarding-storage', // sessionStorage 키 이름
      // sessionStorage 사용 (브라우저 닫으면 삭제됨)
      storage: typeof window !== 'undefined' ? {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      } : undefined,
      partialize: (state) => ({
        // sessionStorage에 저장할 상태 선택 (File 객체는 직렬화 불가능하므로 제외)
        currentStep: state.currentStep,
        fullName: state.fullName,
        bio: state.bio,
        avatarPreview: state.avatarPreview,
        // avatarFile은 저장하지 않음 (File 객체는 sessionStorage에 저장 불가)
      }),
    }
  )
);

export type { OnboardingState };
