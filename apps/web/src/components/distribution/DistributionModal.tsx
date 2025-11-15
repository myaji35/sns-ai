'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ConnectedAccount {
  id: string;
  platform: string;
  account_name: string | null;
  is_active: boolean;
}

interface DistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  onSuccess?: () => void;
}

/**
 * 배포 설정 모달 (Story 6.5)
 *
 * 플랫폼 선택 및 스케줄링 설정
 */
export default function DistributionModal({
  isOpen,
  onClose,
  contentId,
  onSuccess
}: DistributionModalProps) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      loadConnectedAccounts();
      // 기본값: 내일 오전 10시
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
      setScheduledTime('10:00');
    }
  }, [isOpen]);

  const loadConnectedAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('id, platform, account_name, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (!error && data) {
        setAccounts(data);
      }
    } catch (error) {
      console.error('계정 로드 오류:', error);
    }
  };

  const toggleAccount = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
    } else {
      newSelected.add(accountId);
    }
    setSelectedAccounts(newSelected);
  };

  const handleDistribute = async () => {
    if (selectedAccounts.size === 0) {
      alert('배포할 플랫폼을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 스케줄 시간 계산
      let scheduledFor = null;
      if (scheduleType === 'scheduled') {
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      // 각 선택된 계정에 대해 배포 작업 생성
      const jobs = Array.from(selectedAccounts).map(accountId => {
        const account = accounts.find(a => a.id === accountId);
        return {
          user_id: user.id,
          content_id: contentId,
          platform: account?.platform,
          connected_account_id: accountId,
          status: 'pending',
          scheduled_for: scheduledFor,
        };
      });

      const { error } = await supabase
        .from('distribution_jobs')
        .insert(jobs);

      if (error) {
        throw error;
      }

      alert(scheduleType === 'now'
        ? '배포가 시작되었습니다!'
        : `배포가 ${new Date(scheduledFor!).toLocaleString('ko-KR')}에 예약되었습니다!`
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('배포 오류:', error);
      alert('배포 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformInfo = (platform: string) => {
    const platforms: Record<string, { name: string; icon: string; color: string }> = {
      instagram: { name: 'Instagram', icon: '📷', color: 'from-purple-600 to-pink-500' },
      facebook: { name: 'Facebook', icon: '👥', color: 'from-blue-600 to-blue-700' },
      naver_blog: { name: 'Naver Blog', icon: '📝', color: 'from-green-600 to-green-700' },
    };
    return platforms[platform] || { name: platform, icon: '🔗', color: 'from-gray-600 to-gray-700' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">콘텐츠 배포</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-6">
          {/* 플랫폼 선택 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              배포할 플랫폼 선택
            </h3>

            {accounts.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-4">연결된 계정이 없습니다</p>
                <a
                  href="/settings/connected-accounts"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  계정 연결하기
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((account) => {
                  const info = getPlatformInfo(account.platform);
                  const isSelected = selectedAccounts.has(account.id);

                  return (
                    <button
                      key={account.id}
                      onClick={() => toggleAccount(account.id)}
                      className={`w-full p-4 border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center text-xl`}>
                          {info.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{info.name}</div>
                          <div className="text-sm text-gray-600">
                            {account.account_name || '계정명 없음'}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="text-blue-600">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 스케줄 설정 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              배포 시간
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleType === 'now'}
                  onChange={() => setScheduleType('now')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">즉시 배포</div>
                  <div className="text-sm text-gray-600">지금 바로 콘텐츠를 게시합니다</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleType === 'scheduled'}
                  onChange={() => setScheduleType('scheduled')}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">예약 배포</div>
                  <div className="text-sm text-gray-600 mb-3">특정 시간에 자동으로 게시합니다</div>

                  {scheduleType === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">날짜</label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">시간</label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* 선택 요약 */}
          {selectedAccounts.size > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-900">
                <strong>{selectedAccounts.size}개</strong> 플랫폼에{' '}
                {scheduleType === 'now' ? '즉시' : `${scheduledDate} ${scheduledTime}에`} 배포됩니다.
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleDistribute}
              disabled={loading || selectedAccounts.size === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '배포 중...' : '배포 시작'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
