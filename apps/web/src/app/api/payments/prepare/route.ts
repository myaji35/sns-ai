import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 결제 준비 API (주문 ID 생성 및 DB 저장)
export async function POST(request: NextRequest) {
  try {
    const { organizationId, quotaAmount } = await request.json();

    if (!organizationId || !quotaAmount) {
      return NextResponse.json(
        { error: 'organizationId and quotaAmount are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 주문 ID 생성 (타임스탬프 + 랜덤)
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 쿼터당 가격 (500원)
    const pricePerQuota = 500;
    const amount = quotaAmount * pricePerQuota;

    // DB에 pending 상태로 저장
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .insert({
        organization_id: organizationId,
        order_id: orderId,
        amount,
        quota_amount: quotaAmount,
        price_per_quota: pricePerQuota,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment transaction:', error);
      return NextResponse.json(
        { error: 'Failed to create payment transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId,
      amount,
      quotaAmount,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('Payment prepare error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
