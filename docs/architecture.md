# ContentFlow AI - Technical Architecture Document

**프로젝트명:** ContentFlow AI (통합 콘텐츠 마케팅 자동화 플랫폼)
**문서 버전:** 1.0
**작성일:** 2025-11-14
**아키텍트:** Winston
**검증 상태:** ✅ 검증 완료

---

## 📋 Executive Summary

ContentFlow AI는 **소상공인과 중소기업**을 위한 올인원 콘텐츠 마케팅 자동화 SaaS 플랫폼입니다. Google Sheets에서 콘텐츠를 기획하면, AI가 블로그 글과 SNS 포스트를 생성하고, 모든 채널에 자동으로 배포합니다.

**핵심 아키텍처 원칙:**
- **Supabase 기반**: Auth, DB, Storage 통합 플랫폼
- **워크플로우 분리**: 복잡한 AI 작업은 별도 NestJS 서버에서 처리
- **멀티테넌트**: RLS로 완벽한 데이터 격리
- **확장 가능**: 수백 명 동시 사용자 지원

---

## 🎯 통합 프로젝트 비전

이 아키텍처는 **두 개의 PRD를 통합**한 결과입니다:

### SNS-AI (Mary's Vision)
- 소상공인/중소기업 타겟
- SNS 콘텐츠 자동화
- 한국 시장 특화 (네이버, 카카오)
- 가망 고객 확보

### ICOP (기존 PRD)
- 블로그 콘텐츠 오케스트레이션
- Google Sheets 기획 관리
- 다중 LLM 비교/통합
- 멀티모달 (텍스트 + 이미지)

### 통합 결과: ContentFlow AI
**= 블로그 + SNS + AI 콘텐츠 생성 + 멀티 채널 배포**

---

## 🏗️ 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 (브라우저)                        │
│                     Google Sheets (외부)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Next.js 15.5)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 대시보드      │  │ 검토 UI      │  │ 분석 화면    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────┬───────────────────────────────────┬────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Platform                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Auth (OAuth, Email)          │ Row Level Security   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ PostgreSQL Database (멀티테넌트 데이터)                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Storage (생성된 이미지, 콘텐츠)                        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Realtime (진행 상황 알림)                             │   │
│  └──────────────────────────────────────────────────────┘   │
└────────┬───────────────────────────────────┬────────────────┘
         │                                   │
         │ Webhook/API                       │ DB Connection
         ▼                                   │
┌─────────────────────────────────────────────────────────────┐
│          Workflow Engine (NestJS + BullMQ + Redis)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 작업 큐 (Job Queue)                                   │   │
│  │  - 콘텐츠 생성 작업                                   │   │
│  │  - 이미지 생성 작업                                   │   │
│  │  - 배포 작업                                         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 크론 스케줄러 (Cron Scheduler)                        │   │
│  │  - 주간/월간 자동 발행                                │   │
│  │  - Google Sheets 동기화                              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 재시도 로직 (Retry Logic)                            │   │
│  │  - API 실패 시 자동 재시도 (최대 3회)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────┬───────────────────────────────────┬────────────────┘
         │                                   │
         │ API Calls                         │
         ▼                                   ▼
