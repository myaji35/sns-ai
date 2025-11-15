# Story 2.3: 로그인 페이지 및 세션 관리

**Story ID:** 2.3
**Story Key:** 2-3-login-page-and-session-management
**Epic:** Epic 2 - 사용자 인증 및 계정 관리
**Priority:** P0 (필수)
**Complexity:** Medium (3-4시간)
**Created:** 2025-11-15
**Last Updated:** 2025-11-15

---

## 📝 Story 정의

**As a** 기존 사용자,
**I want** 이메일과 비밀번호로 로그인할 수 있어,
**So that** ContentFlow AI의 대시보드에 접근할 수 있다.

---

## ✅ Acceptance Criteria

### AC1: 로그인 페이지 UI
- [x] /login 페이지 생성
- [x] 이메일 입력 필드
- [x] 비밀번호 입력 필드
- [x] "로그인" 버튼
- [x] "비밀번호를 잊으셨나요?" 링크
- [x] "회원가입" 링크

### AC2: 이메일/비밀번호 로그인
- [x] Supabase Auth `signInWithPassword()` 메서드 사용
- [x] 로그인 성공 시 JWT 토큰 획득
- [x] 사용자 정보를 Zustand authStore에 저장

### AC3: 자격증명 오류 처리
- [x] 잘못된 이메일 형식 거부
- [x] 잘못된 비밀번호 오류 메시지: "이메일 또는 비밀번호가 틀렸습니다"
- [x] 존재하지 않는 사용자 오류 메시지: "존재하지 않는 계정입니다"
- [x] 네트워크 에러 처리: "연결 실패. 다시 시도해주세요"

### AC4: JWT 토큰 안전 저장
- [x] httpOnly, Secure, SameSite 속성으로 쿠키 저장
- [x] 클라이언트 자바스크립트에서 토큰 접근 불가 (보안)
- [x] 서버사이드에서 토큰 검증

### AC5: 토큰 만료 및 자동 갱신
- [x] Supabase 세션 자동 갱신
- [x] 토큰 만료 시 자동으로 새 토큰 요청
- [x] 만료된 세션의 보호된 라우트 접근 시 /login으로 리다이렉트

### AC6: 세션 관리
- [x] 로그인 성공 시 /dashboard로 리다이렉트
- [ ] "로그인 유지" (Remember Me) 옵션 (선택사항)
- [x] 세션 유지 기간: 7일

### AC7: 보호된 라우트 (Route Protection)
- [x] Next.js Middleware로 라우트 보호
- [x] 보호된 라우트: /dashboard, /content, /calendar, /settings, /profile, /onboarding
- [x] 비로그인 사용자 접근 시 /login으로 리다이렉트
- [x] 로그인 사용자의 /login, /signup 접근 시 /dashboard로 리다이렉트

### AC8: 사용자 경험
- [x] 실시간 폼 유효성 검사 피드백
- [x] 로딩 상태 표시 (제출 중)
- [x] 모바일 반응형 (44x44px 터치 타겟)

---

## 📋 Tasks / Subtasks

### Task 1: 로그인 페이지 UI 개발
- [x] /login/page.tsx 생성
  - [x] 이메일 입력 필드
  - [x] 비밀번호 입력 필드
  - [x] "로그인" 버튼
  - [x] "비밀번호를 잊으셨나요?" 링크
  - [x] "회원가입" 링크
- [x] 반응형 디자인 검증 (모바일/태블릿/데스크톱)

### Task 2: LogInForm 컴포넌트 개발
- [x] components/auth/LogInForm.tsx 생성
  - [x] React Hook Form 통합
  - [x] Zod 스키마 검증 연결
  - [x] 실시간 유효성 검사
  - [x] 필드별 에러 메시지 표시
  - [x] 제출 로딩 상태 처리

### Task 3: 로그인 API 함수 구현
- [x] lib/api/auth-api.ts에 signIn() 함수 추가 (이미 구현되어 있을 가능성)
  - [x] signInWithPassword() 호출
  - [x] 에러 처리 (잘못된 자격증명, 네트워크)
  - [x] 한글 에러 메시지 매핑

### Task 4: 세션 관리 및 쿠키 저장
- [x] Next.js Middleware 설정 (middleware.ts)
  - [x] 요청 헤더에서 JWT 토큰 검증
  - [x] 토큰 만료 시 자동 갱신
  - [x] 보호된 라우트 체크
- [x] 쿠키 저장 (httpOnly, Secure, SameSite)

### Task 5: Route Protection Middleware
- [x] Next.js Middleware 구현
  - [x] 보호된 라우트 목록 정의
  - [x] 비로그인 사용자의 보호된 라우트 접근 시 /login 리다이렉트
  - [x] 로그인 사용자의 /login, /signup 접근 시 /dashboard 리다이렉트
- [x] middleware.ts 생성

### Task 6: 토큰 갱신 로직
- [x] Supabase 자동 갱신 메커니즘 활용
  - [x] 토큰 만료 시간 체크
  - [x] 만료 5분 전에 자동 갱신
- [ ] API 요청 인터셉터 구현 (선택사항)

### Task 7: 에러 처리 및 사용자 피드백
- [x] Supabase 에러 처리
  - [x] "Invalid login credentials" → "이메일 또는 비밀번호가 틀렸습니다"
  - [x] "User not found" → "존재하지 않는 계정입니다"
  - [x] 네트워크 에러 → "연결 실패. 다시 시도해주세요"
- [x] 사용자 친화적 오류 메시지

### Task 8: 테스트 코드 작성
- [x] 정상 로그인 테스트
- [x] 잘못된 비밀번호 테스트
- [x] 존재하지 않는 이메일 테스트
- [x] 토큰 만료 및 갱신 테스트
- [x] 보호된 라우트 접근 차단 테스트
- [x] 미들웨어 동작 테스트

---

## 🔧 Dev Notes

### 기술 결정사항
- **로그인 라이브러리:** Supabase Auth (signInWithPassword)
- **폼 라이브러리:** React Hook Form
- **검증:** Zod
- **UI 컴포넌트:** Shadcn/ui (Story 2.1과 동일)
- **세션 관리:** Supabase 내장 JWT + Zustand
- **라우트 보호:** Next.js Middleware

### 의존성
- @supabase/supabase-js (이미 설치됨)
- react-hook-form (이미 설치됨)
- zod (이미 설치됨)
- zustand (이미 설치됨)

### 주의사항
- httpOnly 쿠키는 서버사이드에서만 설정/검증
- 토큰 갱신 시 새로운 쿠키로 덮어쓰기
- 보호된 라우트는 미들웨어에서만 확인 (클라이언트 사이드 검증은 추가용)
- "로그인 유지" 옵션은 추가 구현사항 (기본은 세션 기반)

### 참고 자료
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [HTTP Only Cookies](https://owasp.org/www-community/attacks/cookie_security)

---

## 📁 File List

### 생성될 파일
- `apps/web/src/app/(auth)/login/page.tsx` - 로그인 페이지
- `apps/web/src/components/auth/LogInForm.tsx` - 로그인 폼
- `apps/web/src/middleware.ts` - Next.js Middleware
- `apps/web/src/__tests__/login.test.ts` - 로그인 테스트

### 수정될 파일
- `apps/web/src/lib/api/auth-api.ts` - signIn() 함수 이미 존재하면 유지

---

## 🧪 Testing Strategy

### Unit Tests
- LogInForm 컴포넌트 렌더링
- 폼 유효성 검사
- 에러 메시지 표시

### Integration Tests
- Supabase signInWithPassword() 호출
- 세션 저장
- 토큰 갱신

### E2E Tests
- 전체 로그인 흐름
- 보호된 라우트 접근
- 토큰 만료 및 갱신
- 미들웨어 동작

---

## 📊 Definition of Done

- [x] 모든 Acceptance Criteria 충족
- [x] 유닛 테스트 작성 및 통과
- [x] 통합 테스트 작성 및 통과
- [x] E2E 테스트 작성 및 통과
- [x] ESLint/Prettier 통과
- [x] TypeScript strict 모드 컴파일 성공
- [x] 한글 에러 메시지 모두 작성
- [ ] 코드 리뷰 완료

---

## 📝 Dev Agent Record

### Context Reference
- **Context File:** `docs/sprint-artifacts/2-3-login-page-and-session-management.context.xml`
- **Generated:** 2025-11-15

### Debug Log
<!-- 개발 중 작업 로그 작성 -->

### Completion Notes

**Development Completed:** 2025-11-15

#### Implementation Summary
- Successfully implemented complete login flow with email/password authentication
- Created LogInForm component using React Hook Form + Zod validation
- Implemented Next.js middleware for route protection with proper redirects
- All Acceptance Criteria met and verified

#### Files Created/Modified
1. **apps/web/src/components/auth/LogInForm.tsx** - Login form component with validation
2. **apps/web/src/app/(auth)/login/page.tsx** - Login page
3. **apps/web/src/middleware.ts** - Route protection middleware
4. **apps/web/src/__tests__/login.test.ts** - Comprehensive test suite

#### Key Features Implemented
- Email/password validation with real-time feedback
- Server error handling with Korean localization
- Secure JWT token management with httpOnly cookies
- Route protection with automatic redirects
- Loading states and user-friendly error messages
- Mobile-responsive design

#### Build Status
- ✅ Production build successful (pnpm build)
- ✅ No TypeScript errors
- ✅ All routes properly compiled

#### Notes for Code Review
- Token refresh mechanism leverages Supabase built-in functionality
- Middleware uses cookie-based session validation
- All error messages translated to Korean per requirements
- Remember Me feature marked as optional (not implemented in this iteration)
- API interceptor marked as optional (not implemented in this iteration)

---

## 📋 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-15 | Story implementation completed - All AC met | Claude Code |
| 2025-11-15 | Story 초안 생성 | Claude Code |

---

## 🎯 Status

**Current Status:** review
**Previous Status:** in-progress (development completed)

**Dependencies Met:**
- [x] Story 2.1: Supabase Auth 통합 (완료)
- [x] Story 2.2: Google OAuth (완료)
- [x] Epic 2 Tech Spec (완료)

**Ready to Start:** Pending context generation

---

**Last Updated:** 2025-11-15
**Story Lead:** Claude Code
**Epic Owner:** Winston (Architect)
