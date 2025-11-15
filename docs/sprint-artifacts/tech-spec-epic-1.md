# Epic Technical Specification: 프로젝트 기반 구축 (Foundation)

Date: 2025-11-14
Author: BMad
Epic ID: 1
Status: Draft

---

## Overview

Epic 1은 ContentFlow AI의 전체 기술 인프라를 구축하는 기반 Epic입니다. Turborepo 기반 Monorepo, Next.js 15.5 Frontend, NestJS 11.x Workflow Engine, Supabase 백엔드, CI/CD 파이프라인을 설정하여 모든 후속 기능 개발을 가능하게 합니다.

이 Epic은 PRD의 기술적 요구사항을 충족하며, Architecture 문서에 정의된 전체 시스템 구조의 물리적 구현입니다. MVP 개발의 첫 단계로서 개발팀이 안정적으로 작업할 수 있는 환경을 제공합니다.

## Objectives and Scope

**In Scope:**

- Turborepo + pnpm 기반 Monorepo 구조 설정
- Next.js 15.5 Frontend 앱 초기화 (TypeScript, Tailwind CSS, Shadcn/ui)
- NestJS 11.x Workflow Engine 초기화 (모듈 구조, Health check, Swagger)
- Supabase 프로젝트 생성 및 초기 DB 스키마 마이그레이션 (6개 테이블 + RLS)
- GitHub Actions CI/CD 파이프라인 (테스트, 린팅, 자동 배포)
- 로컬 개발 환경 설정 (pnpm dev로 모든 앱 동시 실행)

**Out of Scope:**

- 실제 비즈니스 로직 구현 (Epic 2-7에서 처리)
- UI/UX 디자인 상세 구현 (Epic 2-7에서 처리)
- 외부 API 통합 (Google Sheets, LLM, SNS 등)
- 프로덕션 배포 (CI/CD 설정만, 실제 배포는 Epic 2 이후)

## System Architecture Alignment

이 Epic은 Architecture 문서의 다음 구성요소를 물리적으로 구현합니다:

**Frontend (apps/web):**

- Next.js 15.5 App Router 구조 (`app/` 디렉토리)
- Tailwind CSS 3.x + Shadcn/ui 디자인 시스템
- TypeScript 5.x 타입 안전성
- Trust Blue (#0EA5E9) 컬러 테마 설정

**Backend (apps/workflow-engine):**

- NestJS 11.x 모듈 구조:
  - `modules/content/` - 콘텐츠 생성 로직 (Epic 4)
  - `modules/ai/` - LLM 통합 (Epic 4)
  - `modules/distribution/` - SNS 배포 (Epic 6)
  - `modules/sheets/` - Google Sheets 연동 (Epic 3)
  - `modules/queue/` - BullMQ 작업 큐 (Epic 4)

**Database (Supabase):**

- PostgreSQL 15+ 테이블 스키마 (Architecture 문서 기준)
- Row Level Security (RLS) 정책
- Supabase Auth, Storage, Realtime 설정

**Infrastructure:**

- Monorepo: Turborepo + pnpm workspace
- CI/CD: GitHub Actions
- Deployment: Vercel (Frontend), Railway (Backend)

**제약사항:**

- Node.js 20.x 이상 필요
- pnpm 9.x 사용 (npm/yarn 사용 불가)
- Supabase CLI 필수 설치

## Detailed Design

### Services and Modules

| 모듈/서비스               | 책임                           | 입력/출력                       | 소유자      |
| ------------------------- | ------------------------------ | ------------------------------- | ----------- |
| **apps/web**              | Next.js Frontend               | HTTP 요청 → HTML/React 컴포넌트 | Frontend 팀 |
| **apps/workflow-engine**  | NestJS Backend                 | HTTP API → JSON 응답            | Backend 팀  |
| **packages/shared-types** | 공유 TypeScript 타입           | N/A (타입 정의만)               | 전체 팀     |
| **packages/database**     | Supabase 스키마 & 마이그레이션 | SQL 파일 → DB 구조              | Backend 팀  |
| **Turborepo**             | Monorepo 빌드 오케스트레이션   | 소스 코드 → 빌드 아티팩트       | DevOps      |
| **GitHub Actions**        | CI/CD 자동화                   | Git Push → 테스트/배포          | DevOps      |

**모듈 의존성:**

```
apps/web → packages/shared-types
apps/workflow-engine → packages/shared-types
apps/workflow-engine → packages/database
```

### Data Models and Contracts

**초기 DB 스키마 (Supabase PostgreSQL):**

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
  platform TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, account_name)
);

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own accounts" ON public.connected_accounts
  FOR ALL USING (auth.uid() = user_id);

