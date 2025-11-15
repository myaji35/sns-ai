import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// 보호된 라우트 목록 (임시로 대시보드, 컨텐츠 관리 제외 - 데모용)
const protectedRoutes = ['/calendar', '/settings', '/profile-onboarding'];

// 공개 라우트 목록 (인증되지 않은 사용자도 접근 가능)
const publicAuthRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/logout', '/auth/v1/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트, 정적 파일 제외
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
    return NextResponse.next();
  }

  try {
    // 세션 확인 (서버사이드)
    // Note: 클라이언트 Supabase로는 미들웨어에서 직접 세션 확인 불가
    // 대신 쿠키 검증이나 별도 API 엔드포인트 사용 필요
    
    // 임시 해결책: 클라이언트에서 쿠키 확인
    const authToken = request.cookies.get('sb-auth-token');
    const isAuthenticated = !!authToken;

    // 보호된 라우트 접근 확인
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        // 비로그인 사용자는 /login으로 리다이렉트
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // 로그인 사용자의 인증 라우트 접근
    if (publicAuthRoutes.some(route => pathname.startsWith(route))) {
      if (isAuthenticated) {
        // 로그인 사용자는 /dashboard로 리다이렉트
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // 에러 발생 시 요청 계속 진행
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Middleware 적용 경로
export const config = {
  matcher: [
    // 보호된 라우트 (대시보드, 컨텐츠 관리 임시 제외)
    '/calendar/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/profile-onboarding/:path*',
    // 인증 라우트 (로그인, 회원가입, 비밀번호 관련, 로그아웃, OAuth 콜백)
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/logout',
    '/auth/v1/callback',
  ],
};
