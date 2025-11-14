-- Add LLM API keys table for AI content generation
-- Migration: 20251114000002_add_llm_api_keys
-- Description: 사용자별 LLM API 키를 안전하게 저장

-- LLM API Keys Table
CREATE TABLE IF NOT EXISTS public.llm_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google'
  api_key TEXT NOT NULL, -- Encrypted API key
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- RLS 정책
ALTER TABLE public.llm_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys" ON public.llm_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON public.llm_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.llm_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.llm_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_llm_api_keys_user_id ON public.llm_api_keys(user_id);
CREATE INDEX idx_llm_api_keys_provider ON public.llm_api_keys(provider);

-- 코멘트
COMMENT ON TABLE public.llm_api_keys IS '사용자별 LLM API 키 저장 (암호화됨)';
COMMENT ON COLUMN public.llm_api_keys.provider IS 'LLM 제공자: openai, anthropic, google';
COMMENT ON COLUMN public.llm_api_keys.api_key IS '암호화된 API 키';
