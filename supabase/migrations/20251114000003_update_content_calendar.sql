-- Add columns for publishing tracking
ALTER TABLE public.content_calendar
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_url TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for scheduled_date for scheduler queries
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date
ON public.content_calendar(scheduled_date)
WHERE status = 'scheduled';

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_content_calendar_status
ON public.content_calendar(status);
