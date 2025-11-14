'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const onboardingSchema = z.object({
  companyName: z.string().min(1, '브랜드/회사명을 입력해주세요').max(50, '최대 50자까지 입력 가능합니다'),
  industry: z.string().min(1, '업종을 선택해주세요'),
  brandDescription: z.string().max(200, '최대 200자까지 입력 가능합니다').optional(),
  toneAndManner: z.array(z.string()).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      toneAndManner: [],
    },
  });

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['companyName', 'industry']);
    } else if (step === 2) {
      isValid = await trigger(['brandDescription']);
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('profiles')
          .update({
            company_name: '미입력',
            industry: '기타',
          })
          .eq('id', user.id);

        router.push('/dashboard');
      }
    } catch (err) {
      setError('프로필 저장 중 오류가 발생했습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          company_name: data.companyName,
          industry: data.industry,
          brand_description: data.brandDescription || null,
          tone_and_manner: selectedTones.length > 0 ? JSON.stringify(selectedTones) : null,
        })
        .eq('id', user.id);

      if (updateError) {
        setError('프로필 저장 중 오류가 발생했습니다');
        console.error(updateError);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('프로필 저장 중 오류가 발생했습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTone = (tone: string) => {
    setSelectedTones((prev) =>
      prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>프로필 설정</span>
            <span>{step}/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">기본 정보</h2>
                <p className="text-gray-600">브랜드에 대해 알려주세요</p>
              </div>

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

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 브랜드 보이스 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">브랜드 보이스</h2>
                <p className="text-gray-600">브랜드의 톤과 스타일을 설정하세요</p>
              </div>

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
                  {getValues('brandDescription')?.length || 0}/200
                </p>
                {errors.brandDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.brandDescription.message}</p>
                )}
              </div>

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

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 완료 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">준비 완료!</h2>
                <p className="text-gray-600 mb-8">
                  이제 AI가 {getValues('companyName')}에 맞는 콘텐츠를 생성할 준비가 되었습니다
                </p>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-gray-700 min-w-24">브랜드명:</span>
                    <span className="text-gray-900">{getValues('companyName')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-gray-700 min-w-24">업종:</span>
                    <span className="text-gray-900">{getValues('industry')}</span>
                  </div>
                  {getValues('brandDescription') && (
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-700 min-w-24">설명:</span>
                      <span className="text-gray-900">{getValues('brandDescription')}</span>
                    </div>
                  )}
                  {selectedTones.length > 0 && (
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-700 min-w-24">톤:</span>
                      <span className="text-gray-900">
                        {selectedTones.map((tone) => TONES.find((t) => t.value === tone)?.label).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '저장 중...' : '완료'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Skip Button */}
        {step < 3 && (
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition"
          >
            나중에 설정하기
          </button>
        )}
      </div>
    </div>
  );
}
