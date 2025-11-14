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
- (예정) UX Design 후: 인터랙션 상세 추가
- (예정) Architecture 후: 기술 결정 추가

---

## FR 커버리지 매트릭스

**총 52개 FR → 7개 Epic → 68개 Story**

| Epic | FR 커버리지 | 스토리 수 |
|------|-----------|----------|
| Epic 1: Foundation | 인프라 전제조건 | 5 |
| Epic 2: User Authentication | FR1-FR5 | 8 |
| Epic 3: Content Planning Hub | FR6-FR11 | 10 |
| Epic 4: AI Content Generation | FR12-FR20 | 12 |
| Epic 5: Review & Approval | FR21-FR28 | 9 |
| Epic 6: Multi-Channel Distribution | FR29-FR40 | 14 |
| Epic 7: Dashboard & Usage | FR41-FR52 | 10 |

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

## Epic 4~7: 추가 예정

**Epic 4: AI 콘텐츠 생성 엔진** (FR12-FR20) - 12개 스토리 예정
**Epic 5: 검토 및 승인 워크플로우** (FR21-FR28) - 9개 스토리 예정
**Epic 6: 멀티 채널 배포** (FR29-FR40) - 14개 스토리 예정
**Epic 7: 대시보드 및 사용량 관리** (FR41-FR52) - 10개 스토리 예정

이 에픽들은 UX Design 및 Architecture 워크플로우 이후에 상세화됩니다.

---

## 현재 상태 요약

**완료된 에픽:** 3/7
**완료된 스토리:** 23/68

**다음 단계:**
1. UX Design 워크플로우 실행 → UI/UX 상세 추가
2. Architecture 워크플로우 실행 → 기술 상세 추가
3. 나머지 Epic 4~7 스토리 작성

**BMad Method 진행:**
- ✅ Phase 1: Discovery & Research 완료
- ✅ Phase 2: PRD 완료
- ✅ Phase 3: Architecture 완료
- 🔄 Phase 3.5: Epic Breakdown (진행 중 - Epic 1~3 완료)
- ⏳ Phase 4: UX Design
- ⏳ Phase 5: Sprint Planning & Implementation

---

**문서 버전:** 1.0 (Partial - Epic 1~3)
**최종 수정일:** 2025-11-14
**다음 업데이트:** UX Design 완료 후