# ContentFlow AI - Product Requirements Document

**Author:** BMad
**Date:** 2025-11-14
**Version:** 1.0
**Track:** BMad Method

---

## Executive Summary

ContentFlow AI는 소상공인과 중소기업이 **내실있고 자연스러운 콘텐츠**를 자동으로 생성하여 블로그와 SNS에 배포할 수 있도록 돕는 올인원 마케팅 자동화 플랫폼입니다.

**핵심 문제:** 771만 개 중소기업/소상공인의 70%가 "콘텐츠 생성의 어려움" 때문에 SNS 마케팅을 효과적으로 활용하지 못하고 있습니다.

**우리의 솔루션:** Google Sheets에서 주제를 기획하면, AI가 여러 모델을 동시에 사용해 최고 품질의 콘텐츠를 생성하고, 사업자가 검토 후 승인하면 모든 채널에 자동 배포됩니다.

**핵심 가치 제안:**
> "AI가 콘텐츠를 만들지만, 내 브랜드의 목소리는 내가 지킨다"

### What Makes This Special

**이 제품의 결정적 차별화 요소는 "내실있고 자연스러운 콘텐츠의 자동 생성" 능력입니다.**

대부분의 AI 콘텐츠 도구는:
- ❌ 천편일률적이고 로봇 같은 글을 생성
- ❌ 사용자가 손을 많이 봐야 함
- ❌ 브랜드 톤앤매너를 반영하지 못함

**ContentFlow AI는:**
- ✅ **멀티 LLM 오케스트레이션** - GPT-4, Claude 3.5, Gemini 2.0을 동시 호출해 최고 품질 선택
- ✅ **브랜드 학습** - 사용할수록 업종, 톤, 스타일을 학습하여 "우리다운" 글 생성
- ✅ **검토 후 자동화** - 완전 자동이 아닌, 사업자가 통제권을 유지하는 반자동화
- ✅ **Google Sheets 기획 관리** - 익숙한 도구로 손쉽게 콘텐츠 계획 수립
- ✅ **블로그 + SNS 통합** - 하나의 워크플로우로 모든 채널 커버

**사용자의 "Aha Moment":**
> "처음 AI가 만든 콘텐츠를 봤는데, 수정할 게 거의 없어서 그냥 바로 게시했다"

---

## Project Classification

**Technical Type:** SaaS B2B Web Application
**Domain:** Marketing Automation + AI Content Generation
**Complexity:** Medium

**기술적 특성:**
- Next.js 15 Frontend (App Router)
- Supabase Backend (Auth, DB, Storage)
- NestJS Workflow Engine (BullMQ + Redis)
- Multi-LLM Integration (OpenAI, Anthropic, Google)
- Multi-platform Distribution (Instagram, Facebook, Naver, Kakao, WordPress)

**도메인 특성:**
- **타겟 고객:** 한국 소상공인/중소기업 (771만 개 사업체)
- **시장 규모:** SAM 약 7,700억-8,100억 원/년
- **경쟁 강도:** 낮음 (한국 특화 AI+SNS 통합 솔루션 부재)
- **성장성:** AI 콘텐츠 시장 CAGR 30-47% 초고속 성장

---

## Success Criteria

### Product Success (제품 성공 지표)

**핵심 성공 지표는 "콘텐츠 품질"입니다.**

#### 1. 콘텐츠 품질 지표 (최우선)

| 지표 | MVP 목표 | 측정 방법 |
|------|---------|----------|
| **바로 게시 승인율** | 70% 이상 | 검토 UI에서 "수정 없이 승인" 비율 |
| **사용자 만족도 (콘텐츠 품질)** | 4.0/5.0 이상 | 검토 후 별점 피드백 |
| **AI 생성 콘텐츠 vs 사람 구분 불가율** | 60% 이상 | 블라인드 테스트 |
| **재사용률** | 80% 이상 | 1회 사용 후 다음 달 지속 사용 비율 |

