-- Epic 6: Multi-Channel Distribution System
-- 멀티 채널 배포를 위한 테이블 및 함수

-- 배포 작업 테이블
CREATE TABLE IF NOT EXISTS public.distribution_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.generated_contents(id) ON DELETE CASCADE,

  -- 배포 정보
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'naver_blog', 'linkedin', 'twitter')),
  connected_account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,

  -- 스케줄링
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- 상태 및 결과
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- 에러 정보
  error_message TEXT,
  error_details JSONB,

  -- 게시 결과
  platform_post_id TEXT, -- 플랫폼에서의 게시물 ID
  platform_url TEXT, -- 게시된 콘텐츠 URL

  -- 메타데이터
  metadata JSONB, -- 플랫폼별 추가 정보 (해시태그, 이미지 URL 등)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 배포 로그 테이블 (상세 추적용)
CREATE TABLE IF NOT EXISTS public.distribution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_job_id UUID NOT NULL REFERENCES public.distribution_jobs(id) ON DELETE CASCADE,

  -- 로그 정보
  event_type TEXT NOT NULL CHECK (event_type IN ('started', 'processing', 'success', 'failed', 'retry')),
  message TEXT,
  details JSONB,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.distribution_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_logs ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 배포 작업만 볼 수 있음
CREATE POLICY "Users can view own distribution jobs"
  ON public.distribution_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 배포 작업을 생성할 수 있음
CREATE POLICY "Users can create own distribution jobs"
  ON public.distribution_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 배포 작업을 수정할 수 있음
CREATE POLICY "Users can update own distribution jobs"
  ON public.distribution_jobs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 배포 작업을 삭제할 수 있음
CREATE POLICY "Users can delete own distribution jobs"
  ON public.distribution_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- 사용자는 자신의 배포 로그를 볼 수 있음
CREATE POLICY "Users can view own distribution logs"
  ON public.distribution_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distribution_jobs
      WHERE distribution_jobs.id = distribution_logs.distribution_job_id
      AND distribution_jobs.user_id = auth.uid()
    )
  );

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_user_id ON public.distribution_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_content_id ON public.distribution_jobs(content_id);
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_platform ON public.distribution_jobs(platform);
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_status ON public.distribution_jobs(status);
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_scheduled_for ON public.distribution_jobs(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_created_at ON public.distribution_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_distribution_logs_job_id ON public.distribution_logs(distribution_job_id);
CREATE INDEX IF NOT EXISTS idx_distribution_logs_event_type ON public.distribution_logs(event_type);

-- updated_at 트리거
CREATE TRIGGER update_distribution_jobs_updated_at
  BEFORE UPDATE ON public.distribution_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 배포 통계 뷰 (사용자별)
CREATE OR REPLACE VIEW public.distribution_stats AS
SELECT
  user_id,
  platform,
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE status = 'published') as published_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  AVG(CASE WHEN status = 'published' THEN
    EXTRACT(EPOCH FROM (published_at - created_at))
  END) as avg_publish_time_seconds
FROM public.distribution_jobs
GROUP BY user_id, platform;

-- 권한 부여
GRANT ALL ON public.distribution_jobs TO authenticated;
GRANT ALL ON public.distribution_logs TO authenticated;
GRANT SELECT ON public.distribution_stats TO authenticated;
