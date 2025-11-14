-- Add columns to connected_accounts for social media platforms
ALTER TABLE public.connected_accounts
ADD COLUMN IF NOT EXISTS platform_user_id TEXT,
ADD COLUMN IF NOT EXISTS platform_username TEXT,
ADD COLUMN IF NOT EXISTS scopes TEXT[],
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update platform check constraint to include social media platforms
ALTER TABLE public.connected_accounts
DROP CONSTRAINT IF EXISTS connected_accounts_platform_check;

ALTER TABLE public.connected_accounts
ADD CONSTRAINT connected_accounts_platform_check
CHECK (platform IN ('google_sheets', 'instagram', 'facebook', 'twitter', 'linkedin'));

-- Add index for platform queries
CREATE INDEX IF NOT EXISTS idx_connected_accounts_platform_active
ON public.connected_accounts(user_id, platform, is_active);

-- Create social_media_posts table for tracking published posts
CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content_calendar(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin')),
  platform_post_id TEXT, -- ID from the platform
  platform_post_url TEXT, -- URL to view the post
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  error_message TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own social media posts"
  ON public.social_media_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social media posts"
  ON public.social_media_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social media posts"
  ON public.social_media_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_social_media_posts_content_id
ON public.social_media_posts(content_id);

CREATE INDEX IF NOT EXISTS idx_social_media_posts_user_platform
ON public.social_media_posts(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_social_media_posts_status
ON public.social_media_posts(status);
