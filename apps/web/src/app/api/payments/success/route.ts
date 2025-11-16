import { NextRequest, NextResponse } from 'next/server';

// 결제 성공 리다이렉트 처리
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const organizationId = searchParams.get('organizationId');

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(
      new URL(`/management?payment=error&message=Missing parameters`, request.url)
    );
  }

  try {
    // 결제 승인 API 호출
    const confirmResponse = await fetch(
      new URL('/api/payments/confirm', request.url).toString(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: parseInt(amount),
        }),
      }
    );

    if (!confirmResponse.ok) {
      const error = await confirmResponse.json();
      return NextResponse.redirect(
        new URL(
          `/management?payment=error&message=${encodeURIComponent(error.error || 'Payment failed')}`,
          request.url
        )
      );
    }

    // 성공 시 관리 페이지로 리다이렉트
    const redirectUrl = organizationId
      ? `/management?payment=success&organizationId=${organizationId}`
      : `/management?payment=success`;

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Payment success handler error:', error);
    return NextResponse.redirect(
      new URL(`/management?payment=error&message=Internal error`, request.url)
    );
  }
}
