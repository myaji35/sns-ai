import { NextRequest, NextResponse } from 'next/server';

// 결제 실패 리다이렉트 처리
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  const errorMessage = message || '결제가 취소되었습니다.';

  return NextResponse.redirect(
    new URL(
      `/management?payment=failed&message=${encodeURIComponent(errorMessage)}&code=${code || ''}`,
      request.url
    )
  );
}
