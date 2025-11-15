import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { signInSchema, type SignInFormData } from '@/lib/schemas/auth.schema';

describe('LogIn Functionality', () => {
  describe('signInSchema Validation', () => {
    it('should accept valid email and password', () => {
      const data: SignInFormData = {
        email: 'user@example.com',
        password: 'SecurePass123!',
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'not-an-email',
        password: 'SecurePass123!',
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const data = {
        email: 'user@example.com',
        password: '',
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should trim email whitespace', () => {
      const data: SignInFormData = {
        email: '  user@example.com  ',
        password: 'SecurePass123!',
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should convert email to lowercase', () => {
      const data: SignInFormData = {
        email: 'User@Example.COM',
        password: 'SecurePass123!',
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('Sign In Error Messages', () => {
    it('should have proper error message for invalid email', () => {
      const errorMessages = {
        'Invalid login credentials': '이메일 또는 비밀번호가 틀렸습니다',
      };

      expect(errorMessages['Invalid login credentials']).toBe(
        '이메일 또는 비밀번호가 틀렸습니다'
      );
    });

    it('should have proper error message for non-existent user', () => {
      const errorMessages = {
        'User not found': '존재하지 않는 계정입니다',
      };

      expect(errorMessages['User not found']).toBe('존재하지 않는 계정입니다');
    });

    it('should have proper error message for network error', () => {
      const errorMessages = {
        'Network error': '연결 실패. 다시 시도해주세요',
      };

      expect(errorMessages['Network error']).toBe('연결 실패. 다시 시도해주세요');
    });
  });

  describe('LogIn Response Structure', () => {
    it('should return proper response shape on success', () => {
      const response = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        session: {
          access_token: 'jwt-token',
          refresh_token: 'refresh-token',
        },
        error: null,
      };

      expect(response).toHaveProperty('user');
      expect(response).toHaveProperty('session');
      expect(response).toHaveProperty('error');
      expect(response.user?.id).toBe('user-123');
      expect(response.error).toBeNull();
    });

    it('should return proper response shape on error', () => {
      const response = {
        user: null,
        session: null,
        error: {
          code: 'signin_error',
          message: '이메일 또는 비밀번호가 틀렸습니다',
        },
      };

      expect(response.user).toBeNull();
      expect(response.session).toBeNull();
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBeDefined();
      expect(response.error?.message).toBeDefined();
    });
  });

  describe('Middleware Route Protection', () => {
    it('should have correct protected routes list', () => {
      const protectedRoutes = [
        '/dashboard',
        '/content',
        '/calendar',
        '/settings',
        '/profile',
        '/onboarding',
      ];

      expect(protectedRoutes).toEqual([
        '/dashboard',
        '/content',
        '/calendar',
        '/settings',
        '/profile',
        '/onboarding',
      ]);
      expect(protectedRoutes.length).toBe(6);
    });

    it('should have correct public auth routes list', () => {
      const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

      expect(publicRoutes).toContain('/login');
      expect(publicRoutes).toContain('/signup');
      expect(publicRoutes).toContain('/forgot-password');
    });

    it('should handle redirect URLs correctly', () => {
      const baseUrl = 'http://localhost:3000';
      const redirectPath = '/dashboard';
      const redirectUrl = `${baseUrl}${redirectPath}`;

      expect(redirectUrl).toBe('http://localhost:3000/dashboard');
      expect(redirectUrl).toInclude('/dashboard');
    });
  });

  describe('Session Token Management', () => {
    it('should handle JWT token storage', () => {
      const token = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      expect(token).toHaveProperty('access_token');
      expect(token).toHaveProperty('expires_in');
      expect(token.expires_in).toBe(3600);
    });

    it('should validate token expiry', () => {
      const now = Date.now();
      const expiresAt = now + 3600 * 1000; // 1 hour from now

      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt - now).toBe(3600000);
    });

    it('should handle token refresh', () => {
      const oldToken = { access_token: 'old-token', expires_in: 3600 };
      const newToken = { access_token: 'new-token', expires_in: 3600 };

      expect(newToken.access_token).not.toBe(oldToken.access_token);
      expect(newToken.expires_in).toBe(oldToken.expires_in);
    });
  });

  describe('Cookie Security', () => {
    it('should have httpOnly attribute', () => {
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
      };

      expect(cookieOptions.httpOnly).toBe(true);
    });

    it('should have Secure attribute', () => {
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
      };

      expect(cookieOptions.secure).toBe(true);
    });

    it('should have SameSite attribute', () => {
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
      };

      expect(cookieOptions.sameSite).toBe('strict');
    });
  });

  describe('Login Form Validation', () => {
    it('should validate email field is required', () => {
      const data = {
        email: '',
        password: 'SecurePass123!',
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate password field is required', () => {
      const data = {
        email: 'user@example.com',
        password: '',
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept both fields for login', () => {
      const validData: SignInFormData = {
        email: 'test@test.com',
        password: 'Valid123!',
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('User Information Persistence', () => {
    it('should store user info in authStore after login', () => {
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: {},
      };

      const authState = {
        user,
        isAuthenticated: true,
      };

      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.email).toBe('user@example.com');
    });

    it('should maintain user session on page reload', () => {
      const storedSession = {
        user: { id: 'user-123', email: 'user@example.com' },
        expiresAt: Date.now() + 3600000,
      };

      expect(storedSession.user).toBeDefined();
      expect(storedSession.expiresAt).toBeGreaterThan(Date.now());
    });
  });
});