-- 콘텐츠 캘린더
CREATE TABLE public.content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  google_sheet_id TEXT,
  category TEXT NOT NULL,
  main_topic TEXT NOT NULL,
  subtopics JSONB,
  publish_frequency TEXT,
  status TEXT DEFAULT 'pending',
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
  title TEXT NOT NULL,
  subtitle TEXT,
  topic TEXT NOT NULL,
  content_type TEXT NOT NULL,
  body_markdown TEXT,
  meta_description TEXT,
  keywords TEXT[],
  llm_provider TEXT,
  llm_model TEXT,
  generation_prompt TEXT,
  thumbnail_url TEXT,
  body_images JSONB,
  review_status TEXT DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  published_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own content" ON public.contents
  FOR ALL USING (auth.uid() = user_id);

-- 작업 로그
CREATE TABLE public.job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  attempts INT DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own job logs" ON public.job_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 사용량 추적
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  quantity INT DEFAULT 1,
  metadata JSONB,
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

**TypeScript 공유 타입 (packages/shared-types):**

```typescript
// packages/shared-types/src/user.types.ts
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: 'google_sheets' | 'instagram' | 'facebook' | 'naver';
  account_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// packages/shared-types/src/content.types.ts
export interface Content {
  id: string;
  user_id: string;
  title: string;
  body_markdown?: string;
  review_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
```

### APIs and Interfaces

**NestJS Workflow Engine - Health Check:**

```typescript
// GET /health
// Response:
{
  "status": "ok",
  "timestamp": "2025-11-14T10:00:00Z"
}
```

**NestJS Workflow Engine - Swagger Documentation:**

```typescript
// GET /api
// Returns: Swagger UI with all API endpoints documented
```

**Frontend ↔ Supabase:**

```typescript
// Supabase Client 초기화
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 예시: 프로필 조회
const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
```

### Workflows and Sequencing

**개발 워크플로우:**

```
1. 개발자가 feature 브랜치 생성
2. 로컬에서 `pnpm dev` 실행 (모든 앱 동시 실행)
3. 코드 작성 및 테스트
4. Git commit (Husky pre-commit hook 실행)
5. GitHub에 Push
6. GitHub Actions CI 실행:
   - TypeScript 컴파일 체크
   - ESLint 검사
   - Prettier 체크
   - Jest 테스트 실행
7. PR 생성 및 리뷰
8. main 브랜치 머지
9. GitHub Actions CD 실행:
   - Vercel 자동 배포 (Frontend)
   - Railway 자동 배포 (Backend)
```

**Monorepo 빌드 순서:**

```
1. Turborepo가 의존성 그래프 분석
2. packages/shared-types 빌드
3. packages/database 마이그레이션 실행
4. apps/web 빌드 (병렬)
5. apps/workflow-engine 빌드 (병렬)
```

## Non-Functional Requirements

### Performance

**빌드 시간:**

- Turborepo 캐시 사용 시 증분 빌드: < 30초
- 전체 빌드 (cold): < 3분
- 로컬 개발 서버 시작: < 10초

**개발 경험:**

- Hot Module Replacement (HMR): < 1초
- TypeScript 타입 체크: < 5초
- ESLint 실행: < 3초

**CI/CD:**