#### 2. 사용자 채택 지표

| 지표 | MVP (6개월) | Year 1 |
|------|------------|--------|
| **활성 사용자** | 100명 | 1,000명 |
| **주간 콘텐츠 생성** | 사용자당 2-3개 | 사용자당 5-10개 |
| **사용자 유지율 (30일)** | 70% | 80% |

#### 3. 비즈니스 지표

| 지표 | MVP | Year 1 |
|------|-----|--------|
| **월 반복 수익 (MRR)** | 3.5M KRW | 42M KRW |
| **평균 ARPU** | 35,000원/월 | 42,000원/월 |
| **CAC (고객 확보 비용)** | 30,000원 이하 | 25,000원 이하 |
| **LTV/CAC 비율** | 15 이상 | 20 이상 |

### Success Definition

**MVP가 성공했다고 판단하는 기준:**

1. ✅ **품질 검증:** 베타 사용자의 70% 이상이 "AI 콘텐츠가 기대 이상"이라고 평가
2. ✅ **습관 형성:** 사용자가 월 평균 8-12개 콘텐츠를 지속 생성
3. ✅ **입소문:** NPS (Net Promoter Score) 50 이상
4. ✅ **비즈니스:** 3개월 내 100명 유료 전환, MRR 3.5M 달성

**실패 시나리오 (피해야 할):**
- ❌ 콘텐츠 품질 불만으로 인한 이탈 (승인율 50% 미만)
- ❌ "손이 너무 많이 간다"는 피드백 과다
- ❌ 경쟁사 대비 차별화 없음

---

## Product Scope

### MVP - Minimum Viable Product (3-6개월)

**MVP의 핵심 철학: "내실있고 자연스러운 콘텐츠 자동 생성"을 검증하는 최소 기능**

#### 필수 기능 (Must Have)

**1. 콘텐츠 기획 허브**
- Google Sheets 연동으로 콘텐츠 캘린더 관리
- 메인 주제 입력 → AI가 하위 주제 10개 자동 생성
- 주간/월간 자동 발행 스케줄링

**2. AI 콘텐츠 생성 엔진 (핵심!)**
- **멀티 LLM 동시 호출:** GPT-4 Turbo, Claude 3.5 Sonnet, Gemini 2.0 Flash
- **품질 우선 전략:** 3개 결과 중 최고만 선택 (속도 < 품질)
- **블로그 포스트 생성:** 마크다운 형식, 1,500-2,500자
- **SEO 최적화:** 메타 설명 + 키워드 10개 자동 생성
- **톤앤매너 학습:** 업종, 브랜드 정보 입력 → 스타일 반영

**3. 검토 워크플로우**
- 생성된 콘텐츠를 검토 UI에서 확인
- 수정 기능 (제목, 본문 편집)
- 승인/거절 버튼
- 실시간 알림: "새 콘텐츠가 검토 대기 중입니다"

**4. 멀티 채널 배포 (기본 플랫폼)**
- Instagram (이미지 + 캡션)
- Facebook (텍스트 포스트)
- 네이버 블로그 (선택 - 한국 시장 중요)
- 예약 배포 기능 (시간 지정)

**5. 대시보드**
- 콘텐츠 캘린더 뷰
- 검토 대기 목록
- 배포 현황
- 기본 분석 (생성 개수, 승인율)

**6. 사용자 계정 & 인증**
- 이메일/비밀번호 가입
- Google 소셜 로그인
- 프로필 설정 (업종, 브랜드명, 톤앤매너)

#### MVP에서 제외 (Post-MVP)

- ❌ 이미지 자동 생성 (fal.ai) → Phase 2
- ❌ 3개 LLM 초안 비교 UI → Phase 2
- ❌ X (Twitter), Threads, 카카오 스토리 → Phase 2
- ❌ 고급 분석 (인게이지먼트, ROI) → Phase 2
- ❌ 팀 협업 기능 → Phase 2
- ❌ 모바일 앱 → Phase 3

