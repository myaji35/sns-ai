# Epic 2: 사용자 인증 및 계정 관리 - 기술 사양

**Epic ID:** 2
**Epic 이름:** 사용자 인증 및 계정 관리 (User Authentication & Account Management)
**생성일:** 2025-11-15
**최종 수정일:** 2025-11-15
**작성자:** Winston (Architect)

---

## 📋 Executive Summary

Epic 2는 ContentFlow AI의 핵심 진입점입니다. 사용자 인증(Authentication), 계정 관리(Account Management), 프로필 설정(Profile Setup)을 구현하여 사용자가 안전하게 가입하고 로그인하며 개인화된 브랜드 정보를 관리할 수 있도록 합니다.

**비즈니스 가치:** 사용자 획득의 첫 번째 단계. 브랜드 정보는 이후 AI 콘텐츠 품질에 직접 영향.

**FR 커버리지:** FR1-FR5 (5개 기능 요구사항)

**스토리 수:** 8개 스토리

**우선순위:** P0 (필수 - Epic 1 완료 후 즉시 진행)

**의존성:**
- Epic 1 완료 필수 (인프라: Next.js, NestJS, Supabase, Database)
- Story 1.2 (Next.js Frontend)
- Story 1.4 (Supabase Database)

---

## 🎯 기술 아키텍처

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자 브라우저                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Frontend (15.5)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Auth Pages:                                          │  │
│  │  - /signup      (회원가입)                            │  │
│  │  - /login       (로그인)                              │  │
│  │  - /reset-password (비밀번호 재설정)                 │  │
│  │  - /forgot-password (비밀번호 찾기)                  │  │
│  │  - /onboarding  (온보딩 - 프로필 설정)                │  │
│  │  - /profile     (프로필 편집)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
                   │ Supabase Auth API
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Auth Service (Managed Authentication)               │  │
│  │  - Email/Password authentication                    │  │
│  │  - OAuth providers (Google)                         │  │
│  │  - JWT token management                            │  │
│  │  - Session management                              │  │
│  │  - Email verification                              │  │
│  │  - Password reset                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                 │  │
│  │  - public.profiles (사용자 프로필)                   │  │
│  │  - public.connected_accounts (외부 계정 연동)       │  │
│  │  - auth.users (Supabase 내부 - 자동 관리)           │  │
│  │  - RLS policies (행 수준 보안)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Realtime (선택사항 - 향후 필요 시)                   │  │
│  │  - Session state updates                           │  │
│  │  - Profile changes                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture (Frontend)

```
/auth 레이아웃
├── (auth)/
│   ├── layout.tsx                 # Auth 페이지 공통 레이아웃
│   ├── signup/
│   │   └── page.tsx              # 회원가입 페이지 (2.1)
│   ├── login/
│   │   └── page.tsx              # 로그인 페이지 (2.3)
│   ├── reset-password/
│   │   └── page.tsx              # 비밀번호 재설정 (2.4)
│   ├── forgot-password/
│   │   └── page.tsx              # 비밀번호 찾기 (2.4)
│   └── callback/
│       └── page.tsx              # OAuth 콜백 처리 (2.2)
│
/(dashboard) 레이아웃
├── onboarding/
│   └── page.tsx                  # 온보딩/프로필 설정 (2.5)
└── profile/
    └── page.tsx                  # 프로필 편집 (2.6)

공유 컴포넌트 (components/)
├── auth/
│   ├── SignUpForm.tsx            # 회원가입 폼 (2.1)
│   ├── LogInForm.tsx             # 로그인 폼 (2.3)
│   ├── ResetPasswordForm.tsx      # 비밀번호 재설정 폼 (2.4)
│   ├── OAuthButtons.tsx           # OAuth 버튼들 (2.2)
│   ├── PasswordStrengthMeter.tsx  # 비밀번호 강도 표시기 (2.1)
│   └── AuthGuard.tsx              # 인증 보호 래퍼 (2.3)
│
├── onboarding/
│   ├── OnboardingForm.tsx         # 3단계 온보딩 폼 (2.5)
│   ├── Step1BasicInfo.tsx         # Step 1: 기본 정보
│   ├── Step2BrandVoice.tsx        # Step 2: 브랜드 보이스
│   └── Step3Complete.tsx          # Step 3: 완료
│
└── profile/
    ├── ProfileForm.tsx            # 프로필 편집 폼 (2.6)
    ├── ProfileAvatar.tsx          # 프로필 사진 (2.6)
    └── DeleteAccount.tsx          # 계정 삭제 (2.7)

라이브러리 (lib/)
├── supabase/
│   ├── client.ts                 # Supabase 클라이언트
│   ├── auth-helpers.ts           # 인증 헬퍼 함수들
│   └── middleware.ts             # Next.js Middleware
│
├── api/
│   ├── auth-api.ts               # 인증 API 호출
│   └── profile-api.ts            # 프로필 API 호출
│
└── schemas/
    ├── auth.schema.ts            # 인증 폼 검증 스키마
    └── profile.schema.ts         # 프로필 검증 스키마

훅 (hooks/)
├── useAuth.ts                    # 인증 상태 훅
├── useProfile.ts                 # 프로필 데이터 훅
└── useAuthForm.ts                # 폼 상태 관리 훅

스토어 (stores/)
└── authStore.ts                  # Zustand 인증 상태 관리
```

---

## 📊 스토리별 기술 명세

### Story 2.1: Supabase Auth 통합 (이메일/비밀번호)

**목표:** 사용자가 이메일과 비밀번호로 계정을 생성할 수 있도록 함

**승인 기준:**
- ✓ Supabase Auth에 새 사용자 생성
- ✓ 비밀번호 정책: 8자 이상, 대문자, 숫자, 특수문자
- ✓ RFC 5322 이메일 검증
- ✓ 가입 후 자동 로그인 및 /dashboard 리다이렉트
- ✓ 이메일 인증 메일 발송
- ✓ 중복 이메일 오류 처리

**기술 스택:**
- Frontend: React Hook Form + Zod 스키마 검증
- Backend: Supabase `signUp()` API
- UI: Shadcn/ui Input, Button, Form components
- 추가 기능:
  - 비밀번호 강도 표시기 (3단계: 약함/보통/강함)
  - 실시간 유효성 검사
  - reCAPTCHA v3 (선택사항)
  - 모바일 반응형 (44x44px 터치 타겟)

**파일 생성:**
- `/signup/page.tsx` - 회원가입 페이지
- `components/auth/SignUpForm.tsx` - 회원가입 폼
- `components/auth/PasswordStrengthMeter.tsx` - 비밀번호 강도 표시
- `lib/schemas/auth.schema.ts` - Zod 검증 스키마
- `lib/api/auth-api.ts` - 인증 API 헬퍼

**테스트 계획:**
- ✓ 유효한 가입 (모든 조건 만족)
- ✓ 약한 비밀번호 거부
- ✓ 중복 이메일 거부
- ✓ 잘못된 이메일 형식 거부
- ✓ 자동 로그인 및 리다이렉트

**소요 시간:** 4-6시간

---

### Story 2.2: Google 소셜 로그인 구현

**목표:** 사용자가 Google 계정으로 로그인할 수 있도록 함

**승인 기준:**
- ✓ Google OAuth 로그인 페이지 표시
- ✓ Google 계정 선택 후 /dashboard 리다이렉트
- ✓ 최초 로그인 시 profiles 테이블에 자동 레코드 생성
- ✓ 이후 로그인 시 기존 프로필 사용
- ✓ 로그인 실패 시 오류 메시지

**기술 스택:**
- Frontend: Supabase Auth 라이브러리
- OAuth Provider: Google Cloud Console OAuth 2.0
- Backend: Supabase Auth Google Provider
- 리다이렉트 URL: `{SUPABASE_URL}/auth/v1/callback`

**파일 생성:**
- `components/auth/OAuthButtons.tsx` - Google 로그인 버튼
- `lib/supabase/oauth-handlers.ts` - OAuth 처리 로직
- Database trigger: 신규 사용자 profiles 레코드 자동 생성

**테스트 계획:**
- ✓ Google 로그인 플로우
- ✓ 신규 사용자 프로필 자동 생성
- ✓ 기존 사용자 로그인 (프로필 유지)
- ✓ OAuth 에러 처리

**소요 시간:** 3-4시간

---

### Story 2.3: 로그인 페이지 및 세션 관리

**목표:** 기존 사용자가 로그인하고 세션이 유지될 수 있도록 함

**승인 기준:**
- ✓ 이메일/비밀번호로 로그인
- ✓ 잘못된 자격증명 오류 처리
- ✓ JWT 토큰 안전하게 저장 (secure httpOnly cookie 권장)
- ✓ 토큰 만료 시 자동 갱신
- ✓ 로그인하지 않은 사용자의 보호된 라우트 접근 시 /login으로 리다이렉트
- ✓ "로그인 유지" 옵션

**기술 스택:**
- Frontend: Supabase `signInWithPassword()`, Next.js Middleware
- Session: JWT 토큰 (Supabase 기본)
- State Management: TanStack Query + Zustand
- Route Protection: Next.js Middleware

**파일 생성:**
- `/login/page.tsx` - 로그인 페이지
- `components/auth/LogInForm.tsx` - 로그인 폼
- `lib/supabase/middleware.ts` - Next.js Middleware (보호된 라우트)
- `hooks/useAuth.ts` - 인증 상태 훅
- `stores/authStore.ts` - Zustand 인증 저장소

**Middleware 로직:**
```typescript
// 보호된 라우트 패턴
const protectedRoutes = ['/dashboard', '/content', '/calendar', '/settings', '/profile', '/onboarding'];

// 1. 세션 확인
// 2. 없으면 /login으로 리다이렉트
// 3. 토큰 만료 시 자동 갱신
```

**테스트 계획:**
- ✓ 정상 로그인
- ✓ 잘못된 비밀번호
- ✓ 존재하지 않는 이메일
- ✓ 토큰 만료 및 갱신
- ✓ 비로그인 사용자의 보호된 라우트 접근 차단

**소요 시간:** 3-4시간

---

### Story 2.4: 비밀번호 재설정 (이메일 인증)

**목표:** 사용자가 잊어버린 비밀번호를 이메일로 재설정할 수 있도록 함

**승인 기준:**
- ✓ "비밀번호를 잊으셨나요?" 링크로 재설정 페이지 이동
- ✓ 이메일 입력 후 재설정 링크 발송
- ✓ 링크 유효시간: 1시간
- ✓ 링크 클릭 시 새 비밀번호 입력 페이지
- ✓ 비밀번호 변경 완료 후 /login으로 리다이렉트
- ✓ 존재하지 않는 이메일도 동일한 응답 (보안)

**기술 스택:**
- Backend: Supabase `resetPasswordForEmail()`, `updateUser()`
- Email: Supabase 내장 이메일 서비스 (또는 자체 Mailpit)
- Token: 임시 토큰 (Supabase 관리)

**파일 생성:**
- `/forgot-password/page.tsx` - 비밀번호 찾기 페이지
- `/reset-password/page.tsx` - 비밀번호 재설정 페이지
- `components/auth/ResetPasswordForm.tsx` - 재설정 폼
- `lib/api/auth-api.ts` - 재설정 API 헬퍼

**이메일 템플릿:**
```
Subject: ContentFlow AI - 비밀번호 재설정

안녕하세요,

다음 링크를 클릭하여 비밀번호를 재설정하세요:
{SITE_URL}/reset-password?token=xxx

이 링크는 1시간 동안 유효합니다.

하지만 이 요청을 하지 않았다면, 이 이메일을 무시하세요.

감사합니다,
ContentFlow AI 팀
```

**테스트 계획:**
- ✓ 이메일 발송
- ✓ 토큰 검증
- ✓ 비밀번호 변경
- ✓ 만료된 토큰 처리
- ✓ 보안: 타이밍 공격 방지

**소요 시간:** 3-4시간

---

### Story 2.5: 프로필 등록 (온보딩)

**목표:** 신규 사용자가 브랜드 정보를 설정하도록 유도

**승인 기준:**
- ✓ 프로필이 비어있으면 /onboarding으로 자동 리다이렉트
- ✓ 3단계 폼 표시
- ✓ Step 1: 브랜드명(필수, 50자), 업종(드롭다운, 20개 옵션)
- ✓ Step 2: 브랜드 설명(선택, 200자), 톤앤매너(체크박스, 4개)
- ✓ Step 3: 확인 및 완료
- ✓ "나중에 설정하기" 옵션
- ✓ 완료 시 "환영합니다!" 메시지 및 /dashboard 리다이렉트

**기술 스택:**
- Form: React Hook Form (멀티스텝)
- State: Zustand (폼 상태 관리)
- Validation: Zod 스키마
- UI: Shadcn/ui components
- Progress: Custom progress bar (1/3, 2/3, 3/3)

**파일 생성:**
- `/onboarding/page.tsx` - 온보딩 페이지
- `components/onboarding/OnboardingForm.tsx` - 폼 컨테이너
- `components/onboarding/Step1BasicInfo.tsx` - Step 1
- `components/onboarding/Step2BrandVoice.tsx` - Step 2
- `components/onboarding/Step3Complete.tsx` - Step 3
- `lib/schemas/profile.schema.ts` - Zod 검증
- `hooks/useOnboarding.ts` - 온보딩 로직 훅

**업종 옵션 (20개):**
```
카페, 레스토랑, 베이커리, 피자, 중식당,
한식당, 일식당, 치킨, 버거, 찜닭,
뷰티(헤어), 뷰티(메이크업), 뷰티(스킨케어), 네일, 에스테틱,
패션(의류), 패션(신발), 패션(가방), 액세서리,
제조업, 서비스업, 교육, 피트니스, 부동산
```

**톤앤매너 옵션 (4개):**
```
친근한, 전문적인, 유머러스한, 진지한
```

**테스트 계획:**
- ✓ 3단계 폼 네비게이션
- ✓ 유효성 검사
- ✓ 폼 상태 저장
- ✓ "나중에 설정하기" 스킵
- ✓ 완료 후 리다이렉트

**소요 시간:** 5-6시간

---

### Story 2.6: 프로필 수정 페이지

**목표:** 사용자가 프로필 정보를 언제든 수정할 수 있도록 함

**승인 기준:**
- ✓ /profile 페이지에 현재 프로필 정보 표시
- ✓ 모든 정보 (브랜드명, 업종, 설명, 톤앤매너) 수정 가능
- ✓ 프로필 사진 업로드/변경
- ✓ "저장" 버튼으로 변경사항 저장
- ✓ 수정 취소 옵션
- ✓ 성공 메시지 표시

**기술 스택:**
- Form: React Hook Form
- Image: Supabase Storage
- Validation: Zod
- State: TanStack Query (캐싱)

**파일 생성:**
- `/profile/page.tsx` - 프로필 수정 페이지
- `components/profile/ProfileForm.tsx` - 프로필 폼
- `components/profile/ProfileAvatar.tsx` - 사진 업로드
- `lib/api/profile-api.ts` - 프로필 API 헬퍼
- `hooks/useProfile.ts` - 프로필 데이터 훅

**이미지 저장:**
```
Storage bucket: "user-profiles"
경로: "{user_id}/avatar.jpg"
크기: 최대 5MB
형식: JPG, PNG, WebP
```

**테스트 계획:**
- ✓ 프로필 정보 로드
- ✓ 정보 수정 및 저장
- ✓ 이미지 업로드
- ✓ 수정 취소
- ✓ 성공 메시지

**소요 시간:** 4-5시간

---

### Story 2.7: 계정 삭제 기능

**목표:** 사용자가 자신의 계정을 삭제할 수 있도록 함

**승인 기준:**
- ✓ /profile 또는 /settings 페이지에 "계정 삭제" 버튼
- ✓ 확인 모달 표시
- ✓ 비밀번호 재입력 요구 (보안)
- ✓ 계정 삭제 시 auth.users 및 profiles 레코드 제거
- ✓ 관련 모든 데이터 삭제 (옵션: 데이터 익스포트 후 삭제)
- ✓ 계정 삭제 후 /login으로 리다이렉트

**기술 스택:**
- Backend: Supabase `admin.auth.deleteUser()` (또는 Trigger)
- Security: 비밀번호 검증
- Confirmation: 확인 모달

**파일 생성:**
- `components/profile/DeleteAccount.tsx` - 계정 삭제 섹션
- `lib/api/profile-api.ts` - 계정 삭제 API 추가

**삭제 정책:**
```
- auth.users 레코드 삭제 (자동 cascade)
- public.profiles 삭제 (ON DELETE CASCADE)
- 관련 모든 데이터 삭제:
  - connected_accounts
  - content_calendar
  - contents
  - job_logs
  - usage_metrics
```

**테스트 계획:**
- ✓ 삭제 확인 모달
- ✓ 비밀번호 검증
- ✓ 계정 삭제
- ✓ 관련 데이터 삭제 확인

**소요 시간:** 2-3시간

---

### Story 2.8: 로그아웃 기능

**목표:** 사용자가 안전하게 로그아웃할 수 있도록 함

**승인 기준:**
- ✓ 대시보드 헤더의 프로필 드롭다운에 "로그아웃" 옵션
- ✓ 로그아웃 클릭 시 세션 종료
- ✓ 토큰 제거 (localStorage/cookie)
- ✓ /login으로 리다이렉트
- ✓ 로그아웃 후 보호된 라우트 접근 불가

**기술 스택:**
- Backend: Supabase `signOut()`
- Storage: localStorage/cookie 정리
- State: Zustand 상태 초기화

**파일 생성:**
- `components/profile/LogoutButton.tsx` - 로그아웃 버튼
- `lib/supabase/auth-helpers.ts` - 로그아웃 헬퍼 함수 추가

**로그아웃 프로세스:**
```
1. Supabase signOut() 호출
2. localStorage/cookie에서 토큰 제거
3. 상태 관리자(Zustand) 초기화
4. /login으로 리다이렉트
```

**테스트 계획:**
- ✓ 로그아웃 버튼 클릭
- ✓ 토큰 삭제 확인
- ✓ 리다이렉트
- ✓ 보호된 라우트 접근 불가

**소요 시간:** 1-2시간

---

## 🗄️ 데이터베이스 스키마

### public.profiles (사용자 프로필)

```sql
-- 이미 생성됨 (Story 1.4에서 생성)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,                      -- 브랜드/회사명 (Story 2.5)
  company_name TEXT,                   -- (대체 필드)
  industry TEXT,                        -- 업종 (Story 2.5)
  brand_description TEXT,               -- 브랜드 설명 (Story 2.5)
  tone_voice TEXT[],                    -- 톤앤매너 배열 (Story 2.5)
  avatar_url TEXT,                      -- 프로필 사진 URL (Story 2.6)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (이미 설정됨)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### public.connected_accounts (이미 존재, 참고용)

```sql
-- Story 2.2에서 사용: OAuth 토큰 저장
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'google_sheets', 'instagram', 'facebook', 'google'
  account_name TEXT,
  access_token TEXT NOT NULL, -- 암호화된 토큰
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, account_name)
);
```

---

## 🔐 보안 고려사항

### 1. 비밀번호 정책
- 최소 8자 이상
- 대문자 1개 이상
- 숫자 1개 이상
- 특수문자 1개 이상
- Supabase가 자동으로 enforcing

### 2. 토큰 관리
- JWT 토큰은 Supabase가 자동 관리
- Refresh token으로 자동 갱신 (만료 시)
- Secure HTTPOnly cookie 권장 (XSS 방지)
- 또는 In-Memory 저장 (SSR 환경에서는 주의)

### 3. OAuth 보안
- Google Cloud Console에서 인증된 리다이렉트 URI만 허용
- State 파라미터로 CSRF 공격 방지 (Supabase가 자동 처리)
- HTTPS만 사용

### 4. 비밀번호 재설정
- 1시간 유효 기한 (조정 가능)
- 일회용 토큰
- 타이밍 공격 방지 (동일한 응답 시간)

### 5. 이메일 검증
- RFC 5322 표준 검증
- 가입 후 이메일 검증 메일 발송 (선택: 강제 검증)
- reCAPTCHA v3 고려 (봇 방지)

### 6. 계정 삭제
- 비밀번호 재입력 요구
- 확인 단계 (실수 방지)
- Cascade delete로 관련 데이터 자동 삭제

---

## 📱 모바일 최적화

- 터치 타겟: 최소 44x44px
- 뷰포트 메타 태그: `width=device-width, initial-scale=1`
- 반응형 폼 (모바일 우선)
- 소프트 키보드 고려 (input focus시 페이지 스크롤)

---

## 🧪 테스트 전략

### Unit Tests
- 비밀번호 유효성 검사
- 이메일 형식 검증
- 폼 상태 관리

### Integration Tests
- Supabase Auth API 호출
- 데이터베이스 쓰기/읽기
- OAuth 플로우

### E2E Tests (선택사항)
- Playwright 또는 Cypress
- 전체 회원가입 흐름
- 로그인 후 보호된 라우트 접근

---

## 📚 구현 순서

1. **Story 2.1** (4-6h): 이메일/비밀번호 회원가입
2. **Story 2.3** (3-4h): 로그인 + 세션 관리 (2.1 기반)
3. **Story 2.4** (3-4h): 비밀번호 재설정 (2.1, 2.3 기반)
4. **Story 2.2** (3-4h): Google OAuth (2.3 기반)
5. **Story 2.5** (5-6h): 온보딩/프로필 설정 (2.3 기반)
6. **Story 2.6** (4-5h): 프로필 편집 (2.5 기반)
7. **Story 2.7** (2-3h): 계정 삭제 (2.6 기반)
8. **Story 2.8** (1-2h): 로그아웃 (2.3 기반)

**총 예상 시간:** 26-35시간 (약 3.5-4.5일, 팀 규모에 따라)

---

## 📋 검수 기준 (DoD - Definition of Done)

- [ ] 모든 스토리 승인 기준 만족
- [ ] 유닛 테스트 작성 및 통과
- [ ] 통합 테스트 작성 및 통과
- [ ] ESLint/Prettier 통과
- [ ] TypeScript strict 모드 컴파일 성공
- [ ] 코드 리뷰 완료
- [ ] 모든 페이지 반응형 검증 (모바일/태블릿/데스크톱)
- [ ] 보안 검사 (OWASP Top 10)
- [ ] 성능 검사 (First Contentful Paint < 2초)
- [ ] 접근성 검사 (WCAG 2.1 AA)
- [ ] CI/CD 파이프라인 통과
- [ ] 문서화 완료

---

**작성일:** 2025-11-15
**검토자:** Winston (Architect)
**상태:** Ready for Story Development