┌─────────────────────────────┐   ┌─────────────────────────┐
│     외부 AI 서비스           │   │   외부 SNS API          │
│  ┌────────────────────┐     │   │  ┌─────────────────┐   │
│  │ OpenAI GPT-4       │     │   │  │ Instagram       │   │
│  ├────────────────────┤     │   │  ├─────────────────┤   │
│  │ Anthropic Claude   │     │   │  │ Facebook        │   │
│  ├────────────────────┤     │   │  ├─────────────────┤   │
│  │ Google Gemini      │     │   │  │ Threads         │   │
│  ├────────────────────┤     │   │  ├─────────────────┤   │
│  │ fal.ai (FLUX)      │     │   │  │ X (Twitter)     │   │
│  │ (이미지 생성)       │     │   │  ├─────────────────┤   │
│  └────────────────────┘     │   │  │ 네이버 블로그    │   │
│                             │   │  ├─────────────────┤   │
│                             │   │  │ 카카오 스토리    │   │
│                             │   │  └─────────────────┘   │
└─────────────────────────────┘   └─────────────────────────┘
```

---

## 💻 기술 스택 (Technology Stack)

### Frontend Stack

| 기술 | 버전 | 역할 | 검증일 |
|------|------|------|--------|
| **Next.js** | 15.5 | React 프레임워크, App Router | 2025-11-14 |
| **TypeScript** | 5.x | 타입 안전성 | 2025-11-14 |
| **React** | 19.x | UI 라이브러리 | 2025-11-14 |
| **Tailwind CSS** | 3.x | 스타일링 | 2025-11-14 |
| **Shadcn/ui** | latest | UI 컴포넌트 | 2025-11-14 |
| **Supabase JS** | 2.x | Supabase 클라이언트 | 2025-11-14 |
| **TanStack Query** | 5.x | 서버 상태 관리 | 2025-11-14 |
| **Zustand** | 4.x | 클라이언트 상태 관리 | 2025-11-14 |

### Backend Stack

| 기술 | 버전 | 역할 | 검증일 |
|------|------|------|--------|
| **Supabase** | latest | BaaS 플랫폼 (Auth, DB, Storage) | 2025-11-14 |
| **PostgreSQL** | 15+ | 관계형 데이터베이스 | 2025-11-14 |
| **NestJS** | 11.x | Node.js 프레임워크 | 2025-11-14 |
| **BullMQ** | 5.63.0 | 작업 큐 관리 | 2025-11-14 |
| **Redis** | 7.x | 인메모리 데이터베이스 (큐 저장소) | 2025-11-14 |

### AI & External Services

| 서비스 | 용도 | 가격 모델 | 검증일 |
|--------|------|-----------|--------|
| **OpenAI GPT-4 Turbo** | 텍스트 생성 (옵션 1) | $0.01/1K tokens | 2025-11-14 |
| **Anthropic Claude 3.5 Sonnet** | 텍스트 생성 (옵션 2) | $0.003/1K tokens | 2025-11-14 |
| **Google Gemini 2.0 Flash** | 텍스트 생성 (옵션 3) | $0.0001/1K tokens | 2025-11-14 |
| **fal.ai** | 이미지 생성 (FLUX 모델) | ~$0.003/image (schnell) | 2025-11-14 |
| **Google Sheets API** | 콘텐츠 기획 관리 | 무료 (할당량 내) | 2025-11-14 |
| **Instagram Graph API** | SNS 자동 배포 | 무료 | 2025-11-14 |
| **Facebook Graph API** | SNS 자동 배포 | 무료 | 2025-11-14 |

### Infrastructure & DevOps

| 기술 | 버전 | 역할 |
|------|------|------|
| **Vercel** | latest | Frontend 호스팅 (Next.js) |
| **Railway / Render** | latest | NestJS 서버 호스팅 |
| **Upstash Redis** | latest | Managed Redis (BullMQ용) |
| **Docker** | latest | 컨테이너화 (선택사항) |
| **GitHub Actions** | latest | CI/CD |

---

## 📂 프로젝트 구조 (Project Structure)

### Monorepo 구조 (Turborepo)

```
contentflow-ai/
├── apps/
│   ├── web/                          # Next.js 15 Frontend
│   │   ├── app/                      # App Router
│   │   │   ├── (auth)/              # 인증 관련 페이지
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── (dashboard)/         # 대시보드 레이아웃
│   │   │   │   ├── dashboard/       # 메인 대시보드
│   │   │   │   ├── content/         # 콘텐츠 관리
│   │   │   │   │   ├── [id]/       # 개별 콘텐츠 상세
│   │   │   │   │   └── review/     # 검토 대기 목록
│   │   │   │   ├── calendar/        # 콘텐츠 캘린더
│   │   │   │   ├── analytics/       # 분석 화면
│   │   │   │   └── settings/        # 설정
│   │   │   ├── api/                 # Next.js API Routes
│   │   │   │   └── webhooks/       # Supabase/외부 Webhooks
│   │   │   └── layout.tsx
│   │   ├── components/              # React 컴포넌트
│   │   │   ├── ui/                 # Shadcn/ui 컴포넌트
│   │   │   ├── content/            # 콘텐츠 관련 컴포넌트
│   │   │   ├── calendar/           # 캘린더 컴포넌트
│   │   │   └── analytics/          # 차트 컴포넌트
│   │   ├── lib/                    # 유틸리티 함수
│   │   │   ├── supabase/          # Supabase 클라이언트
│   │   │   ├── api/               # API 클라이언트
│   │   │   └── utils.ts
│   │   ├── hooks/                  # Custom React Hooks
│   │   ├── stores/                 # Zustand Stores
│   │   ├── types/                  # TypeScript 타입
│   │   └── package.json
│   │
│   └── workflow-engine/             # NestJS Workflow Server
│       ├── src/
│       │   ├── modules/
│       │   │   ├── content/        # 콘텐츠 생성 모듈
│       │   │   │   ├── content.service.ts
│       │   │   │   ├── content.processor.ts
│       │   │   │   └── content.controller.ts
│       │   │   ├── ai/             # AI 서비스 모듈
│       │   │   │   ├── llm.service.ts
│       │   │   │   ├── image.service.ts
│       │   │   │   └── providers/
│       │   │   │       ├── openai.provider.ts
│       │   │   │       ├── claude.provider.ts
│       │   │   │       ├── gemini.provider.ts
│       │   │   │       └── falai.provider.ts
│       │   │   ├── distribution/   # 배포 모듈
│       │   │   │   ├── instagram.service.ts
│       │   │   │   ├── facebook.service.ts
│       │   │   │   ├── naver.service.ts
│       │   │   │   └── wordpress.service.ts
│       │   │   ├── sheets/         # Google Sheets 연동
│       │   │   │   └── sheets.service.ts
│       │   │   ├── queue/          # BullMQ 설정
│       │   │   │   ├── queue.module.ts
│       │   │   │   ├── content.queue.ts
│       │   │   │   └── processors/
│       │   │   └── cron/           # 크론 작업
│       │   │       └── scheduler.service.ts
│       │   ├── common/             # 공통 유틸리티
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   └── filters/
│       │   ├── config/             # 설정 파일
│       │   │   ├── supabase.config.ts
│       │   │   ├── redis.config.ts
│       │   │   └── ai.config.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/
│       └── package.json
│
├── packages/
│   ├── shared-types/               # 공유 TypeScript 타입
│   │   ├── src/
│   │   │   ├── content.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── database/                   # Supabase 스키마 & 마이그레이션
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── schema.sql
│   │
│   └── eslint-config/              # 공유 ESLint 설정
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── turbo.json                      # Turborepo 설정
├── package.json
└── README.md
```

---

## 🗄️ 데이터베이스 스키마 (Database Schema)

### Supabase PostgreSQL 스키마

```sql
-- 사용자 프로필 (Supabase Auth 확장)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 외부 계정 연동 (OAuth 토큰 저장)
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'google_sheets', 'instagram', 'facebook', 'naver', etc.
  account_name TEXT,
  access_token TEXT NOT NULL, -- 암호화된 토큰
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, account_name)
);

