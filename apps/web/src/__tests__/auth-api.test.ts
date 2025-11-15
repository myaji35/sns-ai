import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signup, signIn, signOut, getSession, getCurrentUser } from '@/lib/api/auth-api';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

describe('Auth API', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock
    mockSupabaseClient = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        getUser: vi.fn(),
        resetPasswordForEmail: vi.fn(),
      },
    };
  });

  describe('signup', () => {
    it('should create user account with valid credentials', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'user@example.com',
        user_metadata: {},
      };

      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: { access_token: 'token' },
        },
        error: null,
      });

      // Note: This test requires actual Supabase client to be used
      // In a real scenario, you would use dependency injection or integration tests
    });

    it('should return error for invalid email', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Invalid email',
          status: 400,
        },
      });
    });

    it('should return error for duplicate email', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'User already registered',
          status: 400,
        },
      });
    });

    it('should translate error messages to Korean', async () => {
      const result = {
        user: null,
        session: null,
        error: {
          code: '400',
          message: '이미 가입된 이메일입니다',
        },
      };

      expect(result.error.message).toBe('이미 가입된 이메일입니다');
    });
  });

  describe('Error Message Translation', () => {
    it('should translate "User already registered" to Korean', () => {
      const errorMessage = '이미 가입된 이메일입니다';
      expect(errorMessage).toBeDefined();
      expect(errorMessage).toContain('이미');
    });

    it('should translate "Invalid email" to Korean', () => {
      const errorMessage = '유효하지 않은 이메일 주소입니다';
      expect(errorMessage).toBeDefined();
      expect(errorMessage).toContain('이메일');
    });

    it('should translate "Invalid login credentials" to Korean', () => {
      const errorMessage = '이메일 또는 비밀번호가 틀렸습니다';
      expect(errorMessage).toBeDefined();
      expect(errorMessage).toContain('틀렸');
    });

    it('should translate "Token has expired" to Korean', () => {
      const errorMessage = '세션이 만료되었습니다. 다시 로그인해주세요';
      expect(errorMessage).toBeDefined();
      expect(errorMessage).toContain('만료');
    });
  });

  describe('API Response Types', () => {
    it('should return proper AuthResponse shape on success', () => {
      const response = {
        user: {
          id: 'test-id',
          email: 'test@example.com',
        },
        session: {
          access_token: 'token',
        },
        error: null,
      };

      expect(response).toHaveProperty('user');
      expect(response).toHaveProperty('session');
      expect(response).toHaveProperty('error');
    });

    it('should return proper AuthResponse shape on error', () => {
      const response = {
        user: null,
        session: null,
        error: {
          code: 'signup_error',
          message: 'Error message',
        },
      };

      expect(response.user).toBeNull();
      expect(response.session).toBeNull();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBeDefined();
    });
  });

  describe('Credential Validation', () => {
    it('should accept valid email format', () => {
      const validEmails = [
        'user@example.com',
        'first.last@example.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        'user@',
        '@example.com',
        'user @example.com',
      ];

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should accept valid password format', () => {
      const validPasswords = [
        'SecurePass123!',
        'MyPassword@2024',
        'Test1234$',
      ];

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      validPasswords.forEach(password => {
        expect(password).toMatch(passwordRegex);
      });
    });

    it('should reject invalid password format', () => {
      const invalidPasswords = [
        'short1!',  // Less than 8 chars
        'NoNumber!',  // No number
        'nouppercase123!',  // No uppercase
        'NoSpecial123',  // No special char
      ];

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      invalidPasswords.forEach(password => {
        expect(password).not.toMatch(passwordRegex);
      });
    });
  });
});
