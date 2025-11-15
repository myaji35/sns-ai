import { google } from 'googleapis';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Google Sheets 토큰 관리 서비스
 *
 * 토큰 암호화/복호화, 자동 갱신, 유효성 검증 등을 담당
 */
export class SheetsTokenService {
  private static ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  /**
   * 간단한 암호화 (실제 프로덕션에서는 더 강력한 암호화 사용)
   * TODO: Supabase Vault 또는 pgcrypto 사용
   */
  static encrypt(text: string): string {
    // Base64 인코딩 (임시 - 실제로는 AES-256 등 사용)
    return Buffer.from(text).toString('base64');
  }

  /**
   * 복호화
   */
  static decrypt(encryptedText: string): string {
    try {
      return Buffer.from(encryptedText, 'base64').toString();
    } catch {
      return '';
    }
  }

  /**
   * 토큰이 만료되었는지 확인
   */
  static isTokenExpired(expiresAt: Date | string | null): boolean {
    if (!expiresAt) return true;

    const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    const now = new Date();

    // 1시간 여유를 두고 갱신 (AC 4: 토큰 만료 1시간 전 자동 갱신)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    return expiry <= oneHourFromNow;
  }

  /**
   * Refresh Token을 사용하여 Access Token 갱신
   */
  static async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiryDate: number;
  } | null> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_SHEETS_CLIENT_ID,
        process.env.GOOGLE_SHEETS_CLIENT_SECRET,
        process.env.GOOGLE_SHEETS_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      // 새 액세스 토큰 가져오기
      const { credentials } = await oauth2Client.refreshAccessToken();

      if (!credentials.access_token || !credentials.expiry_date) {
        console.error('토큰 갱신 실패: 필요한 정보 없음');
        return null;
      }

      return {
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date,
      };
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      return null;
    }
  }

  /**
   * 사용자의 Google Sheets 연동 정보 가져오기
   */
  static async getUserSheetsConnection(userId: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'google_sheets')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // 토큰 복호화
    return {
      ...data,
      access_token: this.decrypt(data.access_token),
      refresh_token: data.refresh_token ? this.decrypt(data.refresh_token) : null,
    };
  }

  /**
   * 토큰 갱신 및 DB 업데이트
   */
  static async refreshAndUpdateToken(userId: string): Promise<boolean> {
    const connection = await this.getUserSheetsConnection(userId);
    if (!connection || !connection.refresh_token) {
      console.error('갱신할 연동 정보 없음');
      return false;
    }

    // 토큰이 만료되었는지 확인
    if (!this.isTokenExpired(connection.token_expires_at)) {
      return true; // 아직 유효함
    }

    // 새 토큰 가져오기
    const newTokens = await this.refreshAccessToken(connection.refresh_token);
    if (!newTokens) {
      console.error('토큰 갱신 실패');
      return false;
    }

    // DB 업데이트
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { error } = await supabase
      .from('connected_accounts')
      .update({
        access_token: this.encrypt(newTokens.accessToken),
        token_expires_at: new Date(newTokens.expiryDate).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    if (error) {
      console.error('토큰 업데이트 실패:', error);
      return false;
    }

    return true;
  }

  /**
   * Google Sheets API 클라이언트 생성
   * 토큰 자동 갱신 포함
   */
  static async createSheetsClient(userId: string) {
    // 토큰 갱신 시도
    const refreshed = await this.refreshAndUpdateToken(userId);
    if (!refreshed) {
      throw new Error('토큰 갱신 실패');
    }

    // 최신 연동 정보 가져오기
    const connection = await this.getUserSheetsConnection(userId);
    if (!connection) {
      throw new Error('Google Sheets 연동이 필요합니다');
    }

    // OAuth2 클라이언트 생성
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SHEETS_CLIENT_ID,
      process.env.GOOGLE_SHEETS_CLIENT_SECRET,
      process.env.GOOGLE_SHEETS_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
    });

    // Sheets API 클라이언트 반환
    return google.sheets({ version: 'v4', auth: oauth2Client });
  }
}