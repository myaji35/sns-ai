# ContentFlow AI - Epic & Story Breakdown

**프로젝트:** ContentFlow AI
**생성일:** 2025-11-14
**작성자:** John (PM)
**버전:** 1.0 (Initial - PRD 기반)

---

## 문서 개요

이 문서는 PRD의 52개 기능 요구사항을 개발 가능한 에픽과 스토리로 분해한 **living document**입니다.

**BMad Method 워크플로우 체인:**

1. ✅ **현재:** PRD 기반 초기 에픽/스토리 분해 완료
2. ⏳ **다음:** UX Design 워크플로우 → 인터랙션 상세 추가
3. ⏳ **이후:** Architecture 워크플로우 → 기술 상세 추가
4. ⏳ **최종:** Phase 4 Implementation → 컨텍스트 조합하여 개발

**문서 업데이트 이력:**

- 2025-11-14: PRD 기반 초기 분해 (John)
- 2025-11-14: UX Design 완료 후 Epic 4-7 상세화 (BMad)
- (예정) Architecture 후: 기술 결정 추가

---

## FR 커버리지 매트릭스

**총 52개 FR → 7개 Epic → 68개 Story**

| Epic                               | FR 커버리지     | 스토리 수 |
| ---------------------------------- | --------------- | --------- |
| Epic 1: Foundation                 | 인프라 전제조건 | 5         |
| Epic 2: User Authentication        | FR1-FR5         | 8         |
| Epic 3: Content Planning Hub       | FR6-FR11        | 10        |
| Epic 4: AI Content Generation      | FR12-FR20       | 12        |
| Epic 5: Review & Approval          | FR21-FR28       | 9         |
| Epic 6: Multi-Channel Distribution | FR29-FR40       | 14        |
| Epic 7: Dashboard & Usage          | FR41-FR52       | 10        |

---

## Epic 1: 프로젝트 기반 구축 (Foundation)

**Epic 목표:**
모든 후속 개발을 가능하게 하는 기술적 기반을 마련합니다. Monorepo, Supabase, CI/CD, 배포 파이프라인을 구축하여 개발팀이 안정적으로 작업할 수 있는 환경을 제공합니다.

**비즈니스 가치:**
없음 (기술 인프라) - 하지만 모든 기능의 전제조건

**기술 스택:**

- Turborepo + pnpm (Monorepo)
- Next.js 15.5 (Frontend)
- NestJS 11.x (Workflow Engine)
- Supabase (Auth, DB, Storage)
- Vercel (Frontend 배포)
- Railway/Render (Backend 배포)

**우선순위:** P0 (필수 - 가장 먼저)

---

### Story 1.1: Monorepo 초기화 및 프로젝트 구조 설정

**As a** 개발자,
**I want** Turborepo 기반 Monorepo가 설정되어,
**So that** Frontend와 Backend를 효율적으로 관리할 수 있다.

**Acceptance Criteria:**

**Given** 빈 Git 저장소가 있을 때
**When** 프로젝트 초기화를 실행하면
**Then** 다음 구조가 생성된다:

```
contentflow-ai/
├── apps/
│   ├── web/                    # Next.js Frontend
│   └── workflow-engine/        # NestJS Backend
├── packages/
│   ├── shared-types/          # 공유 TypeScript 타입
│   └── database/              # Supabase 스키마
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

**And** `pnpm dev` 실행 시 모든 앱이 동시에 실행된다
**And** TypeScript 컴파일 오류가 없다
**And** ESLint + Prettier 설정이 적용된다

**Prerequisites:** 없음 (첫 스토리)

**Technical Notes:**

- `npx create-turbo@latest` 사용
- pnpm workspace 설정
- 공유 tsconfig.json 설정
- Git hooks (Husky) 설정 고려

**Estimated Effort:** 2-4시간

---

### Story 1.2: Next.js 15 Frontend 앱 초기화

**As a** 개발자,
**I want** Next.js 15 App Router 기반 Frontend가 설정되어,
**So that** UI 개발을 시작할 수 있다.

**Acceptance Criteria:**

**Given** Monorepo 구조가 설정되어 있을 때
**When** `apps/web` 디렉토리를 설정하면
**Then** Next.js 15.5가 App Router 모드로 설정된다

**And** Tailwind CSS 3.x가 설정된다
**And** Shadcn/ui 초기화 완료 (`npx shadcn-ui@latest init`)
**And** `app/` 디렉토리 구조가 생성된다:

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── (dashboard)/
│   └── dashboard/
└── layout.tsx
```

**And** localhost:3000 접속 시 "ContentFlow AI" 메인 페이지가 표시된다
**And** 반응형 디자인 확인 (모바일, 태블릿, 데스크톱)

**Prerequisites:** Story 1.1 완료

**Technical Notes:**

- Next.js 15.5 사용 (`create-next-app@latest`)
- TypeScript 5.x 설정
- Tailwind CSS + Shadcn/ui 통합
- Font: Pretendard (한글 최적화)
- 다크 모드는 MVP 제외

**Estimated Effort:** 3-4시간

---

### Story 1.3: NestJS Workflow Engine 초기화

**As a** 개발자,
**I want** NestJS 기반 Workflow Engine이 설정되어,
**So that** AI 작업 큐와 배포 로직을 구현할 수 있다.

**Acceptance Criteria:**

**Given** Monorepo 구조가 설정되어 있을 때
**When** `apps/workflow-engine` 디렉토리를 설정하면
**Then** NestJS 11.x 앱이 생성된다

**And** 다음 모듈 구조가 생성된다:

```
src/
├── modules/
│   ├── content/
│   ├── ai/
│   ├── distribution/
│   ├── sheets/
│   └── queue/
├── config/
├── common/
├── app.module.ts
└── main.ts
```

**And** localhost:3001 접속 시 "Workflow Engine Running" 응답
**And** Health check 엔드포인트 `/health` 작동
**And** Swagger API 문서 `/api` 생성

**Prerequisites:** Story 1.1 완료

**Technical Notes:**

- `nest new apps/workflow-engine`
- @nestjs/config, @nestjs/common 설치
- CORS 설정 (Frontend 허용)
- Environment 변수 검증 (class-validator)

**Estimated Effort:** 2-3시간

---

### Story 1.4: Supabase 프로젝트 생성 및 DB 스키마 마이그레이션

**As a** 개발자,
**I want** Supabase 프로젝트와 초기 DB 스키마가 설정되어,
**So that** 사용자 데이터를 저장할 수 있다.

**Acceptance Criteria:**

**Given** Supabase CLI가 설치되어 있을 때
**When** Supabase 프로젝트를 초기화하면
**Then** `supabase/` 디렉토리가 생성된다

**And** 다음 테이블이 생성된다:

- `public.profiles` (사용자 프로필)
- `public.connected_accounts` (SNS 연동 계정)
- `public.content_calendar` (콘텐츠 캘린더)
- `public.contents` (생성된 콘텐츠)
- `public.job_logs` (작업 로그)
- `public.usage_metrics` (사용량 추적)

**And** Row Level Security (RLS) 정책이 모든 테이블에 적용된다
**And** `supabase start` 실행 시 로컬 DB가 시작된다 (localhost:54323)
**And** Migration 파일이 `supabase/migrations/` 에 생성된다

**Prerequisites:** Story 1.1 완료

**Technical Notes:**

- Architecture 문서의 DB 스키마 참조
- RLS 정책: `auth.uid() = user_id`
- 인덱스 설정 (성능 최적화)
- `supabase db push` 로 마이그레이션 실행

**Estimated Effort:** 4-6시간

---

### Story 1.5: CI/CD 파이프라인 설정 (GitHub Actions)

**As a** 개발팀,
**I want** 자동화된 CI/CD 파이프라인이 설정되어,
**So that** 코드 푸시 시 자동으로 테스트하고 배포할 수 있다.

**Acceptance Criteria:**

**Given** GitHub 저장소가 설정되어 있을 때
**When** `.github/workflows/ci.yml` 파일을 생성하면
**Then** PR 생성 시 다음 작업이 자동 실행된다:

- TypeScript 컴파일 체크
- ESLint 검사
- Prettier 포맷 체크
- Unit 테스트 (Jest)

**And** `main` 브랜치 푸시 시:

- Frontend가 Vercel에 자동 배포된다
- Backend가 Railway에 자동 배포된다

**And** 배포 실패 시 Slack/Email 알림 발송 (선택사항)
**And** 모든 체크가 통과해야 PR 머지 가능

**Prerequisites:** Story 1.1, 1.2, 1.3 완료

**Technical Notes:**

- GitHub Actions workflow 파일 작성
- Vercel CLI 통합 또는 Vercel GitHub App 사용
- Railway CLI 통합
- 시크릿 관리 (VERCEL_TOKEN, RAILWAY_TOKEN 등)
- 배포 환경 변수 설정

**Estimated Effort:** 3-5시간

---

## Epic 2: 사용자 인증 및 계정 관리 (User Authentication)

**Epic 목표:**
사용자가 안전하게 가입하고 로그인하며, 자신의 브랜드 정보(업종, 톤앤매너)를 설정할 수 있습니다.

**비즈니스 가치:**
사용자가 서비스를 사용하기 위한 필수 진입점. 브랜드 정보는 AI 콘텐츠 품질에 직접 영향.

**FR 커버리지:** FR1, FR2, FR3, FR4, FR5

**우선순위:** P0 (필수 - Epic 1 다음)

---

### Story 2.1: Supabase Auth 통합 (이메일/비밀번호)

**As a** 신규 사용자,
**I want** 이메일과 비밀번호로 계정을 생성할 수 있어,
**So that** ContentFlow AI를 사용할 수 있다.

**Acceptance Criteria:**

**Given** 회원가입 페이지(`/signup`)에 접속했을 때
**When** 유효한 이메일과 비밀번호를 입력하고 "가입하기" 버튼을 클릭하면
**Then** Supabase Auth에 계정이 생성된다

**And** 비밀번호 요구사항이 충족되어야 한다:

- 최소 8자
- 대문자 1개 이상
- 숫자 1개 이상
- 특수문자 1개 이상

**And** 이메일 형식이 RFC 5322 표준을 따른다
**And** 가입 완료 시 자동으로 로그인되어 `/dashboard`로 리다이렉트
**And** 이메일 인증 메일이 발송된다 (Supabase 기본 기능)
**And** 이미 존재하는 이메일로 가입 시도 시 "이미 가입된 이메일입니다" 오류 표시

**Prerequisites:** Story 1.2, 1.4 완료

**Technical Notes:**

- Supabase JS `signUp()` 메서드 사용
- Frontend 폼 검증: React Hook Form + Zod
- 비밀번호 강도 표시기 (약함/보통/강함)
- reCAPTCHA v3 통합 (봇 방지) - 선택사항
- 모바일 반응형 (44x44px 터치 타겟)

**Estimated Effort:** 4-6시간

---

### Story 2.2: Google 소셜 로그인 구현

**As a** 신규 사용자,
**I want** Google 계정으로 빠르게 로그인할 수 있어,
**So that** 비밀번호를 기억할 필요가 없다.

**Acceptance Criteria:**

**Given** 로그인 페이지(`/login`)에 접속했을 때
**When** "Google로 계속하기" 버튼을 클릭하면
**Then** Google OAuth 동의 화면으로 리다이렉트된다

**And** Google 계정 선택 및 승인 후 `/dashboard`로 리다이렉트
**And** 최초 로그인 시 `public.profiles` 테이블에 사용자 레코드 자동 생성
**And** 이후 로그인 시 기존 프로필 사용
**And** 로그인 실패 시 "로그인에 실패했습니다" 오류 표시

**Prerequisites:** Story 2.1 완료

**Technical Notes:**

- Supabase Auth Google Provider 설정
- Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
- Redirect URL 설정: `{SUPABASE_URL}/auth/v1/callback`
- `supabase.auth.signInWithOAuth({ provider: 'google' })`
- onAuthStateChange 리스너로 세션 관리

**Estimated Effort:** 3-4시간

---

### Story 2.3: 로그인 페이지 및 세션 관리

**As a** 기존 사용자,
**I want** 이메일/비밀번호로 로그인할 수 있어,
**So that** 내 계정에 접근할 수 있다.

**Acceptance Criteria:**

**Given** 로그인 페이지(`/login`)에 접속했을 때
**When** 올바른 이메일과 비밀번호를 입력하고 "로그인" 버튼을 클릭하면
**Then** 로그인에 성공하고 `/dashboard`로 리다이렉트

**And** 잘못된 비밀번호 입력 시 "이메일 또는 비밀번호가 올바르지 않습니다" 오류
**And** "로그인 상태 유지" 체크박스 제공 (선택사항)
**And** JWT 토큰이 localStorage/cookie에 안전하게 저장
**And** 토큰 만료 시 자동 갱신 (Refresh Token)
**And** 로그인하지 않은 사용자가 `/dashboard` 접근 시 `/login`으로 리다이렉트

**Prerequisites:** Story 2.1 완료

**Technical Notes:**

- Supabase `signInWithPassword()` 사용
- Next.js Middleware로 보호된 라우트 설정
- `getSession()` 으로 세션 확인
- TanStack Query로 사용자 상태 캐싱
- 로그아웃: `signOut()` 메서드

**Estimated Effort:** 3-4시간

---

### Story 2.4: 비밀번호 재설정 (이메일 인증)

**As a** 사용자,
**I want** 비밀번호를 잊어버렸을 때 이메일로 재설정할 수 있어,
**So that** 계정에 다시 접근할 수 있다.

**Acceptance Criteria:**

**Given** 로그인 페이지에서 "비밀번호를 잊으셨나요?" 링크를 클릭했을 때
**When** 재설정 페이지에서 이메일을 입력하고 "재설정 링크 전송" 버튼을 클릭하면
**Then** 이메일로 비밀번호 재설정 링크가 발송된다

**And** 링크는 1시간 동안 유효하다
**And** 링크 클릭 시 새 비밀번호 입력 페이지로 이동
**And** 새 비밀번호 입력 및 확인 후 비밀번호가 변경된다
**And** 변경 완료 시 "비밀번호가 변경되었습니다" 메시지 표시 후 `/login`으로 리다이렉트
**And** 존재하지 않는 이메일 입력 시에도 보안상 동일한 메시지 표시

**Prerequisites:** Story 2.1 완료

**Technical Notes:**

- Supabase `resetPasswordForEmail()` 사용
- 재설정 URL: `{SITE_URL}/reset-password?token=xxx`
- `updateUser({ password: newPassword })` 로 비밀번호 변경
- 보안: 타이밍 공격 방지 (동일한 응답 시간)

**Estimated Effort:** 3-4시간

---

### Story 2.5: 프로필 등록 (온보딩)