### Growth Features (Post-MVP, 6-12개월)

**Phase 2A: 콘텐츠 품질 고도화**
- 이미지 자동 생성 (fal.ai FLUX) - 썸네일 + 본문 이미지 5-10개
- 3개 LLM 초안 비교 UI - 사용자가 직접 선택 또는 통합
- A/B 테스트 기능 - 2가지 버전 생성 → 성과 비교
- 브랜드 보이스 파인튜닝 - 과거 콘텐츠 학습

**Phase 2B: 플랫폼 확장**
- 추가 SNS: X (Twitter), Threads, 카카오 스토리
- WordPress 자동 배포
- LinkedIn (B2B 기업용)

**Phase 2C: 분석 & 최적화**
- 고급 분석 대시보드
  - 플랫폼별 인게이지먼트
  - 최고 성과 콘텐츠 유형 분석
  - ROI 추정
- 성과 기반 자동 최적화
  - 어떤 LLM이 우리 업종에 맞는지 학습
  - 어떤 주제/스타일이 반응 좋은지 추천

### Vision (Future, 12개월+)

**Phase 3: 완전한 마케팅 오케스트레이션**
- 모바일 앱 (iOS, Android)
- 영상 콘텐츠 생성 (Shorts, Reels)
- 이메일 마케팅 통합
- 가망 고객 추적 시스템 (CRM 라이트)
- 고객 리뷰 자동 응답
- 멀티 브랜드 관리 (대행사용)

---

## SaaS B2B Specific Requirements

### Multi-Tenancy Architecture

**데이터 격리:**
- Supabase Row Level Security (RLS)로 완벽한 사용자 데이터 격리
- 사용자 A는 사용자 B의 콘텐츠를 절대 볼 수 없음
- PostgreSQL 수준 권한 제어 (애플리케이션 버그로 우회 불가)

**테넌트 모델:**
- 1 사용자 = 1 테넌트 (MVP)
- Future: 1 회사 = 1 테넌트, 여러 사용자 (팀 기능)

### Permissions & Roles

**MVP 역할 (단순):**
- **Owner:** 계정 소유자 (모든 권한)

**Future 역할:**
- Admin: 팀 관리 + 모든 콘텐츠 관리
- Editor: 콘텐츠 생성, 검토, 배포
- Viewer: 읽기 전용

### Authentication & Authorization

**인증 방법:**
- Supabase Auth 사용
- 이메일/비밀번호
- OAuth 소셜 로그인 (Google)

**토큰 보안:**
- 외부 SNS OAuth 토큰: Supabase Vault에 암호화 저장
- JWT 기반 세션 관리
- 토큰 자동 갱신 (Refresh Token)

### API Specification (Internal)

**Frontend ↔ Supabase:**
- Supabase JS SDK 사용
- Realtime subscriptions (검토 대기 알림)

**Frontend ↔ Workflow Engine:**
- Next.js API Routes → NestJS REST API
- 주요 엔드포인트:
  - `POST /api/content/generate` - 콘텐츠 생성 작업 큐 추가
  - `POST /api/content/distribute` - 배포 작업 큐 추가
  - `GET /api/jobs/:id/status` - 작업 진행 상황 조회

### Subscription & Billing

**MVP 가격 정책:**

| 플랜 | 가격 | 콘텐츠 생성 | 배포 플랫폼 |
|------|------|------------|-----------|
| **Free Trial** | 0원 (14일) | 5개 | 모든 플랫폼 |
| **Starter** | 35,000원/월 | 20개/월 | 3개 플랫폼 |
| **Growth** | 75,000원/월 | 60개/월 | 모든 플랫폼 + 이미지 |
| **Pro** | 150,000원/월 | 150개/월 | 모든 기능 + 우선 지원 |