-- RLS: 사용자는 자신의 연동 계정만 조회/수정 가능
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own accounts" ON public.connected_accounts
  FOR ALL USING (auth.uid() = user_id);

-- 콘텐츠 캘린더 (Google Sheets 동기화)
CREATE TABLE public.content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  google_sheet_id TEXT, -- Google Sheets 문서 ID
  category TEXT NOT NULL,
  main_topic TEXT NOT NULL,
  subtopics JSONB, -- 배열: ["하위주제1", "하위주제2", ...]
  publish_frequency TEXT, -- 'weekly', 'monthly', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calendar" ON public.content_calendar
  FOR ALL USING (auth.uid() = user_id);

-- 생성된 콘텐츠
CREATE TABLE public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calendar_id UUID REFERENCES public.content_calendar(id) ON DELETE SET NULL,

  -- 콘텐츠 메타데이터
  title TEXT NOT NULL,
  subtitle TEXT,
  topic TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'blog', 'sns_post'

  -- 생성된 콘텐츠 (마크다운)
  body_markdown TEXT,

  -- SEO
  meta_description TEXT,
  keywords TEXT[], -- 배열: ['키워드1', '키워드2', ...]

  -- AI 생성 정보
  llm_provider TEXT, -- 'openai', 'anthropic', 'google'
  llm_model TEXT,
  generation_prompt TEXT,

  -- 이미지
  thumbnail_url TEXT,
  body_images JSONB, -- 배열: [{url, alt, position}, ...]

  -- 검토 & 배포
  review_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,

  -- 배포 플랫폼별 URL
  published_urls JSONB, -- {instagram: 'url', facebook: 'url', naver: 'url', ...}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own content" ON public.contents
  FOR ALL USING (auth.uid() = user_id);

-- 작업 로그 (워크플로우 추적)
CREATE TABLE public.job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- 'content_generation', 'image_generation', 'distribution'
  status TEXT NOT NULL, -- 'queued', 'processing', 'completed', 'failed'
  error_message TEXT,
  attempts INT DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own job logs" ON public.job_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 사용량 추적 (과금용)
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'content_generated', 'image_generated', 'api_call'
  quantity INT DEFAULT 1,
  metadata JSONB, -- {llm_provider, tokens_used, image_model, etc.}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own usage" ON public.usage_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- 인덱스 (성능 최적화)
CREATE INDEX idx_contents_user_id ON public.contents(user_id);
CREATE INDEX idx_contents_review_status ON public.contents(review_status);
CREATE INDEX idx_job_logs_user_id ON public.job_logs(user_id);
CREATE INDEX idx_job_logs_status ON public.job_logs(status);
CREATE INDEX idx_usage_metrics_user_id_created ON public.usage_metrics(user_id, created_at);
```

---

## 🔄 핵심 워크플로우 (Core Workflows)

### 1. 콘텐츠 생성 워크플로우

```
[사용자] → Google Sheets에 메인 주제 입력
    ↓
[Frontend] → Supabase에 content_calendar 레코드 생성
    ↓
[Workflow Engine] → BullMQ 작업 큐에 'generate_subtopics' 작업 추가
    ↓
[AI Service] → LLM 호출하여 하위 주제 10개 생성
    ↓
[Sheets Service] → Google Sheets에 하위 주제 다시 작성
    ↓
[Workflow Engine] → 각 하위 주제마다 'generate_content' 작업 생성
    ↓
[AI Service] → 다중 LLM 동시 호출 (GPT, Claude, Gemini)
    ↓
