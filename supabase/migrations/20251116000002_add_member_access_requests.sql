-- Create member_access_requests table for tracking membership requests
CREATE TABLE IF NOT EXISTS public.member_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Request details
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  introduction TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Admin response
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.member_access_requests ENABLE ROW LEVEL SECURITY;

-- Allow all for demo mode
CREATE POLICY "Allow SELECT for all (demo mode)"
  ON public.member_access_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Allow INSERT for all (demo mode)"
  ON public.member_access_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow UPDATE for all (demo mode)"
  ON public.member_access_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow DELETE for all (demo mode)"
  ON public.member_access_requests
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_member_access_requests_user_id ON public.member_access_requests(user_id);
CREATE INDEX idx_member_access_requests_email ON public.member_access_requests(email);
CREATE INDEX idx_member_access_requests_status ON public.member_access_requests(status);
CREATE INDEX idx_member_access_requests_created_at ON public.member_access_requests(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_member_access_requests_updated_at
  BEFORE UPDATE ON public.member_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.member_access_requests TO authenticated;
GRANT SELECT ON public.member_access_requests TO anon;