**사용량 추적:**
- `usage_metrics` 테이블에 실시간 기록
- 월 할당량 초과 시 알림
- 추가 사용량: 건당 과금 옵션

---

## User Experience Principles

**UX 철학: "복잡한 기술, 간단한 사용"**

### 핵심 UX 원칙

1. **Zero Learning Curve (학습 불필요)**
   - 처음 사용자도 5분 안에 첫 콘텐츠 생성
   - 온보딩 3단계: 업종 선택 → 브랜드 정보 입력 → 첫 주제 입력

2. **Familiar Tools (익숙한 도구)**
   - Google Sheets로 콘텐츠 기획 (스프레드시트 익숙도 활용)
   - 워드프로세서처럼 직관적인 검토 UI

3. **Instant Feedback (즉각적 피드백)**
   - 작업 진행 상황 실시간 표시
   - "AI가 글을 쓰고 있습니다..." 프로그레스 바
   - 완료 즉시 알림

4. **Control & Trust (통제권 & 신뢰)**
   - 모든 콘텐츠는 검토 후 게시 (강제)
   - 수정 기능 항상 제공
   - "AI 제안"이지 "AI 강요"가 아님

5. **Korean First (한국 최적화)**
   - 모든 UI 한글
   - 한국 SNS 플랫폼 우선 (네이버, 카카오)
   - 한국 비즈니스 문화 반영

### Key Interactions

**1. 콘텐츠 생성 플로우 (핵심 UX)**

```
Step 1: 주제 입력
[Google Sheets에서 메인 주제 입력] → Sheets 자동 감지

Step 2: AI 생성 시작
[대시보드에 "생성 중" 카드 표시]
- "AI가 3개 모델로 콘텐츠를 생성하고 있습니다..."
- 예상 시간: 30-60초

Step 3: 검토 알림
[브라우저 알림] "새 콘텐츠가 준비되었습니다!"
→ 검토 페이지로 자동 이동

Step 4: 검토 & 편집
[Split View]
- 왼쪽: AI 생성 콘텐츠 (마크다운 에디터)
- 오른쪽: 미리보기
- 하단: [승인] [수정 후 승인] [거절] 버튼

Step 5: 배포 확인
[배포 설정 모달]
- 플랫폼 선택: ☑ Instagram ☑ Facebook ☑ 네이버
- 예약 시간: "지금 바로" | "예약 설정"
- [배포하기] 버튼

Step 6: 완료
[대시보드에 "배포 완료" 표시]
- 각 플랫폼 URL 링크 제공
```

**2. 대시보드 레이아웃**

```
┌─────────────────────────────────────────────────┐
│ [ContentFlow AI 로고]   [알림] [설정] [프로필] │
├─────────────────────────────────────────────────┤
│ 📊 이번 주 현황                                 │
│   생성: 12개 | 검토 대기: 3개 | 배포: 9개       │
├─────────────────────────────────────────────────┤
│ 🔔 검토 대기 (3)            [모두 보기 →]      │
│   ┌───────────────────────────────┐             │
│   │ "여름 신메뉴 소개"             │             │
│   │ AI 생성 완료 - 5분 전          │             │
│   │ [검토하기]                     │             │
│   └───────────────────────────────┘             │
├─────────────────────────────────────────────────┤
│ 📅 콘텐츠 캘린더                                │
│   [월] [화] [수] [목] [금] [토] [일]           │
│    ●   ●        ●    ●              (게시 예정) │
├─────────────────────────────────────────────────┤
│ ✨ [새 콘텐츠 생성하기] 버튼                    │
└─────────────────────────────────────────────────┘
```

**3. 검토 UI (가장 중요한 화면)**

**목표:** 사용자가 30초 안에 콘텐츠 품질 판단

