-- Add brand_description and tone_and_manner columns to profiles table
-- Migration: 20251114000001_add_profile_fields
-- Description: 온보딩 및 프로필 편집에서 사용하는 브랜드 설명과 톤앤매너 필드 추가

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS brand_description TEXT,
ADD COLUMN IF NOT EXISTS tone_and_manner JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.brand_description IS '브랜드 설명 (최대 200자)';
COMMENT ON COLUMN public.profiles.tone_and_manner IS '브랜드 톤앤매너 (배열로 저장, 예: ["friendly", "professional"])';
