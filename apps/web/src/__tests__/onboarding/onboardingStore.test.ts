import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingStore } from '@/stores/onboardingStore';

describe('온보딩 스토어', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    useOnboardingStore.getState().reset();
  });

  describe('초기 상태', () => {
    it('초기 단계는 1이어야 한다', () => {
      const { currentStep } = useOnboardingStore.getState();
      expect(currentStep).toBe(1);
    });

    it('초기 이름은 빈 문자열이어야 한다', () => {
      const { fullName } = useOnboardingStore.getState();
      expect(fullName).toBe('');
    });

    it('초기 소개는 빈 문자열이어야 한다', () => {
      const { bio } = useOnboardingStore.getState();
      expect(bio).toBe('');
    });

    it('초기 아바타 파일은 null이어야 한다', () => {
      const { avatarFile } = useOnboardingStore.getState();
      expect(avatarFile).toBe(null);
    });
  });

  describe('이름 설정', () => {
    it('이름을 설정할 수 있어야 한다', () => {
      const { setFullName } = useOnboardingStore.getState();

      setFullName('홍길동');

      const { fullName } = useOnboardingStore.getState();
      expect(fullName).toBe('홍길동');
    });
  });

  describe('소개 설정', () => {
    it('소개를 설정할 수 있어야 한다', () => {
      const { setBio } = useOnboardingStore.getState();

      setBio('안녕하세요!');

      const { bio } = useOnboardingStore.getState();
      expect(bio).toBe('안녕하세요!');
    });
  });

  describe('단계 이동', () => {
    it('nextStep으로 다음 단계로 이동해야 한다', () => {
      const { nextStep } = useOnboardingStore.getState();

      nextStep();

      const { currentStep } = useOnboardingStore.getState();
      expect(currentStep).toBe(2);
    });

    it('prevStep으로 이전 단계로 이동해야 한다', () => {
      const { setCurrentStep, prevStep } = useOnboardingStore.getState();

      setCurrentStep(2);
      prevStep();

      const { currentStep } = useOnboardingStore.getState();
      expect(currentStep).toBe(1);
    });

    it('1단계에서 prevStep은 동작하지 않아야 한다', () => {
      const { prevStep } = useOnboardingStore.getState();

      prevStep();

      const { currentStep } = useOnboardingStore.getState();
      expect(currentStep).toBe(1);
    });

    it('3단계에서 nextStep은 동작하지 않아야 한다', () => {
      const { setCurrentStep, nextStep } = useOnboardingStore.getState();

      setCurrentStep(3);
      nextStep();

      const { currentStep } = useOnboardingStore.getState();
      expect(currentStep).toBe(3);
    });
  });

  describe('reset', () => {
    it('reset은 모든 상태를 초기화해야 한다', () => {
      const { setFullName, setBio, setCurrentStep, reset } = useOnboardingStore.getState();

      // 상태 변경
      setFullName('홍길동');
      setBio('테스트');
      setCurrentStep(3);

      // 초기화
      reset();

      // 검증
      const state = useOnboardingStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.fullName).toBe('');
      expect(state.bio).toBe('');
      expect(state.avatarFile).toBe(null);
      expect(state.avatarPreview).toBe(null);
    });
  });

  describe('아바타 미리보기', () => {
    it('아바타 미리보기 URL을 설정할 수 있어야 한다', () => {
      const { setAvatarPreview } = useOnboardingStore.getState();

      const previewUrl = 'data:image/png;base64,abc123';
      setAvatarPreview(previewUrl);

      const { avatarPreview } = useOnboardingStore.getState();
      expect(avatarPreview).toBe(previewUrl);
    });
  });
});
