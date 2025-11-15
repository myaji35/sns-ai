# Story 1.1: Monorepo 초기화 및 프로젝트 구조 설정

Status: ready-for-dev

## Story

As a 개발자,
I want Turborepo 기반 Monorepo가 설정되어,
So that Frontend와 Backend를 효율적으로 관리할 수 있다.

## Acceptance Criteria

1. **AC1:** Turborepo Monorepo 구조가 설정되어 `pnpm dev` 실행 시 모든 앱이 동시에 실행된다
   - [Tech Spec AC1 매핑]

2. **AC2:** 프로젝트 루트에 다음 구조가 생성된다:

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

3. **AC3:** TypeScript 컴파일 오류가 없다

4. **AC4:** ESLint + Prettier 설정이 적용된다

5. **AC5:** `.env.example` 파일에 모든 환경 변수가 문서화된다
   - [Tech Spec AC7 매핑]

## Tasks / Subtasks

- [ ] Task 1: Turborepo 프로젝트 초기화 (AC: #1, #2)
  - [ ] `npx create-turbo@latest` 실행하여 기본 구조 생성
  - [ ] `apps/web` 디렉토리 생성 (Next.js 앱 준비)
  - [ ] `apps/workflow-engine` 디렉토리 생성 (NestJS 앱 준비)
  - [ ] `packages/shared-types` 디렉토리 생성
  - [ ] `packages/database` 디렉토리 생성

- [ ] Task 2: pnpm workspace 설정 (AC: #1)
  - [ ] `pnpm-workspace.yaml` 파일 생성
  - [ ] `turbo.json`에 빌드 파이프라인 설정 (`build`, `dev`, `lint` 명령)
  - [ ] 루트 `package.json`에 workspace 스크립트 추가

- [ ] Task 3: TypeScript 공유 설정 (AC: #3)
  - [ ] 루트 `tsconfig.json` 생성 (base config)
  - [ ] `packages/shared-types/tsconfig.json` 생성
  - [ ] `packages/shared-types/package.json` 설정 (exports 필드)
  - [ ] `pnpm install` 실행 및 타입 체크

- [ ] Task 4: ESLint 및 Prettier 설정 (AC: #4)
  - [ ] 루트 `.eslintrc.js` 또는 `eslint.config.js` 생성
  - [ ] `.prettierrc` 파일 생성 (코드 포맷팅 규칙)
  - [ ] `pnpm add -Dw eslint prettier` 설치
  - [ ] `package.json`에 `lint` 스크립트 추가

- [ ] Task 5: 환경 변수 템플릿 작성 (AC: #5)
  - [ ] `.env.example` 파일 생성
  - [ ] 필수 환경 변수 문서화:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `DATABASE_URL`
  - [ ] `.gitignore`에 `.env` 추가 (실제 키는 커밋 금지)

- [ ] Task 6: 로컬 개발 환경 테스트 (AC: #1, #3, #4)
  - [ ] `pnpm install` 전체 의존성 설치
  - [ ] `pnpm build` 실행하여 빌드 확인
  - [ ] `pnpm lint` 실행하여 린팅 확인
  - [ ] `pnpm dev` 실행 (현재는 빈 앱이지만 에러 없이 실행되어야 함)

## Dev Notes

### Architecture Alignment

**Monorepo 구조 (Architecture 문서 참조):**

- **Frontend:** `apps/web` - Next.js 15.5, TypeScript, Tailwind CSS
- **Backend:** `apps/workflow-engine` - NestJS 11.x, TypeScript
- **Shared:** `packages/shared-types` - 공유 TypeScript 인터페이스
- **Database:** `packages/database` - Supabase 마이그레이션 파일

**Turborepo 빌드 파이프라인:**

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

**pnpm workspace 설정:**

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Technical Constraints

**Node.js 버전:**

- 최소 Node.js 20.x 필요 (Next.js 15 요구사항)
- `.nvmrc` 파일 생성 권장: `20.x`

**pnpm 사용 이유:**

- npm/yarn보다 빠른 설치 속도
- Monorepo 최적화 (symlink 기반)
- Disk space 절약 (hard link 사용)

**Turborepo 캐싱:**

- 로컬 빌드 캐시 활성화
- 원격 캐시는 Post-MVP (Vercel Remote Cache 고려)

### Testing Standards

**Manual Test Checklist:**

1. `pnpm install` 실행 시 에러 없이 완료
2. `pnpm build` 실행 시 모든 패키지 빌드 성공
3. `pnpm lint` 실행 시 린팅 에러 없음
4. `pnpm dev` 실행 시 모든 앱 동시 실행 (현재는 빈 앱)
5. TypeScript 타입 체크 통과: `pnpm turbo run type-check`

**Performance Criteria:**

- 전체 빌드 시간 (cold): < 3분
- 증분 빌드 시간 (Turborepo 캐시): < 30초

### Project Structure Notes

**Root 파일 구조:**

```
contentflow-ai/
├── .github/                    # CI/CD workflows (Story 1.5에서 추가)
├── apps/
│   ├── web/                    # Story 1.2에서 초기화
│   └── workflow-engine/        # Story 1.3에서 초기화
├── packages/
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── user.types.ts
│   │   │   ├── content.types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── database/               # Story 1.4에서 Supabase 마이그레이션 추가
│       ├── migrations/
│       └── seed.sql
├── .env.example
├── .gitignore
├── .nvmrc
├── .prettierrc
├── eslint.config.js
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

**packages/shared-types 초기 구조:**

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

// packages/shared-types/src/index.ts
export * from './user.types';
export * from './content.types';
```

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Detailed-Design]
- [Source: docs/architecture.md#System-Components]
- [Source: docs/epics.md#Story-1.1]
- Turborepo 공식 문서: https://turbo.build/repo/docs
- pnpm workspace: https://pnpm.io/workspaces

### First Story in Epic

이 스토리는 Epic 1의 첫 번째 스토리이므로 이전 스토리로부터 계승할 패턴이나 파일이 없습니다. 모든 프로젝트 구조를 처음부터 설정합니다.

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/1-1-monorepo-initialization-and-project-structure.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
