import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Supabase OAuth 콜백 핸들러
 * GET /auth/v1/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json(
      { message: 'Missing authorization code' },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();

    // 코드를 세션으로 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth exchange error:', error);
      return NextResponse.json(
        { message: error.message || 'OAuth exchange failed' },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { message: 'No user returned from OAuth provider' },
        { status: 400 }
      );
    }

    // 프로필 테이블에 사용자 정보 저장 (OAuth 사용자)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            email: data.user.email,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        // 프로필 생성 실패해도 로그인은 진행
      }
    } catch (err) {
      console.error('Profile creation failed:', err);
      // 프로필 생성 실패해도 로그인은 진행
    }

    // 성공: 대시보드로 리다이렉트
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