[AI Service] → 3개 초안 비교 → 최상의 글 선택 또는 통합
    ↓
[AI Service] → SEO 메타데이터 생성 (설명 + 키워드 10개)
    ↓
[Image Service] → fal.ai로 썸네일 1개 + 본문 이미지 5-10개 생성
    ↓
[Content Processor] → 이미지를 마크다운 본문에 삽입
    ↓
[Supabase] → contents 테이블에 저장 (review_status = 'pending')
    ↓
[Frontend] → 실시간 알림: "새 콘텐츠가 검토 대기 중입니다"
    ↓
[사용자] → 검토 UI에서 콘텐츠 확인 → 승인/거절
    ↓ (승인 시)
[Workflow Engine] → 'distribute_content' 작업 생성
    ↓
[Distribution Service] → 각 SNS 플랫폼 API 호출
    │   ├── Instagram Graph API
    │   ├── Facebook Graph API
    │   ├── 네이버 블로그 API
    │   ├── 카카오 스토리 API
    │   └── WordPress API
    ↓
[Supabase] → published_urls 업데이트, published_at 기록
    ↓
[Frontend] → 대시보드에 "배포 완료" 표시
```

### 2. 자동 스케줄링 워크플로우

```
[Cron Scheduler] → 매주 월요일 오전 9시 실행
    ↓
[Workflow Engine] → content_calendar에서 publish_frequency = 'weekly' 조회
    ↓
[Workflow Engine] → 각 캘린더 항목마다 콘텐츠 생성 작업 큐 추가
    ↓
(위 "콘텐츠 생성 워크플로우" 실행)
```

### 3. API 실패 재시도 로직

```
[AI Service] → OpenAI API 호출
    ↓ (실패 시)
[BullMQ] → 자동 재시도 (최대 3회, 지수 백오프)
    │   - 1차 재시도: 10초 후
    │   - 2차 재시도: 30초 후
    │   - 3차 재시도: 60초 후
    ↓ (3회 실패 시)
[Workflow Engine] → job_logs에 'failed' 상태 기록
    ↓
[Frontend] → 사용자에게 오류 알림 표시
```

---

## 🔐 보안 아키텍처 (Security Architecture)

### 1. 인증/인가 (Authentication & Authorization)

**Supabase Auth 사용:**
- **이메일/비밀번호** 인증
- **OAuth 소셜 로그인** (Google, GitHub 등)
- **JWT 토큰** 기반 세션 관리
- **Row Level Security (RLS)** - PostgreSQL 수준 권한 제어

### 2. 멀티테넌트 데이터 격리

**RLS 정책:**
```sql
-- 예시: 사용자는 자신의 콘텐츠만 조회
CREATE POLICY "Users view own content" ON public.contents
  FOR SELECT USING (auth.uid() = user_id);
```

**격리 수준:**
- 사용자 A는 사용자 B의 데이터를 **절대** 볼 수 없음
- 데이터베이스 수준에서 강제 (애플리케이션 버그로 우회 불가)

### 3. 외부 API 토큰 보안

**저장 방법:**
1. **Supabase Vault** 사용 (권장)
   - Vault에 암호화된 시크릿 저장
   - 애플리케이션은 Vault에서 런타임에 토큰 조회

2. **대안: DB 컬럼 암호화**
   ```sql
   -- connected_accounts.access_token을 pgcrypto로 암호화
   CREATE EXTENSION IF NOT EXISTS pgcrypto;

   -- 저장 시
   INSERT INTO connected_accounts (access_token)
   VALUES (pgp_sym_encrypt('actual_token', 'encryption_key'));

   -- 조회 시
   SELECT pgp_sym_decrypt(access_token, 'encryption_key') FROM connected_accounts;
   ```

**환경 변수 관리:**
- `.env.local` (로컬 개발)
- Vercel 환경 변수 (프로덕션)
- NestJS 서버: Railway/Render 시크릿

### 4. API 속도 제한 (Rate Limiting)

**Supabase RLS + 애플리케이션 레벨:**
- 사용자당 시간당 콘텐츠 생성 제한 (예: 10개/시간)
- BullMQ의 Rate Limiter 기능 사용

```typescript
// BullMQ Rate Limiting 예시
const contentQueue = new Queue('content-generation', {
  connection: redis,
  limiter: {
    max: 10, // 최대 10개 작업
    duration: 3600000, // 1시간(ms)
  },
});
```

---

## 🚀 배포 아키텍처 (Deployment Architecture)

### Production 환경

```
[사용자]
   ↓ HTTPS
[Vercel CDN] → Next.js Frontend (서버리스)
   ↓ API
[Supabase Cloud] → Auth, Database, Storage, Realtime
   ↓ Webhook/API
[Railway/Render] → NestJS Workflow Engine
   ↓ Redis Connection
