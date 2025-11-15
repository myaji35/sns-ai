-- Migration: Add deleted_at column to profiles table
-- Description: Adds a soft delete timestamp column for GDPR compliance and data recovery
-- Date: 2025-11-15
-- Story: 2.7 - 계정 삭제 기능

-- Add deleted_at column to profiles table
ALTER TABLE profiles
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster queries on non-deleted profiles
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.deleted_at IS 'Soft delete timestamp. NULL means active account, non-NULL means deleted.';

-- Optional: Create a view for active (non-deleted) profiles
CREATE OR REPLACE VIEW active_profiles AS
SELECT *
FROM profiles
WHERE deleted_at IS NULL;

-- Grant appropriate permissions
GRANT SELECT ON active_profiles TO authenticated;

-- Note: To enable soft delete, uncomment the relevant code in
-- /apps/web/src/app/api/auth/delete-account/route.ts
