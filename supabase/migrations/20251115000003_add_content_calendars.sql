-- Create content_calendars table for storing Google Sheets calendar information
CREATE TABLE IF NOT EXISTS public.content_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_sheet_id TEXT NOT NULL,
  google_sheet_url TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.content_calendars ENABLE ROW LEVEL SECURITY;

-- Users can only see their own calendars
CREATE POLICY "Users can view own calendars"
  ON public.content_calendars
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own calendars
CREATE POLICY "Users can insert own calendars"
  ON public.content_calendars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own calendars
CREATE POLICY "Users can update own calendars"
  ON public.content_calendars
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own calendars
CREATE POLICY "Users can delete own calendars"
  ON public.content_calendars
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create calendar_topics table for storing topics from Google Sheets
CREATE TABLE IF NOT EXISTS public.calendar_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES public.content_calendars(id) ON DELETE CASCADE,
  category TEXT,
  main_topic TEXT NOT NULL,
  subtopics JSONB, -- Array of subtopics
  publish_frequency TEXT,
  status TEXT DEFAULT '기획중',
  sheet_row_number INTEGER, -- Track which row this came from
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for calendar_topics
ALTER TABLE public.calendar_topics ENABLE ROW LEVEL SECURITY;

-- Users can only see topics from their own calendars
CREATE POLICY "Users can view own calendar topics"
  ON public.calendar_topics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content_calendars
      WHERE content_calendars.id = calendar_topics.calendar_id
      AND content_calendars.user_id = auth.uid()
    )
  );

-- Users can insert topics to their own calendars
CREATE POLICY "Users can insert own calendar topics"
  ON public.calendar_topics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.content_calendars
      WHERE content_calendars.id = calendar_topics.calendar_id
      AND content_calendars.user_id = auth.uid()
    )
  );

-- Users can update topics in their own calendars
CREATE POLICY "Users can update own calendar topics"
  ON public.calendar_topics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.content_calendars
      WHERE content_calendars.id = calendar_topics.calendar_id
      AND content_calendars.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.content_calendars
      WHERE content_calendars.id = calendar_topics.calendar_id
      AND content_calendars.user_id = auth.uid()
    )
  );

-- Users can delete topics from their own calendars
CREATE POLICY "Users can delete own calendar topics"
  ON public.calendar_topics
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.content_calendars
      WHERE content_calendars.id = calendar_topics.calendar_id
      AND content_calendars.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_content_calendars_user_id ON public.content_calendars(user_id);
CREATE INDEX idx_content_calendars_google_sheet_id ON public.content_calendars(google_sheet_id);
CREATE INDEX idx_calendar_topics_calendar_id ON public.calendar_topics(calendar_id);
CREATE INDEX idx_calendar_topics_status ON public.calendar_topics(status);

-- Create updated_at triggers
CREATE TRIGGER update_content_calendars_updated_at
  BEFORE UPDATE ON public.content_calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_topics_updated_at
  BEFORE UPDATE ON public.calendar_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add unique partial index for one active calendar per user
CREATE UNIQUE INDEX idx_one_active_calendar_per_user
ON public.content_calendars (user_id)
WHERE is_active = true;

-- Grant permissions
GRANT ALL ON public.content_calendars TO authenticated;
GRANT SELECT ON public.content_calendars TO anon;
GRANT ALL ON public.calendar_topics TO authenticated;
GRANT SELECT ON public.calendar_topics TO anon;