-- Add DELETE policy for organizations (member companies)

-- Drop existing policy if exists to avoid conflicts
DROP POLICY IF EXISTS "Management can delete member companies" ON public.organizations;

-- Management can delete member companies
CREATE POLICY "Management can delete member companies"
  ON public.organizations
  FOR DELETE
  USING (
    -- Can only delete member companies (not management companies)
    organization_type = 'member'
    AND
    -- Must be a member of the parent management company
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.organizations parent ON parent.id = om.organization_id
      WHERE parent.organization_type = 'management'
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND organizations.parent_id = parent.id
    )
  );

-- Also add UPDATE policy if not exists
DROP POLICY IF EXISTS "Management can update member companies" ON public.organizations;

CREATE POLICY "Management can update member companies"
  ON public.organizations
  FOR UPDATE
  USING (
    -- Own organization
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
    OR
    -- Management updating member companies
    (
      organization_type = 'member'
      AND
      EXISTS (
        SELECT 1 FROM public.organization_members om
        JOIN public.organizations parent ON parent.id = om.organization_id
        WHERE parent.organization_type = 'management'
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND organizations.parent_id = parent.id
      )
    )
  );

-- Add INSERT policy for creating member companies
DROP POLICY IF EXISTS "Management can create member companies" ON public.organizations;

CREATE POLICY "Management can create member companies"
  ON public.organizations
  FOR INSERT
  WITH CHECK (
    organization_type = 'member'
    AND
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = parent_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );
