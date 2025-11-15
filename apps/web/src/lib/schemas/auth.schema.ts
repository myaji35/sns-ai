import { z } from 'zod';

/**
 * 비밀번호 검증 규칙
 * - 최소 8자 이상
 * - 대문자 1개 이상
 * - 숫자 1개 이상
 * - 특수문자 1개 이상 (!@#$%^&*)
 */
const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .refine(
    (password) => /[A-Z]/.test(password),
    '비밀번호는 대문자를 최소 1개 이상 포함해야 합니다'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    '비밀번호는 숫자를 최소 1개 이상 포함해야 합니다'
  )
  .refine(
    (password) => /[!@#$%^&*]/.test(password),
    '비밀번호는 특수문자(!@#$%^&*)를 최소 1개 이상 포함해야 합니다'
  );

/**
 * 회원가입 폼 검증 스키마
 */
export const signUpSchema = z
  .object({
    email: z
      .string()
      .email('유효한 이메일 주소를 입력해주세요')
      .toLowerCase()
      .trim(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: '비밀번호가 일치하지 않습니다',
      path: ['confirmPassword'],
    }
  );

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * 비밀번호 강도 평가
 * @param password - 평가할 비밀번호
 * @returns { strength: 'weak' | 'medium' | 'strong' | 'very-strong', messages: string[] }
 */
export function evaluatePasswordStrength(password: string) {
  const messages: string[] = [];
  let score = 0;

  // 최소 길이 확인
  if (password.length >= 8) {
    score++;
  } else {
    messages.push('최소 8자 이상');
  }

  // 대문자 확인
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    messages.push('대문자 1개 이상');
  }

  // 숫자 확인
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    messages.push('숫자 1개 이상');
  }

  // 특수문자 확인
  if (/[!@#$%^&*]/.test(password)) {
    score++;
  } else {
    messages.push('특수문자(!@#$%^&*) 1개 이상');
  }

  // 강도 판정
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 4) {
    strength = 'very-strong';
  } else if (score >= 3) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }

  return { strength, messages, score };
}

/**
 * 로그인 폼 검증 스키마 (향후 사용)
 */
export const signInSchema = z.object({
  email: z
    .string()
    .email('유효한 이메일 주소를 입력해주세요')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type SignInFormData = z.infer<typeof signInSchema>;
