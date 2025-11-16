-- 결제 및 쿼터 관련 테이블 추가

-- 1. 결제 거래 내역 테이블
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- 결제 정보
  payment_key TEXT,  -- 토스 페이먼츠 결제 키
  order_id TEXT NOT NULL UNIQUE,  -- 주문 ID (고유값)
  amount INTEGER NOT NULL,  -- 결제 금액 (원)

  -- 상품 정보
  quota_amount INTEGER NOT NULL,  -- 구매한 쿼터 수량
  price_per_quota INTEGER NOT NULL DEFAULT 500,  -- 쿼터당 가격 (기본 500원)

  -- 결제 상태
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed, cancelled

  -- 결제 방법
  method TEXT,  -- 카드, 가상계좌, 간편결제 등

  -- 토스 페이먼츠 응답 데이터
  toss_response JSONB,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT check_amount_positive CHECK (amount > 0),
  CONSTRAINT check_quota_positive CHECK (quota_amount > 0)
);

-- 2. 쿼터 사용 내역 테이블
CREATE TABLE IF NOT EXISTS public.quota_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- 사용 정보
  used_amount INTEGER NOT NULL DEFAULT 1,  -- 사용한 쿼터 수량
  content_type TEXT,  -- 콘텐츠 유형 (post, story, reel 등)
  content_id UUID,  -- 생성된 콘텐츠 ID (참조용)

  -- 설명
  description TEXT,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT check_used_amount_positive CHECK (used_amount > 0)
);

-- 3. organizations 테이블에 현재 쿼터 필드 추가
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS current_quota INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS quota_warning_sent BOOLEAN DEFAULT FALSE;

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_payment_transactions_org ON public.payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quota_usage_org ON public.quota_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_quota_usage_created_at ON public.quota_usage(created_at DESC);

-- 5. RLS 정책 (개발 모드: 모두 허용)
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on payment_transactions (demo mode)"
  ON public.payment_transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on quota_usage (demo mode)"
  ON public.quota_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. 기존 조직에 초기 쿼터 설정 (monthly_contents_limit 기준)
UPDATE public.organizations
SET current_quota = monthly_contents_limit
WHERE current_quota = 0 AND monthly_contents_limit IS NOT NULL;

COMMENT ON TABLE public.payment_transactions IS '결제 거래 내역';
COMMENT ON TABLE public.quota_usage IS '쿼터 사용 내역';
COMMENT ON COLUMN public.organizations.current_quota IS '현재 남은 쿼터 수량';
COMMENT ON COLUMN public.organizations.quota_warning_sent IS '쿼터 부족 경고 발송 여부 (10% 이하)';
