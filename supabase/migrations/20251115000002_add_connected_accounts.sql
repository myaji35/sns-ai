-- Create connected_accounts table for Google Sheets OAuth tokens
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('google_sheets', 'google_drive', 'microsoft_365')),
  account_name TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Will be encrypted via Vault or pgcrypto
  refresh_token TEXT, -- For token refresh
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one account per platform per user
  UNIQUE(user_id, platform)
);

-- Add RLS policies
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connected accounts
CREATE POLICY "Users can view own connected accounts"
  ON public.connected_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own connected accounts
CREATE POLICY "Users can insert own connected accounts"
  ON public.connected_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connected accounts
CREATE POLICY "Users can update own connected accounts"
  ON public.connected_accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own connected accounts
CREATE POLICY "Users can delete own connected accounts"
  ON public.connected_accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create an updated_at trigger (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_connected_accounts_updated_at ON public.connected_accounts;
CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_connected_accounts_user_id ON public.connected_accounts(user_id);
CREATE INDEX idx_connected_accounts_platform ON public.connected_accounts(platform);
CREATE INDEX idx_connected_accounts_is_active ON public.connected_accounts(is_active);

-- Grant permissions
GRANT ALL ON public.connected_accounts TO authenticated;
GRANT SELECT ON public.connected_accounts TO anon;