[Upstash Redis] → BullMQ 작업 큐
```

### 서비스별 호스팅

| 서비스 | 호스팅 플랫폼 | 이유 |
|--------|-------------|------|
| **Next.js Frontend** | Vercel | Next.js 최적화, 자동 배포, Edge Functions |
| **Supabase** | Supabase Cloud | Managed BaaS, 자동 확장 |
| **NestJS Server** | Railway 또는 Render | NestJS 지원, Redis 통합, 저렴한 가격 |
| **Redis (BullMQ)** | Upstash Redis | Serverless Redis, 자동 확장 |

### CI/CD 파이프라인

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test
      - run: npm run lint

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service workflow-engine
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 📊 확장성 고려사항 (Scalability Considerations)

### 현재 아키텍처 지원 규모

| 지표 | MVP (1년차) | Growth (2년차) | Scale (3년차) |
|------|------------|----------------|---------------|
| **동시 사용자** | 100명 | 500명 | 1,000명 |
| **월간 콘텐츠 생성** | 10,000개 | 50,000개 | 100,000개 |
| **DB 크기** | 10GB | 50GB | 100GB |
| **비용 (월)** | $500 | $2,000 | $5,000 |

### 확장 전략

#### 1. 데이터베이스 확장
- **Supabase Pro Plan**: 자동 확장 지원
- **읽기 전용 레플리카**: 분석 쿼리 분리
- **Connection Pooling**: Supavisor 사용

#### 2. 워크플로우 엔진 확장
- **수평 확장**: Railway/Render에서 인스턴스 추가
- **BullMQ 분산**: 여러 워커 프로세스 실행
- **Redis 클러스터**: Upstash 자동 확장

#### 3. AI API 비용 최적화
- **캐싱**: 유사 주제는 이전 생성물 재사용
- **모델 선택**: Gemini Flash (저렴) → GPT-4 (고급) 단계별 사용
- **배치 처리**: 여러 요청 묶어서 API 호출 최소화

---

## 🧪 테스트 전략 (Testing Strategy)

### Frontend 테스트

```typescript
// 예시: components/__tests__/ContentReviewCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ContentReviewCard } from '../ContentReviewCard';

