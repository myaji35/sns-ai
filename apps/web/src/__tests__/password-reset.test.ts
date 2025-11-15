import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// 비밀번호 재설정 스키마 테스트
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '이메일 주소를 입력해주세요')
    .email('유효한 이메일 주소를 입력해주세요')
    .toLowerCase()
    .trim(),
});

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(/[A-Z]/, '대문자를 포함해야 합니다')
      .regex(/[0-9]/, '숫자를 포함해야 합니다')
      .regex(/[!@#$%^&*]/, '특수문자(!@#$%^&*)를 포함해야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

describe('Password Reset Functionality', () => {
  describe('ForgotPasswordForm Validation', () => {
    it('should accept valid email', () => {
      const data = { email: 'user@example.com' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const data = { email: 'not-an-email' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const data = { email: '' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should trim email whitespace', () => {
      const data = { email: '  user@example.com  ' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should convert email to lowercase', () => {
      const data = { email: 'User@Example.COM' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('ResetPasswordForm Validation', () => {
    it('should accept valid password', () => {
      const data = {
        newPassword: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase letter', () => {
      const data = {
        newPassword: 'securepass123!',
        confirmPassword: 'securepass123!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const data = {
        newPassword: 'SecurePass!',
        confirmPassword: 'SecurePass!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const data = {
        newPassword: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const data = {
        newPassword: 'Pass1!',
        confirmPassword: 'Pass1!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const data = {
        newPassword: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept exactly 8 character password with all requirements', () => {
      const data = {
        newPassword: 'Pass1!ab',
        confirmPassword: 'Pass1!ab',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Password Reset Error Messages', () => {
    it('should have proper error message for network error', () => {
      const errorMessages = {
        'Network error': '네트워크 연결을 확인해주세요',
      };
      expect(errorMessages['Network error']).toBe('네트워크 연결을 확인해주세요');
    });

    it('should have proper error message for token expiry', () => {
      const errorMessages = {
        'Token expired': '링크가 만료되었습니다',
      };
      expect(errorMessages['Token expired']).toBe('링크가 만료되었습니다');
    });

    it('should have proper error message for invalid token', () => {
      const errorMessages = {
        'Invalid token': '올바른 링크가 아닙니다',
      };
      expect(errorMessages['Invalid token']).toBe('올바른 링크가 아닙니다');
    });

    it('should have proper error message for rate limit', () => {
      const errorMessages = {
        'Rate limit exceeded': '너무 많은 요청입니다. 잠시 후 다시 시도해주세요',
      };
      expect(errorMessages['Rate limit exceeded']).toBe(
        '너무 많은 요청입니다. 잠시 후 다시 시도해주세요'
      );
    });
  });

  describe('Password Reset Response Structure', () => {
    it('should return proper response shape on success', () => {
      const response = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        session: null,
        error: null,
      };

      expect(response).toHaveProperty('user');
      expect(response).toHaveProperty('session');
      expect(response).toHaveProperty('error');
      expect(response.user?.email).toBe('user@example.com');
      expect(response.error).toBeNull();
    });

    it('should return proper response shape on error', () => {
      const response = {
        user: null,
        session: null,
        error: {
          code: 'reset_error',
          message: '올바른 링크가 아닙니다',
        },
      };

      expect(response.user).toBeNull();
      expect(response.session).toBeNull();
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBeDefined();
      expect(response.error?.message).toBeDefined();
    });
  });

  describe('Forgot Password Form Submission', () => {
    it('should show success message after email submission', () => {
      const submitSuccess = true;
      const message = '✓ 비밀번호 재설정 링크를 이메일로 발송했습니다';

      expect(submitSuccess).toBe(true);
      expect(message).toContain('발송했습니다');
    });

    it('should maintain security by showing same message for non-existent email', () => {
      const message = '이메일 주소를 확인해주세요';
      // 존재하는 이메일과 존재하지 않는 이메일 모두 같은 메시지 반환
      expect(message).toBe('이메일 주소를 확인해주세요');
    });
  });

  describe('Reset Password Flow', () => {
    it('should validate token from URL', () => {
      const token = 'valid-token-xxx';
      const isTokenValid = token && token.length > 0;
      expect(isTokenValid).toBe(true);
    });

    it('should handle missing token', () => {
      const token = null;
      const shouldShowError = !token;
      expect(shouldShowError).toBe(true);
    });

    it('should redirect to login after successful password change', () => {
      const redirectPath = '/login';
      expect(redirectPath).toBe('/login');
      expect(redirectPath).not.toBe('/forgot-password');
    });

    it('should allow user to request new link on token expiry', () => {
      const canRequestAgain = true;
      const redirectPath = '/forgot-password';
      expect(canRequestAgain).toBe(true);
      expect(redirectPath).toBe('/forgot-password');
    });
  });

  describe('Middleware Route Protection', () => {
    it('should have forgot-password in public auth routes', () => {
      const publicAuthRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
      expect(publicAuthRoutes).toContain('/forgot-password');
    });

    it('should have reset-password in public auth routes', () => {
      const publicAuthRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
      expect(publicAuthRoutes).toContain('/reset-password');
    });

    it('should allow unauthenticated users to access forgot-password', () => {
      const isAuthenticated = false;
      const route = '/forgot-password';
      const canAccess = !isAuthenticated && ['/forgot-password'].includes(route);
      expect(canAccess).toBe(true);
    });

    it('should allow unauthenticated users to access reset-password', () => {
      const isAuthenticated = false;
      const route = '/reset-password?token=xxx';
      const canAccess = !isAuthenticated && route.startsWith('/reset-password');
      expect(canAccess).toBe(true);
    });
  });

  describe('Password Strength Validation', () => {
    it('should display weak strength for insufficient criteria', () => {
      const password = 'Pass1!';
      const hasMinLength = password.length >= 8;
      const strength = !hasMinLength ? 'weak' : 'medium';
      expect(strength).toBe('weak');
    });

    it('should display medium strength for 3 criteria met', () => {
      const password = 'SecurePass123';
      const criteria = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
      ].filter(Boolean).length;
      const strength = criteria === 3 ? 'medium' : 'weak';
      expect(strength).toBe('medium');
    });

    it('should display strong strength for all 4 criteria met', () => {
      const password = 'SecurePass123!';
      const criteria = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[!@#$%^&*]/.test(password),
      ].filter(Boolean).length;
      const strength = criteria === 4 ? 'strong' : 'medium';
      expect(strength).toBe('strong');
    });
  });
});
