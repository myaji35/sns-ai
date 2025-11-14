-- Add review columns to content_calendar
ALTER TABLE public.content_calendar
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft' CHECK (review_status IN ('draft', 'pending_review', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);

-- Create content_reviews table for review history
CREATE TABLE IF NOT EXISTS public.content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content_calendar(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  review_status TEXT NOT NULL CHECK (review_status IN ('approved', 'rejected', 'revision_requested')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on content_reviews
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_reviews
CREATE POLICY "Users can view reviews for their content"
  ON public.content_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content_calendar
      WHERE content_calendar.id = content_reviews.content_id
      AND content_calendar.user_id = auth.uid()
    )
    OR reviewer_id = auth.uid()
  );

CREATE POLICY "Users can create reviews for any content"
  ON public.content_reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can update their own reviews"
  ON public.content_reviews FOR UPDATE
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

-- Add index for review queries
CREATE INDEX IF NOT EXISTS idx_content_reviews_content_id
ON public.content_reviews(content_id);

CREATE INDEX IF NOT EXISTS idx_content_calendar_review_status
ON public.content_calendar(review_status);
