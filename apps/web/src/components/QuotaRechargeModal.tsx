'use client';

import { useState, useEffect } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';

interface QuotaRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  currentQuota: number;
  monthlyLimit: number;
  onSuccess: () => void;
}

const QUOTA_OPTIONS = [
  { amount: 100, price: 50000, label: '100개 (+50,000원)' },
  { amount: 200, price: 95000, label: '200개 (+95,000원) - 5% 할인' },
  { amount: 500, price: 225000, label: '500개 (+225,000원) - 10% 할인' },
  { amount: 1000, price: 400000, label: '1,000개 (+400,000원) - 20% 할인' },
];

export default function QuotaRechargeModal({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  currentQuota,
  monthlyLimit,
  onSuccess,
}: QuotaRechargeModalProps) {
  const [selectedOption, setSelectedOption] = useState(QUOTA_OPTIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 쿼터 사용률 계산
  const usagePercent = monthlyLimit > 0 ? (currentQuota / monthlyLimit) * 100 : 0;
  const isLowQuota = usagePercent <= 10;

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. 결제 준비 API 호출 (주문 ID 생성)
      const prepareResponse = await fetch('/api/payments/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          quotaAmount: selectedOption.amount,
        }),
      });

      if (!prepareResponse.ok) {
        throw new Error('Failed to prepare payment');
      }

      const { orderId, amount } = await prepareResponse.json();

      // 2. 토스 페이먼츠 SDK 로드
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );

      // 3. 결제 위젯 호출
      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName: `${organizationName} - 콘텐츠 쿼터 ${selectedOption.amount}개`,
        customerName: organizationName,
        successUrl: `${window.location.origin}/api/payments/success?organizationId=${organizationId}`,
        failUrl: `${window.location.origin}/api/payments/fail`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">콘텐츠 쿼터 충전</h2>

        {/* 현재 쿼터 현황 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">현재 쿼터</span>
            <span className="text-lg font-bold">
              {currentQuota.toLocaleString()}개
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">월간 한도</span>
            <span className="text-sm">{monthlyLimit.toLocaleString()}개</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>사용률: {usagePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isLowQuota
                    ? 'bg-red-500'
                    : usagePercent <= 30
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            {isLowQuota && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ 쿼터가 10% 이하입니다. 충전을 권장합니다.
              </p>
            )}
          </div>
        </div>

        {/* 충전 옵션 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            충전할 쿼터 수량 선택
          </label>
          <div className="space-y-2">
            {QUOTA_OPTIONS.map((option) => (
              <button
                key={option.amount}
                type="button"
                onClick={() => setSelectedOption(option)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedOption.amount === option.amount
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm text-gray-500">
                    개당 {(option.price / option.amount).toFixed(0)}원
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 결제 금액 요약 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">결제 금액</span>
            <span className="text-2xl font-bold text-blue-600">
              {selectedOption.price.toLocaleString()}원
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            충전 후 쿼터: {(currentQuota + selectedOption.amount).toLocaleString()}개
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? '처리 중...' : '결제하기'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          * 토스페이먼츠를 통해 안전하게 결제됩니다.
        </p>
      </div>
    </div>
  );
}
