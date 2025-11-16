-- Fix infinite recursion in UPDATE policy
-- Simplify the policy to avoid referencing organization_members

-- Drop existing UPDATE policies that cause recursion
DROP POLICY IF EXISTS "Users can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners and admins can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Management can update member companies" ON public.organizations;

-- Create a simple UPDATE policy for demo mode
CREATE POLICY "Allow UPDATE for all (demo mode)"
  ON public.organizations
  FOR UPDATE
  USING (
    -- 개발 환경: 모든 조직 업데이트 가능
    true

    -- 프로덕션용 정책 (현재 주석 처리):
    -- (
    --   -- Own organization (must have active membership)
    --   EXISTS (
    --     SELECT 1 FROM public.organization_members
    --     WHERE organization_members.organization_id = organizations.id
    --     AND organization_members.user_id = auth.uid()
    --     AND organization_members.status = 'active'
    --   )
    -- )
    -- OR
    -- (
    --   -- Member companies (must be management company admin)
    --   organization_type = 'member'
    --   AND parent_id IS NOT NULL
    --   AND auth.uid() IS NOT NULL
    -- )
  );
