-- Fix infinite recursion in DELETE policy
-- Simplify the policy to avoid referencing organization_members

-- Drop existing DELETE policies
DROP POLICY IF EXISTS "Management can delete member companies" ON public.organizations;
DROP POLICY IF EXISTS "Owners can delete organization" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated users to delete member orgs" ON public.organizations;

-- Create a simple DELETE policy for demo mode
-- In production, you should add proper authorization checks
CREATE POLICY "Allow DELETE for all (demo mode)"
  ON public.organizations
  FOR DELETE
  USING (
    -- 개발 환경: 모든 사용자가 member 타입 조직 삭제 가능
    organization_type = 'member'

    -- 프로덕션용 정책 (현재 주석 처리):
    -- organization_type = 'member'
    -- AND parent_id IS NOT NULL
    -- AND auth.uid() IS NOT NULL
  );