describe('ContentReviewCard', () => {
  it('renders content title and body', () => {
    const mockContent = {
      id: '123',
      title: 'Test Title',
      body_markdown: '# Test Content',
    };

    render(<ContentReviewCard content={mockContent} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

**도구:**
- Jest + React Testing Library
- Playwright (E2E)

### Backend 테스트

```typescript
// 예시: workflow-engine/src/modules/ai/llm.service.spec.ts
import { Test } from '@nestjs/testing';
import { LLMService } from './llm.service';

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LLMService],
    }).compile();

    service = module.get<LLMService>(LLMService);
  });

  it('should generate content using multiple LLMs', async () => {
    const result = await service.generateWithMultipleLLMs('Test topic');

    expect(result).toHaveProperty('gpt');
    expect(result).toHaveProperty('claude');
    expect(result).toHaveProperty('gemini');
  });
});
```

**도구:**
- Jest + Supertest
- BullMQ 테스트 모드

---

## 📈 모니터링 & 로깅 (Monitoring & Logging)

### 모니터링 도구

| 도구 | 용도 |
|------|------|
| **Vercel Analytics** | Frontend 성능 모니터링 |
| **Supabase Dashboard** | DB 쿼리 성능, 연결 풀 |
| **Bull Board** | BullMQ 작업 큐 시각화 |
| **Sentry** | 에러 추적 (Frontend + Backend) |
| **Upstash Console** | Redis 메모리 사용량 |

### 구조화된 로깅

```typescript
// NestJS Logger 예시
import { Logger } from '@nestjs/common';

export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  async generateContent(topic: string, userId: string) {
    this.logger.log(`Generating content for topic: ${topic}`, {
      userId,
      topic,
      timestamp: new Date().toISOString(),
    });

    try {
      // 콘텐츠 생성 로직
    } catch (error) {
      this.logger.error(`Content generation failed`, {
        userId,
        topic,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

---

## 🔧 개발 환경 설정 (Development Setup)

### 필수 요구사항

- **Node.js**: 20.x 이상
- **pnpm**: 9.x (Turborepo 권장 패키지 매니저)
- **Docker**: Redis 로컬 실행용 (선택사항)
- **Supabase CLI**: 로컬 DB 관리

### 초기 설정

```bash
# 1. 저장소 클론
git clone https://github.com/your-org/contentflow-ai.git
cd contentflow-ai

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
cp apps/web/.env.example apps/web/.env.local
cp apps/workflow-engine/.env.example apps/workflow-engine/.env

# 4. Supabase 로컬 시작
supabase start

# 5. DB 마이그레이션
supabase db push

# 6. Redis 시작 (Docker)
docker run -d -p 6379:6379 redis:7-alpine

# 7. 개발 서버 실행 (모든 앱 동시 실행)
pnpm dev
```

### 로컬 개발 URL

- **Frontend**: http://localhost:3000
- **Workflow Engine API**: http://localhost:3001
- **Supabase Studio**: http://localhost:54323
- **Bull Board**: http://localhost:3001/admin/queues

---

## 🎨 구현 패턴 (Implementation Patterns)

### 1. Naming Conventions (명명 규칙)

| 항목 | 규칙 | 예시 |
|------|------|------|
| **React 컴포넌트** | PascalCase | `ContentReviewCard.tsx` |
| **파일명 (컴포넌트)** | PascalCase | `ContentReviewCard.tsx` |
| **파일명 (유틸)** | kebab-case | `api-client.ts` |
| **함수/변수** | camelCase | `generateContent()` |
| **상수** | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| **DB 테이블** | snake_case (단수) | `content_calendar` |
| **DB 컬럼** | snake_case | `user_id`, `created_at` |
| **API 엔드포인트** | kebab-case | `/api/content-generation` |

### 2. 에러 처리 패턴

```typescript
// Frontend
try {
  const response = await apiClient.generateContent(topic);
  toast.success('콘텐츠 생성 시작!');
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error('알 수 없는 오류가 발생했습니다.');
    Sentry.captureException(error);
  }
}

// Backend (NestJS)
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 3. API 응답 형식

```typescript
// 성공 응답
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Generated Content",
    "body_markdown": "..."
  },
  "meta": {
    "timestamp": "2025-11-14T10:00:00Z"
  }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "CONTENT_GENERATION_FAILED",
    "message": "AI 서비스가 응답하지 않습니다.",
    "details": { "provider": "openai", "attempts": 3 }
  },
  "meta": {
    "timestamp": "2025-11-14T10:00:00Z"
  }
}
```

### 4. 날짜/시간 처리

- **저장**: 항상 UTC (PostgreSQL `TIMESTAMP WITH TIME ZONE`)
- **표시**: 사용자 로케일에 맞춰 변환
- **라이브러리**: `date-fns` 사용

```typescript
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const displayDate = format(parseISO(createdAt), 'PPP', { locale: ko });
// 출력: "2025년 11월 14일"
```

---

## 🔄 Novel Architectural Patterns (혁신적 패턴)

### 1. Multi-LLM Orchestration Pattern

**문제:** 어떤 LLM이 특정 주제에 가장 적합한지 사전에 알 수 없음

**해결책:** 3개 LLM 동시 호출 → 결과 비교 → 최상 선택 또는 통합

```typescript
// ai/llm.service.ts
export class LLMService {
  async generateWithMultipleLLMs(topic: string) {
    // 병렬 호출
    const [gptResult, claudeResult, geminiResult] = await Promise.all([
      this.openaiProvider.generate(topic),
      this.claudeProvider.generate(topic),
      this.geminiProvider.generate(topic),
    ]);

    // 품질 평가 (자동 또는 사용자 선택)
    const bestResult = await this.evaluateBest([
      { provider: 'gpt', content: gptResult },
      { provider: 'claude', content: claudeResult },
      { provider: 'gemini', content: geminiResult },
    ]);

    return bestResult;
  }

  private async evaluateBest(results: Array<{provider: string, content: string}>) {
    // 옵션 1: 사용자가 선택 (UI로 3개 표시)
    // 옵션 2: 자동 평가 (길이, 구조, 키워드 밀도 등)
    // 옵션 3: 메타 LLM으로 평가 (GPT-4가 3개 중 best 선택)
  }
}
```

**컴포넌트:**
- `OpenAIProvider`
- `ClaudeProvider`
- `GeminiProvider`
- `LLMOrchestrator`

**데이터 흐름:**
1. 사용자가 주제 제출
2. 3개 LLM 동시 호출 (Promise.all)
3. 결과를 DB에 임시 저장
4. 사용자에게 3개 초안 표시 OR 자동 선택
5. 선택된 결과를 최종 콘텐츠로 저장

### 2. Adaptive Retry with Provider Fallback Pattern

**문제:** 외부 API (OpenAI, fal.ai 등)가 간헐적으로 실패

**해결책:** BullMQ 재시도 + Provider 자동 전환

```typescript
// queue/processors/content.processor.ts
@Processor('content-generation')
export class ContentProcessor {
  @Process('generate-text')
  async handleTextGeneration(job: Job) {
    const { topic, preferredProvider } = job.data;

    try {
      return await this.llmService.generate(topic, preferredProvider);
    } catch (error) {
      // 재시도 횟수 확인
      if (job.attemptsMade < 3) {
        throw error; // BullMQ가 자동 재시도
      }

      // 3회 실패 시, 다른 Provider로 전환
      const fallbackProvider = this.getFallbackProvider(preferredProvider);
      this.logger.warn(`Switching to fallback: ${fallbackProvider}`);

      return await this.llmService.generate(topic, fallbackProvider);
    }
  }

  private getFallbackProvider(failed: string): string {
    const providers = ['openai', 'anthropic', 'google'];
    return providers.find(p => p !== failed) || 'anthropic';
  }
}
```

**영향 받는 Epic:** 모든 AI 콘텐츠 생성 작업

---

## 📋 아키텍처 결정 기록 (ADR - Architecture Decision Records)

### ADR-001: Supabase 선택 이유

**결정:** Supabase를 백엔드 플랫폼으로 사용

**맥락:**
- 멀티테넌트 SaaS 구축 필요
- 빠른 MVP 개발 요구
- Auth, DB, Storage 통합 필요

**고려한 대안:**
- 자체 NestJS + PostgreSQL + Auth0
- Firebase
- AWS Amplify

**결정 이유:**
1. **RLS (Row Level Security)** - 멀티테넌트 자동 격리
2. **PostgreSQL** - 관계형 데이터에 적합
3. **Realtime** - 작업 진행 상황 실시간 업데이트
4. **오픈소스** - 벤더 락인 최소화

**트레이드오프:**
- ✅ 장점: 빠른 개발, 자동 확장, 낮은 초기 비용
- ❌ 단점: 복잡한 비즈니스 로직은 별도 서버 필요

---

### ADR-002: BullMQ 선택 이유

**결정:** BullMQ를 작업 큐 관리 시스템으로 사용

**맥락:**
- 긴 실행 시간 작업 (AI 콘텐츠 생성)
- 재시도 로직 필요
- 크론 스케줄링 필요

**고려한 대안:**
- Bull (구버전)
- Agenda
- Temporal.io

**결정 이유:**
1. **TypeScript 네이티브** - NestJS와 완벽 통합
2. **재시도 로직 내장** - 지수 백오프 지원
3. **Bull Board** - 관리 UI 제공
4. **성능** - Redis 기반 고속 처리

**트레이드오프:**
- ✅ 장점: 안정적, 기능 풍부, 커뮤니티 활발
- ❌ 단점: Redis 의존성 (추가 인프라)

---

### ADR-003: fal.ai 선택 이유

**결정:** fal.ai를 이미지 생성 서비스로 사용

**맥락:**
- PRD 요구사항: "고품질 FLUX 모델 + 빠른 응답"
- 본문 이미지 5-10개 동시 생성

**고려한 대안:**
- Replicate
- Stability AI

**결정 이유:**
1. **속도** - Replicate 대비 4배 빠름
2. **가격** - 유사한 가격대
3. **FLUX 지원** - 최신 고품질 모델

**트레이드오프:**
- ✅ 장점: 빠른 속도, 최신 모델
- ❌ 단점: 신생 서비스 (안정성 검증 필요)

**완화 전략:** 향후 Replicate 백업 추가 고려

---

### ADR-004: Monorepo (Turborepo) 선택

**결정:** Turborepo로 Monorepo 구성

**맥락:**
- Frontend (Next.js) + Backend (NestJS) 통합 관리
- 공유 타입 정의 필요

**결정 이유:**
1. **타입 공유** - `shared-types` 패키지
2. **일관된 빌드** - Turbo 캐싱
3. **개발 경험** - `pnpm dev`로 모든 앱 동시 실행

---

## 🎯 Epic to Architecture Mapping (Epic별 아키텍처 매핑)

### Epic 1: 콘텐츠 기획 허브
- **Frontend**: `app/(dashboard)/calendar/`
- **Backend**: `workflow-engine/src/modules/sheets/`
- **DB**: `content_calendar` 테이블
- **외부 API**: Google Sheets API

### Epic 2: AI 콘텐츠 생성 엔진
- **Frontend**: `app/(dashboard)/content/`
- **Backend**: `workflow-engine/src/modules/ai/`, `content/`
- **DB**: `contents` 테이블
- **외부 API**: OpenAI, Anthropic, Google AI

### Epic 3: 이미지 자동 생성
- **Backend**: `workflow-engine/src/modules/ai/image.service.ts`
- **DB**: `contents.thumbnail_url`, `body_images`
- **외부 API**: fal.ai

### Epic 4: 멀티 채널 배포
- **Backend**: `workflow-engine/src/modules/distribution/`
- **DB**: `contents.published_urls`
- **외부 API**: Instagram, Facebook, 네이버, 카카오, WordPress

### Epic 5: 검토 워크플로우
- **Frontend**: `app/(dashboard)/content/review/`
- **Backend**: Supabase Realtime
- **DB**: `contents.review_status`

### Epic 6: 분석 & 최적화
- **Frontend**: `app/(dashboard)/analytics/`
- **DB**: `usage_metrics`, `contents` (engagement 데이터)

---

## ⚡ 성능 고려사항 (Performance Considerations)

### Frontend 최적화

1. **Next.js App Router 활용**
   - Server Components (기본값)
   - Client Components ('use client') 최소화
   - Suspense Boundaries로 로딩 상태 관리

2. **이미지 최적화**
   - `next/image` 사용 (자동 최적화)
   - Supabase Storage에서 CDN 제공

3. **코드 스플리팅**
   - 동적 import로 큰 컴포넌트 지연 로딩
   ```typescript
   const ContentEditor = dynamic(() => import('@/components/ContentEditor'), {
     loading: () => <Skeleton />,
   });
   ```

### Backend 최적화

1. **DB 쿼리 최적화**
   - 인덱스 활용 (위 스키마 참조)
   - N+1 문제 방지 (JOIN 사용)
   - Supabase RPC 함수로 복잡한 쿼리 최적화

2. **BullMQ 동시성**
   ```typescript
   @Process({ name: 'generate-content', concurrency: 5 })
   async handleGeneration(job: Job) {
     // 최대 5개 작업 동시 처리
   }
   ```

3. **AI API 호출 최적화**
   - 스트리밍 응답 (OpenAI Streaming)
   - 캐싱 (Redis에 유사 주제 결과 저장)

---

## 🧩 통합 포인트 (Integration Points)

### 1. Frontend ↔ Supabase

**방법:** Supabase JS SDK
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 데이터 조회
const { data, error } = await supabase
  .from('contents')
  .select('*')
  .eq('review_status', 'pending');
```

### 2. Frontend ↔ Workflow Engine

**방법:** Next.js API Routes → NestJS REST API
```typescript
// app/api/content/generate/route.ts
export async function POST(request: Request) {
  const { topic } = await request.json();

  const response = await fetch(`${process.env.WORKFLOW_ENGINE_URL}/api/content/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  return response.json();
}
```

### 3. Supabase ↔ Workflow Engine

**방법:** Supabase Webhooks
```sql
-- Supabase에서 콘텐츠 승인 시 Webhook 트리거
CREATE OR REPLACE FUNCTION notify_content_approved()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://workflow-engine.railway.app/webhooks/content-approved',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object('content_id', NEW.id)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_approved_trigger
AFTER UPDATE OF review_status ON contents
FOR EACH ROW
WHEN (NEW.review_status = 'approved')
EXECUTE FUNCTION notify_content_approved();
```

### 4. Workflow Engine ↔ External APIs

**방법:** NestJS HTTP Module + 재시도 로직
```typescript
import { HttpService } from '@nestjs/axios';
import { retry } from 'rxjs/operators';

export class OpenAIProvider {
  constructor(private httpService: HttpService) {}

  async generate(prompt: string) {
    return this.httpService
      .post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
      })
      .pipe(retry(3)) // 최대 3회 재시도
      .toPromise();
  }
}
```

---

## 🔍 Next Steps (다음 단계)

### Phase 1: MVP 개발 (3-6개월)

1. **프로젝트 초기화**
   ```bash
   npx create-turbo@latest contentflow-ai
   cd contentflow-ai
   npx create-next-app@latest apps/web --typescript --tailwind --app
   nest new apps/workflow-engine
   ```

2. **Supabase 설정**
   - 프로젝트 생성
   - DB 스키마 마이그레이션
   - RLS 정책 적용

3. **핵심 기능 구현 순서**
   - [x] 아키텍처 문서 작성
   - [ ] Supabase Auth + 사용자 프로필
   - [ ] Google Sheets 연동
   - [ ] AI 콘텐츠 생성 (단일 LLM)
   - [ ] 검토 워크플로우
   - [ ] SNS 배포 (Instagram, Facebook)
   - [ ] 대시보드 UI

4. **베타 테스트**
   - 50-100명 초기 사용자
   - 피드백 수집 및 개선

### Phase 2: 고도화 (6-12개월)

- 다중 LLM 비교 기능
- 이미지 자동 생성
- 한국 SNS (네이버, 카카오) 연동
- 고급 분석 대시보드
- 모바일 앱

---

## 📚 참고 자료 (References)

### 공식 문서
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)

### 관련 프로젝트
- [프로젝트 개요서](./project-brief.md)
- [경쟁사 분석](./competitive-analysis.md)
- [시장 조사](./market-research.md)
- [PRD (기존)](../prd.md)

---

## ✅ 검증 체크리스트

### 필수 항목
- [x] 기술 스택에 구체적 버전 명시
- [x] 모든 Epic이 아키텍처 컴포넌트에 매핑
- [x] 완전한 소스 트리 (실제 구조, 플레이스홀더 없음)
- [x] 멀티테넌트 데이터 격리 방법 명시
- [x] 외부 API 재시도 로직 설계
- [x] 보안 요구사항 (OAuth 토큰 암호화) 해결
- [x] Novel Pattern 문서화 (Multi-LLM Orchestration)
- [x] 아키텍처 결정 기록 (ADR) 포함

### 권장 항목
- [x] 배포 아키텍처 다이어그램
- [x] 확장성 고려사항
- [x] 모니터링 전략
- [x] 성능 최적화 방안

---

**문서 승인:** Winston (아키텍트)
**최종 검토일:** 2025-11-14
**다음 리뷰:** PRD 작성 완료 후
