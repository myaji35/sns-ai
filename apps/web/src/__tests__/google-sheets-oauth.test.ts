import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as callbackHandler } from '@/app/api/auth/google-sheets/callback/route';
import { POST as connectHandler } from '@/app/api/auth/google-sheets/connect/route';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'test-account-id' },
        error: null,
      }),
    })),
  })),
}));

// Mock Google APIs
vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        generateAuthUrl: vi.fn().mockReturnValue('https://accounts.google.com/oauth/authorize'),
        getToken: vi.fn().mockResolvedValue({
          tokens: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expiry_date: Date.now() + 3600000,
          },
        }),
      })),
    },
    oauth2: vi.fn(() => ({
      userinfo: {
        get: vi.fn().mockResolvedValue({
          data: {
            email: 'test@gmail.com',
            name: 'Test User',
          },
        }),
      },
    })),
  },
}));

describe('Google Sheets OAuth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set environment variables
    process.env.GOOGLE_SHEETS_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_SHEETS_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_SHEETS_REDIRECT_URI = 'http://localhost:3000/api/auth/google-sheets/callback';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/auth/google-sheets/connect', () => {
    it('should generate OAuth URL with correct parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/google-sheets/connect', {
        method: 'POST',
      });

      const response = await connectHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('authUrl');
      expect(data.authUrl).toContain('https://accounts.google.com/oauth/authorize');
    });

    it('should return 401 for unauthenticated users', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server');
      (createServerSupabaseClient as any).mockReturnValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/google-sheets/connect', {
        method: 'POST',
      });

      const response = await connectHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/google-sheets/callback', () => {
    it('should handle successful OAuth callback', async () => {
      const state = Buffer.from(
        JSON.stringify({
          userId: 'test-user-id',
          timestamp: Date.now(),
        })
      ).toString('base64');

      const url = `http://localhost:3000/api/auth/google-sheets/callback?code=test-code&state=${state}`;
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(302); // Redirect
      expect(response.headers.get('Location')).toContain('/settings/integrations');
      expect(response.headers.get('Location')).toContain('success=true');
    });

    it('should reject invalid state parameter', async () => {
      const invalidState = 'invalid-state';
      const url = `http://localhost:3000/api/auth/google-sheets/callback?code=test-code&state=${invalidState}`;
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('error=');
    });

    it('should handle missing authorization code', async () => {
      const state = Buffer.from(
        JSON.stringify({
          userId: 'test-user-id',
          timestamp: Date.now(),
        })
      ).toString('base64');

      const url = `http://localhost:3000/api/auth/google-sheets/callback?state=${state}`;
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('error=');
    });

    it('should reject expired state (older than 10 minutes)', async () => {
      const expiredState = Buffer.from(
        JSON.stringify({
          userId: 'test-user-id',
          timestamp: Date.now() - 11 * 60 * 1000, // 11 minutes ago
        })
      ).toString('base64');

      const url = `http://localhost:3000/api/auth/google-sheets/callback?code=test-code&state=${expiredState}`;
      const request = new NextRequest(url);

      const response = await callbackHandler(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('error=');
    });
  });
});