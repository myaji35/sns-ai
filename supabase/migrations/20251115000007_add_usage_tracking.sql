-- Epic 7: Dashboard & Usage Management
-- 사용량 추적 및 분석 데이터

-- 사용량 추적 테이블
CREATE TABLE IF NOT EXISTS public.usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기간 (일별 집계)
  date DATE NOT NULL,

  -- AI 사용량
  ai_requests_count INTEGER DEFAULT 0,
  ai_tokens_used INTEGER DEFAULT 0,
  ai_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- 콘텐츠 생성
  contents_generated INTEGER DEFAULT 0,
  contents_approved INTEGER DEFAULT 0,
  contents_rejected INTEGER DEFAULT 0,

  -- 배포
  distributions_scheduled INTEGER DEFAULT 0,
  distributions_published INTEGER DEFAULT 0,
  distributions_failed INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, date)
);

-- 사용자 할당량 테이블
CREATE TABLE IF NOT EXISTS public.user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- 월별 할당량
  monthly_ai_requests_limit INTEGER DEFAULT 1000,
  monthly_contents_limit INTEGER DEFAULT 100,
  monthly_distributions_limit INTEGER DEFAULT 500,

  -- 현재 월 사용량
  current_month_ai_requests INTEGER DEFAULT 0,
  current_month_contents INTEGER DEFAULT 0,
  current_month_distributions INTEGER DEFAULT 0,

  -- 월 초기화 날짜
  quota_reset_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 사용량 통계만 볼 수 있음
CREATE POLICY "Users can view own usage stats"
  ON public.usage_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 할당량만 볼 수 있음
CREATE POLICY "Users can view own quotas"
  ON public.user_quotas
  FOR SELECT
  USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_date ON public.usage_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON public.user_quotas(user_id);

-- updated_at 트리거
CREATE TRIGGER update_usage_stats_updated_at
  BEFORE UPDATE ON public.usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quotas_updated_at
  BEFORE UPDATE ON public.user_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 사용량 집계 함수 (일별)
CREATE OR REPLACE FUNCTION aggregate_daily_usage(target_date DATE, target_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.usage_stats (
    user_id,
    date,
    contents_generated,
    contents_approved,
    contents_rejected,
    distributions_scheduled,
    distributions_published,
    distributions_failed
  )
  SELECT
    target_user_id,
    target_date,
    COUNT(*) FILTER (WHERE status = 'draft'),
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*) FILTER (WHERE status = 'rejected'),
    0, -- distributions는 별도 집계
    0,
    0
  FROM public.generated_contents
  WHERE user_id = target_user_id
    AND DATE(created_at) = target_date
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    contents_generated = EXCLUDED.contents_generated,
    contents_approved = EXCLUDED.contents_approved,
    contents_rejected = EXCLUDED.contents_rejected,
    updated_at = now();

  -- 배포 통계 업데이트
  UPDATE public.usage_stats
  SET
    distributions_scheduled = (
      SELECT COUNT(*) FROM public.distribution_jobs
      WHERE user_id = target_user_id
        AND DATE(created_at) = target_date
    ),
    distributions_published = (
      SELECT COUNT(*) FROM public.distribution_jobs
      WHERE user_id = target_user_id
        AND DATE(created_at) = target_date
        AND status = 'published'
    ),
    distributions_failed = (
      SELECT COUNT(*) FROM public.distribution_jobs
      WHERE user_id = target_user_id
        AND DATE(created_at) = target_date
        AND status = 'failed'
    ),
    updated_at = now()
  WHERE user_id = target_user_id
    AND date = target_date;
END;
$$ LANGUAGE plpgsql;

-- 월간 통계 뷰
CREATE OR REPLACE VIEW public.monthly_stats AS
SELECT
  user_id,
  DATE_TRUNC('month', date) as month,
  SUM(ai_requests_count) as total_ai_requests,
  SUM(ai_tokens_used) as total_tokens,
  SUM(ai_cost_usd) as total_cost,
  SUM(contents_generated) as total_contents,
  SUM(contents_approved) as total_approved,
  SUM(distributions_published) as total_published,
  AVG(contents_approved::float / NULLIF(contents_generated, 0)) as approval_rate
FROM public.usage_stats
GROUP BY user_id, DATE_TRUNC('month', date);

-- 주간 통계 뷰
CREATE OR REPLACE VIEW public.weekly_stats AS
SELECT
  user_id,
  DATE_TRUNC('week', date) as week,
  SUM(contents_generated) as total_contents,
  SUM(contents_approved) as total_approved,
  SUM(distributions_published) as total_published
FROM public.usage_stats
GROUP BY user_id, DATE_TRUNC('week', date);

-- 권한 부여
GRANT ALL ON public.usage_stats TO authenticated;
GRANT ALL ON public.user_quotas TO authenticated;
GRANT SELECT ON public.monthly_stats TO authenticated;
GRANT SELECT ON public.weekly_stats TO authenticated;
