# ContentFlow AI

> 소상공인과 중소기업을 위한 올인원 콘텐츠 마케팅 자동화 플랫폼

Google Sheets에서 기획하고, AI가 블로그와 SNS 콘텐츠를 생성하며, 모든 채널에 자동 배포합니다.

## 🎯 프로젝트 비전

**SNS-AI** (소상공인 SNS 마케팅) + **ICOP** (블로그 콘텐츠 오케스트레이션)을 통합한 플랫폼입니다.

## 🏗️ 아키텍처

- **Frontend**: Next.js 15.5 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, DB, Storage) + NestJS (Workflow Engine)
- **AI**: Multi-LLM (GPT-4, Claude 3.5, Gemini) + fal.ai (이미지 생성)
- **Queue**: BullMQ + Redis
- **Deploy**: Vercel (Frontend) + Railway (Backend)

자세한 내용은 [Architecture Document](./docs/architecture.md)를 참조하세요.

## 📂 프로젝트 구조

```
contentflow-ai/
├── apps/
│   ├── web/                    # Next.js Frontend
│   └── workflow-engine/        # NestJS Workflow Server
├── packages/
│   ├── shared-types/          # 공유 TypeScript 타입
│   └── database/              # Supabase 스키마 & 마이그레이션
└── docs/                      # 문서
    ├── architecture.md
    ├── project-brief.md
    ├── competitive-analysis.md
    └── market-research.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x 이상
- pnpm 9.x
- Supabase CLI
- Docker (Redis 로컬 실행용)

### Installation

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp apps/web/.env.example apps/web/.env.local
cp apps/workflow-engine/.env.example apps/workflow-engine/.env

# Supabase 로컬 시작
supabase start

# DB 마이그레이션
supabase db push

# Redis 시작 (Docker)
docker run -d -p 6379:6379 redis:7-alpine

# 개발 서버 실행
pnpm dev
```

### 로컬 개발 URL

- Frontend: http://localhost:3000
- Workflow Engine: http://localhost:3001
- Supabase Studio: http://localhost:54323

## 📚 문서

- [프로젝트 개요서](./docs/project-brief.md)
- [기술 아키텍처](./docs/architecture.md)
- [경쟁사 분석](./docs/competitive-analysis.md)
- [시장 조사](./docs/market-research.md)

## 🛠️ Tech Stack

### Frontend
- Next.js 15.5
- TypeScript 5.x
- Tailwind CSS 3.x
- Shadcn/ui
- Supabase JS
- TanStack Query
- Zustand

### Backend
- Supabase (BaaS)
- NestJS 11.x
- BullMQ 5.63.0
- Redis 7.x
- PostgreSQL 15+

### AI Services
- OpenAI GPT-4 Turbo
- Anthropic Claude 3.5 Sonnet
- Google Gemini 2.0 Flash
- fal.ai (FLUX 이미지 생성)

## 🔄 CI/CD

### GitHub Actions Workflow

`.github/workflows/ci.yml`에서 다음 단계를 자동 실행합니다:

1. **Lint & Type Check**: TypeScript 컴파일 및 ESLint 검사
2. **Unit Tests**: Jest 테스트 실행
3. **Build Check**: 전체 앱 빌드 확인
4. **Deploy Frontend** (main 브랜치): Vercel에 자동 배포
5. **Deploy Backend** (main 브랜치): Railway에 자동 배포

### 배포 설정

#### Required GitHub Secrets

GitHub Repository Settings → Secrets and variables → Actions에서 다음 시크릿을 설정하세요:

```
VERCEL_TOKEN          # Vercel 배포 토큰
VERCEL_ORG_ID         # Vercel 조직 ID
VERCEL_PROJECT_ID     # Vercel 프로젝트 ID
RAILWAY_TOKEN         # Railway 배포 토큰
```

#### Vercel 배포 설정

```bash
# Vercel CLI 설치 및 프로젝트 링크
npm i -g vercel
cd apps/web
vercel link

# Vercel 토큰 생성
vercel token create

# 조직 및 프로젝트 ID 확인
cat .vercel/project.json
```

#### Railway 배포 설정

```bash
# Railway CLI 설치 및 프로젝트 초기화
npm i -g @railway/cli
railway login
cd apps/workflow-engine
railway init

# Railway 토큰 생성
railway token create
```

Railway Dashboard에서 다음 환경 변수를 설정하세요:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`
- `FAL_AI_API_KEY`

## 📈 Development Roadmap

### Phase 1: MVP (3-6개월)
- [x] 프로젝트 초기화
- [ ] Supabase Auth + 사용자 프로필
- [ ] Google Sheets 연동
- [ ] AI 콘텐츠 생성 (단일 LLM)
- [ ] 검토 워크플로우
- [ ] SNS 배포 (Instagram, Facebook)
- [ ] 대시보드 UI

### Phase 2: 고도화 (6-12개월)
- [ ] 다중 LLM 비교 기능
- [ ] 이미지 자동 생성
- [ ] 한국 SNS (네이버, 카카오) 연동
- [ ] 고급 분석 대시보드
- [ ] 모바일 앱

## 👥 Team

- **Analyst**: Mary - 비즈니스 분석 & 시장 조사
- **Architect**: Winston - 기술 아키텍처 설계
- **PM**: John - 제품 요구사항 정의

## 📄 License

MIT

## 🤝 Contributing

이 프로젝트는 현재 개발 초기 단계입니다. 기여에 관심이 있으시면 이슈를 열어주세요.

---

**Last Updated**: 2025-11-14
**Version**: 0.1.0 (MVP 개발 중)