- GitHub Actions CI 파이프라인: < 5분
- Vercel 배포: < 2분
- Railway 배포: < 3분

### Security

**소스 코드 보안:**

- `.env` 파일은 Git에 커밋 금지 (`.gitignore`)
- Supabase 키는 환경 변수로 관리
- GitHub Secrets 사용 (VERCEL_TOKEN, RAILWAY_TOKEN)

**데이터베이스 보안:**

- RLS (Row Level Security) 모든 테이블 적용
- `auth.uid()` 기반 사용자 데이터 격리
- OAuth 토큰 암호화 저장 (Epic 3에서 구현)

### Reliability/Availability

**로컬 개발 환경:**

- `pnpm dev` 실패 시 명확한 에러 메시지
- Supabase 로컬 DB 자동 시작/종료
- Hot reload 안정성 (crash 시 자동 재시작)

**CI/CD:**

- GitHub Actions 실패 시 자동 재시도 (1회)
- 배포 실패 시 롤백 가능 (Vercel/Railway 기본 기능)

### Observability

**로그:**

- NestJS Logger 사용 (구조화된 로그)
- 로그 레벨: debug, info, warn, error
- 개발 환경: console 출력
- 프로덕션: Railway Logs (향후 Sentry 통합 고려)

**모니터링:**

- Vercel Analytics (Frontend 성능)
- Railway Metrics (Backend CPU/Memory)
- Supabase Dashboard (DB 쿼리 성능)

## Dependencies and Integrations

**Root 의존성 (package.json):**

```json
{
  "devDependencies": {
    "@turbo/gen": "^2.5.8",
    "turbo": "^2.5.8",
    "typescript": "^5.7.2",
    "prettier": "^3.4.2",
    "eslint": "^9.18.0"
  }
}
```

**Frontend 의존성 (apps/web/package.json):**

```json
{
  "dependencies": {
    "next": "15.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.2",
    "@supabase/supabase-js": "^2.47.10",
    "tailwindcss": "^3.4.17",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.7.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "eslint": "^9.18.0",
    "eslint-config-next": "15.5.0"
  }
}
```

**Backend 의존성 (apps/workflow-engine/package.json):**

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/config": "^3.3.0",
    "@nestjs/swagger": "^8.0.7",
    "@supabase/supabase-js": "^2.47.10",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/node": "^22.10.2",
    "jest": "^29.7.0",
    "typescript": "^5.7.2"
  }
}
```

**외부 서비스:**

- Supabase (Auth, DB, Storage)
- Vercel (Frontend 배포)
- Railway (Backend 배포)
- GitHub (코드 저장소, CI/CD)

## Acceptance Criteria (Authoritative)

**AC1:** Turborepo Monorepo 구조가 설정되어 `pnpm dev` 실행 시 모든 앱이 동시에 실행된다.

**AC2:** Next.js 15.5 Frontend가 localhost:3000에서 실행되며 Tailwind CSS와 Shadcn/ui가 설정된다.

**AC3:** NestJS 11.x Workflow Engine이 localhost:3001에서 실행되며 `/health` 엔드포인트가 200 응답을 반환한다.

**AC4:** Supabase 로컬 DB가 `supabase start`로 시작되며 6개 테이블이 생성되고 RLS가 적용된다.

**AC5:** GitHub Actions CI 파이프라인이 PR 생성 시 TypeScript, ESLint, Prettier, Jest를 자동 실행한다.

**AC6:** `main` 브랜치 푸시 시 Vercel과 Railway에 자동 배포된다.

**AC7:** 모든 환경 변수는 `.env.example` 파일에 문서화된다.

**AC8:** `packages/shared-types`에 공유 TypeScript 타입이 정의되고 Frontend/Backend에서 사용 가능하다.

**AC9:** DB 마이그레이션 파일이 `supabase/migrations/`에 버전 관리된다.

**AC10:** 로컬 개발 환경 설정 가이드가 README.md에 작성된다.

## Traceability Mapping

| AC   | Spec Section    | Component/API                       | Test Idea                              |
| ---- | --------------- | ----------------------------------- | -------------------------------------- |
| AC1  | Monorepo 구조   | `turbo.json`, `pnpm-workspace.yaml` | `pnpm dev` 실행 후 모든 포트 확인      |
| AC2  | Frontend 설정   | `apps/web/app/layout.tsx`           | localhost:3000 접속 테스트             |
| AC3  | Backend 설정    | `apps/workflow-engine/src/main.ts`  | `curl localhost:3001/health`           |
| AC4  | DB 스키마       | `supabase/migrations/*.sql`         | `supabase db push` 후 테이블 존재 확인 |
| AC5  | CI 파이프라인   | `.github/workflows/ci.yml`          | PR 생성 후 Actions 로그 확인           |
| AC6  | CD 파이프라인   | `.github/workflows/ci.yml`          | main 푸시 후 배포 URL 확인             |
| AC7  | 환경 변수       | `.env.example`                      | 모든 필수 변수 문서화 확인             |
| AC8  | 공유 타입       | `packages/shared-types/src/*.ts`    | 타입 import 테스트                     |
| AC9  | DB 마이그레이션 | `supabase/migrations/`              | Git 히스토리 확인                      |
| AC10 | 문서화          | `README.md`                         | 신규 개발자가 README만으로 설정 가능   |

## Risks, Assumptions, Open Questions

**Risks:**

- **R1:** Vercel/Railway 배포 실패 시 수동 개입 필요 → **완화:** 상세한 배포 가이드 문서 작성
- **R2:** Supabase 로컬 DB와 Cloud DB 스키마 불일치 → **완화:** 마이그레이션 파일 버전 관리
- **R3:** Monorepo 빌드 캐시 이슈 → **완화:** Turborepo 문서 참조, 필요시 캐시 초기화

**Assumptions:**

- **A1:** Node.js 20.x 이상이 설치되어 있음
- **A2:** pnpm이 글로벌 설치되어 있음 (`npm install -g pnpm`)
- **A3:** Supabase CLI가 설치되어 있음 (`brew install supabase/tap/supabase`)
- **A4:** GitHub 계정이 있고 저장소 접근 권한이 있음

**Open Questions:**

- **Q1:** Vercel Pro 플랜 사용 여부? → **답변 대기:** MVP는 Free 플랜 사용
- **Q2:** Railway 대신 Render 사용 고려? → **답변 대기:** Railway 우선, 필요시 마이그레이션
- **Q3:** Husky Git hooks 설정? → **답변 대기:** Story 1.1에서 설정

## Test Strategy Summary

**Unit Tests (Jest):**

- `packages/shared-types`: 타입 검증 테스트
- `apps/workflow-engine`: NestJS 컨트롤러/서비스 테스트
- 커버리지 목표: 핵심 로직 80% 이상

**Integration Tests:**

- Frontend ↔ Supabase 연결 테스트
- Backend ↔ Supabase 연결 테스트
- API 엔드포인트 E2E 테스트 (Supertest)

**E2E Tests (Playwright - Optional):**

- 로컬 환경에서 `pnpm dev` 실행 후 기본 페이지 로드 테스트
- MVP에서는 수동 테스트 위주, Post-MVP에서 자동화

**Manual Tests:**

- Story 1.1: `pnpm dev` 실행 후 모든 포트 확인
- Story 1.2: localhost:3000 UI 확인
- Story 1.3: localhost:3001/health 응답 확인
- Story 1.4: Supabase Studio에서 테이블 확인
- Story 1.5: GitHub Actions 로그 확인

**CI/CD Tests:**

- GitHub Actions에서 모든 테스트 자동 실행
- PR 머지 전 모든 체크 통과 필수
- 배포 전 smoke test (health check)

---

**이 Tech Spec은 Epic 1의 모든 Story 구현을 위한 권위 있는 기술 문서입니다. Story 작성 시 이 문서를 참조하여 일관성을 유지합니다.**
