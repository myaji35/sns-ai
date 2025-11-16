-- Create demo admin user, management organization and member company

DO $$
DECLARE
  demo_mgmt_org_id UUID;
  demo_member_org_id UUID;
  demo_user_id UUID;
BEGIN
  -- Create management organization first
  INSERT INTO public.organizations (
    id,
    name,
    email,
    organization_type,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    '데모 관리사',
    'management@example.com',
    'management',
    NOW(),
    NOW()
  )
  RETURNING id INTO demo_mgmt_org_id;

  -- Create demo admin user in auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change_token_current,
    email_change_token_new,
    recovery_token,
    email_change,
    reauthentication_token,
    phone_change_token
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),  -- bcrypt hash of 'admin123'
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    false,
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO demo_user_id;

  -- Update the auto-created profile to link to management org
  UPDATE public.profiles
  SET current_organization_id = demo_mgmt_org_id,
      full_name = 'Admin User',
      updated_at = NOW()
  WHERE id = demo_user_id;

  -- Create member organization
  INSERT INTO public.organizations (
    id,
    name,
    email,
    phone,
    business_number,
    industry,
    plan_type,
    organization_type,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    '데모 회원사',
    'demo@example.com',
    '02-1234-5678',
    '123-45-67890',
    '소프트웨어 개발',
    'business',
    'member',
    NOW(),
    NOW()
  )
  RETURNING id INTO demo_member_org_id;

  RAISE NOTICE 'Created admin user: %, management org: %, member org: %', demo_user_id, demo_mgmt_org_id, demo_member_org_id;
END $$;
