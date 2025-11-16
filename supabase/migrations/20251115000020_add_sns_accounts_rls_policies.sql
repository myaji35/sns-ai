-- member_sns_accounts 테이블에 INSERT, UPDATE, DELETE 정책 추가

-- INSERT 정책: 데모 모드로 모두 허용
DROP POLICY IF EXISTS "Allow INSERT for all (demo mode)" ON public.member_sns_accounts;
CREATE POLICY "Allow INSERT for all (demo mode)"
  ON public.member_sns_accounts
  FOR INSERT
  WITH CHECK (true);

-- UPDATE 정책: 데모 모드로 모두 허용
DROP POLICY IF EXISTS "Allow UPDATE for all (demo mode)" ON public.member_sns_accounts;
CREATE POLICY "Allow UPDATE for all (demo mode)"
  ON public.member_sns_accounts
  FOR UPDATE
  USING (true);

-- DELETE 정책: 데모 모드로 모두 허용
DROP POLICY IF EXISTS "Allow DELETE for all (demo mode)" ON public.member_sns_accounts;
CREATE POLICY "Allow DELETE for all (demo mode)"
  ON public.member_sns_accounts
  FOR DELETE
  USING (true);
