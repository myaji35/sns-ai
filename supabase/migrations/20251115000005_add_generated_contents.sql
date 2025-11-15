-- Create generated_contents table for storing AI-generated content
CREATE TABLE IF NOT EXISTS public.generated_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content details
  type TEXT NOT NULL CHECK (type IN ('subtopics', 'blog_post', 'social_media', 'image_prompt')),
  main_topic TEXT,
  content TEXT NOT NULL,

  -- Content metadata
  title TEXT,
  image_prompt TEXT,
  hashtags TEXT[], -- Array of hashtags
  metadata JSONB, -- wordCount, readingTime, seoScore, etc.
  versions JSONB, -- Array of different AI provider versions

  -- Platform and status
  platform TEXT CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'blog')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'rejected', 'published')),

  -- Quality and feedback
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  feedback TEXT,

  -- Related entities
  calendar_topic_id UUID REFERENCES public.calendar_topics(id) ON DELETE SET NULL,
  parent_content_id UUID REFERENCES public.generated_contents(id) ON DELETE SET NULL,

  -- Publishing info
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.generated_contents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own generated content
CREATE POLICY "Users can view own generated content"
  ON public.generated_contents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own content
CREATE POLICY "Users can insert own generated content"
  ON public.generated_contents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update own generated content"
  ON public.generated_contents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete own generated content"
  ON public.generated_contents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_generated_contents_user_id ON public.generated_contents(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_contents_type ON public.generated_contents(type);
CREATE INDEX IF NOT EXISTS idx_generated_contents_status ON public.generated_contents(status);
CREATE INDEX IF NOT EXISTS idx_generated_contents_platform ON public.generated_contents(platform);
CREATE INDEX IF NOT EXISTS idx_generated_contents_calendar_topic_id ON public.generated_contents(calendar_topic_id);
CREATE INDEX IF NOT EXISTS idx_generated_contents_created_at ON public.generated_contents(created_at DESC);

-- Create updated_at triggers
CREATE TRIGGER update_generated_contents_updated_at
  BEFORE UPDATE ON public.generated_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.generated_contents TO authenticated;
GRANT SELECT ON public.generated_contents TO anon;
GRANT ALL ON public.content_reviews TO authenticated;
GRANT SELECT ON public.content_reviews TO anon;