**As a** 신규 사용자,
**I want** 최초 로그인 후 브랜드 정보를 입력할 수 있어,
**So that** AI가 내 브랜드에 맞는 콘텐츠를 생성할 수 있다.

**Acceptance Criteria:**

**Given** 최초 가입 후 로그인했을 때
**When** 프로필이 비어있으면 온보딩 페이지(`/onboarding`)로 리다이렉트
**Then** 다음 정보를 입력하는 3단계 폼이 표시된다:

**Step 1: 기본 정보**

- 브랜드/회사명 (필수, 최대 50자)
- 업종 선택 (드롭다운: 카페, 레스토랑, 뷰티, 패션, 제조업, 서비스업 등 20개 옵션)

**Step 2: 브랜드 보이스**

- 브랜드 설명 (선택, 최대 200자)
- 톤앤매너 선택 (체크박스: 친근한, 전문적인, 유머러스한, 진지한 등)

**Step 3: 완료**

- "설정 완료" 버튼 클릭 시 `public.profiles` 업데이트
- `/dashboard`로 리다이렉트

**And** "나중에 설정하기" 버튼으로 건너뛰기 가능 (기본값 사용)
**And** 프로필 저장 완료 시 "환영합니다! 첫 콘텐츠를 만들어보세요" 환영 메시지

**Prerequisites:** Story 2.3 완료

**Technical Notes:**

- React Hook Form 멀티스텝 폼
- Zustand로 폼 상태 관리
- Supabase `profiles` 테이블 업데이트
- 프로그레스 바 표시 (1/3, 2/3, 3/3)
- 모바일 최적화

**Estimated Effort:** 5-6시간

---

### Story 2.6: 프로필 수정 페이지

**As a** 사용자,
**I want** 언제든지 프로필 정보를 수정할 수 있어,
**So that** 브랜드 변경사항을 반영할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드에서 "설정" 메뉴를 클릭했을 때
**When** 설정 페이지(`/settings/profile`)에 접속하면
**Then** 현재 프로필 정보가 폼에 미리 채워져 있다

**And** 모든 필드를 수정할 수 있다:

- 이름 (full_name)
- 브랜드/회사명 (company_name)
- 업종 (industry)
- 브랜드 설명
- 톤앤매너

**And** "저장" 버튼 클릭 시 변경사항이 DB에 반영된다
**And** 저장 성공 시 "프로필이 업데이트되었습니다" 토스트 알림
**And** "취소" 버튼 클릭 시 변경사항 취소
**And** 실시간 검증 (예: 브랜드명 1자 이상 필수)

**Prerequisites:** Story 2.5 완료

**Technical Notes:**

- Supabase `from('profiles').update()` 사용
- Optimistic UI 업데이트 (TanStack Query)
- Shadcn/ui Toast 컴포넌트
- 변경 감지 (dirty fields) 및 "변경사항 저장하지 않고 나가시겠습니까?" 경고

**Estimated Effort:** 3-4시간

---

### Story 2.7: 계정 삭제 기능

**As a** 사용자,
**I want** 더 이상 사용하지 않을 때 계정을 삭제할 수 있어,
**So that** 내 데이터가 시스템에서 완전히 제거된다.

**Acceptance Criteria:**

**Given** 설정 페이지에서 "계정 관리" 섹션을 찾았을 때
**When** "계정 삭제" 버튼을 클릭하면
**Then** 확인 모달이 표시된다:

- "정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- 비밀번호 재입력 필드 (본인 확인)
- "삭제" / "취소" 버튼

**And** 올바른 비밀번호 입력 후 "삭제" 클릭 시:

- Supabase Auth에서 사용자 삭제
- `ON DELETE CASCADE`로 연결된 모든 데이터 자동 삭제:
  - profiles
  - connected_accounts
  - content_calendar
  - contents
  - job_logs
  - usage_metrics

**And** 삭제 완료 후 로그아웃되어 `/` 홈페이지로 리다이렉트
**And** "계정이 삭제되었습니다" 메시지 표시

**Prerequisites:** Story 2.6 완료

**Technical Notes:**

- Supabase Admin API `deleteUser()` 사용 (서버 사이드)
- 보안: Next.js API Route로 처리 (클라이언트 직접 삭제 금지)
- DB 외래 키: `ON DELETE CASCADE` 설정 확인
- 30일 대기 기간 없이 즉시 삭제 (MVP)

**Estimated Effort:** 2-3시간

---

### Story 2.8: 로그아웃 기능

**As a** 사용자,
**I want** 언제든지 로그아웃할 수 있어,
**So that** 보안을 유지할 수 있다.

**Acceptance Criteria:**

**Given** 로그인된 상태에서 대시보드에 있을 때
**When** 우측 상단 프로필 드롭다운에서 "로그아웃" 버튼을 클릭하면
**Then** 로그아웃되어 `/` 홈페이지로 리다이렉트

**And** 세션 토큰이 완전히 제거된다 (localStorage, cookie)
**And** 로그아웃 후 보호된 페이지(`/dashboard`) 접근 시 `/login`으로 리다이렉트
**And** 로그아웃 확인 없이 즉시 실행 (빠른 UX)

**Prerequisites:** Story 2.3 완료

**Technical Notes:**

- Supabase `signOut()` 메서드
- TanStack Query 캐시 클리어
- Zustand 상태 초기화
- 간단한 구현 (< 1시간)

**Estimated Effort:** 1-2시간

---

## Epic 3: 콘텐츠 기획 허브 (Content Planning Hub)

**Epic 목표:**
사용자가 익숙한 Google Sheets를 사용하여 콘텐츠를 기획하고, AI가 하위 주제를 자동으로 생성하여 콘텐츠 캘린더를 관리합니다.

**비즈니스 가치:**
사용자에게 친숙한 UX 제공, AI가 아이디어 확장을 도와 "콘텐츠 고갈" 문제 해결

**FR 커버리지:** FR6, FR7, FR8, FR9, FR10, FR11

**우선순위:** P0 (필수 - Epic 2 다음)

---

### Story 3.1: Google Sheets API OAuth 연동

**As a** 사용자,
**I want** Google Sheets 계정을 연동할 수 있어,
**So that** Sheets에서 콘텐츠를 기획할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드에서 "Google Sheets 연동" 버튼을 클릭했을 때
**When** Google OAuth 동의 화면에서 Sheets 권한을 승인하면
**Then** `connected_accounts` 테이블에 Google 계정 정보가 저장된다

**And** 다음 권한이 요청된다:

- `https://www.googleapis.com/auth/spreadsheets` (Sheets 읽기/쓰기)
- `https://www.googleapis.com/auth/drive.file` (생성한 파일만 접근)

**And** Access Token과 Refresh Token이 Supabase Vault에 암호화 저장
**And** 토큰 만료 시 자동 갱신 (Refresh Token 사용)
**And** 연동 성공 시 "Google Sheets가 연동되었습니다" 토스트 알림
**And** 연동 실패 시 재시도 옵션 제공

**Prerequisites:** Story 2.3 완료

**Technical Notes:**

- Google Cloud Console에서 OAuth 2.0 클라이언트 생성
- Scope: `spreadsheets`, `drive.file`
- Backend (NestJS)에서 OAuth 플로우 처리
- googleapis npm 패키지 사용
- Supabase Vault 또는 pgcrypto로 토큰 암호화

**Estimated Effort:** 5-6시간

---

### Story 3.2: 콘텐츠 캘린더 Sheets 생성

**As a** 사용자,
**I want** "새 콘텐츠 캘린더 만들기" 버튼을 클릭하여 Google Sheets를 자동 생성할 수 있어,
**So that** 수동으로 Sheets를 만들 필요가 없다.

**Acceptance Criteria:**

**Given** Google Sheets가 연동된 상태에서
**When** "새 캘린더 만들기" 버튼을 클릭하면
**Then** 다음 구조의 Google Sheets가 자동 생성된다:

**Sheet 구조:**
| 카테고리 | 메인 주제 | 하위 주제 1 | 하위 주제 2 | ... | 하위 주제 10 | 발행 빈도 | 상태 |
|---------|----------|------------|------------|-----|-------------|---------|------|

**And** Sheets 이름: "ContentFlow - {브랜드명} - {날짜}"
**And** 생성된 Sheets URL이 `content_calendar` 테이블에 저장
**And** 대시보드에 "Sheets에서 열기" 버튼이 활성화
**And** 생성 완료 시 "콘텐츠 캘린더가 생성되었습니다" 알림

**Prerequisites:** Story 3.1 완료

**Technical Notes:**

- Google Sheets API `spreadsheets.create()` 사용
- 템플릿 헤더 자동 삽입
- 공유 권한: 사용자 이메일에만 편집 권한 부여
- Sheets ID를 DB에 저장 (`google_sheet_id` 컬럼)

**Estimated Effort:** 4-5시간

---

### Story 3.3: Sheets에서 메인 주제 감지 및 동기화

**As a** 사용자,
**I want** Sheets에 메인 주제를 입력하면 시스템이 자동으로 감지해,
**So that** 수동으로 동기화 버튼을 누르지 않아도 된다.

**Acceptance Criteria:**

**Given** 콘텐츠 캘린더 Sheets가 생성되어 있을 때
**When** 사용자가 Sheets에 새로운 메인 주제를 입력하면
**Then** 5분 이내에 시스템이 변경사항을 감지한다 (폴링 또는 Webhook)

**And** 감지된 주제가 `content_calendar` 테이블에 저장:

- category
- main_topic
- publish_frequency (설정된 경우)
- status: 'pending'

**And** 대시보드의 "검토 대기" 섹션에 새 주제가 표시
**And** "하위 주제 생성" 버튼이 활성화

**Prerequisites:** Story 3.2 완료

**Technical Notes:**

- 폴링 방식: Cron 작업 (5분마다 Sheets API 호출)
- 또는 Google Apps Script Webhook (실시간, 복잡도 높음)
- MVP는 폴링 방식 권장
- BullMQ Cron Queue 사용: `@Cron('*/5 * * * *')`
- 변경 감지: 마지막 수정 시간 비교

**Estimated Effort:** 4-5시간

---

### Story 3.4: AI 하위 주제 10개 자동 생성

**As a** 사용자,
**I want** 메인 주제를 입력하면 AI가 하위 주제 10개를 자동 생성해,
**So that** 콘텐츠 아이디어를 쉽게 확장할 수 있다.

**Acceptance Criteria:**

**Given** 콘텐츠 캘린더에 메인 주제가 입력되어 있을 때
**When** "하위 주제 생성" 버튼을 클릭하면
**Then** AI(Gemini 2.0 Flash)가 하위 주제 10개를 생성한다

**And** 생성 진행 상황이 프로그레스 바로 표시:

- "AI가 하위 주제를 생성하고 있습니다..."
- 예상 시간: 20-30초

**And** 생성 완료 시 Sheets의 "하위 주제 1~10" 컬럼에 자동으로 작성
**And** `content_calendar.subtopics` JSONB 컬럼에 배열로 저장
**And** 생성 실패 시 재시도 옵션 제공
**And** 생성된 하위 주제 품질:

- 메인 주제와 관련성 높음
- 구체적이고 실용적
- 중복 없음
- 한국어로 자연스럽게 표현

**Prerequisites:** Story 3.3 완료

**Technical Notes:**

- LLM Provider: Gemini 2.0 Flash (비용 효율)
- Prompt 엔지니어링:

  ```
  메인 주제: {topic}
  업종: {industry}

  위 주제에 대해 {industry} 고객에게 유용한 블로그 하위 주제 10개를 생성하세요.
  각 주제는 구체적이고 실용적이어야 합니다.
  ```

- BullMQ 작업 큐로 비동기 처리
- Google Sheets API `spreadsheets.values.update()` 로 결과 작성

**Estimated Effort:** 6-8시간

---

### Story 3.5: 콘텐츠 발행 빈도 설정

**As a** 사용자,
**I want** 각 주제별로 발행 빈도를 설정할 수 있어,
**So that** 자동으로 정기적으로 콘텐츠가 생성된다.

**Acceptance Criteria:**

**Given** 콘텐츠 캘린더에 주제가 등록되어 있을 때
**When** "발행 빈도" 컬럼에 값을 입력하면 (예: "주간", "월간")
**Then** 해당 값이 `content_calendar.publish_frequency`에 저장된다

**And** 지원 빈도 옵션:

- "주간" (weekly): 매주 월요일 오전 9시 자동 생성
- "월간" (monthly): 매월 1일 오전 9시 자동 생성
- "수동" (manual): 자동 생성 안 함

**And** 빈도 설정 변경 시 즉시 반영
**And** Cron 스케줄러가 설정된 빈도에 따라 자동 콘텐츠 생성 트리거

**Prerequisites:** Story 3.4 완료

**Technical Notes:**

- NestJS Cron Scheduler 사용
- BullMQ Repeat Jobs (recurring jobs)
- `@Cron('0 9 * * 1')` - 매주 월요일 9시
- `@Cron('0 9 1 * *')` - 매월 1일 9시
- 타임존: Asia/Seoul (KST)

**Estimated Effort:** 3-4시간

---

### Story 3.6: 대시보드에서 콘텐츠 캘린더 시각화

**As a** 사용자,
**I want** 대시보드에서 월간 콘텐츠 계획을 캘린더 뷰로 볼 수 있어,
**So that** 언제 무엇이 발행되는지 한눈에 파악할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드의 "콘텐츠 캘린더" 섹션에 접속했을 때
**When** 캘린더를 확인하면
**Then** 월간 캘린더 뷰가 표시된다

**And** 각 날짜에 예정된 콘텐츠가 점(●)으로 표시:

- 초록색: 생성 완료
- 노란색: 검토 대기
- 파란색: 예정됨

**And** 날짜 클릭 시 해당 날짜의 콘텐츠 목록 표시
**And** 이전/다음 달 이동 버튼
**And** "오늘" 버튼으로 현재 달로 빠르게 이동
**And** 모바일에서도 스크롤 가능한 캘린더 뷰

**Prerequisites:** Story 3.5 완료

**Technical Notes:**

- React Big Calendar 또는 FullCalendar 라이브러리
- Supabase에서 `content_calendar` 및 `contents` 조인 쿼리
- 날짜 필터링: `published_at` 또는 예정일
- Tailwind CSS로 스타일링
- 반응형 디자인 (모바일에서는 리스트 뷰 옵션)

**Estimated Effort:** 6-8시간

---

### Story 3.7: 특정 주제 수동 콘텐츠 생성 트리거

**As a** 사용자,
**I want** 자동 스케줄을 기다리지 않고 특정 주제의 콘텐츠를 즉시 생성할 수 있어,
**So that** 긴급하게 필요한 콘텐츠를 빠르게 만들 수 있다.

**Acceptance Criteria:**

**Given** 콘텐츠 캘린더 목록에서 특정 주제를 선택했을 때
**When** "지금 생성" 버튼을 클릭하면
**Then** 즉시 AI 콘텐츠 생성 작업이 BullMQ 큐에 추가된다

