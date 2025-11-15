-- Member Company Details: SNS Accounts, Google Sheets, Monitoring
-- SNS accounts, Google Sheets integration, and statistics tracking

-- 1. Member SNS accounts table
CREATE TABLE IF NOT EXISTS public.member_sns_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Member company
  member_company_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- SNS platform info
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'naver_blog', 'twitter', 'youtube', 'tiktok')),
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL,

  -- Credentials (encrypted)
  credentials JSONB NOT NULL DEFAULT '{}',

  -- Connection status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'expired')),
  last_connected_at TIMESTAMPTZ,
  connection_error TEXT,

  -- Profile info
  profile_url TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(member_company_id, platform, account_id)
);

-- 2. Member Google Sheets table
CREATE TABLE IF NOT EXISTS public.member_google_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Member company
  member_company_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Google Sheets info
  sheet_id TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  sheet_url TEXT,

  -- Column mapping
  column_mapping JSONB DEFAULT '{}',

  -- Publishing schedule
  publish_frequency TEXT DEFAULT 'manual' CHECK (publish_frequency IN ('manual', 'daily', 'weekly', 'biweekly', 'monthly')),
  publish_day_of_week INTEGER,
  publish_time TIME DEFAULT '09:00',

  -- Auto publish
  auto_publish BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Sync status
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'error')),
  sync_error TEXT,

  -- OAuth credentials
  google_credentials JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(member_company_id, sheet_id)
);

-- 3. SNS daily statistics (visitors, engagement, followers)
CREATE TABLE IF NOT EXISTS public.sns_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- SNS account
  sns_account_id UUID NOT NULL REFERENCES public.member_sns_accounts(id) ON DELETE CASCADE,
  member_company_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Date
  stat_date DATE NOT NULL,

  -- Visit/Traffic stats
  visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,

  -- Engagement stats
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,

  -- Follower growth
  follower_count INTEGER DEFAULT 0,
  follower_change INTEGER DEFAULT 0,

  -- Content stats
  posts_count INTEGER DEFAULT 0,

  -- Reach stats
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,

  -- Engagement rate
  engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(sns_account_id, stat_date)
);

-- 4. SNS post statistics
CREATE TABLE IF NOT EXISTS public.sns_post_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- SNS account and post
  sns_account_id UUID NOT NULL REFERENCES public.member_sns_accounts(id) ON DELETE CASCADE,
  member_company_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Post info
  post_id TEXT NOT NULL,
  post_url TEXT,
  post_content TEXT,
  posted_at TIMESTAMPTZ NOT NULL,

  -- Stats
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,

  -- Engagement rate
  engagement_rate DECIMAL(5,2) DEFAULT 0,

  -- Last update
  last_updated_at TIMESTAMPTZ DEFAULT now(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(sns_account_id, post_id)
);

-- Enable RLS
ALTER TABLE public.member_sns_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_google_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sns_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sns_post_stats ENABLE ROW LEVEL SECURITY;

-- SNS accounts: Management and member company can view
CREATE POLICY "Management and member company can view SNS accounts"
  ON public.member_sns_accounts
  FOR SELECT
  USING (
    -- Member company
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = member_sns_accounts.member_company_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
    OR
    -- Management company
    EXISTS (
      SELECT 1 FROM public.organizations member
      JOIN public.organization_members om ON om.organization_id = member.parent_id
      WHERE member.id = member_sns_accounts.member_company_id
      AND member.organization_type = 'member'
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );

-- Google Sheets: Management and member company can view
CREATE POLICY "Management and member company can view Google Sheets"
  ON public.member_google_sheets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = member_google_sheets.member_company_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.organizations member
      JOIN public.organization_members om ON om.organization_id = member.parent_id
      WHERE member.id = member_google_sheets.member_company_id
      AND member.organization_type = 'member'
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );

-- Stats: Management and member company can view
CREATE POLICY "Management and member company can view stats"
  ON public.sns_daily_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = sns_daily_stats.member_company_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.organizations member
      JOIN public.organization_members om ON om.organization_id = member.parent_id
      WHERE member.id = sns_daily_stats.member_company_id
      AND member.organization_type = 'member'
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );

CREATE POLICY "Management and member company can view post stats"
  ON public.sns_post_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = sns_post_stats.member_company_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.organizations member
      JOIN public.organization_members om ON om.organization_id = member.parent_id
      WHERE member.id = sns_post_stats.member_company_id
      AND member.organization_type = 'member'
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_member_sns_accounts_company ON public.member_sns_accounts(member_company_id);
CREATE INDEX IF NOT EXISTS idx_member_sns_accounts_platform ON public.member_sns_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_member_google_sheets_company ON public.member_google_sheets(member_company_id);
CREATE INDEX IF NOT EXISTS idx_sns_daily_stats_account_date ON public.sns_daily_stats(sns_account_id, stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_sns_daily_stats_company_date ON public.sns_daily_stats(member_company_id, stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_sns_post_stats_account ON public.sns_post_stats(sns_account_id);
CREATE INDEX IF NOT EXISTS idx_sns_post_stats_posted_at ON public.sns_post_stats(posted_at DESC);

-- Updated_at triggers
CREATE TRIGGER update_member_sns_accounts_updated_at
  BEFORE UPDATE ON public.member_sns_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_google_sheets_updated_at
  BEFORE UPDATE ON public.member_google_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sns_daily_stats_updated_at
  BEFORE UPDATE ON public.sns_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View: Member company SNS summary
CREATE OR REPLACE VIEW public.member_company_sns_summary AS
SELECT
  member_company_id,
  COUNT(DISTINCT id) as total_sns_accounts,
  COUNT(DISTINCT id) FILTER (WHERE status = 'active') as active_accounts,
  SUM(follower_count) as total_followers,
  SUM(post_count) as total_posts,
  jsonb_agg(
    jsonb_build_object(
      'platform', platform,
      'account_name', account_name,
      'follower_count', follower_count,
      'status', status
    )
  ) as accounts
FROM public.member_sns_accounts
GROUP BY member_company_id;

GRANT SELECT ON public.member_company_sns_summary TO authenticated;

-- View: Member company weekly stats
CREATE OR REPLACE VIEW public.member_company_weekly_stats AS
SELECT
  member_company_id,
  SUM(visitors) as total_visitors,
  SUM(likes) as total_likes,
  SUM(comments) as total_comments,
  SUM(shares) as total_shares,
  AVG(engagement_rate) as avg_engagement_rate,
  MAX(follower_count) as current_followers
FROM public.sns_daily_stats
WHERE stat_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY member_company_id;

GRANT SELECT ON public.member_company_weekly_stats TO authenticated;

-- Grants
GRANT ALL ON public.member_sns_accounts TO authenticated;
GRANT ALL ON public.member_google_sheets TO authenticated;
GRANT ALL ON public.sns_daily_stats TO authenticated;
GRANT ALL ON public.sns_post_stats TO authenticated;
