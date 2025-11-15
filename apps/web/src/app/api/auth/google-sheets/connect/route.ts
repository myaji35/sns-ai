import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/google-sheets/connect
 *
 * Google Sheets OAuth 인증 URL 생성
 * 사용자를 Google OAuth 동의 화면으로 리다이렉트하기 위한 URL을 반환
 */
export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다' },
        { status: 401 }
      );
    }

    // OAuth2 클라이언트 생성
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SHEETS_CLIENT_ID,
      process.env.GOOGLE_SHEETS_CLIENT_SECRET,
      process.env.GOOGLE_SHEETS_REDIRECT_URI
    );

    // 필요한 스코프 정의
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',  // Sheets 읽기/쓰기
      'https://www.googleapis.com/auth/drive.file',    // 생성한 파일만 접근
      'https://www.googleapis.com/auth/userinfo.email' // 사용자 이메일 정보
    ];

    // State 파라미터로 사용자 ID 암호화하여 전달 (CSRF 방지)
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    })).toString('base64');

    // 인증 URL 생성
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',  // Refresh Token 받기 위해 필요
      scope: scopes,
      state: state,
      prompt: 'consent'  // 항상 동의 화면 표시 (Refresh Token 재발급)
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Google Sheets OAuth URL 생성 오류:', error);
    return NextResponse.json(
      { error: 'OAuth URL 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}