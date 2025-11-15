-- Add columns for publishing tracking
ALTER TABLE public.content_calendar
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_url TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Note: scheduled_date column needs to be added first before creating index
-- This index creation is commented out as the column doesn't exist yet
-- CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date
-- ON public.content_calendar(scheduled_date)
-- WHERE status = 'scheduled';

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_content_calendar_status
ON public.content_calendar(status);