- 깔끔한 마크다운 에디터
- 실시간 미리보기
- 품질 지표 표시:
  - "이 글은 Claude 3.5 모델로 생성되었습니다"
  - "SEO 점수: 85/100"
  - "가독성: 높음"
- 빠른 편집 툴바 (제목 변경, 강조 추가 등)

---

## Functional Requirements

### 사용자 계정 & 인증 (User Account)

**FR1:** 사용자는 이메일과 비밀번호로 계정을 생성할 수 있다
**FR2:** 사용자는 Google 계정으로 소셜 로그인할 수 있다
**FR3:** 사용자는 비밀번호를 이메일 인증으로 재설정할 수 있다
**FR4:** 사용자는 프로필 정보를 등록/수정할 수 있다 (업종, 브랜드명, 브랜드 설명, 톤앤매너)
**FR5:** 사용자는 자신의 계정을 삭제할 수 있다

### 콘텐츠 기획 관리 (Content Planning)

**FR6:** 사용자는 Google Sheets 계정을 연동할 수 있다 (OAuth)
**FR7:** 사용자는 Google Sheets에서 콘텐츠 캘린더를 생성할 수 있다
**FR8:** 사용자는 Sheets에 메인 주제를 입력하면 AI가 하위 주제 10개를 자동 생성하여 Sheets에 작성한다
**FR9:** 사용자는 콘텐츠 발행 빈도를 설정할 수 있다 (주간, 월간)
**FR10:** 사용자는 대시보드에서 콘텐츠 캘린더를 시각화하여 볼 수 있다
**FR11:** 사용자는 특정 주제의 콘텐츠 생성을 수동으로 트리거할 수 있다

### AI 콘텐츠 생성 (AI Content Generation)

**FR12:** 시스템은 하위 주제를 기반으로 블로그 포스트를 자동 생성한다
**FR13:** 시스템은 3개 LLM(GPT-4 Turbo, Claude 3.5 Sonnet, Gemini 2.0 Flash)을 동시에 호출한다
**FR14:** 시스템은 3개 생성 결과 중 품질 기준으로 최고의 콘텐츠를 자동 선택한다
**FR15:** 생성된 콘텐츠는 마크다운 형식으로 저장된다
**FR16:** 콘텐츠 길이는 1,500-2,500자를 목표로 한다
**FR17:** 시스템은 사용자 프로필의 업종과 톤앤매너 정보를 반영하여 콘텐츠를 생성한다
**FR18:** 시스템은 SEO 메타 설명을 자동 생성한다
**FR19:** 시스템은 SEO 키워드 10개를 자동 생성한다
**FR20:** 사용자는 콘텐츠 생성 진행 상황을 실시간으로 확인할 수 있다

### 검토 워크플로우 (Review Workflow)

**FR21:** 콘텐츠 생성 완료 시 사용자에게 실시간 알림이 전송된다
**FR22:** 사용자는 검토 대기 중인 콘텐츠 목록을 볼 수 있다
**FR23:** 사용자는 개별 콘텐츠를 검토 UI에서 열어볼 수 있다
**FR24:** 검토 UI는 마크다운 에디터와 미리보기를 동시에 표시한다
**FR25:** 사용자는 콘텐츠의 제목과 본문을 직접 수정할 수 있다
**FR26:** 사용자는 콘텐츠를 승인할 수 있다
**FR27:** 사용자는 콘텐츠를 거절할 수 있다 (재생성 옵션 제공)
**FR28:** 사용자는 승인 시 품질 피드백(별점 1-5)을 남길 수 있다

### SNS 계정 연동 (SNS Integration)

**FR29:** 사용자는 Instagram 계정을 연동할 수 있다 (Instagram Graph API OAuth)
**FR30:** 사용자는 Facebook 페이지를 연동할 수 있다
**FR31:** 사용자는 네이버 블로그 계정을 연동할 수 있다
**FR32:** 사용자는 연동된 계정 목록을 관리할 수 있다 (활성화/비활성화, 삭제)
**FR33:** 시스템은 연동 계정의 OAuth 토큰을 안전하게 암호화하여 저장한다

