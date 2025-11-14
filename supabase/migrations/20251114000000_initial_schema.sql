-- ContentFlow AI Initial Database Schema
-- Migration: 20251114000000_initial_schema
-- Description: 사용자 프로필, 계정 연동, 콘텐츠 캘린더, 콘텐츠, 작업 로그, 사용량 추적 테이블 생성

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Profiles Table (사용자 프로필)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. Connected Accounts Table (외부 계정 연동)
-- ============================================================================
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'google_sheets', 'instagram', 'facebook', 'naver', etc.
  account_name TEXT,
  access_token TEXT NOT NULL, -- 암호화된 토큰
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, account_name)
);

-- RLS: 사용자는 자신의 연동 계정만 조회/수정 가능
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own accounts" ON public.connected_accounts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 3. Content Calendar Table (콘텐츠 캘린더)
-- ============================================================================
CREATE TABLE public.content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  google_sheet_id TEXT, -- Google Sheets 문서 ID
  category TEXT NOT NULL,
  main_topic TEXT NOT NULL,
  subtopics JSONB, -- 배열: ["하위주제1", "하위주제2", ...]
  publish_frequency TEXT, -- 'weekly', 'monthly', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own calendar" ON public.content_calendar
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Contents Table (생성된 콘텐츠)
-- ============================================================================
CREATE TABLE public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calendar_id UUID REFERENCES public.content_calendar(id) ON DELETE SET NULL,

  -- 콘텐츠 메타데이터
  title TEXT NOT NULL,
  subtitle TEXT,
  topic TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'blog', 'sns_post'

  -- 생성된 콘텐츠 (마크다운)
  body_markdown TEXT,

  -- SEO
  meta_description TEXT,
  keywords TEXT[], -- 배열: ['키워드1', '키워드2', ...]

  -- AI 생성 정보
  llm_provider TEXT, -- 'openai', 'anthropic', 'google'
  llm_model TEXT,
  generation_prompt TEXT,

  -- 이미지
  thumbnail_url TEXT,
  body_images JSONB, -- 배열: [{url, alt, position}, ...]

  -- 검토 & 배포
  review_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,

  -- 배포 플랫폼별 URL
  published_urls JSONB, -- {instagram: 'url', facebook: 'url', naver: 'url', ...}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own content" ON public.contents
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 5. Job Logs Table (작업 로그 - 워크플로우 추적)
-- ============================================================================
CREATE TABLE public.job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- 'content_generation', 'image_generation', 'distribution'
  status TEXT NOT NULL, -- 'queued', 'processing', 'completed', 'failed'
  error_message TEXT,
  attempts INT DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own job logs" ON public.job_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 6. Usage Metrics Table (사용량 추적 - 과금용)
-- ============================================================================
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'content_generated', 'image_generated', 'api_call'
  quantity INT DEFAULT 1,
  metadata JSONB, -- {llm_provider, tokens_used, image_model, etc.}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage" ON public.usage_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 7. Indexes (성능 최적화)
-- ============================================================================
CREATE INDEX idx_contents_user_id ON public.contents(user_id);
CREATE INDEX idx_contents_review_status ON public.contents(review_status);
CREATE INDEX idx_contents_created_at ON public.contents(created_at DESC);
CREATE INDEX idx_job_logs_user_id ON public.job_logs(user_id);
CREATE INDEX idx_job_logs_status ON public.job_logs(status);
CREATE INDEX idx_job_logs_created_at ON public.job_logs(created_at DESC);
CREATE INDEX idx_usage_metrics_user_id_created ON public.usage_metrics(user_id, created_at);
CREATE INDEX idx_content_calendar_user_id ON public.content_calendar(user_id);

-- ============================================================================
-- 8. Updated At Trigger Function (자동 updated_at 갱신)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at
  BEFORE UPDATE ON public.content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON public.contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