**And** 생성 진행 상황이 실시간으로 표시:

- "콘텐츠를 생성하고 있습니다... (30-60초 소요)"

**And** 생성 완료 시:

- 검토 페이지로 이동 또는
- "새 콘텐츠가 검토 대기 중입니다" 알림

**And** 동시에 여러 주제를 선택하여 일괄 생성 가능 (체크박스)
**And** 생성 중 오류 발생 시 명확한 오류 메시지 + 재시도 버튼

**Prerequisites:** Story 3.6 완료

**Technical Notes:**

- Frontend에서 API 호출: `POST /api/content/generate`
- Backend에서 BullMQ 작업 추가
- 작업 ID 반환하여 진행 상황 폴링
- Supabase Realtime으로 상태 변경 알림 (선택사항)

**Estimated Effort:** 4-5시간

---

### Story 3.8: 연동된 Google Sheets 계정 관리

**As a** 사용자,
**I want** 연동된 Google 계정을 확인하고 해제할 수 있어,
**So that** 계정 변경 또는 연동 해제가 필요할 때 대응할 수 있다.

**Acceptance Criteria:**

**Given** 설정 페이지의 "연동 계정" 섹션에 접속했을 때
**When** 연동된 Google Sheets 계정을 확인하면
**Then** 다음 정보가 표시된다:

- Google 이메일 주소
- 연동 일시
- 상태: "활성" 또는 "비활성"

**And** "연동 해제" 버튼 클릭 시 확인 모달 표시
**And** 확인 후 `connected_accounts` 테이블에서 해당 계정 삭제
**And** 연동 해제 시 관련 캘린더 데이터는 유지 (삭제 안 함)
**And** 재연동 버튼으로 다시 OAuth 플로우 시작 가능

**Prerequisites:** Story 3.1 완료

**Technical Notes:**

- `connected_accounts` 테이블 조회 (`platform = 'google_sheets'`)
- Supabase RLS로 본인 계정만 조회
- 소프트 삭제 권장 (`is_active = false`) 또는 완전 삭제
- 토큰 만료 확인 및 갱신 상태 표시

**Estimated Effort:** 2-3시간

---

### Story 3.9: Sheets 동기화 상태 표시

**As a** 사용자,
**I want** Google Sheets 동기화 상태를 실시간으로 확인할 수 있어,
**So that** 변경사항이 반영되었는지 알 수 있다.

**Acceptance Criteria:**

**Given** 대시보드에 있을 때
**When** Google Sheets 동기화가 진행 중이면
**Then** "동기화 중..." 아이콘이 표시된다

**And** 마지막 동기화 시간이 표시: "5분 전 동기화됨"
**And** 동기화 실패 시 경고 아이콘 + "동기화 실패. 재시도하기" 버튼
**And** 수동 동기화 버튼 제공 ("지금 동기화")
**And** 동기화 성공 시 녹색 체크 아이콘

**Prerequisites:** Story 3.3 완료

**Technical Notes:**

- `job_logs` 테이블에 동기화 작업 기록
- Frontend에서 최근 동기화 작업 상태 조회
- TanStack Query로 주기적 폴링 (30초마다)
- 아이콘: Lucide React 아이콘 사용

**Estimated Effort:** 2-3시간

---

### Story 3.10: 콘텐츠 캘린더 삭제 기능

**As a** 사용자,
**I want** 더 이상 사용하지 않는 콘텐츠 캘린더를 삭제할 수 있어,
**So that** 불필요한 데이터를 정리할 수 있다.

**Acceptance Criteria:**

**Given** 콘텐츠 캘린더 목록에서 특정 캘린더를 선택했을 때
**When** "삭제" 버튼을 클릭하면
**Then** 확인 모달이 표시: "이 캘린더와 관련된 모든 콘텐츠가 삭제됩니다. 계속하시겠습니까?"

**And** 확인 후 `content_calendar` 레코드 삭제
**And** `ON DELETE CASCADE`로 연결된 `contents` 레코드도 삭제
**And** Google Sheets는 삭제되지 않음 (사용자가 직접 관리)
**And** 삭제 완료 시 "캘린더가 삭제되었습니다" 토스트 알림

**Prerequisites:** Story 3.2 완료

**Technical Notes:**

- Supabase `from('content_calendar').delete()` 사용
- 외래 키 `ON DELETE CASCADE` 확인
- 소프트 삭제 대신 하드 삭제 (MVP)
- 삭제 전 30일 보관 기능은 Post-MVP

**Estimated Effort:** 2시간

---

---

## Epic 4: AI 콘텐츠 생성 엔진 (AI Content Generation Engine)

**Epic 목표:**
멀티 LLM 오케스트레이션을 통해 "내실있고 자연스러운" 고품질 콘텐츠를 자동으로 생성합니다. GPT-4 Turbo, Claude 3.5 Sonnet, Gemini 2.0 Flash를 동시에 호출하여 최고 품질의 결과만 선택하는 것이 핵심입니다.

**비즈니스 가치:**
제품의 핵심 차별화 요소. "AI 콘텐츠가 기대 이상"이라는 평가를 받아야 MVP 성공.

**FR 커버리지:** FR12-FR20

**우선순위:** P0 (필수 - Epic 3 다음)

---

### Story 4.1: 멀티 LLM 프로바이더 통합

**As a** 시스템,
**I want** 3개 LLM API(OpenAI, Anthropic, Google)를 통합하여,
**So that** 동시에 호출하고 결과를 비교할 수 있다.

**Acceptance Criteria:**

**Given** NestJS Workflow Engine에 AI 모듈이 설정되어 있을 때
**When** 각 LLM 프로바이더 클래스를 구현하면
**Then** 다음 3개 프로바이더가 생성된다:

- `OpenAIProvider` (GPT-4 Turbo)
- `AnthropicProvider` (Claude 3.5 Sonnet)
- `GoogleProvider` (Gemini 2.0 Flash)

**And** 각 프로바이더는 공통 인터페이스를 구현:

```typescript
interface LLMProvider {
  generateContent(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;
  getModelName(): string;
  estimateCost(tokens: number): number;
}
```

**And** 환경 변수로 API 키 관리:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`

**And** API 키 검증 헬스체크 엔드포인트: `GET /api/ai/health`
**And** 각 프로바이더별 Rate Limiting 설정
**And** 요청/응답 로깅 (디버깅용)

**Prerequisites:** Story 1.3 (NestJS 초기화) 완료

**Technical Notes:**

- OpenAI SDK: `openai` npm 패키지
- Anthropic SDK: `@anthropic-ai/sdk`
- Google SDK: `@google/generative-ai`
- NestJS ConfigModule로 환경 변수 주입
- 각 프로바이더는 Injectable 클래스로 구현
- 에러 핸들링: API 호출 실패 시 재시도 로직

**Estimated Effort:** 6-8시간

---

### Story 4.2: BullMQ 작업 큐 설정 (콘텐츠 생성)

**As a** 개발자,
**I want** BullMQ로 콘텐츠 생성 작업을 비동기 처리할 수 있어,
**So that** 사용자가 대기하지 않고 백그라운드에서 처리된다.

**Acceptance Criteria:**

**Given** Redis가 설치되어 있을 때
**When** BullMQ를 NestJS에 통합하면
**Then** `content-generation` 큐가 생성된다

**And** 다음 작업 타입이 지원된다:

- `generate-subtopics` (하위 주제 10개 생성)
- `generate-content` (블로그 포스트 생성)
- `regenerate-content` (거절 후 재생성)

**And** 작업 상태가 추적된다:

- `waiting` → `active` → `completed` | `failed`

**And** Bull Board UI가 설정되어 작업 모니터링 가능:

- URL: `http://localhost:3001/admin/queues`
- 인증: Basic Auth (관리자만 접근)

**And** 작업 진행 상황을 `job.updateProgress()`로 업데이트
**And** 실패한 작업은 최대 3회 자동 재시도 (지수 백오프)

**Prerequisites:** Story 1.3 완료

**Technical Notes:**

- `@nestjs/bull` 패키지 사용
- Redis 연결: `localhost:6379` (로컬), Railway Redis (프로덕션)
- Worker Concurrency: 5 (동시 5개 작업 처리)
- Job 보관 기간: 완료 24시간, 실패 7일
- Bull Board: `@bull-board/express` + `@bull-board/api`

**Estimated Effort:** 4-5시간

---

### Story 4.3: AI 하위 주제 생성 프롬프트 엔지니어링

**As a** 시스템,
**I want** 효과적인 프롬프트로 하위 주제 10개를 생성하여,
**So that** 사용자가 만족할 만한 구체적이고 실용적인 주제를 제공한다.

**Acceptance Criteria:**

**Given** 메인 주제와 사용자 프로필(업종, 톤앤매너)이 있을 때
**When** Gemini 2.0 Flash에 프롬프트를 전송하면
**Then** 10개의 하위 주제가 JSON 형식으로 반환된다

**And** 프롬프트 구조:

```
[시스템 역할]
당신은 한국 {업종} 전문 콘텐츠 기획자입니다.

[맥락]
사용자: {브랜드명}
업종: {업종}
톤앤매너: {톤앤매너}

[작업]
메인 주제: "{main_topic}"
위 주제에 대해 블로그 포스트로 작성할 수 있는 하위 주제 10개를 생성하세요.

[요구사항]
- 각 주제는 구체적이고 실용적이어야 함
- {업종} 고객에게 유용한 정보를 제공
- 중복 없이 다양한 각도에서 접근
- 한국어로 자연스럽게 표현
- 각 주제는 20자 이내

[출력 형식]
JSON 배열: ["주제1", "주제2", ...]
```

**And** 생성된 하위 주제 품질 검증:

- 10개 정확히 생성
- 중복 없음
- 한국어 자연스러움
- 메인 주제와 관련성 80% 이상

**And** 생성 시간: 평균 20-30초 이내
**And** 실패 시 재시도 (최대 3회)

**Prerequisites:** Story 4.1, 4.2 완료

**Technical Notes:**

- Gemini 2.0 Flash 사용 (비용 효율성)
- Temperature: 0.8 (창의성과 일관성 균형)
- Max Tokens: 500
- JSON 모드 활성화: `response_mime_type: 'application/json'`
- 프롬프트 템플릿: Handlebars 또는 템플릿 리터럴

**Estimated Effort:** 5-6시간

---

### Story 4.4: 멀티 LLM 동시 호출 오케스트레이터

**As a** 시스템,
**I want** 3개 LLM을 동시에 호출하여,
**So that** 생성 시간을 단축하고 여러 결과를 비교할 수 있다.

**Acceptance Criteria:**

**Given** 콘텐츠 생성 요청이 들어왔을 때
**When** `ContentOrchestrator.generate()`를 호출하면
**Then** 3개 LLM에 동시에 요청을 전송한다 (`Promise.all()`)

**And** 각 LLM 응답을 기다리되, 타임아웃 설정:

- GPT-4 Turbo: 60초
- Claude 3.5 Sonnet: 60초
- Gemini 2.0 Flash: 45초

**And** 응답 데이터 구조:

```typescript
interface LLMResponse {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  content: string;
  tokensUsed: number;
  latency: number; // ms
  quality: number; // 품질 점수 (0-100)
  error?: string;
}
```

**And** 최소 1개 LLM이 성공하면 작업 성공으로 처리
**And** 모든 LLM 실패 시 작업 실패로 표시하고 재시도
**And** 작업 진행 상황 업데이트:

- 0%: 작업 시작
- 33%: 첫 번째 LLM 응답
- 66%: 두 번째 LLM 응답
- 100%: 모든 응답 완료

**Prerequisites:** Story 4.1 완료

**Technical Notes:**

- `Promise.allSettled()` 사용 (일부 실패 허용)
- Timeout 처리: `Promise.race()` + `setTimeout()`
- 에러 핸들링: 각 프로바이더별 에러 로깅
- 결과 저장: `contents` 테이블에 JSON 컬럼 (`llm_responses`)

**Estimated Effort:** 5-6시간

---

### Story 4.5: 품질 평가 알고리즘 (최고 콘텐츠 선택)

**As a** 시스템,
**I want** 3개 LLM 결과 중 품질이 가장 높은 콘텐츠를 자동 선택하여,
**So that** 사용자에게 최고 품질의 콘텐츠만 제공한다.

**Acceptance Criteria:**

**Given** 3개 LLM 응답이 모두 성공했을 때
**When** 품질 평가 알고리즘을 실행하면
**Then** 각 응답에 대해 품질 점수(0-100)를 계산한다

**And** 품질 평가 기준 (가중치):

1. **길이 적합성 (20점):** 1,500-2,500자 범위 내
2. **구조 완성도 (25점):** 제목, 소제목, 단락 구성
3. **한국어 자연스러움 (20점):** 어색한 표현, 번역투 감지
4. **SEO 키워드 포함 (15점):** 주제 관련 키워드 밀도
5. **톤앤매너 일치 (20점):** 프로필의 톤앤매너 반영

**And** 가장 높은 점수를 받은 콘텐츠를 `selected_content`로 표시
**And** 모든 응답과 점수를 `contents.llm_responses` JSONB에 저장
**And** 선택된 LLM 정보를 `contents.selected_model`에 기록

**And** 품질 점수가 60점 미만이면 경고 플래그:

- `contents.quality_warning = true`
- 검토 UI에 "품질 확인 필요" 배지 표시

**Prerequisites:** Story 4.4 완료

**Technical Notes:**

