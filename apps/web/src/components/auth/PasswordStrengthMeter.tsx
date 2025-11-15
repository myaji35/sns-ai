'use client';

import React from 'react';
import { evaluatePasswordStrength } from '@/lib/schemas/auth.schema';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const { strength, messages, score } = evaluatePasswordStrength(password);

  // 강도별 색상과 레이블 정의
  const strengthConfig = {
    'very-strong': {
      label: '매우 강함',
      color: 'bg-green-500',
      percentage: 100,
      textColor: 'text-green-600',
    },
    strong: {
      label: '강함',
      color: 'bg-blue-500',
      percentage: 75,
      textColor: 'text-blue-600',
    },
    medium: {
      label: '보통',
      color: 'bg-yellow-500',
      percentage: 50,
      textColor: 'text-yellow-600',
    },
    weak: {
      label: '약함',
      color: 'bg-red-500',
      percentage: 25,
      textColor: 'text-red-600',
    },
  };

  const config = strengthConfig[strength];

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* 강도 표시 바 */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            비밀번호 강도
          </label>
          <span className={`text-sm font-semibold ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${config.color} transition-all duration-300`}
            style={{ width: `${config.percentage}%` }}
          />
        </div>
      </div>

      {/* 요구사항 체크리스트 */}
      {showRequirements && messages.length > 0 && (
        <div className="space-y-1 mt-3">
          <p className="text-xs font-medium text-gray-600">필수 요구사항:</p>
          <div className="space-y-1">
            {/* 길이 확인 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {password.length >= 8 ? '✓' : '○'}
              </div>
              <span
                className={`text-xs ${
                  password.length >= 8 ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                8자 이상
              </span>
            </div>

            {/* 대문자 확인 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {/[A-Z]/.test(password) ? '✓' : '○'}
              </div>
              <span
                className={`text-xs ${
                  /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                대문자 1개 이상
              </span>
            </div>

            {/* 숫자 확인 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {/[0-9]/.test(password) ? '✓' : '○'}
              </div>
              <span
                className={`text-xs ${
                  /[0-9]/.test(password) ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                숫자 1개 이상
              </span>
            </div>

            {/* 특수문자 확인 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  /[!@#$%^&*]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {/[!@#$%^&*]/.test(password) ? '✓' : '○'}
              </div>
              <span
                className={`text-xs ${
                  /[!@#$%^&*]/.test(password) ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                특수문자(!@#$%^&*) 1개 이상
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
