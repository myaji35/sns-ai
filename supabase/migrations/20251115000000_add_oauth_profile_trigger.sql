-- Add Google OAuth profile auto-creation trigger
-- Migration: 20251115000000_add_oauth_profile_trigger
-- Description: Google OAuth 사용자 생성 시 profiles 테이블에 자동으로 레코드 생성

-- Step 1: Add google_id column to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.google_id IS 'Google OAuth ID';

-- Step 2: Create or replace the handle_new_user function
-- This function is called when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert new profile for the user
  -- Use ON CONFLICT to prevent duplicate profile creation
  INSERT INTO public.profiles (id, email, google_id, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'provider_id',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Step 3: Create trigger on auth.users table if it doesn't exist
-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
