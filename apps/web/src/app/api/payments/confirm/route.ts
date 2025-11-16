import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 토스 페이먼츠 결제 승인 API
export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: 'paymentKey, orderId, and amount are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 토스 페이먼츠 결제 승인 요청
    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    if (!tossSecretKey) {
      throw new Error('TOSS_SECRET_KEY is not configured');
    }

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${tossSecretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('Toss Payments error:', tossData);

      // DB에 실패 상태 저장
      await supabase
        .from('payment_transactions')
        .update({
          status: 'failed',
          toss_response: tossData,
        })
        .eq('order_id', orderId);

      return NextResponse.json(
        { error: tossData.message || 'Payment confirmation failed' },
        { status: 400 }
      );
    }

    // 결제 승인 성공 - DB 업데이트
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .update({
        payment_key: paymentKey,
        status: 'completed',
        method: tossData.method,
        toss_response: tossData,
        approved_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (transactionError) {
      console.error('Error updating transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      );
    }

    // 조직의 쿼터 증가
    const { error: quotaError } = await supabase.rpc('add_quota', {
      org_id: transaction.organization_id,
      quota_to_add: transaction.quota_amount,
    });

    // RPC 함수가 없을 경우 직접 UPDATE
    if (quotaError) {
      // 현재 쿼터 조회
      const { data: org } = await supabase
        .from('organizations')
        .select('current_quota')
        .eq('id', transaction.organization_id)
        .single();

      if (org) {
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            current_quota: (org.current_quota || 0) + transaction.quota_amount,
            quota_warning_sent: false, // 충전했으므로 경고 플래그 리셋
          })
          .eq('id', transaction.organization_id);

        if (updateError) {
          console.error('Error updating quota:', updateError);
          return NextResponse.json(
            { error: 'Payment successful but failed to update quota' },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Payment confirm error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
