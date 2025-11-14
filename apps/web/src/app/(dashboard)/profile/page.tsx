'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const profileSchema = z.object({
  fullName: z.string().max(50, '최대 50자까지 입력 가능합니다').optional(),
  companyName: z.string().min(1, '브랜드/회사명을 입력해주세요').max(50, '최대 50자까지 입력 가능합니다'),
  industry: z.string().min(1, '업종을 선택해주세요'),
  brandDescription: z.string().max(200, '최대 200자까지 입력 가능합니다').optional(),
  toneAndManner: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const INDUSTRIES = [
  '카페/베이커리',
  '레스토랑/요식업',
  '뷰티/미용',
  '패션/의류',
  '헬스/피트니스',
  '교육/학원',
  '의료/건강',
  '부동산',
  '여행/숙박',
  '제조업',
  '소매/유통',
  '서비스업',
  'IT/기술',
  '컨설팅',
  '예술/문화',
  '기타',
];

const TONES = [
  { value: 'friendly', label: '친근한' },
  { value: 'professional', label: '전문적인' },
  { value: 'humorous', label: '유머러스한' },
  { value: 'serious', label: '진지한' },
  { value: 'casual', label: '캐주얼한' },
  { value: 'formal', label: '격식있는' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const brandDescription = watch('brandDescription');

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setValue('fullName', profile.full_name || '');
        setValue('companyName', profile.company_name || '');
        setValue('industry', profile.industry || '');
        setValue('brandDescription', profile.brand_description || '');

        // Parse tone_and_manner if it's stored as JSON
        if (profile.tone_and_manner) {
          try {
            const tones = typeof profile.tone_and_manner === 'string'
              ? JSON.parse(profile.tone_and_manner)
              : profile.tone_and_manner;
            setSelectedTones(Array.isArray(tones) ? tones : []);
          } catch {
            setSelectedTones([]);
          }
        }
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [router, setValue]);

  const toggleTone = (tone: string) => {
    setSelectedTones((prev) =>
      prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone]
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName || null,
          company_name: data.companyName,
          industry: data.industry,
          brand_description: data.brandDescription || null,
          tone_and_manner: selectedTones.length > 0 ? JSON.stringify(selectedTones) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        setError('프로필 업데이트 중 오류가 발생했습니다');
        console.error(updateError);
        return;
      }

      setSuccess('프로필이 성공적으로 업데이트되었습니다!');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('프로필 업데이트 중 오류가 발생했습니다');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← 대시보드로 돌아가기
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필 편집</h1>
            <p className="text-gray-600">브랜드 정보를 업데이트하세요</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                이름 (선택)
              </label>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="홍길동"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                브랜드/회사명 <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                {...register('companyName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="예: 커피빈 강남점"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                업종 <span className="text-red-500">*</span>
              </label>
              <select
                id="industry"
                {...register('industry')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="">업종을 선택하세요</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
              )}
            </div>

            {/* Brand Description */}
            <div>
              <label htmlFor="brandDescription" className="block text-sm font-medium text-gray-700 mb-2">
                브랜드 설명 (선택)
              </label>
              <textarea
                id="brandDescription"
                {...register('brandDescription')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="브랜드의 특징, 가치, 목표 고객 등을 간단히 설명해주세요"
              />
              <p className="mt-1 text-sm text-gray-500">
                {brandDescription?.length || 0}/200
              </p>
              {errors.brandDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.brandDescription.message}</p>
              )}
            </div>

            {/* Tone and Manner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                톤앤매너 (선택)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => toggleTone(tone.value)}
                    className={`py-3 px-4 border-2 rounded-lg font-medium transition ${
                      selectedTones.includes(tone.value)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>

          {/* Account Danger Zone */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">계정 관리</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-2">계정 삭제</h3>
              <p className="text-sm text-red-700 mb-4">
                계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                    alert('계정 삭제 기능은 아직 구현되지 않았습니다.');
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