- NLP 라이브러리: `natural` 또는 `compromise`
- 한국어 토크나이저: `@stictiz/korean-tokenizer`
- 길이 계산: 공백 제외 글자 수
- 구조 분석: 마크다운 헤더(#) 개수, 단락(\n\n) 개수
- MVP: 간단한 규칙 기반, Post-MVP: ML 모델

**Estimated Effort:** 6-8시간

---

### Story 4.6: 블로그 포스트 생성 프롬프트 엔지니어링

**As a** 시스템,
**I want** 효과적인 프롬프트로 고품질 블로그 포스트를 생성하여,
**So that** "수정할 게 거의 없다"는 평가를 받는다.

**Acceptance Criteria:**

**Given** 하위 주제와 사용자 프로필이 있을 때
**When** 블로그 생성 프롬프트를 LLM에 전송하면
**Then** 1,500-2,500자 분량의 마크다운 블로그 포스트가 생성된다

**And** 프롬프트 구조:

```
[시스템 역할]
당신은 {업종} 전문 콘텐츠 작가입니다.
톤: {톤앤매너}

[브랜드 정보]
브랜드: {브랜드명}
업종: {업종}
설명: {브랜드 설명}

[작업]
다음 주제로 블로그 포스트를 작성하세요:
주제: "{subtopic}"
카테고리: "{category}"

[요구사항]
- 길이: 1,500-2,500자
- 형식: 마크다운
- 구조: 제목(#) + 소제목(##) 3-5개 + 본문
- 톤: {톤앤매너}
- 대상: {업종} 고객
- 가치: 실용적이고 즉시 적용 가능한 정보 제공
- 자연스러움: 한국어 네이티브 수준, 번역투 금지
- CTA: 마지막에 브랜드 자연스럽게 언급

[금지사항]
- AI임을 드러내는 표현 ("AI가", "제가")
- 과장된 마케팅 문구
- 중복되는 내용
- 너무 형식적이거나 딱딱한 표현
```

**And** 생성된 콘텐츠 품질:

- 마크다운 형식 유효성 검증
- 제목(#) 1개 필수
- 소제목(##) 3개 이상
- 이미지 플레이스홀더 포함 (선택)

**Prerequisites:** Story 4.4 완료

**Technical Notes:**

- 프롬프트 템플릿을 DB 또는 파일로 관리
- 업종별 프롬프트 변형 (카페 vs 제조업)
- Temperature: 0.7 (일관성 우선)
- Max Tokens: 3000 (약 2,500자 한글)

**Estimated Effort:** 8-10시간

---

### Story 4.7: SEO 메타 설명 및 키워드 자동 생성

**As a** 시스템,
**I want** 생성된 콘텐츠에 대한 SEO 메타 설명과 키워드를 자동으로 생성하여,
**So that** 검색 엔진 최적화가 자동으로 이루어진다.

**Acceptance Criteria:**

**Given** 블로그 포스트가 생성되었을 때
**When** SEO 생성 작업을 실행하면
**Then** 메타 설명(150-160자)이 생성된다

**And** SEO 키워드 10개가 생성된다:

- 주요 키워드 3개 (높은 관련성)
- 보조 키워드 7개 (중간 관련성)

**And** 메타 설명 요구사항:

- 길이: 150-160자 (구글 검색 결과 최적 길이)
- 내용: 포스트 핵심 요약 + CTA
- 자연스러움: 클릭을 유도하는 매력적인 문구

**And** 키워드 추출 방식:

- TF-IDF 알고리즘 사용
- 불용어 제거 (조사, 접속사 등)
- 단어 빈도 + 문서 중요도 계산

**And** 생성 결과 저장:

- `contents.seo_meta_description`
- `contents.seo_keywords` (TEXT[] 배열)

**Prerequisites:** Story 4.6 완료

**Technical Notes:**

- SEO 메타 생성: Gemini 2.0 Flash (빠르고 저렴)
- 키워드 추출: `natural` 라이브러리 TF-IDF
- 한국어 불용어 사전: 커스텀 리스트 작성
- 프롬프트: "다음 블로그 포스트의 SEO 메타 설명을 150자로 작성하세요..."

**Estimated Effort:** 4-5시간

---

### Story 4.8: 콘텐츠 생성 진행 상황 실시간 업데이트

**As a** 사용자,
**I want** 콘텐츠 생성 진행 상황을 실시간으로 확인할 수 있어,
**So that** 얼마나 기다려야 하는지 알 수 있다.

**Acceptance Criteria:**

**Given** 콘텐츠 생성 작업이 진행 중일 때
**When** Frontend에서 진행 상황을 폴링하면
**Then** 현재 진행률(0-100%)과 상태 메시지가 반환된다

**And** 진행 단계별 메시지:

- 0%: "콘텐츠 생성 작업을 시작합니다..."
- 20%: "3개 LLM에 요청을 전송했습니다..."
- 50%: "AI가 콘텐츠를 생성하고 있습니다... (30-60초 소요)"
- 75%: "품질을 평가하고 있습니다..."
- 90%: "SEO 메타 데이터를 생성하고 있습니다..."
- 100%: "생성 완료! 검토 페이지로 이동하세요."

**And** UI 표시 (UX Design 반영):

```
┌──────────────────────────────────────┐
│ 🤖 AI가 콘텐츠를 생성하고 있습니다     │
│                                      │
│ ████████████░░░░░░░░░░░  50%        │
│                                      │
│ 3개 LLM 모델이 협력하여 최고 품질의   │
│ 콘텐츠를 생성하고 있습니다.           │
│                                      │
│ 예상 시간: 약 30초 남음               │
└──────────────────────────────────────┘
```

**And** 프로그레스 바 색상: Primary Blue (#0EA5E9)
**And** 실패 시 에러 메시지 + 재시도 버튼

**Prerequisites:** Story 4.2, 4.4 완료

**Technical Notes:**

- Frontend: TanStack Query `useQuery` 3초마다 폴링
- Backend: `GET /api/jobs/:jobId/status` 엔드포인트
- BullMQ `job.updateProgress()` 호출
- Shadcn/ui Progress 컴포넌트 사용
- UX Design: ux-design-specification.md Section 7.3 참조

**Estimated Effort:** 4-5시간

---

### Story 4.9: 사용자 프로필 기반 콘텐츠 개인화

**As a** 시스템,
**I want** 사용자 프로필(업종, 톤앤매너, 브랜드 설명)을 반영하여,
**So that** "우리 브랜드다운" 콘텐츠가 생성된다.

**Acceptance Criteria:**

**Given** 사용자 프로필에 다음 정보가 저장되어 있을 때:

- 업종 (industry)
- 브랜드명 (company_name)
- 브랜드 설명 (brand_description)
- 톤앤매너 (tone_manner: 친근한, 전문적인, 유머러스한 등)

**When** 콘텐츠 생성 프롬프트를 구성하면
**Then** 모든 프로필 정보가 프롬프트에 반영된다

**And** 업종별 콘텐츠 스타일 차별화:

- **카페/레스토랑:** 따뜻하고 감성적, 메뉴/분위기 중심
- **뷰티/패션:** 트렌디하고 스타일리시, 비주얼 강조
- **제조업:** 전문적이고 신뢰감, 기술/품질 중심
- **서비스업:** 친근하고 실용적, 고객 혜택 중심

**And** 톤앤매너 반영:

- **친근한:** 반말 또는 존댓말, 이모티콘 사용 고려
- **전문적인:** 존댓말, 전문 용어 적절히 사용
- **유머러스한:** 재치있는 표현, 가벼운 농담
- **진지한:** 격식있는 표현, 신뢰감 강조

**And** 브랜드명 자연스럽게 언급 (마지막 CTA 부분)

**Prerequisites:** Story 2.5 (프로필 등록), Story 4.6 완료

**Technical Notes:**

- 프로필 조회: `from('profiles').select().eq('user_id', userId)`
- 프롬프트 템플릿에 변수 치환
- 업종별 프롬프트 변형: Switch 문 또는 Map 구조
- 톤앤매너는 시스템 메시지에 반영

**Estimated Effort:** 4-5시간

---

### Story 4.10: 콘텐츠 재생성 기능 (거절 후)

**As a** 사용자,
**I want** 마음에 들지 않는 콘텐츠를 거절하고 재생성할 수 있어,
**So that** 만족할 때까지 반복할 수 있다.

**Acceptance Criteria:**

**Given** 검토 UI에서 콘텐츠를 거절했을 때
**When** "재생성" 버튼을 클릭하면
**Then** 새로운 콘텐츠 생성 작업이 큐에 추가된다

**And** 재생성 옵션 제공:

- **동일 주제로 재생성** (기본)
- **톤앤매너 변경** (예: 친근한 → 전문적인)
- **길이 조정** (짧게 / 길게)

**And** 재생성 시 이전 결과 참고:

- 거절 사유를 프롬프트에 반영 (선택사항)
- 다른 LLM 우선 사용 (이전에 선택 안 된 모델)

**And** 재생성 횟수 제한:

- 동일 주제당 최대 3회 재생성
- 3회 초과 시 "다른 주제로 시도해보세요" 메시지

**And** `contents` 테이블에 재생성 기록:

- `regeneration_count` 컬럼 증가
- `rejection_reason` 저장 (선택사항)

**Prerequisites:** Story 4.6, Story 5.4 (거절 기능) 완료

**Technical Notes:**

- Frontend: 재생성 옵션 모달 (Shadcn/ui Dialog)
- Backend: `POST /api/content/:id/regenerate`
- BullMQ: 기존 작업과 동일 큐 사용
- 프롬프트에 "이전 버전은 [문제]가 있었습니다. 개선해주세요." 추가

**Estimated Effort:** 4-5시간

---

### Story 4.11: LLM API 비용 추적 및 최적화

**As a** 관리자,
**I want** LLM API 사용량과 비용을 추적할 수 있어,
**So that** 예산을 관리하고 비용을 최적화할 수 있다.

**Acceptance Criteria:**

**Given** 콘텐츠 생성 작업이 완료되었을 때
**When** `job_logs` 테이블에 기록하면
**Then** 다음 정보가 저장된다:

- 사용된 LLM 모델
- 토큰 사용량 (input + output)
- 예상 비용 (USD)
- 응답 시간 (latency)

**And** 비용 계산:

- GPT-4 Turbo: $10/1M input tokens, $30/1M output tokens
- Claude 3.5 Sonnet: $3/1M input, $15/1M output
- Gemini 2.0 Flash: $0.075/1M input, $0.30/1M output

**And** 관리자 대시보드에 표시:

- 일간/월간 총 비용
- LLM별 사용 비율
- 평균 응답 시간
- 실패율

**And** 비용 알림:

- 일간 $10 초과 시 Slack/이메일 알림
- 월간 $300 초과 시 경고

**Prerequisites:** Story 4.4 완료

**Technical Notes:**

- `job_logs` 테이블에 컬럼 추가:
  - `tokens_input`, `tokens_output`, `cost_usd`, `latency_ms`
- 비용 계산 함수: `calculateLLMCost(model, tokens)`
- 관리자 대시보드: Bull Board 확장 또는 별도 페이지
- 알림: Nodemailer 또는 Slack Webhook

**Estimated Effort:** 3-4시간

---

### Story 4.12: AI 생성 완료 알림 (실시간)

**As a** 사용자,
**I want** AI 콘텐츠 생성이 완료되면 즉시 알림을 받아,
**So that** 기다리지 않고 바로 검토할 수 있다.

**Acceptance Criteria:**

**Given** 콘텐츠 생성 작업이 완료되었을 때
**When** Frontend에서 알림을 확인하면
**Then** 다음 알림이 표시된다:

- 브라우저 푸시 알림: "새 콘텐츠가 준비되었습니다!"
- 인앱 알림: 헤더 알림 아이콘에 빨간 뱃지 (1)
- 토스트 알림: 우측 하단 팝업

**And** 알림 클릭 시:

- 검토 페이지(`/review/:contentId`)로 이동

**And** 알림 메시지 구조:

```
제목: "새 콘텐츠 준비 완료 🎉"
내용: "{subtopic}" 콘텐츠가 생성되었습니다.
액션: [지금 검토하기] 버튼
```

**And** 알림 설정:

- 사용자가 알림 on/off 설정 가능 (설정 페이지)
- 브라우저 알림 권한 요청

**Prerequisites:** Story 4.8 완료

**Technical Notes:**

- Supabase Realtime Subscription 사용:
  ```typescript
  supabase
    .channel('contents')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'contents',
        filter: `user_id=eq.${userId}`,
      },
      payload => {
        showNotification(payload.new);
      }
    )
    .subscribe();
  ```
- 브라우저 알림: Web Notifications API
- 토스트: Shadcn/ui Toast 컴포넌트
- 알림 목록: `notifications` 테이블 (선택사항)

**Estimated Effort:** 4-5시간

## Epic 5: 검토 및 승인 워크플로우 (Review & Approval Workflow)

**Epic 목표:**
사용자가 생성된 콘텐츠를 검토하고, 수정하고, 승인/거절할 수 있는 직관적인 워크플로우를 제공합니다. "통제권 & 자신감"을 느끼게 하는 핵심 UX입니다.

**비즈니스 가치:**
"AI가 도와주지만, 내 브랜드는 내가 지킨다"는 가치 제안의 실현. 검토 승인율 70% 이상이 MVP 성공 기준.

**FR 커버리지:** FR21-FR28

**우선순위:** P0 (필수 - Epic 4 다음)

---

### Story 5.1: 검토 대기 목록 UI

**As a** 사용자,
**I want** 검토 대기 중인 콘텐츠 목록을 한눈에 볼 수 있어,
**So that** 어떤 콘텐츠를 검토해야 하는지 즉시 파악할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드에 접속했을 때
**When** "검토 대기" 섹션을 확인하면
**Then** 상태가 `pending_review`인 모든 콘텐츠가 카드 형식으로 표시된다

**And** 각 카드 정보 (UX Design 반영):

```
┌──────────────────────────────────────┐
│ 여름 신메뉴 소개                      │
│ AI 생성 완료 • 5분 전                │
│ 모델: Claude 3.5 | 품질: 85/100      │
│                        [검토하기] →  │
└──────────────────────────────────────┘
```

**And** 카드 컴포넌트 스타일:

- 배경: White (#FFFFFF)
- 테두리: Gray 200 (#e5e7eb), 호버 시 Primary Blue
- 그림자: 미묘한 그림자 (shadow-sm)
- 패딩: 16px
- Border Radius: 8px

**And** 정렬 순서: 생성 일시 최신순
**And** 검토 대기 개수 뱃지 표시: "검토 대기 중 (3개)"
**And** 빈 상태 처리:

```
┌──────────────────────────────────────┐
│         ✨                           │
│   검토 대기 중인 콘텐츠가 없습니다    │
│   새 콘텐츠를 생성해보세요!           │
│                                      │
│       [+ 새 콘텐츠 생성하기]         │
└──────────────────────────────────────┘
```

**Prerequisites:** Story 4.12 완료

**Technical Notes:**

- Supabase 쿼리: `from('contents').select().eq('status', 'pending_review').order('created_at', { ascending: false })`
- Shadcn/ui Card 컴포넌트 사용
- TanStack Query로 데이터 캐싱 및 자동 갱신
- UX Design: ux-design-specification.md Section 4.2 참조

**Estimated Effort:** 4-5시간

---

### Story 5.2: 검토 UI - 마크다운 에디터 & 미리보기 (Split View)

**As a** 사용자,
**I want** 검토 페이지에서 콘텐츠를 편집하고 미리보기를 동시에 볼 수 있어,
**So that** 수정 결과를 즉시 확인할 수 있다.

**Acceptance Criteria:**

**Given** 검토 대기 목록에서 "검토하기" 버튼을 클릭했을 때
**When** 검토 페이지(`/review/:contentId`)에 접속하면
**Then** Split View 레이아웃이 표시된다

**And** 레이아웃 구조 (UX Design 반영 - Content First Direction):

```
┌─────────────────────────────────────────────┐
│ [← 뒤로] 여름 신메뉴 소개            [승인] │ ← Header
├──────────────────┬──────────────────────────┤
│                  │                          │
│   마크다운 에디터   │      미리보기 (HTML)      │ ← Split View
│                  │                          │
│  # 여름 신메뉴    │    <h1>여름 신메뉴</h1>   │
│                  │                          │
│  올 여름...       │    <p>올 여름...</p>     │
│                  │                          │
├──────────────────┴──────────────────────────┤
│ [거절] [수정 후 승인] [승인하기]              │ ← Footer
└─────────────────────────────────────────────┘
```

**And** 마크다운 에디터 기능:

- 툴바: Bold, Italic, 헤딩, 리스트, 링크, 이미지
- 실시간 문자 수 표시: "1,850 / 2,500자"
- Syntax Highlighting (마크다운)
- 자동 저장 (3초 idle 후)

**And** 미리보기 기능:

- 마크다운 → HTML 변환 (react-markdown)
- 블로그 스타일 적용 (타이포그래피)
- 스크롤 동기화 (선택사항)

**And** 반응형 처리:

- 데스크톱 (> 1024px): Side-by-side
- 태블릿/모바일 (< 1024px): Tabs (편집 | 미리보기)

**Prerequisites:** Story 5.1 완료

**Technical Notes:**

- 마크다운 에디터: `@uiw/react-md-editor` 또는 `react-simplemde-editor`
- 미리보기: `react-markdown` + `remark-gfm`
- 자동 저장: `useDebouncedCallback` (500ms)
- Tailwind CSS Grid: `grid grid-cols-2 gap-4`
- UX Design: ux-design-specification.md Section 7.4 참조

**Estimated Effort:** 8-10시간

---

### Story 5.3: 콘텐츠 수정 및 저장 기능

**As a** 사용자,
**I want** 검토 UI에서 제목과 본문을 직접 수정할 수 있어,
**So that** AI 생성 콘텐츠를 내 스타일에 맞게 다듬을 수 있다.

**Acceptance Criteria:**

**Given** 검토 페이지에 있을 때
**When** 제목 또는 본문을 수정하면
**Then** 변경사항이 실시간으로 미리보기에 반영된다

**And** 수정 가능한 필드:

- 제목 (title)
- 본문 (content) - 마크다운
- SEO 메타 설명 (seo_meta_description)
- SEO 키워드 (seo_keywords)

**And** 자동 저장:

- 3초 idle 후 자동으로 `contents` 테이블 업데이트
- 저장 상태 표시: "저장 중..." → "저장됨 ✓"
- 저장 실패 시: "저장 실패. 재시도하세요." + 경고 아이콘

**And** 수동 저장:

- Ctrl+S (Cmd+S) 단축키
- "저장" 버튼 (상단 툴바)

**And** 변경 감지:

- 수정사항이 있으면 페이지 이탈 시 경고:
  "저장하지 않은 변경사항이 있습니다. 나가시겠습니까?"

**Prerequisites:** Story 5.2 완료

**Technical Notes:**

- Supabase `update()`: `from('contents').update({ title, content }).eq('id', contentId)`
- 자동 저장: `useDebounce` 훅 (3000ms)
- Dirty fields 추적: React Hook Form `formState.isDirty`
- 이탈 방지: `beforeunload` 이벤트 리스너

**Estimated Effort:** 4-5시간

---

### Story 5.4: 콘텐츠 승인 기능

**As a** 사용자,
**I want** 만족스러운 콘텐츠를 승인할 수 있어,
**So that** 배포 단계로 넘어갈 수 있다.

**Acceptance Criteria:**

**Given** 검토 페이지에서 콘텐츠를 확인했을 때
**When** "승인하기" 버튼을 클릭하면
**Then** 승인 확인 모달이 표시된다

**And** 모달 내용:

```
┌────────────────────────────────────┐
│  ✅ 콘텐츠를 승인하시겠습니까?       │
│                                    │
│  이 콘텐츠를 배포 준비 상태로       │
│  변경합니다.                        │
│                                    │
│  [ ] 품질이 기대 이상입니다         │
│                                    │
│  별점: ★★★★★ (선택사항)            │
│                                    │
│      [취소]         [승인하기]      │
└────────────────────────────────────┘
```

**And** 승인 처리:

- `contents.status` → `approved`
- `contents.approved_at` → 현재 시간
- `contents.quality_rating` → 별점 (1-5)

**And** 승인 완료 후:

- 배포 설정 모달로 자동 전환 (Story 6.5 참조)
- 또는 대시보드로 리다이렉트 (사용자 선택)
- 토스트 알림: "콘텐츠가 승인되었습니다! 🎉"

**And** 통계 업데이트:

- 사용자 승인율 계산하여 프로필에 기록

**Prerequisites:** Story 5.2 완료

**Technical Notes:**

- Shadcn/ui Dialog 컴포넌트
- Supabase 업데이트: `update({ status: 'approved', approved_at: new Date() })`
- 별점 입력: Shadcn/ui RadioGroup (별 아이콘 5개)
- UX Design: ux-design-specification.md Section 7.5 참조

**Estimated Effort:** 3-4시간

---

### Story 5.5: 콘텐츠 거절 및 재생성 트리거

**As a** 사용자,
**I want** 마음에 들지 않는 콘텐츠를 거절하고 재생성을 요청할 수 있어,
**So that** 더 나은 콘텐츠를 받을 수 있다.

**Acceptance Criteria:**

**Given** 검토 페이지에서 콘텐츠를 확인했을 때
**When** "거절" 버튼을 클릭하면
**Then** 거절 사유 선택 모달이 표시된다

**And** 모달 내용:

```
┌────────────────────────────────────┐
│  ❌ 콘텐츠를 거절하시겠습니까?       │
│                                    │
│  거절 사유 (선택사항):              │
│  ○ 톤앤매너가 맞지 않음             │
│  ○ 내용이 부족함                   │
│  ○ 너무 길거나 짧음                │
│  ○ 품질이 기대에 못 미침            │
│  ○ 기타: [____________]            │
│                                    │
│      [취소]         [거절하기]      │
└────────────────────────────────────┘
```

**And** 거절 처리:

- `contents.status` → `rejected`
- `contents.rejection_reason` → 사유 저장
- `contents.rejected_at` → 현재 시간

**And** 거절 후 옵션:

```
┌────────────────────────────────────┐
│  콘텐츠가 거절되었습니다.           │
│                                    │
│  [다른 콘텐츠 검토하기]             │
│  [동일 주제로 재생성하기]           │
│  [주제 수정 후 재생성하기]          │
└────────────────────────────────────┘
```

**And** 재생성 선택 시:

- Story 4.10의 재생성 워크플로우 실행
- 거절 사유를 프롬프트에 반영

**Prerequisites:** Story 5.2, 4.10 완료

**Technical Notes:**

- Shadcn/ui RadioGroup (사유 선택)
- Supabase 업데이트 + Story 4.10 재생성 API 호출
- 거절 사유 분석 (관리자 대시보드용)

**Estimated Effort:** 4-5시간

---

### Story 5.6: 품질 피드백 수집 (별점)

**As a** 시스템,
**I want** 사용자가 승인 시 품질 피드백을 남길 수 있어,
**So that** LLM 성능을 추적하고 개선할 수 있다.

**Acceptance Criteria:**

**Given** 콘텐츠 승인 모달에서
**When** 별점(1-5)을 선택하면
**Then** `contents.quality_rating` 컬럼에 저장된다

**And** 별점 의미:

- ⭐ (1점): 많은 수정 필요
- ⭐⭐ (2점): 일부 수정 필요
- ⭐⭐⭐ (3점): 보통
- ⭐⭐⭐⭐ (4점): 좋음
- ⭐⭐⭐⭐⭐ (5점): 수정 없이 바로 게시

**And** 피드백 데이터 활용:

- 관리자 대시보드에 평균 별점 표시
- LLM별 평균 별점 비교 (GPT-4 vs Claude vs Gemini)
- 업종별 평균 별점 분석

**And** 별점은 선택사항 (필수 아님)
**And** 별점 없이도 승인 가능

**Prerequisites:** Story 5.4 완료

**Technical Notes:**

- Shadcn/ui Rating 컴포넌트 (커스텀)
- 별 아이콘: Lucide React `Star` 아이콘
- 분석 쿼리: `SELECT AVG(quality_rating) FROM contents WHERE selected_model = 'gpt-4'`

**Estimated Effort:** 2-3시간

---

### Story 5.7: 실시간 콘텐츠 생성 알림 (Supabase Realtime)

**As a** 사용자,
**I want** 새 콘텐츠가 생성되면 대시보드에 즉시 표시되어,
**So that** 페이지를 새로고침하지 않아도 확인할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드에 접속해 있을 때
**When** 백그라운드에서 콘텐츠 생성이 완료되면
**Then** 검토 대기 목록에 새 카드가 자동으로 추가된다

**And** 실시간 업데이트:

- Supabase Realtime Subscription 활성화
- `contents` 테이블 INSERT 이벤트 감지
- 현재 사용자 것만 필터링 (`user_id = auth.uid()`)

**And** UI 애니메이션:

- 새 카드가 부드럽게 페이드인 (fade-in)
- 상단에 추가 (최신순)

**And** 알림 뱃지 업데이트:

- 헤더 알림 아이콘 뱃지 +1
- "검토 대기 중 (3개)" → "(4개)"

**Prerequisites:** Story 4.12, 5.1 완료

**Technical Notes:**

- Supabase Realtime: `supabase.channel('contents').on('postgres_changes', ...)`
- TanStack Query `queryClient.invalidateQueries()` 또는 `setQueryData()`
- Framer Motion으로 애니메이션
- UX Design: 실시간 피드백 원칙 반영

**Estimated Effort:** 4-5시간

---

### Story 5.8: 검토 UI 단축키 지원

**As a** 사용자,
**I want** 키보드 단축키로 빠르게 검토 작업을 할 수 있어,
**So that** 효율적으로 여러 콘텐츠를 처리할 수 있다.

**Acceptance Criteria:**

**Given** 검토 페이지에 있을 때
**When** 다음 단축키를 누르면
**Then** 해당 액션이 실행된다:

- `Ctrl/Cmd + S`: 저장
- `Ctrl/Cmd + Enter`: 승인
- `Esc`: 모달 닫기 / 취소
- `Ctrl/Cmd + E`: 에디터 포커스
- `Ctrl/Cmd + P`: 미리보기 포커스
- `Ctrl/Cmd + ← →`: 이전/다음 콘텐츠

**And** 단축키 안내:

- `?` 키로 단축키 도움말 표시
- 모달에 단축키 목록 표시

**And** 모바일에서는 단축키 비활성화

**Prerequisites:** Story 5.2, 5.3, 5.4 완료

**Technical Notes:**

- `react-hotkeys-hook` 라이브러리
- 단축키 충돌 방지 (입력 필드 내에서는 비활성화)
- 도움말 모달: Shadcn/ui Dialog

**Estimated Effort:** 3-4시간

---

### Story 5.9: 여러 콘텐츠 일괄 승인/거절

**As a** 사용자,
**I want** 검토 대기 목록에서 여러 콘텐츠를 선택하여 일괄 승인/거절할 수 있어,
**So that** 많은 콘텐츠를 빠르게 처리할 수 있다.

**Acceptance Criteria:**

**Given** 검토 대기 목록에 여러 콘텐츠가 있을 때
**When** 각 카드의 체크박스를 선택하면
**Then** 상단에 일괄 작업 툴바가 표시된다

**And** 툴바 내용:

```
┌──────────────────────────────────────┐
│ ✓ 3개 선택됨                          │
│            [일괄 승인] [일괄 거절]     │
└──────────────────────────────────────┘
```

**And** 일괄 승인 클릭 시:

- 확인 모달: "3개 콘텐츠를 모두 승인하시겠습니까?"
- 승인 후 배포 설정 모달 (플랫폼 선택)

**And** 일괄 거절 클릭 시:

- 확인 모달: "3개 콘텐츠를 모두 거절하시겠습니까?"
- 거절 사유는 공통 적용

**And** 전체 선택/해제:

- 헤더 체크박스로 모든 항목 선택/해제
- 선택된 개수 표시

**Prerequisites:** Story 5.1, 5.4, 5.5 완료

**Technical Notes:**

- React state로 선택된 항목 ID 배열 관리
- Supabase batch update: `update().in('id', selectedIds)`
- Shadcn/ui Checkbox 컴포넌트
- UX Design: 효율성 원칙 반영

**Estimated Effort:** 4-5시간

---

## Epic 6: 멀티 채널 배포 (Multi-Channel Distribution)

**Epic 목표:**
승인된 콘텐츠를 Instagram, Facebook, 네이버 블로그 등 여러 SNS 채널에 자동으로 배포합니다. 한 번의 승인으로 모든 채널에 동시 게시되는 것이 핵심 가치입니다.

**비즈니스 가치:**
시간 절약 및 일관된 브랜드 메시지 전달. "하나의 워크플로우로 모든 채널 커버"

**FR 커버리지:** FR29-FR40

**우선순위:** P0 (필수 - Epic 5 다음)

---

### Story 6.1: Instagram 계정 OAuth 연동

**As a** 사용자,
**I want** Instagram 계정을 연동할 수 있어,
**So that** Instagram에 자동 게시할 수 있다.

**Acceptance Criteria:**

**Given** 설정 페이지의 "SNS 연동" 섹션에서
**When** "Instagram 연동" 버튼을 클릭하면
**Then** Facebook Login (Instagram Graph API) OAuth 플로우가 시작된다

**And** 요청 권한:

- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement` (Instagram Business 계정 접근)

**And** OAuth 콜백 처리:

- Access Token 수신
- Instagram Business Account ID 저장
- `connected_accounts` 테이블에 레코드 추가:
  - `platform = 'instagram'`
  - `account_id` (Instagram Business Account ID)
  - `access_token` (암호화)
  - `refresh_token` (암호화)

**And** 토큰 저장 보안:

- Supabase Vault 또는 pgcrypto로 암호화
- RLS 정책으로 본인만 접근

**And** 연동 성공 시:

- "Instagram이 연동되었습니다!" 토스트 알림
- 계정 프로필 이미지 및 이름 표시

**Prerequisites:** Story 2.3 (로그인) 완료

**Technical Notes:**

- Facebook for Developers에서 앱 생성
- Instagram Graph API 사용 (비즈니스 계정 필수)
- OAuth Redirect URI: `{SITE_URL}/api/auth/instagram/callback`
- SDK: `facebook-nodejs-business-sdk` 또는 axios로 직접 호출
- 토큰 갱신: Long-lived token (60일)으로 교환

**Estimated Effort:** 6-8시간

---

### Story 6.2: Facebook 페이지 OAuth 연동

**As a** 사용자,
**I want** Facebook 페이지를 연동할 수 있어,
**So that** Facebook에 자동 게시할 수 있다.

**Acceptance Criteria:**

**Given** 설정 페이지의 "SNS 연동" 섹션에서
**When** "Facebook 연동" 버튼을 클릭하면
**Then** Facebook Login OAuth 플로우가 시작된다

**And** 요청 권한:

- `pages_manage_posts`
- `pages_read_engagement`

**And** 페이지 선택:

- OAuth 완료 후 사용자가 관리하는 페이지 목록 표시
- 사용자가 연동할 페이지 선택
- 선택한 페이지의 Page Access Token 저장

**And** `connected_accounts` 테이블에 저장:

- `platform = 'facebook'`
- `account_id` (Page ID)
- `account_name` (Page Name)
- `access_token` (Page Access Token, 암호화)

**And** 토큰 갱신:

- Long-lived User Access Token으로 교환 (60일)
- Page Access Token은 만료 없음

**Prerequisites:** Story 6.1 완료 (동일 Facebook OAuth 앱 사용)

**Technical Notes:**

- Facebook Graph API: `GET /me/accounts` (페이지 목록)
- Page Access Token: `/me/accounts?fields=access_token,name`
- SDK: `facebook-nodejs-business-sdk`
- 토큰 교환: `oauth/access_token?grant_type=fb_exchange_token`

**Estimated Effort:** 5-6시간

---

### Story 6.3: 네이버 블로그 OAuth 연동

**As a** 사용자,
**I want** 네이버 블로그 계정을 연동할 수 있어,
**So that** 네이버 블로그에 자동 게시할 수 있다.

**Acceptance Criteria:**

**Given** 설정 페이지의 "SNS 연동" 섹션에서
**When** "네이버 블로그 연동" 버튼을 클릭하면
**Then** 네이버 OAuth 2.0 플로우가 시작된다

**And** 요청 권한:

- `blog` (블로그 작성 권한)

**And** OAuth 콜백 처리:

- Access Token 수신
- Refresh Token 저장 (토큰 갱신용)
- `connected_accounts` 테이블에 저장:
  - `platform = 'naver_blog'`
  - `account_id` (네이버 사용자 ID)
  - `access_token` (암호화)
  - `refresh_token` (암호화)

**And** 토큰 유효기간:

- Access Token: 1시간
- Refresh Token: 영구 (갱신 시마다 새 토큰 발급)

**And** 토큰 자동 갱신:

- Access Token 만료 시 Refresh Token으로 자동 갱신
- 갱신 실패 시 사용자에게 재연동 요청

**Prerequisites:** Story 6.2 완료

**Technical Notes:**

- 네이버 개발자 센터에서 애플리케이션 등록
- 네이버 블로그 API: `https://openapi.naver.com/blog/writePost.json`
- OAuth 엔드포인트:
  - 인증: `https://nid.naver.com/oauth2.0/authorize`
  - 토큰: `https://nid.naver.com/oauth2.0/token`
- Axios로 API 호출

**Estimated Effort:** 5-6시간

---

### Story 6.4: 연동된 계정 관리 UI

**As a** 사용자,
**I want** 연동된 SNS 계정 목록을 확인하고 관리할 수 있어,
**So that** 어떤 계정이 연동되어 있는지 파악하고 필요시 해제할 수 있다.

**Acceptance Criteria:**

**Given** 설정 페이지(`/settings/accounts`)에 접속했을 때
**When** "연동 계정" 섹션을 확인하면
**Then** 연동된 모든 SNS 계정이 카드 형식으로 표시된다

**And** 각 카드 정보:

```
┌──────────────────────────────────────┐
│ [Instagram 아이콘]                   │
│ Instagram                            │
│ @my_business_account                 │
│ 연동일: 2025-11-10                   │
│ 상태: ● 활성                         │
│                 [연동 해제]   [설정] │
└──────────────────────────────────────┘
```

**And** 연동 해제 기능:

- "연동 해제" 버튼 클릭 시 확인 모달
- 확인 후 `connected_accounts` 테이블에서 삭제
- 토스트 알림: "Instagram 연동이 해제되었습니다."

**And** 연동 상태 표시:

- **활성** (초록색 점): 토큰 유효, 정상 작동
- **재연동 필요** (노란색 점): 토큰 만료
- **오류** (빨간색 점): API 호출 실패

**And** 미연동 플랫폼:

- "연동하기" 버튼 표시
- 지원 플랫폼: Instagram, Facebook, 네이버 블로그

**Prerequisites:** Story 6.1, 6.2, 6.3 완료

**Technical Notes:**

- Supabase 쿼리: `from('connected_accounts').select().eq('user_id', userId)`
- 플랫폼 아이콘: Lucide React 아이콘
- Shadcn/ui Card 컴포넌트
- UX Design: ux-design-specification.md Section 8 참조

**Estimated Effort:** 4-5시간

---

### Story 6.5: 배포 설정 모달 (플랫폼 선택 & 예약)

**As a** 사용자,
**I want** 콘텐츠 승인 시 배포할 플랫폼과 시간을 선택할 수 있어,
**So that** 원하는 채널에 원하는 시간에 게시할 수 있다.

**Acceptance Criteria:**

**Given** 검토 UI에서 콘텐츠를 승인했을 때
**When** 배포 설정 모달이 표시되면
**Then** 다음 옵션을 선택할 수 있다

**And** 모달 구조:

```
┌────────────────────────────────────┐
│  📤 배포 설정                       │
│                                    │
│  배포할 플랫폼:                     │
│  ☑ Instagram                       │
│  ☑ Facebook                        │
│  ☑ 네이버 블로그                   │
│  ☐ 카카오 스토리 (미연동)           │
│                                    │
│  배포 시간:                         │
│  ○ 지금 바로                       │
│  ○ 예약 설정                       │
│    [날짜 선택] [시간 선택]          │
│                                    │
│      [취소]         [배포하기]      │
└────────────────────────────────────┘
```

**And** 플랫폼 선택:

- 연동된 계정만 선택 가능
- 미연동 플랫폼은 비활성화 + "연동하기" 링크

**And** 배포 시간 옵션:

- **지금 바로:** 즉시 배포 작업 큐 추가
- **예약 설정:** 특정 날짜/시간 선택
  - 날짜: Date Picker (Shadcn/ui Calendar)
  - 시간: Time Picker (시간/분 선택)

**And** 배포 버튼 클릭 시:

- `distribution_jobs` 테이블에 작업 추가
- BullMQ 작업 큐에 추가 (예약 시간 지정)
- 모달 닫기 + 토스트 알림: "배포가 시작되었습니다!"

**Prerequisites:** Story 5.4, 6.4 완료

**Technical Notes:**

- Shadcn/ui Dialog, Checkbox, Calendar, TimePicker
- BullMQ Delayed Jobs: `queue.add('distribute', data, { delay: ms })`
- `distribution_jobs` 스키마:
  - content_id, platform, scheduled_at, status
- UX Design: ux-design-specification.md Section 5 참조

**Estimated Effort:** 6-8시간

---

### Story 6.6: Instagram 자동 게시 (이미지 + 캡션)

**As a** 시스템,
**I want** Instagram에 이미지와 캡션을 자동으로 게시하여,
**So that** 사용자가 수동으로 게시하지 않아도 된다.

**Acceptance Criteria:**

**Given** 배포 작업이 Instagram으로 예약되었을 때
**When** BullMQ Worker가 작업을 처리하면
**Then** Instagram Graph API를 호출하여 게시한다

**And** 게시 프로세스:

1. **이미지 준비:**
   - 썸네일 이미지 URL (Story 8.1: 이미지 생성 - Post-MVP)
   - MVP: 기본 템플릿 이미지 또는 사용자 업로드 이미지 사용

2. **캡션 생성:**
   - 콘텐츠 제목 + 본문 요약 (500자 이내)
   - 해시태그 자동 추가 (SEO 키워드 활용)

3. **API 호출:**
   - `POST /{ig-user-id}/media` (미디어 컨테이너 생성)
   - `POST /{ig-user-id}/media_publish` (게시)

**And** 게시 결과:

- 성공 시:
  - Instagram 게시물 URL 저장 (`distribution_jobs.post_url`)
  - 상태 → `completed`
- 실패 시:
  - 최대 3회 자동 재시도
  - 3회 실패 시 → `failed`, 오류 메시지 저장

**And** 사용자 알림:

- 게시 완료: "Instagram에 게시되었습니다! [보러가기]"
- 게시 실패: "Instagram 게시 실패. 다시 시도하세요."

**Prerequisites:** Story 6.1, 6.5 완료

**Technical Notes:**

- Instagram Graph API:
  - `POST /{ig-user-id}/media?image_url={url}&caption={caption}`
  - `POST /{ig-user-id}/media_publish?creation_id={creation_id}`
- 이미지는 공개 URL 필요 (Supabase Storage 사용)
- 재시도 로직: BullMQ `attempts: 3, backoff: { type: 'exponential' }`

**Estimated Effort:** 6-8시간

---

### Story 6.7: Facebook 자동 게시 (텍스트 포스트)

**As a** 시스템,
**I want** Facebook 페이지에 텍스트 포스트를 자동으로 게시하여,
**So that** 사용자가 수동으로 게시하지 않아도 된다.

**Acceptance Criteria:**

**Given** 배포 작업이 Facebook으로 예약되었을 때
**When** BullMQ Worker가 작업을 처리하면
**Then** Facebook Graph API를 호출하여 게시한다

**And** 게시 프로세스:

1. **포스트 내용 준비:**
   - 마크다운 → 일반 텍스트 변환
   - 링크 자동 링크화

2. **API 호출:**
   - `POST /{page-id}/feed?message={message}`

**And** 게시 결과:

- 성공: Facebook 게시물 ID 및 URL 저장
- 실패: 최대 3회 재시도

**And** 사용자 알림:

- 완료: "Facebook에 게시되었습니다! [보러가기]"
- 실패: "Facebook 게시 실패. 다시 시도하세요."

**Prerequisites:** Story 6.2, 6.5 완료

**Technical Notes:**

- Facebook Graph API: `POST /{page-id}/feed`
- Page Access Token 사용
- 마크다운 제거: `remark-strip-markdown` 라이브러리
- 최대 길이: 63,206자 (Facebook 제한)

**Estimated Effort:** 4-5시간

---

### Story 6.8: 네이버 블로그 자동 게시 (HTML 변환)

**As a** 시스템,
**I want** 네이버 블로그에 HTML 형식으로 자동 게시하여,
**So that** 마크다운 콘텐츠가 블로그 형식으로 변환된다.

**Acceptance Criteria:**

**Given** 배포 작업이 네이버 블로그로 예약되었을 때
**When** BullMQ Worker가 작업을 처리하면
**Then** 네이버 블로그 API를 호출하여 게시한다

**And** 게시 프로세스:

1. **마크다운 → HTML 변환:**
   - `remark` + `remark-html` 사용
   - 네이버 블로그 스타일 적용

2. **API 호출:**
   - `POST /blog/writePost.json`
   - 필드:
     - `title`: 콘텐츠 제목
     - `contents`: HTML 본문
     - `categoryNo`: 카테고리 (기본값: 1)

**And** 게시 결과:

- 성공: 네이버 블로그 게시물 URL 저장
- 실패: 최대 3회 재시도

**And** 사용자 알림:

- 완료: "네이버 블로그에 게시되었습니다! [보러가기]"
- 실패: "네이버 블로그 게시 실패."

**Prerequisites:** Story 6.3, 6.5 완료

**Technical Notes:**

- 네이버 블로그 API: `POST /blog/writePost.json`
- 마크다운 변환: `unified` + `remark-parse` + `remark-html`
- Access Token 갱신 로직 포함
- 이미지 업로드: 네이버 블로그는 외부 이미지 URL 지원

**Estimated Effort:** 5-6시간

---

### Story 6.9: 배포 실패 시 재시도 로직

**As a** 시스템,
**I want** 배포 실패 시 자동으로 재시도하여,
**So that** 일시적인 네트워크 오류로 인한 실패를 복구한다.

**Acceptance Criteria:**

**Given** 배포 작업이 실패했을 때 (API 오류, 타임아웃 등)
**When** BullMQ Worker가 실패를 감지하면
**Then** 자동으로 재시도한다

**And** 재시도 정책:

- 최대 재시도 횟수: 3회
- 재시도 간격: 지수 백오프 (1분, 5분, 15분)

**And** 재시도 실패 시:

- `distribution_jobs.status` → `failed`
- `distribution_jobs.error_message` 저장
- 사용자에게 알림: "배포에 실패했습니다. 수동으로 재시도하세요."
- 이메일/Slack 알림 (관리자)

**And** 재시도 성공 시:

- 정상 플로우로 복귀
- 사용자 알림 없음 (투명하게 처리)

**Prerequisites:** Story 6.6, 6.7, 6.8 완료

**Technical Notes:**

- BullMQ 설정:
  ```typescript
  queue.add('distribute', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000, // 1분
    },
  });
  ```
- 오류 타입 분류:
  - 네트워크 오류: 재시도
  - 인증 오류 (401): 재시도 안 함, 재연동 요청
  - 비즈니스 로직 오류: 재시도 안 함

**Estimated Effort:** 3-4시간

---

### Story 6.10: 배포 현황 모니터링 UI

**As a** 사용자,
**I want** 대시보드에서 배포 현황을 확인할 수 있어,
**So that** 어떤 콘텐츠가 어느 플랫폼에 게시되었는지 파악할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드에 접속했을 때
**When** "배포 현황" 섹션을 확인하면
**Then** 최근 배포 작업 목록이 표시된다

**And** 각 항목 정보:

```
┌──────────────────────────────────────┐
│ 여름 신메뉴 소개                      │
│ Instagram • Facebook • 네이버         │
│ ✓ 완료 (10분 전)          [보러가기] │
└──────────────────────────────────────┘
```

**And** 상태 아이콘:

- ✓ **완료** (초록색): 모든 플랫폼 게시 성공
- ⏱ **진행 중** (노란색): 배포 작업 진행 중
- ❌ **실패** (빨간색): 일부 또는 전체 실패
- 🕐 **예약됨** (파란색): 예약 배포 대기

**And** "보러가기" 버튼:

- 클릭 시 각 플랫폼 게시물 URL로 이동
- 드롭다운: Instagram | Facebook | 네이버

**And** 필터 옵션:

- 전체 / 완료 / 실패 / 예약됨

**Prerequisites:** Story 6.5, 6.6, 6.7, 6.8 완료

**Technical Notes:**

- Supabase 쿼리: `from('distribution_jobs').select('*, contents(title)').order('created_at', { descending: true }).limit(20)`
- Shadcn/ui Badge (상태 표시)
- UX Design: ux-design-specification.md Section 4.2 참조

**Estimated Effort:** 4-5시간

---

### Story 6.11: 배포 완료 알림

**As a** 사용자,
**I want** 배포가 완료되면 알림을 받아,
**So that** 성공 여부를 즉시 확인할 수 있다.

**Acceptance Criteria:**

**Given** 배포 작업이 완료되었을 때
**When** 모든 플랫폼 게시가 성공하면
**Then** 다음 알림이 표시된다:

- 브라우저 알림: "콘텐츠가 모든 채널에 배포되었습니다!"
- 토스트 알림:

```
┌──────────────────────────────────────┐
│ ✅ 배포 완료                          │
│                                      │
│ "여름 신메뉴 소개"가                  │
│ Instagram, Facebook, 네이버에         │
│ 성공적으로 게시되었습니다.            │
│                                      │
│        [게시물 보러가기]   [닫기]     │
└──────────────────────────────────────┘
```

**And** 일부 실패 시:

```
┌──────────────────────────────────────┐
│ ⚠️ 일부 배포 실패                     │
│                                      │
│ Instagram ✓ | Facebook ✓ | 네이버 ✗  │
│                                      │
│ 네이버 블로그 게시에 실패했습니다.    │
│                                      │
│        [다시 시도]         [닫기]     │
└──────────────────────────────────────┘
```

**And** 알림 설정:

- 사용자가 배포 알림 on/off 설정 가능

**Prerequisites:** Story 6.10 완료

**Technical Notes:**

- Supabase Realtime 또는 폴링
- Shadcn/ui Toast 컴포넌트
- Web Notifications API

**Estimated Effort:** 3-4시간

---

### Story 6.12: 수동 재배포 기능

**As a** 사용자,
**I want** 실패한 배포 작업을 수동으로 재시도할 수 있어,
**So that** 문제를 해결한 후 다시 게시할 수 있다.

**Acceptance Criteria:**

**Given** 배포 현황 목록에서 실패한 작업이 있을 때
**When** "다시 시도" 버튼을 클릭하면
**Then** 동일한 콘텐츠로 새 배포 작업이 생성된다

**And** 재배포 옵션:

- 전체 재시도: 모든 플랫폼
- 실패한 플랫폼만 재시도

**And** 재시도 전 확인:

- "다시 시도하시겠습니까?" 확인 모달
- 실패 사유 표시 (참고용)

**And** 재시도 제한:

- 동일 콘텐츠 재시도 최대 5회
- 5회 초과 시 "관리자에게 문의하세요" 메시지

**Prerequisites:** Story 6.10 완료

**Technical Notes:**

- Frontend: `POST /api/distribution/:jobId/retry`
- Backend: 새 BullMQ 작업 생성 (동일 데이터)
- `distribution_jobs.retry_count` 증가

**Estimated Effort:** 3-4시간

---

### Story 6.13: OAuth 토큰 자동 갱신

**As a** 시스템,
**I want** SNS OAuth 토큰을 자동으로 갱신하여,
**So that** 토큰 만료로 인한 배포 실패를 방지한다.

**Acceptance Criteria:**

**Given** 배포 작업 실행 전
**When** Access Token이 만료되었거나 곧 만료될 때 (1시간 이내)
**Then** Refresh Token으로 자동 갱신한다

**And** 갱신 프로세스:

1. 토큰 만료 시간 확인
2. 만료되었으면 Refresh Token 사용
3. 새 Access Token 발급
4. `connected_accounts` 테이블 업데이트
5. 배포 작업 계속 진행

**And** 갱신 실패 시:

- 배포 작업 중단
- `connected_accounts.status` → `token_expired`
- 사용자에게 재연동 요청 알림

**And** 플랫폼별 갱신 정책:

- **Instagram/Facebook:** Long-lived token (60일)
- **네이버:** Refresh Token (영구, 갱신 시마다 재발급)

**Prerequisites:** Story 6.1, 6.2, 6.3 완료

**Technical Notes:**

- Cron Job: 매일 오전 3시 토큰 만료 확인
- Facebook: `GET /oauth/access_token?grant_type=fb_exchange_token`
- 네이버: `POST /oauth2.0/token?grant_type=refresh_token`
- 토큰 만료 체크: `expires_at < NOW() + INTERVAL '1 hour'`

**Estimated Effort:** 4-5시간

---

### Story 6.14: 배포 작업 로그 및 모니터링

**As a** 관리자,
**I want** 모든 배포 작업을 로그로 기록하여,
**So that** 문제 발생 시 디버깅하고 성능을 분석할 수 있다.

**Acceptance Criteria:**

**Given** 배포 작업이 실행될 때
**When** 작업이 완료되거나 실패하면
**Then** `distribution_jobs` 테이블에 상세 로그가 기록된다

**And** 로그 정보:

- 콘텐츠 ID, 플랫폼, 사용자 ID
- 작업 상태 (completed, failed, pending)
- 게시물 URL (성공 시)
- 오류 메시지 (실패 시)
- 재시도 횟수
- 실행 시간 (created_at, completed_at)
- 소요 시간 (duration)

**And** 관리자 대시보드:

- 일간/월간 배포 통계
- 플랫폼별 성공/실패율
- 평균 소요 시간

**And** 오류 알림:

- 실패율 20% 초과 시 Slack 알림
- 특정 플랫폼 연속 5회 실패 시 경고

**Prerequisites:** Story 6.10 완료

**Technical Notes:**

- `distribution_jobs` 스키마:
  ```sql
  CREATE TABLE distribution_jobs (
    id UUID PRIMARY KEY,
    content_id UUID REFERENCES contents(id),
    user_id UUID REFERENCES profiles(id),
    platform TEXT NOT NULL,
    status TEXT NOT NULL,
    post_url TEXT,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
  );
  ```
- Bull Board로 작업 큐 모니터링

**Estimated Effort:** 3-4시간

---

## Epic 7: 대시보드 및 사용량 관리 (Dashboard & Usage Management)

**Epic 목표:**
사용자에게 직관적인 대시보드를 제공하여 콘텐츠 현황, 통계, 사용량을 한눈에 파악할 수 있게 합니다. "한눈에 파악" UX 원칙의 핵심 구현입니다.

**비즈니스 가치:**
사용자 참여 유지, 사용량 기반 수익화 기반

**FR 커버리지:** FR41-FR52

**우선순위:** P0 (필수 - Epic 6과 병행)

---

### Story 7.1: 대시보드 메인 화면 레이아웃

**As a** 사용자,
**I want** 대시보드에서 모든 핵심 정보를 한눈에 볼 수 있어,
**So that** 현재 상태를 빠르게 파악할 수 있다.

**Acceptance Criteria:**

**Given** 로그인 후 대시보드(`/dashboard`)에 접속했을 때
**When** 페이지가 로딩되면
**Then** Dense Dashboard 레이아웃이 표시된다 (UX Design Direction 1)

**And** 레이아웃 구조:

```
┌─────────────────────────────────────────────────┐
│ [ContentFlow AI]        [🔔 3] [프로필 ▾]      │ ← Header
├───────────┬─────────────────────────────────────┤
│ 📊 대시보드 │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│ 📝 생성    │  │ 12  │ │  3  │ │  9  │ │ 85% │  │ ← Stats
│ ✅ 검토    │  └─────┘ └─────┘ └─────┘ └─────┘  │
│ 📅 캘린더  │  ┌───────────────────────────────┐ │
│ 📈 분석    │  │ 🔔 검토 대기 중 (3개)         │ │
│ ⚙️ 설정    │  ├───────────────────────────────┤ │
│            │  │ 여름 신메뉴 소개     [검토] │ │ ← Review
│            │  │ 고객 후기 이벤트     [검토] │ │   Queue
│            │  └───────────────────────────────┘ │
└───────────┴─────────────────────────────────────┘
  Sidebar (250px)      Main Content
```

**And** Sidebar 네비게이션:

- 📊 대시보드 (활성)
- 📝 콘텐츠 생성
- ✅ 검토 대기
- 📅 콘텐츠 캘린더
- 📈 분석
- ⚙️ 설정

**And** 반응형 처리:

- Desktop (> 1024px): Sidebar 고정
- Tablet/Mobile (< 1024px): Hamburger 메뉴

**And** 컬러 테마: Trust Blue (#0EA5E9) 적용

**Prerequisites:** Story 1.2 (Next.js 초기화) 완료

**Technical Notes:**

- Next.js App Router: `app/(dashboard)/dashboard/page.tsx`
- Shadcn/ui Sidebar 컴포넌트 (커스텀)
- Tailwind Grid: `grid grid-cols-[250px_1fr]`
- UX Design: ux-design-specification.md Section 4.2 참조

**Estimated Effort:** 6-8시간

---

### Story 7.2: 통계 카드 (이번 주 현황)

**As a** 사용자,
**I want** 대시보드 상단에 주요 통계를 카드 형식으로 볼 수 있어,
**So that** 이번 주 성과를 즉시 파악할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드에 접속했을 때
**When** 통계 섹션을 확인하면
**Then** 4개의 통계 카드가 Grid로 표시된다

**And** 카드 1: 생성된 콘텐츠

```
┌──────────────┐
│   생성됨      │
│      12      │
│   이번 주     │
└──────────────┘
```

**And** 카드 2: 검토 대기

```
┌──────────────┐
│  검토 대기    │
│       3      │
│   ⚠️ 확인 필요 │
└──────────────┘
```

**And** 카드 3: 배포 완료

```
┌──────────────┐
│  배포 완료    │
│       9      │
│   ✓ 성공      │
└──────────────┘
```

**And** 카드 4: 승인율

```
┌──────────────┐
│   승인율      │
│      85%     │
│   ↑ +5%      │
└──────────────┘
```

**And** 카드 스타일:

- 배경: White
- 테두리: 좌측 파란 테두리 (4px, Primary Blue)
- 그림자: shadow-md
- 패딩: 24px
- 크기: 동일 (Grid 4 columns)

**And** 데이터 조회:

- 이번 주 = 월요일 00:00 ~ 현재
- 실시간 업데이트 (TanStack Query)

**Prerequisites:** Story 7.1 완료

**Technical Notes:**

- Supabase 쿼리:
  ```sql
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending_review') as pending,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'published') as published
  FROM contents
  WHERE user_id = ${userId}
    AND created_at >= date_trunc('week', NOW())
  ```
- Shadcn/ui Card 컴포넌트
- Tailwind Grid: `grid grid-cols-4 gap-4`

**Estimated Effort:** 4-5시간

---

### Story 7.3: 콘텐츠 캘린더 뷰 (월간)

**As a** 사용자,
**I want** 대시보드에서 월간 콘텐츠 계획을 캘린더로 볼 수 있어,
**So that** 언제 무엇이 발행되는지 한눈에 파악할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드 또는 캘린더 페이지(`/calendar`)에 접속했을 때
**When** 캘린더를 확인하면
**Then** 월간 캘린더 뷰가 표시된다

**And** 캘린더 구조:

```
        2025년 11월              ← 헤더
[<]  일 월 화 수 목 금 토  [>]
     27 28 29 30 31  1  2
      3  4  5  6  7  8  9
         ●     ●  ●          ← 콘텐츠 점
     10 11 12 13 14 15 16
```

**And** 콘텐츠 표시:

- 초록색 점 (●): 배포 완료
- 노란색 점 (●): 검토 대기
- 파란색 점 (●): 예정됨 (예약 배포)

**And** 날짜 클릭 시:

- 해당 날짜의 콘텐츠 목록 표시 (사이드 패널)
- 콘텐츠 제목, 상태, 플랫폼 표시

**And** 네비게이션:

- 이전/다음 달 이동 (화살표 버튼)
- "오늘" 버튼 (현재 달로 빠르게 이동)

**And** 반응형:

- Desktop: 전체 캘린더
- Mobile: 리스트 뷰 옵션 제공

**Prerequisites:** Story 3.6 참조 (유사 기능)

**Technical Notes:**

- 캘린더 라이브러리: `react-big-calendar` 또는 커스텀 구현
- Supabase 쿼리: `published_at` 또는 `scheduled_at` 기준
- Tailwind CSS로 스타일링
- UX Design: ux-design-specification.md Section 5.3 참조

**Estimated Effort:** 6-8시간

---

### Story 7.4: 사용량 추적 및 표시

**As a** 사용자,
**I want** 현재 사용량과 플랜 할당량을 확인할 수 있어,
**So that** 얼마나 남았는지 파악하고 플랜 업그레이드를 고려할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드 또는 설정 페이지에서
**When** "사용량" 섹션을 확인하면
**Then** 현재 사용량이 표시된다

**And** 표시 정보:

```
┌──────────────────────────────────────┐
│ 💳 현재 플랜: Starter                 │
│                                      │
│ 콘텐츠 생성:  15 / 20 개/월          │
│ ████████████████░░░░  75%            │
│                                      │
│ 남은 기간: 15일                       │
│                                      │
│            [플랜 업그레이드]          │
└──────────────────────────────────────┘
```

**And** 프로그레스 바 색상:

- 0-50%: 파란색
- 51-80%: 노란색 (주의)
- 81-100%: 빨간색 (경고)

**And** 할당량 80% 도달 시:

- 경고 알림: "할당량의 80%를 사용했습니다."
- 이메일 알림 (1회)

**And** 할당량 100% 도달 시:

- 콘텐츠 생성 차단
- 모달: "월간 할당량을 초과했습니다. 플랜을 업그레이드하세요."
- [플랜 보기] 버튼

**Prerequisites:** Story 7.1 완료

**Technical Notes:**

- `usage_metrics` 테이블:
  ```sql
  CREATE TABLE usage_metrics (
    user_id UUID REFERENCES profiles(id),
    month DATE NOT NULL,
    content_generated INT DEFAULT 0,
    content_distributed INT DEFAULT 0,
    UNIQUE(user_id, month)
  );
  ```
- 매 콘텐츠 생성 시 `content_generated` 증가
- Supabase Function으로 월별 리셋 (Cron)
- Shadcn/ui Progress 컴포넌트

**Estimated Effort:** 4-5시간

---

### Story 7.5: 기본 분석 데이터 (총 생성 개수, 승인율, 트렌드)

**As a** 사용자,
**I want** 분석 페이지에서 기본 통계를 확인할 수 있어,
**So that** 사용 패턴과 성과를 파악할 수 있다.

**Acceptance Criteria:**

**Given** 분석 페이지(`/analytics`)에 접속했을 때
**When** 페이지가 로딩되면
**Then** 다음 분석 데이터가 표시된다

**And** 1. 총 생성 콘텐츠 (누적):

- 숫자 카드: "총 127개 생성"

**And** 2. 승인율:

- 퍼센트 카드: "승인율 82%"
- 설명: "127개 중 104개 승인"

**And** 3. 주간 트렌드 (라인 차트):

- X축: 최근 4주 (주차)
- Y축: 생성 개수
- 라인: 생성된 콘텐츠 수

**And** 4. 플랫폼별 배포 현황 (바 차트):

- Instagram: 45개
- Facebook: 40개
- 네이버: 35개

**And** 5. LLM별 선택 비율 (파이 차트):

- GPT-4: 40%
- Claude 3.5: 35%
- Gemini: 25%

**Prerequisites:** Story 7.1 완료

**Technical Notes:**

- 차트 라이브러리: `recharts` (React 차트 라이브러리)
- Supabase 쿼리 (집계):
  ```sql
  SELECT
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as count
  FROM contents
  WHERE user_id = ${userId}
  GROUP BY week
  ORDER BY week DESC
  LIMIT 4
  ```
- Shadcn/ui Card + recharts 통합

**Estimated Effort:** 8-10시간

---

### Story 7.6: 알림 센터 (헤더 알림 아이콘)

**As a** 사용자,
**I want** 헤더의 알림 아이콘으로 모든 알림을 확인할 수 있어,
**So that** 놓친 알림을 한곳에서 볼 수 있다.

**Acceptance Criteria:**

**Given** 헤더에 알림 아이콘(🔔)이 있을 때
**When** 아이콘을 클릭하면
**Then** 알림 드롭다운이 표시된다

**And** 드롭다운 구조:

```
┌──────────────────────────────────────┐
│ 알림                    [모두 읽음]   │
├──────────────────────────────────────┤
│ ● 새 콘텐츠 준비 완료                │
│   "여름 신메뉴" • 5분 전              │
├──────────────────────────────────────┤
│ ✓ 배포 완료                          │
│   Instagram, Facebook • 1시간 전      │
├──────────────────────────────────────┤
│ ⚠️ 할당량 80% 도달                   │
│   플랜 확인 필요 • 3시간 전           │
└──────────────────────────────────────┘
```

**And** 알림 타입:

- 콘텐츠 생성 완료
- 배포 완료/실패
- 사용량 경고
- 시스템 공지

**And** 뱃지 표시:

- 읽지 않은 알림 개수 (빨간 뱃지)
- "모두 읽음" 버튼으로 일괄 처리

**And** 알림 클릭 시:

- 해당 페이지로 이동 (검토 페이지, 배포 현황 등)

**Prerequisites:** Story 7.1 완료

**Technical Notes:**

- `notifications` 테이블:
  ```sql
  CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- Shadcn/ui DropdownMenu 컴포넌트
- Supabase Realtime으로 실시간 알림

**Estimated Effort:** 5-6시간

---

### Story 7.7: 프로필 드롭다운 메뉴

**As a** 사용자,
**I want** 헤더의 프로필 아이콘으로 설정 메뉴에 접근할 수 있어,
**So that** 빠르게 설정 및 로그아웃을 할 수 있다.

**Acceptance Criteria:**

**Given** 헤더에 프로필 아이콘이 있을 때
**When** 아이콘을 클릭하면
**Then** 프로필 드롭다운이 표시된다

**And** 드롭다운 메뉴:

```
┌──────────────────────────────────┐
│ 홍길동 (hong@example.com)        │
├──────────────────────────────────┤
│ 🏢 프로필 설정                   │
│ 🔗 연동 계정                     │
│ 💳 플랜 & 결제                   │
│ 📊 사용량                        │
├──────────────────────────────────┤
│ 🚪 로그아웃                      │
└──────────────────────────────────┘
```

**And** 각 메뉴 클릭 시:

- 프로필 설정 → `/settings/profile`
- 연동 계정 → `/settings/accounts`
- 플랜 & 결제 → `/settings/billing`
- 사용량 → `/settings/usage`
- 로그아웃 → Supabase `signOut()` 실행

**And** 현재 플랜 뱃지:

- "Starter" / "Growth" / "Pro"

**Prerequisites:** Story 7.1, 2.8 (로그아웃) 완료

**Technical Notes:**

- Shadcn/ui DropdownMenu
- Supabase `getUser()` for profile info
- Next.js Router `push()`

**Estimated Effort:** 3-4시간

---

### Story 7.8: 검색 기능 (콘텐츠 검색)

**As a** 사용자,
**I want** 헤더에서 콘텐츠를 검색할 수 있어,
**So that** 과거 콘텐츠를 빠르게 찾을 수 있다.

**Acceptance Criteria:**

**Given** 헤더에 검색 아이콘(🔍)이 있을 때
**When** 클릭하면 검색 모달이 표시된다
**Then** 검색어를 입력하여 콘텐츠를 검색할 수 있다

**And** 검색 대상:

- 콘텐츠 제목
- 콘텐츠 본문
- SEO 키워드

**And** 검색 결과:

- 제목, 생성일, 상태 표시
- 클릭 시 검토 페이지로 이동

**And** 키보드 단축키:

- `Ctrl/Cmd + K`: 검색 모달 열기
- `Esc`: 모달 닫기
- `↑ ↓`: 결과 탐색
- `Enter`: 선택

**And** 빈 검색 결과:

- "검색 결과가 없습니다." 메시지

**Prerequisites:** Story 7.1 완료

**Technical Notes:**

- Shadcn/ui CommandMenu (Cmd+K 스타일)
- Supabase Full-Text Search:
  ```sql
  SELECT * FROM contents
  WHERE user_id = ${userId}
    AND (
      title ILIKE '%${query}%' OR
      content ILIKE '%${query}%'
    )
  LIMIT 20
  ```
- `react-hotkeys-hook` for shortcuts

**Estimated Effort:** 4-5시간

---

### Story 7.9: 빈 상태 처리 (Empty State)

**As a** 신규 사용자,
**I want** 콘텐츠가 없을 때 가이드를 볼 수 있어,
**So that** 무엇을 해야 하는지 쉽게 알 수 있다.

**Acceptance Criteria:**

**Given** 신규 사용자가 대시보드에 접속했을 때
**When** 생성된 콘텐츠가 0개이면
**Then** Empty State 화면이 표시된다

**And** Empty State 구조:

```
┌──────────────────────────────────────┐
│                                      │
│            ✨                         │
│                                      │
│   ContentFlow AI에 오신 것을 환영합니다!│
│                                      │
│   첫 콘텐츠를 생성하여 AI의 힘을      │
│   경험해보세요!                       │
│                                      │
│       [+ 첫 콘텐츠 생성하기]          │
│                                      │
│   또는 [가이드 보기] [샘플 콘텐츠]   │
└──────────────────────────────────────┘
```

**And** 버튼 액션:

- "첫 콘텐츠 생성하기" → 콘텐츠 생성 플로우
- "가이드 보기" → 온보딩 가이드 (선택사항)
- "샘플 콘텐츠" → 데모 콘텐츠 자동 생성 (선택사항)

**And** 다른 빈 상태:

- 검토 대기 0개
- 배포 현황 0개
- 캘린더 이벤트 0개

**Prerequisites:** Story 7.1 완료

**Technical Notes:**

- 조건부 렌더링: `contents.length === 0`
- Shadcn/ui EmptyState 컴포넌트 (커스텀)
- UX Design: Section 7.9 참조

**Estimated Effort:** 3-4시간

---

### Story 7.10: 시스템 상태 모니터링 (관리자용)

**As a** 관리자,
**I want** 시스템 상태를 모니터링할 수 있어,
**So that** 장애를 빠르게 감지하고 대응할 수 있다.

**Acceptance Criteria:**

**Given** 관리자가 관리자 대시보드(`/admin`)에 접속했을 때
**When** 시스템 상태 섹션을 확인하면
**Then** 다음 정보가 표시된다

**And** 1. AI API 상태:

- OpenAI: ● 정상
- Anthropic: ● 정상
- Google: ⚠️ 지연 (응답 시간: 5초)

**And** 2. 작업 큐 상태 (BullMQ):

- 대기 중: 5개
- 진행 중: 3개
- 완료: 1,234개
- 실패: 12개

**And** 3. 데이터베이스:

- 연결 상태: ● 정상
- 쿼리 응답 시간: 50ms

**And** 4. 알림 설정:

- 실패율 20% 초과 시 Slack 알림
- AI API 응답 시간 10초 초과 시 경고

**Prerequisites:** Story 4.11 (비용 추적) 참조

**Technical Notes:**

- Bull Board 통합: `http://localhost:3001/admin/queues`
- Health Check 엔드포인트: `GET /api/health`
- Slack Webhook으로 알림
- Next.js Middleware로 관리자 전용 보호

**Estimated Effort:** 5-6시간

---

**완료된 스토리:** 68/68 ✅

**Epic별 스토리 분포:**

- Epic 1: Foundation - 5개 스토리
- Epic 2: User Authentication - 8개 스토리
- Epic 3: Content Planning Hub - 10개 스토리
- Epic 4: AI Content Generation - 12개 스토리
- Epic 5: Review & Approval - 9개 스토리
- Epic 6: Multi-Channel Distribution - 14개 스토리
- Epic 7: Dashboard & Usage - 10개 스토리

**다음 단계:**

1. ✅ **UX Design 워크플로우 완료** - 인터랙션 상세 추가됨
2. ⏳ **Architecture 워크플로우** - 기술 결정 추가 필요
3. ⏳ **Sprint Planning** - 68개 스토리를 스프린트로 조직
4. ⏳ **Phase 4 Implementation** - 스토리별 개발 시작

**BMad Method 진행:**

- ✅ Phase 1: Discovery & Research 완료
- ✅ Phase 2: PRD 완료
- ✅ Phase 3: Architecture 완료
- ✅ Phase 3.5: Epic Breakdown 완료 (7 Epics, 68 Stories)
- ✅ Phase 3.6: UX Design 완료
- ⏳ Phase 4: Architecture 워크플로우
- ⏳ Phase 5: Sprint Planning & Implementation

---

**문서 버전:** 2.0 (Complete - All 7 Epics)
**최종 수정일:** 2025-11-14
**작성 이력:**

- v1.0 (2025-11-14): PRD 기반 Epic 1-3 작성 (John)
- v2.0 (2025-11-14): UX Design 반영 Epic 4-7 완성 (BMad)
  **다음 업데이트:** Architecture 완료 후 기술 상세 추가

---

## FR 완전 커버리지 검증

**총 52개 FR → 68개 Story 완전 매핑 완료**

### 사용자 계정 & 인증 (FR1-FR5)

- ✅ FR1: 이메일/비밀번호 가입 → Story 2.1
- ✅ FR2: Google 소셜 로그인 → Story 2.2
- ✅ FR3: 비밀번호 재설정 → Story 2.4
- ✅ FR4: 프로필 등록/수정 → Story 2.5, 2.6
- ✅ FR5: 계정 삭제 → Story 2.7

### 콘텐츠 기획 관리 (FR6-FR11)

- ✅ FR6: Google Sheets OAuth 연동 → Story 3.1
- ✅ FR7: 캘린더 Sheets 생성 → Story 3.2
- ✅ FR8: AI 하위 주제 10개 생성 → Story 3.4
- ✅ FR9: 발행 빈도 설정 → Story 3.5
- ✅ FR10: 캘린더 시각화 → Story 3.6
- ✅ FR11: 수동 콘텐츠 생성 트리거 → Story 3.7

### AI 콘텐츠 생성 (FR12-FR20)

- ✅ FR12: 블로그 포스트 자동 생성 → Story 4.6
- ✅ FR13: 멀티 LLM 동시 호출 → Story 4.4
- ✅ FR14: 품질 기준 최고 선택 → Story 4.5
- ✅ FR15: 마크다운 형식 저장 → Story 4.6
- ✅ FR16: 1,500-2,500자 목표 → Story 4.6
- ✅ FR17: 프로필 반영 (업종/톤앤매너) → Story 4.9
- ✅ FR18: SEO 메타 설명 생성 → Story 4.7
- ✅ FR19: SEO 키워드 10개 생성 → Story 4.7
- ✅ FR20: 실시간 진행 상황 확인 → Story 4.8

### 검토 워크플로우 (FR21-FR28)

- ✅ FR21: 생성 완료 실시간 알림 → Story 4.12, 5.7
- ✅ FR22: 검토 대기 목록 → Story 5.1
- ✅ FR23: 검토 UI 열기 → Story 5.2
- ✅ FR24: 마크다운 에디터 & 미리보기 → Story 5.2
- ✅ FR25: 제목/본문 수정 → Story 5.3
- ✅ FR26: 콘텐츠 승인 → Story 5.4
- ✅ FR27: 콘텐츠 거절 (재생성 옵션) → Story 5.5
- ✅ FR28: 품질 피드백 (별점) → Story 5.6

### SNS 계정 연동 (FR29-FR33)

- ✅ FR29: Instagram OAuth 연동 → Story 6.1
- ✅ FR30: Facebook 페이지 연동 → Story 6.2
- ✅ FR31: 네이버 블로그 연동 → Story 6.3
- ✅ FR32: 연동 계정 관리 → Story 6.4
- ✅ FR33: OAuth 토큰 암호화 저장 → Story 6.1, 6.2, 6.3

### 멀티 채널 배포 (FR34-FR40)

- ✅ FR34: 배포 플랫폼 선택 → Story 6.5
- ✅ FR35: 즉시/예약 배포 → Story 6.5
- ✅ FR36: Instagram 자동 게시 → Story 6.6
- ✅ FR37: Facebook 자동 게시 → Story 6.7
- ✅ FR38: 네이버 블로그 HTML 게시 → Story 6.8
- ✅ FR39: 실패 시 3회 재시도 → Story 6.9
- ✅ FR40: 배포 완료 알림 & URL → Story 6.11

### 대시보드 & 분석 (FR41-FR45)

- ✅ FR41: 이번 주/월 통계 → Story 7.2
- ✅ FR42: 검토/배포 현황 표시 → Story 7.1, 7.2
- ✅ FR43: 월간 캘린더 뷰 → Story 7.3
- ✅ FR44: 개별 콘텐츠 상세 정보 → Story 5.2
- ✅ FR45: 기본 분석 (총 개수, 승인율, 트렌드) → Story 7.5

### 사용량 관리 (FR46-FR49)

- ✅ FR46: 월간 생성 횟수 추적 → Story 7.4
- ✅ FR47: 현재 사용량/할당량 표시 → Story 7.4
- ✅ FR48: 80% 도달 경고 알림 → Story 7.4
- ✅ FR49: 100% 초과 시 차단 & 안내 → Story 7.4

### 시스템 관리 (FR50-FR52)

- ✅ FR50: AI API 호출 실패 로깅 → Story 4.11
- ✅ FR51: 작업 큐 모니터링 (Bull Board) → Story 4.2
- ✅ FR52: 장애 시 관리자 이메일 알림 → Story 7.10

---

**✅ 모든 52개 FR이 68개 Story로 완전히 커버되었습니다.**

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document will be updated after Architecture workflow to incorporate technical decisions._
