-- Upgrade existing organization to management company (demo data creation removed)

DO $$
DECLARE
  demo_org_id UUID;
BEGIN
  -- Find first organization (should be demo org)
  SELECT id INTO demo_org_id
  FROM public.organizations
  ORDER BY created_at ASC
  LIMIT 1;

  IF demo_org_id IS NOT NULL THEN
    -- Upgrade to management company
    UPDATE public.organizations
    SET organization_type = 'management'
    WHERE id = demo_org_id;

    RAISE NOTICE 'Upgraded organization % to management company', demo_org_id;
  ELSE
    RAISE NOTICE 'No organizations found to upgrade';
  END IF;
END $$;
