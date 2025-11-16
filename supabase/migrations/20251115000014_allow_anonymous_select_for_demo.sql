-- 개발 환경 데모 모드를 위한 임시 정책
-- 익명 사용자도 organizations를 조회할 수 있도록 허용
-- 프로덕션 환경에서는 이 정책을 제거하거나 수정해야 함

-- 기존의 중복된 SELECT 정책들을 삭제하고 하나로 통합
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations" ON public.organizations;

-- 새로운 통합 SELECT 정책
CREATE POLICY "Allow SELECT for authenticated and anonymous users"
  ON public.organizations
  FOR SELECT
  USING (
    -- 개발 환경: 모든 사용자(익명 포함)가 조회 가능
    -- 프로덕션 환경에서는 아래 조건으로 제한해야 함
    true

    -- 프로덕션용 정책 (현재 주석 처리):
    -- -- Own organization
    -- EXISTS (
    --   SELECT 1 FROM public.organization_members
    --   WHERE organization_members.organization_id = organizations.id
    --   AND organization_members.user_id = auth.uid()
    --   AND organization_members.status = 'active'
    -- )
    -- OR
    -- -- Member companies under management organization
    -- EXISTS (
    --   SELECT 1 FROM public.organization_members om
    --   WHERE om.organization_id = organizations.parent_id
    --   AND om.user_id = auth.uid()
    --   AND om.status = 'active'
    -- )
  );

-- INSERT 정책도 익명 사용자를 허용하도록 수정
DROP POLICY IF EXISTS "Management can create member companies" ON public.organizations;

CREATE POLICY "Allow INSERT for all users (demo mode)"
  ON public.organizations
  FOR INSERT
  WITH CHECK (
    -- 개발 환경: 모든 사용자가 member 타입 조직 생성 가능
    organization_type = 'member'

    -- 프로덕션용 정책 (현재 주석 처리):
    -- organization_type = 'member'
    -- AND
    -- EXISTS (
    --   SELECT 1 FROM public.organization_members om
    --   WHERE om.organization_id = parent_id
    --   AND om.user_id = auth.uid()
    --   AND om.status = 'active'
    -- )
  );
