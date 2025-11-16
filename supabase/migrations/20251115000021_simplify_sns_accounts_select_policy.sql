-- member_sns_accounts SELECT 정책 단순화 (무한 재귀 방지)

DROP POLICY IF EXISTS "Management and member company can view SNS accounts" ON public.member_sns_accounts;

-- 데모 모드: 모두 조회 가능
CREATE POLICY "Allow SELECT for all (demo mode)"
  ON public.member_sns_accounts
  FOR SELECT
  USING (true);
