-- Create member_content_topics table for storing content topics per member company
CREATE TABLE IF NOT EXISTS public.member_content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_company_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Topic details
  title TEXT NOT NULL,
  description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create calendar_topic_subtopics table for storing subtopics with AI generation settings
CREATE TABLE IF NOT EXISTS public.calendar_topic_subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.member_content_topics(id) ON DELETE CASCADE,

  -- Subtopic configuration
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count >= 1 AND count <= 20),
  auto_schedule TEXT NOT NULL DEFAULT 'manual' CHECK (auto_schedule IN ('manual', 'daily', 'weekly', 'biweekly', 'monthly')),
  schedule_day TEXT, -- For weekly/biweekly/monthly schedules

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subtopic_generated_contents table for storing generated content items
CREATE TABLE IF NOT EXISTS public.subtopic_generated_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id UUID NOT NULL REFERENCES public.calendar_topic_subtopics(id) ON DELETE CASCADE,

  -- Generated content
  subtitle TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for member_content_topics
ALTER TABLE public.member_content_topics ENABLE ROW LEVEL SECURITY;

-- Allow all for demo mode
CREATE POLICY "Allow SELECT for all (demo mode)"
  ON public.member_content_topics
  FOR SELECT
  USING (true);

CREATE POLICY "Allow INSERT for all (demo mode)"
  ON public.member_content_topics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow UPDATE for all (demo mode)"
  ON public.member_content_topics
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow DELETE for all (demo mode)"
  ON public.member_content_topics
  FOR DELETE
  USING (true);

-- Add RLS policies for calendar_topic_subtopics
ALTER TABLE public.calendar_topic_subtopics ENABLE ROW LEVEL SECURITY;

-- Allow all for demo mode
CREATE POLICY "Allow SELECT for all (demo mode)"
  ON public.calendar_topic_subtopics
  FOR SELECT
  USING (true);

CREATE POLICY "Allow INSERT for all (demo mode)"
  ON public.calendar_topic_subtopics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow UPDATE for all (demo mode)"
  ON public.calendar_topic_subtopics
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow DELETE for all (demo mode)"
  ON public.calendar_topic_subtopics
  FOR DELETE
  USING (true);

-- Add RLS policies for subtopic_generated_contents
ALTER TABLE public.subtopic_generated_contents ENABLE ROW LEVEL SECURITY;

-- Allow all for demo mode
CREATE POLICY "Allow SELECT for all (demo mode)"
  ON public.subtopic_generated_contents
  FOR SELECT
  USING (true);

CREATE POLICY "Allow INSERT for all (demo mode)"
  ON public.subtopic_generated_contents
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow UPDATE for all (demo mode)"
  ON public.subtopic_generated_contents
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow DELETE for all (demo mode)"
  ON public.subtopic_generated_contents
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_member_content_topics_company_id ON public.member_content_topics(member_company_id);
CREATE INDEX idx_subtopics_topic_id ON public.calendar_topic_subtopics(topic_id);
CREATE INDEX idx_subtopic_generated_contents_subtopic_id ON public.subtopic_generated_contents(subtopic_id);
CREATE INDEX idx_subtopic_generated_contents_created_at ON public.subtopic_generated_contents(created_at DESC);

-- Create updated_at triggers
CREATE TRIGGER update_member_content_topics_updated_at
  BEFORE UPDATE ON public.member_content_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtopics_updated_at
  BEFORE UPDATE ON public.calendar_topic_subtopics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_contents_updated_at
  BEFORE UPDATE ON public.subtopic_generated_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.member_content_topics TO authenticated;
GRANT SELECT ON public.member_content_topics TO anon;
GRANT ALL ON public.calendar_topic_subtopics TO authenticated;
GRANT SELECT ON public.calendar_topic_subtopics TO anon;
GRANT ALL ON public.subtopic_generated_contents TO authenticated;
GRANT SELECT ON public.subtopic_generated_contents TO anon;