### 멀티 채널 배포 (Multi-Channel Distribution)

**FR34:** 사용자는 콘텐츠 승인 시 배포할 SNS 플랫폼을 선택할 수 있다
**FR35:** 사용자는 즉시 배포 또는 예약 배포(날짜/시간 지정)를 선택할 수 있다
**FR36:** 시스템은 Instagram에 이미지와 캡션을 자동 게시한다
**FR37:** 시스템은 Facebook에 텍스트 포스트를 자동 게시한다
**FR38:** 시스템은 네이버 블로그에 마크다운 콘텐츠를 HTML로 변환하여 게시한다
**FR39:** 배포 실패 시 시스템은 최대 3회 자동 재시도한다
**FR40:** 배포 완료 시 사용자에게 알림이 전송되고 각 플랫폼 URL이 제공된다

### 대시보드 & 분석 (Dashboard & Analytics)

**FR41:** 사용자는 대시보드에서 이번 주/월 생성 콘텐츠 통계를 볼 수 있다
**FR42:** 사용자는 검토 대기, 배포 완료 콘텐츠 현황을 한눈에 볼 수 있다
**FR43:** 사용자는 콘텐츠 캘린더 뷰에서 월간 발행 계획을 확인할 수 있다
**FR44:** 사용자는 개별 콘텐츠의 상세 정보를 조회할 수 있다 (생성 일시, 사용된 LLM, 배포 플랫폼)
**FR45:** 사용자는 기본 분석 데이터를 볼 수 있다 (총 생성 개수, 승인율, 주간 트렌드)

### 사용량 관리 (Usage Management)

**FR46:** 시스템은 사용자의 월간 콘텐츠 생성 횟수를 추적한다
**FR47:** 사용자는 현재 사용량과 플랜 할당량을 대시보드에서 확인할 수 있다
**FR48:** 할당량 80% 도달 시 사용자에게 경고 알림이 전송된다
**FR49:** 할당량 초과 시 콘텐츠 생성이 차단되고 업그레이드 안내가 표시된다

### 시스템 관리 (System Management)

**FR50:** 시스템은 모든 AI API 호출 실패를 로그에 기록한다
**FR51:** 시스템은 작업 큐의 진행 상황을 모니터링할 수 있는 관리자 UI를 제공한다 (Bull Board)
**FR52:** 시스템은 장애 발생 시 관리자에게 이메일 알림을 전송한다

---

## Non-Functional Requirements

### Performance

**콘텐츠 생성 속도:**
- **NFR1:** AI 콘텐츠 생성은 평균 60초 이내 완료되어야 한다 (멀티 LLM 동시 호출)
- **NFR2:** 하위 주제 10개 생성은 30초 이내 완료되어야 한다

**페이지 로딩:**
- **NFR3:** 대시보드 초기 로딩은 2초 이내 완료되어야 한다 (Lighthouse 점수 90 이상)
- **NFR4:** 검토 UI 로딩은 1초 이내 완료되어야 한다

**동시 사용자:**
- **NFR5:** MVP는 최소 100명 동시 사용자를 지원해야 한다
- **NFR6:** Year 1은 최소 500명 동시 사용자를 지원해야 한다

### Security

**인증 & 권한:**
- **NFR7:** 모든 API 엔드포인트는 인증된 사용자만 접근 가능해야 한다
- **NFR8:** Supabase RLS로 사용자 간 데이터 완전 격리가 보장되어야 한다

**데이터 암호화:**
- **NFR9:** SNS OAuth 토큰은 Supabase Vault에 암호화 저장되어야 한다
- **NFR10:** 모든 통신은 HTTPS로 암호화되어야 한다

