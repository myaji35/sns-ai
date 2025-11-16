-- Simplify RLS policies for organizations
-- If user can view the management page, they should be able to manage member companies

-- Drop all existing policies
DROP POLICY IF EXISTS "Management can delete member companies" ON public.organizations;
DROP POLICY IF EXISTS "Management can update member companies" ON public.organizations;
DROP POLICY IF EXISTS "Management can create member companies" ON public.organizations;
DROP POLICY IF EXISTS "Management can view member companies" ON public.organizations;

-- Simple SELECT policy: Can view own organization or member companies under management
CREATE POLICY "Users can view organizations"
  ON public.organizations
  FOR SELECT
  USING (
    -- Own organization
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
    OR
    -- Member companies under management organization
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.parent_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );

-- Simple INSERT policy: Can create member companies if part of management org
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

-- Simple UPDATE policy: Can update own org or member companies under management
CREATE POLICY "Users can update organizations"
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
    -- Member companies under management
    (
      organization_type = 'member'
      AND
      EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organizations.parent_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
      )
    )
  );

-- Simple DELETE policy: Can delete member companies if part of management org
CREATE POLICY "Management can delete member companies"
  ON public.organizations
  FOR DELETE
  USING (
    organization_type = 'member'
    AND
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.parent_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );
