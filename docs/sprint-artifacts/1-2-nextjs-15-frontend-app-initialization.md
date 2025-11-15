# Story 1.2: Next.js 15 Frontend 앱 초기화

Status: ready-for-dev

## Story

As a 개발자,
I want Next.js 15 App Router 기반 Frontend가 설정되어,
So that UI 개발을 시작할 수 있다.

## Acceptance Criteria

1. **AC1:** Next.js 15.5가 App Router 모드로 설정된다
   - [Tech Spec AC2 매핑]

2. **AC2:** Tailwind CSS 3.x가 설정된다

3. **AC3:** Shadcn/ui 초기화 완료 (`npx shadcn-ui@latest init`)

4. **AC4:** `app/` 디렉토리 구조가 생성된다:

   ```
   app/
   ├── (auth)/
   │   ├── login/
   │   └── signup/
   ├── (dashboard)/
   │   └── dashboard/
   └── layout.tsx
   ```

5. **AC5:** localhost:3000 접속 시 "ContentFlow AI" 메인 페이지가 표시된다

6. **AC6:** 반응형 디자인 확인 (모바일, 태블릿, 데스크톱)

## Tasks / Subtasks

- [ ] Task 1: Next.js 15 프로젝트 생성 (AC: #1)
  - [ ] `apps/web` 디렉토리로 이동
  - [ ] `npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"` 실행
  - [ ] App Router 모드 확인 (`app/` 디렉토리 존재)
  - [ ] TypeScript 설정 확인 (`tsconfig.json`)

- [ ] Task 2: Tailwind CSS 설정 (AC: #2)
  - [ ] `tailwind.config.ts` 파일 확인 및 설정
  - [ ] Trust Blue (#0EA5E9) 컬러 테마 추가
  - [ ] `globals.css`에 Tailwind 기본 스타일 확인
  - [ ] Pretendard 폰트 설정 추가

- [ ] Task 3: Shadcn/ui 초기화 (AC: #3)
  - [ ] `npx shadcn-ui@latest init` 실행
  - [ ] `components.json` 설정 확인
  - [ ] `components/ui/` 디렉토리 생성 확인
  - [ ] 기본 컴포넌트 설치 (Button, Card 등)

- [ ] Task 4: App Router 디렉토리 구조 생성 (AC: #4)
  - [ ] `app/(auth)/login/page.tsx` 생성
  - [ ] `app/(auth)/signup/page.tsx` 생성
  - [ ] `app/(dashboard)/dashboard/page.tsx` 생성
  - [ ] `app/layout.tsx` 루트 레이아웃 설정
  - [ ] `app/page.tsx` 메인 페이지 생성

- [ ] Task 5: 메인 페이지 UI 구현 (AC: #5)
  - [ ] "ContentFlow AI" 타이틀 추가
  - [ ] 로고 또는 간단한 헤더 추가
  - [ ] 기본 레이아웃 및 스타일 적용

- [ ] Task 6: 반응형 디자인 테스트 (AC: #6)
  - [ ] 모바일 뷰 확인 (< 640px)
  - [ ] 태블릿 뷰 확인 (640px - 1024px)
  - [ ] 데스크톱 뷰 확인 (> 1024px)
  - [ ] Tailwind responsive breakpoints 활용

- [ ] Task 7: 로컬 개발 서버 실행 및 테스트
  - [ ] `pnpm dev` 실행 (Turborepo workspace에서)
  - [ ] localhost:3000 접속 확인
  - [ ] Hot Module Replacement (HMR) 작동 확인
  - [ ] TypeScript 타입 체크 통과

## Dev Notes

### Architecture Alignment

**Frontend 구조 (Architecture 문서 참조):**

- **Framework:** Next.js 15.5 App Router
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x + Shadcn/ui
- **Font:** Pretendard (한글 최적화)
- **Color Theme:** Trust Blue (#0EA5E9)

**App Router 디렉토리 구조:**

```
apps/web/
├── app/
│   ├── (auth)/           # Route Group (인증 관련)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/      # Route Group (대시보드)
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── layout.tsx        # Root Layout
│   ├── page.tsx          # Home Page
│   └── globals.css       # Global Styles
├── components/
│   └── ui/               # Shadcn/ui components
├── lib/
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Tailwind 설정 (Trust Blue 테마):**

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0EA5E9', // Trust Blue
          50: '#F0F9FF',
          100: '#E0F2FE',
          // ... 나머지 shade
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
    },
  },
};
```

### Technical Constraints

**Next.js 15 요구사항:**

- Node.js 20.x 이상 필수
- React 19.x 사용
- App Router 필수 (Pages Router 사용 불가)

**Shadcn/ui 설정:**

- Radix UI 기반 컴포넌트
- `components/ui/` 디렉토리에 설치
- `lib/utils.ts`에 `cn()` 헬퍼 함수

**반응형 디자인 Breakpoints:**

- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md, lg)
- Desktop: > 1024px (xl, 2xl)

### Testing Standards

**Manual Test Checklist:**

1. `pnpm dev` 실행 시 localhost:3000에서 정상 로드
2. "ContentFlow AI" 타이틀 표시 확인
3. 브라우저 개발자 도구로 반응형 확인
   - Mobile (375px), Tablet (768px), Desktop (1440px)
4. HMR 작동 확인 (코드 수정 후 자동 새로고침)
5. TypeScript 에러 없음 (`pnpm turbo run type-check`)
6. Tailwind 스타일 정상 적용 확인
7. Shadcn/ui 컴포넌트 import 가능 확인

**Performance Criteria:**

- 페이지 초기 로드: < 2초 (Lighthouse)
- HMR 리로드: < 1초
- Lighthouse 점수: 90 이상 (Performance, Accessibility, Best Practices)

### Project Structure Notes

**apps/web 초기 구조:**

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   └── utils.ts
├── public/
│   └── favicon.ico
├── next.config.js
├── tailwind.config.ts
├── components.json
├── tsconfig.json
└── package.json
```

**Route Groups 설명:**

- `(auth)`: URL에 `/auth`가 포함되지 않음 (Next.js Route Group 기능)
- `(dashboard)`: URL에 `/dashboard`가 포함되지 않음
- 실제 URL: `/login`, `/signup`, `/dashboard`

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Detailed-Design]
- [Source: docs/architecture.md#Frontend-Stack]
- [Source: docs/ux-design-specification.md#Design-System]
- [Source: docs/epics.md#Story-1.2]
- Next.js 15 문서: https://nextjs.org/docs
- Shadcn/ui 문서: https://ui.shadcn.com
- Tailwind CSS 문서: https://tailwindcss.com

### Learnings from Previous Story

Story 1.1에서 Turborepo와 pnpm workspace가 설정되었으므로, 이 스토리는 `apps/web` 디렉토리 내에서 작업합니다. `pnpm dev` 실행 시 Turborepo가 모든 앱을 동시에 실행하므로 Frontend만 단독 실행하려면 `pnpm --filter web dev` 사용 가능.

**Prerequisites 체크:**

- Story 1.1 완료 필수 (Monorepo 구조 설정)
- `apps/web` 디렉토리 존재 확인
- pnpm workspace 설정 완료 확인

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/1-2-nextjs-15-frontend-app-initialization.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
