import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/google-sheets/callback
 *
 * Google OAuth 콜백 핸들러
 * Authorization Code를 Access Token과 Refresh Token으로 교환
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // OAuth 에러 처리
  if (error) {
    console.error('OAuth 에러:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=' + encodeURIComponent('Google 연동이 취소되었습니다'), request.nextUrl.origin)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings/integrations?error=' + encodeURIComponent('잘못된 요청입니다'), request.nextUrl.origin)
    );
  }

  // State 검증 (CSRF 방지)
  let stateData;
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString());
  } catch {
    return NextResponse.redirect(
      new URL('/settings/integrations?error=' + encodeURIComponent('보안 검증 실패'), request.nextUrl.origin)
    );
  }

  // 타임스탬프 검증 (5분 이내)
  if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
    return NextResponse.redirect(
      new URL('/settings/integrations?error=' + encodeURIComponent('요청이 만료되었습니다'), request.nextUrl.origin)
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SHEETS_CLIENT_ID,
      process.env.GOOGLE_SHEETS_CLIENT_SECRET,
      process.env.GOOGLE_SHEETS_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Supabase 인증 확인
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }, error: authError
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== stateData.userId) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=' + encodeURIComponent('인증 오류'), request.nextUrl.origin)
      );
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'google_sheets')
      .single();

    if (existingAccount) {
      // Update existing account
      await supabase
        .from('connected_accounts')
        .update({
          account_name: userInfo.data.email || 'Google Account',
          access_token: tokens.access_token || '',
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAccount.id);
    } else {
      // Insert new account
      await supabase.from('connected_accounts').insert({
        user_id: user.id,
        platform: 'google_sheets',
        account_name: userInfo.data.email || 'Google Account',
        access_token: tokens.access_token || '',
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        is_active: true,
      });
    }

    // 성공 시 리다이렉트
    return NextResponse.redirect(
      new URL('/settings/integrations?success=true&message=' + encodeURIComponent('Google Sheets가 연동되었습니다'), request.nextUrl.origin)
    );
  } catch (error) {
    console.error('Google Sheets OAuth 콜백 오류:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=' + encodeURIComponent('연동 처리 중 오류가 발생했습니다'), request.nextUrl.origin)
    );
  }
}