**API 보안:**
- **NFR11:** AI API 키는 환경 변수로 관리되며 클라이언트에 노출되지 않아야 한다
- **NFR12:** Rate Limiting이 적용되어야 한다 (사용자당 시간당 콘텐츠 생성 제한)

### Scalability

**데이터베이스:**
- **NFR13:** PostgreSQL 커넥션 풀링(Supavisor)을 사용하여 DB 연결을 효율적으로 관리한다
- **NFR14:** DB 쿼리는 인덱스를 활용하여 최적화되어야 한다

**작업 큐:**
- **NFR15:** BullMQ는 최소 5개 동시 작업 처리를 지원해야 한다 (워커 concurrency)
- **NFR16:** Redis 메모리 사용량은 모니터링되어야 한다

**AI API 비용 최적화:**
- **NFR17:** 동일 주제 재생성 시 이전 결과를 캐시에서 참조할 수 있다 (선택사항)

### Reliability

**가용성:**
- **NFR18:** 시스템 가동시간은 99.5% 이상이어야 한다 (월 3.6시간 이하 다운타임)

**재시도 로직:**
- **NFR19:** AI API 호출 실패 시 지수 백오프로 최대 3회 자동 재시도한다
- **NFR20:** 3회 실패 시 다른 LLM으로 자동 전환(Fallback)한다

**데이터 무결성:**
- **NFR21:** 모든 콘텐츠 생성/배포 작업은 job_logs 테이블에 기록되어야 한다
- **NFR22:** 배포 실패 시 사용자에게 명확한 오류 메시지가 표시되어야 한다

### Usability

**접근성:**
- **NFR23:** 웹 접근성 WCAG 2.1 Level AA 기준을 준수해야 한다
- **NFR24:** 모든 UI 텍스트는 한글이어야 한다

**반응형 디자인:**
- **NFR25:** 웹 UI는 데스크톱, 태블릿, 모바일에서 정상 작동해야 한다

**브라우저 호환성:**
- **NFR26:** Chrome, Safari, Firefox, Edge 최신 2개 버전을 지원해야 한다

### Integration

**외부 API 의존성:**
- **NFR27:** Google Sheets API, Instagram/Facebook API, 네이버 API의 정책 변경을 모니터링해야 한다
- **NFR28:** 외부 API 응답 시간이 5초 초과 시 타임아웃 처리한다

**Webhook:**
- **NFR29:** Supabase에서 Workflow Engine으로 Webhook 호출 시 1초 이내 응답해야 한다

---

## Innovation & Novel Patterns

### Multi-LLM Orchestration Pattern

**혁신 요소:**

기존 AI 콘텐츠 도구는 단일 LLM만 사용하여 품질 편차가 크고 특정 주제에 약점을 보입니다.

**ContentFlow AI의 차별화:**

```
[사용자가 주제 입력]
      ↓
[3개 LLM 동시 호출]
- GPT-4 Turbo (창의성 우수)
- Claude 3.5 Sonnet (논리성, 구조 우수)
- Gemini 2.0 Flash (속도, 비용 효율)
      ↓
[품질 평가 알고리즘]
- 길이 적정성 (1,500-2,500자)
- 구조화 점수 (섹션 나뉘어짐)
- 키워드 밀도
- 가독성 점수
      ↓
[최고 품질 콘텐츠 선택]
      ↓
[사용자에게 제공]
```

**기술적 구현:**
- `LLMService.generateWithMultipleLLMs()` - Promise.all로 병렬 호출
- `LLMService.evaluateBest()` - 자동 품질 평가 또는 사용자 선택
- Provider Fallback - 특정 LLM 실패 시 다른 것으로 자동 전환

**비즈니스 임팩트:**
- 콘텐츠 품질 일관성 확보
- 특정 LLM 장애 시에도 서비스 지속
- 사용자 만족도 증가 → 이탈률 감소

### Adaptive Retry with Provider Fallback

**문제:**
외부 AI API는 간헐적 장애, Rate Limit, 타임아웃 발생 가능

