-- member_company_detail 뷰에 current_quota 추가

DROP VIEW IF EXISTS public.member_company_detail;

CREATE OR REPLACE VIEW public.member_company_detail AS
SELECT
  o.id,
  o.parent_id as management_company_id,
  o.name,
  o.email,
  o.business_number,
  o.business_type,
  o.industry,
  o.plan_type,
  o.subscription_status,
  o.subscription_start_date,
  o.monthly_contents_limit,
  o.current_quota,
  o.quota_warning_sent,
  o.created_at,
  o.updated_at,
  COUNT(DISTINCT om.user_id) FILTER (WHERE om.status = 'active') as user_count
FROM public.organizations o
LEFT JOIN public.organization_members om ON o.id = om.organization_id
WHERE o.organization_type = 'member'
GROUP BY o.id, o.parent_id, o.name, o.email, o.business_number,
         o.business_type, o.industry, o.plan_type, o.subscription_status,
         o.subscription_start_date, o.monthly_contents_limit, o.current_quota,
         o.quota_warning_sent, o.created_at, o.updated_at;

COMMENT ON VIEW public.member_company_detail IS '회원사 상세 정보 (사용자 수, 쿼터 포함)';
