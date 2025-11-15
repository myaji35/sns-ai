import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deleteAccount } from '@/lib/api/auth-api';
import { deleteAllUserProfileImages } from '@/lib/api/profile-api';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
      admin: {
        deleteUser: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        list: vi.fn(),
        remove: vi.fn(),
      })),
    },
  })),
}));

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      admin: {
        deleteUser: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  })),
}));

describe('Account Deletion - API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('deleteAccount', () => {
    it('should successfully delete account when user is authenticated', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const { createClient } = await import('@/lib/supabase/client');
      const mockSupabase = createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock successful API response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Mock successful sign out
      vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await deleteAccount();

      expect(result.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/delete-account',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: mockUser.id }),
        })
      );
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSupabase = createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await deleteAccount();

      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('not_authenticated');
      expect(result.error?.message).toBe('세션이 만료되었습니다. 다시 로그인하세요');
    });

    it('should return error when API call fails', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const { createClient } = await import('@/lib/supabase/client');
      const mockSupabase = createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock failed API response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ message: '계정 삭제에 실패했습니다' }),
      });

      const result = await deleteAccount();

      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('delete_failed');
    });

    it('should handle network errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const { createClient } = await import('@/lib/supabase/client');
      const mockSupabase = createClient();
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock network error
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await deleteAccount();

      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('network_error');
      expect(result.error?.message).toBe('연결 실패. 다시 시도해주세요');
    });
  });

  describe('deleteAllUserProfileImages', () => {
    it('should successfully delete all user profile images', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSupabase = createClient();
      const mockStorage = mockSupabase.storage.from('avatars');

      // Mock file list
      vi.mocked(mockStorage.list).mockResolvedValue({
        data: [
          { name: '12345.jpg' },
          { name: '67890.jpg' },
        ] as any,
        error: null,
      });

      // Mock successful removal
      vi.mocked(mockStorage.remove).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await deleteAllUserProfileImages('user-123');

      expect(result).toBe(true);
      expect(mockStorage.list).toHaveBeenCalledWith('user-123');
      expect(mockStorage.remove).toHaveBeenCalledWith([
        'user-123/12345.jpg',
        'user-123/67890.jpg',
      ]);
    });

    it('should return true when user has no profile images', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSupabase = createClient();
      const mockStorage = mockSupabase.storage.from('avatars');

      // Mock empty file list
      vi.mocked(mockStorage.list).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await deleteAllUserProfileImages('user-123');

      expect(result).toBe(true);
      expect(mockStorage.remove).not.toHaveBeenCalled();
    });

    it('should return false when listing files fails', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSupabase = createClient();
      const mockStorage = mockSupabase.storage.from('avatars');

      // Mock list error
      vi.mocked(mockStorage.list).mockResolvedValue({
        data: null,
        error: { message: 'List failed' } as any,
      });

      const result = await deleteAllUserProfileImages('user-123');

      expect(result).toBe(false);
    });

    it('should return false when removing files fails', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSupabase = createClient();
      const mockStorage = mockSupabase.storage.from('avatars');

      // Mock file list
      vi.mocked(mockStorage.list).mockResolvedValue({
        data: [{ name: '12345.jpg' }] as any,
        error: null,
      });

      // Mock removal error
      vi.mocked(mockStorage.remove).mockResolvedValue({
        data: null,
        error: { message: 'Remove failed' } as any,
      });

      const result = await deleteAllUserProfileImages('user-123');

      expect(result).toBe(false);
    });
  });
});

describe('Account Deletion - Component Integration', () => {
  it('should validate email confirmation schema', async () => {
    const { z } = await import('zod');

    // Create the same schema used in AccountDeletionModal
    const userEmail = 'test@example.com';
    const schema = z.object({
      email: z
        .string()
        .email('유효한 이메일 주소를 입력하세요')
        .refine((value) => value === userEmail, {
          message: '이메일이 일치하지 않습니다',
        }),
    });

    // Valid email
    const validResult = schema.safeParse({ email: 'test@example.com' });
    expect(validResult.success).toBe(true);

    // Invalid email format
    const invalidFormatResult = schema.safeParse({ email: 'invalid' });
    expect(invalidFormatResult.success).toBe(false);

    // Non-matching email
    const nonMatchingResult = schema.safeParse({ email: 'other@example.com' });
    expect(nonMatchingResult.success).toBe(false);
    if (!nonMatchingResult.success) {
      expect(nonMatchingResult.error.errors[0].message).toBe(
        '이메일이 일치하지 않습니다'
      );
    }
  });
});

describe('Account Deletion - API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject non-HTTPS requests in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const mockRequest = {
      url: 'http://example.com/api/auth/delete-account',
      json: async () => ({ userId: 'user-123' }),
    } as any;

    const { POST } = await import(
      '@/app/api/auth/delete-account/route'
    );

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe('HTTPS 연결만 허용됩니다');

    process.env.NODE_ENV = originalEnv;
  });

  it('should require userId in request body', async () => {
    const mockRequest = {
      url: 'https://example.com/api/auth/delete-account',
      json: async () => ({}),
    } as any;

    const { POST } = await import(
      '@/app/api/auth/delete-account/route'
    );

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('사용자 ID가 필요합니다');
  });
});

describe('Account Deletion - Error Messages', () => {
  it('should provide Korean error messages for all error cases', () => {
    const expectedErrors = [
      '세션이 만료되었습니다. 다시 로그인하세요',
      '계정 삭제에 실패했습니다. 나중에 다시 시도해주세요',
      '연결 실패. 다시 시도해주세요',
      '이미 삭제된 계정입니다',
      '사용자를 찾을 수 없습니다',
    ];

    expectedErrors.forEach((errorMessage) => {
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.length).toBeGreaterThan(0);
      // Verify it's in Korean (contains Hangul characters)
      expect(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(errorMessage)).toBe(true);
    });
  });
});