**해결책:**
```typescript
// BullMQ 재시도 로직
1차 시도: GPT-4 호출 → 실패
2차 시도 (10초 후): GPT-4 재호출 → 실패
3차 시도 (30초 후): GPT-4 재호출 → 실패
4차 시도: Claude 3.5로 자동 전환 → 성공!
```

**사용자 경험:**
- 사용자는 재시도를 의식하지 못함
- "생성 중..." 상태만 보임
- 높은 성공률 보장 (99%+)

### Validation Approach

**MVP 검증 방법:**

1. **베타 테스트 (50-100명, 2개월)**
   - 목표: 콘텐츠 승인율 70% 이상 달성
   - 측정: 매주 승인율, 품질 피드백 수집
   - 개선: 낮은 품질 패턴 분석 → 프롬프트 개선

2. **A/B 테스트**
   - Group A: 멀티 LLM 사용
   - Group B: 단일 LLM (GPT-4만)
   - 비교: 승인율, 사용자 만족도, 재사용률

3. **블라인드 테스트**
   - AI 생성 vs 사람 작성 콘텐츠 섞어서 제시
   - 목표: 60% 이상이 AI를 구분 못함

---

## Implementation Planning

### Development Roadmap

**Sprint 0: 준비 (2주)**
- 프로젝트 초기화 (Turborepo, Next.js, NestJS)
- Supabase 프로젝트 생성 및 DB 스키마 마이그레이션
- CI/CD 파이프라인 구축

**Sprint 1-2: 인증 & 기본 UI (4주)**
- Supabase Auth 통합
- 프로필 등록/수정 UI
- 대시보드 레이아웃

**Sprint 3-4: 콘텐츠 생성 엔진 (4주)**
- Google Sheets API 연동
- 하위 주제 생성 (단일 LLM)
- 블로그 포스트 생성 (단일 LLM)
- SEO 메타데이터 생성

**Sprint 5: 멀티 LLM 통합 (2주)**
- OpenAI, Anthropic, Google AI Provider 구현
- 병렬 호출 및 품질 평가 로직
- Fallback 메커니즘

**Sprint 6: 검토 워크플로우 (2주)**
- 검토 UI (마크다운 에디터 + 미리보기)
- 승인/거절 기능
- 실시간 알림 (Supabase Realtime)

**Sprint 7-8: SNS 배포 (4주)**
- Instagram Graph API 연동
- Facebook API 연동
- 네이버 블로그 API 연동
- 예약 배포 (크론 스케줄러)

**Sprint 9: 폴리싱 & 테스트 (2주)**
- 버그 수정
- 성능 최적화
- 베타 테스트 준비

**Sprint 10-11: 베타 테스트 (4주)**
- 50-100명 베타 사용자 모집
- 피드백 수집 및 개선
- 문서화

**Sprint 12: 정식 출시 (2주)**
- 가격 정책 활성화
- 마케팅 캠페인 시작
- 모니터링 대시보드 구축

**총 개발 기간: 6개월 (24주)**

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `/bmad:bmm:workflows:create-epics-and-stories` to create the implementation breakdown.

---

## References

- Product Brief: docs/project-brief.md
- Market Research: docs/market-research.md
- Competitive Analysis: docs/competitive-analysis.md
- Architecture: docs/architecture.md

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `/bmad:bmm:workflows:create-epics-and-stories`
2. **UX Design** (if needed) - Run: `/bmad:bmm:workflows:create-ux-design`
3. **Sprint Planning** - Run: `/bmad:bmm:workflows:sprint-planning`

---

_This PRD captures the essence of ContentFlow AI - **내실있고 자연스러운 콘텐츠를 자동으로 생성하여 소상공인의 마케팅 부담을 덜어주는** 플랫폼_

_Created through collaborative discovery between BMad and PM John._
_BMad Method Track - 2025-11-14_
