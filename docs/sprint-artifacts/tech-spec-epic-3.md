# Epic Technical Specification: 콘텐츠 기획 허브 (Content Planning Hub)

Date: 2025-11-15
Author: BMad
Epic ID: 3
Status: Draft

---

## Overview

Epic 3는 ContentFlow AI의 콘텐츠 기획 관리 핵심 모듈로, 사용자가 익숙한 Google Sheets를 활용하여 콘텐츠를 계획하고 AI가 아이디어를 확장하는 시스템을 구축합니다. PRD의 "Zero Learning Curve" 원칙에 따라 Google Sheets라는 친숙한 도구를 활용하며, AI가 메인 주제로부터 10개의 하위 주제를 자동 생성하여 "콘텐츠 고갈" 문제를 해결합니다.

이 Epic은 Google OAuth 연동, Sheets API를 통한 양방향 동기화, AI 하위 주제 생성, 그리고 콘텐츠 캘린더 시각화를 포함합니다. 한국 소상공인의 디지털 마케팅 진입 장벽을 낮추는 핵심 기능입니다.

## Objectives and Scope

### In-Scope (이번 Epic 범위)
- Google Sheets OAuth 연동 및 토큰 관리 (Story 3.1)
- 콘텐츠 캘린더 템플릿 자동 생성 (Story 3.2)
- Sheets 변경사항 자동 감지 및 동기화 (Story 3.3)
- AI 하위 주제 10개 자동 생성 (Story 3.4)
- 발행 빈도 설정 (주간/월간) (Story 3.5)
- 대시보드 캘린더 시각화 (Story 3.6)
- 수동 콘텐츠 생성 트리거 (Story 3.7)
- 연동 계정 관리 UI (Story 3.8)
- 동기화 상태 표시 (Story 3.9)
- 캘린더 삭제 기능 (Story 3.10)

### Out-of-Scope (제외 항목)
- 실제 블로그 콘텐츠 생성 (Epic 4)
- SNS 배포 (Epic 6)
- Google 외 다른 스프레드시트 도구 연동
- 실시간 공동 편집 (Google Sheets 자체 기능 사용)
- 복잡한 캘린더 권한 관리 (팀 기능은 Post-MVP)

## System Architecture Alignment

### 아키텍처 참조 (Architecture.md)
- **Frontend**: Next.js 15.5 App Router (`app/(dashboard)/calendar/`)
- **Backend**: NestJS Workflow Engine (`workflow-engine/src/modules/sheets/`)
- **Database**: PostgreSQL (`content_calendar`, `connected_accounts` 테이블)
- **External API**: Google Sheets API v4, Google OAuth 2.0
- **Queue**: BullMQ 작업 큐 (동기화, AI 생성 작업)
- **Security**: OAuth 토큰 Supabase Vault 암호화 저장

### 핵심 아키텍처 제약사항
- Google Sheets API 할당량: 분당 300 읽기 요청, 60 쓰기 요청
- 폴링 주기: 최소 5분 (API 할당량 고려)
- OAuth 토큰 자동 갱신: Refresh Token 필수
- RLS 정책: 사용자별 캘린더 완전 격리

## Detailed Design

### Services and Modules

| 모듈 | 책임 | 입력 | 출력 | 소유자 |
|------|------|------|------|--------|
| **SheetsAuthService** | Google OAuth 2.0 인증 플로우 관리 | 사용자 인증 요청 | Access/Refresh Token | workflow-engine |
| **SheetsApiService** | Google Sheets API 통신 | Sheet ID, 범위 | 셀 데이터 | workflow-engine |
| **CalendarTemplateService** | 캘린더 템플릿 생성 | 사용자 정보, 업종 | 새 Sheet ID | workflow-engine |
| **SheetsSyncService** | Sheets ↔ DB 동기화 | Sheet 변경사항 | DB 업데이트 | workflow-engine |
| **SubtopicGeneratorService** | AI 하위 주제 생성 | 메인 주제, 업종 | 10개 하위 주제 | workflow-engine |
| **CalendarPollingProcessor** | 5분 주기 변경 감지 | Cron 트리거 | 변경사항 목록 | workflow-engine |
| **CalendarUIComponent** | 캘린더 시각화 | 캘린더 데이터 | React 컴포넌트 | web |
| **AccountManagementUI** | 연동 계정 관리 | 사용자 액션 | UI 업데이트 | web |

### Data Models and Contracts

```typescript
// connected_accounts 테이블 (OAuth 토큰 저장)
interface ConnectedAccount {
  id: string; // UUID
  user_id: string; // profiles.id 참조
  platform: 'google_sheets';
  account_name: string; // 구글 이메일
  access_token: string; // 암호화된 액세스 토큰
  refresh_token: string; // 리프레시 토큰
  token_expires_at: Date; // 토큰 만료 시간
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// content_calendar 테이블
interface ContentCalendar {
  id: string; // UUID
  user_id: string; // profiles.id 참조
  google_sheet_id: string; // Google Sheets 문서 ID
  google_sheet_url: string; // 시트 URL (사용자 편의)
  category: string; // 콘텐츠 카테고리
  main_topic: string; // 메인 주제
  subtopics: string[]; // JSONB - 10개 하위 주제
  publish_frequency: 'weekly' | 'monthly' | null;
  next_publish_date: Date | null; // 다음 발행 예정일
  last_synced_at: Date; // 마지막 동기화 시간
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  status: 'active' | 'paused' | 'deleted';
  created_at: Date;
  updated_at: Date;
}

// Google Sheets 템플릿 구조
interface CalendarTemplate {
  headers: string[]; // ['카테고리', '메인 주제', '하위 주제 1', ..., '하위 주제 10', '발행 빈도']
  ranges: {
    category: 'A2';
    mainTopic: 'B2';
    subtopics: 'C2:L2';
    frequency: 'M2';
  };
  sheetName: 'ContentCalendar';
}

// AI 하위 주제 생성 요청/응답
interface SubtopicGenerationRequest {
  mainTopic: string;
  industry: string;
  brandDescription?: string;
  toneAndManner?: string[];
}

interface SubtopicGenerationResponse {
  subtopics: string[]; // 정확히 10개
  llmProvider: 'gemini';
  tokensUsed: number;
  generationTime: number; // ms
}
```

### APIs and Interfaces

```typescript
// 1. Google OAuth 연동
POST /api/auth/google-sheets/connect
Response: {
  authUrl: string; // Google OAuth 동의 화면 URL
}

GET /api/auth/google-sheets/callback?code={auth_code}
Response: {
  success: boolean;
  accountName: string; // 연동된 구글 계정
}

// 2. 캘린더 템플릿 생성
POST /api/sheets/create-calendar
Body: {
  calendarName: string; // 선택적, 기본값 "ContentFlow 콘텐츠 캘린더"
}
Response: {
  sheetId: string;
  sheetUrl: string;
  calendarId: string; // DB 레코드 ID
}

// 3. 캘린더 목록 조회
GET /api/calendars
Response: {
  calendars: ContentCalendar[];
  totalCount: number;
}

// 4. 하위 주제 생성
POST /api/calendars/{calendarId}/generate-subtopics
Body: {
  mainTopic: string;
  regenerate?: boolean; // 재생성 여부
}
Response: {
  subtopics: string[];
  status: 'success' | 'processing' | 'error';
  jobId?: string; // BullMQ 작업 ID
}

// 5. 캘린더 동기화 (수동)
POST /api/calendars/{calendarId}/sync
Response: {
  syncStatus: 'initiated' | 'completed' | 'error';
  changes: {
    added: number;
    updated: number;
    deleted: number;
  };
}

// 6. 발행 빈도 설정
PATCH /api/calendars/{calendarId}/frequency
Body: {
  frequency: 'weekly' | 'monthly' | null;
}
Response: {
  updated: boolean;
  nextPublishDate?: Date;
}

// 7. 연동 계정 관리
GET /api/connected-accounts
DELETE /api/connected-accounts/{accountId}
```

### Workflows and Sequencing

#### 1. Google Sheets OAuth 연동 플로우
```
[사용자] → "Google Sheets 연동" 버튼 클릭
    ↓
[Frontend] → POST /api/auth/google-sheets/connect
    ↓
[Backend] → OAuth URL 생성 (scopes: spreadsheets, drive.file)
    ↓
[사용자] → Google 동의 화면에서 권한 승인
    ↓
[Google] → Redirect to /api/auth/google-sheets/callback?code=xxx
    ↓
[Backend] → Code를 Access/Refresh Token으로 교환
    ↓
[Backend] → Supabase Vault에 토큰 암호화 저장
    ↓
[Backend] → connected_accounts 테이블에 레코드 생성
    ↓
[Frontend] → "연동 완료" 토스트 알림
```

#### 2. AI 하위 주제 생성 플로우
```
[사용자] → 메인 주제 입력 후 "하위 주제 생성" 클릭
    ↓
[Frontend] → POST /api/calendars/{id}/generate-subtopics
    ↓
[Backend] → BullMQ 작업 큐에 'generate_subtopics' 추가
    ↓
[Worker] → Gemini 2.0 Flash API 호출
    │
    ├── Prompt:
    │   "메인 주제: {topic}
    │    업종: {industry}
    │    위 주제에 대해 블로그 하위 주제 10개 생성
    │    각 주제는 구체적이고 실용적이어야 함"
    ↓
[Worker] → 응답 검증 (정확히 10개, 중복 제거)
    ↓
[Worker] → Google Sheets API로 결과 작성 (C2:L2 범위)
    ↓
[Worker] → content_calendar.subtopics 업데이트
    ↓
[Frontend] → Realtime 알림 "하위 주제가 생성되었습니다"
```

#### 3. 자동 동기화 플로우 (5분 주기)
```
[Cron] → 매 5분마다 실행 ('*/5 * * * *')
    ↓
[Processor] → 활성 캘린더 목록 조회 (status='active')
    ↓
[Processor] → 각 캘린더별 Google Sheets API 호출
    │
    ├── spreadsheets.values.batchGet()
    ├── 범위: A2:M (전체 데이터 행)
    ↓
[Processor] → 변경사항 감지
    │
    ├── 새 주제 추가됨 → content_calendar 생성
    ├── 기존 주제 수정됨 → content_calendar 업데이트
    ├── 발행 빈도 변경됨 → publish_frequency 업데이트
    ↓
[Processor] → last_synced_at 타임스탬프 업데이트
    ↓
[Frontend] → 대시보드 캘린더 뷰 자동 새로고침
```

## Non-Functional Requirements

### Performance

- **API 응답 시간**: Google Sheets API 호출은 평균 500ms, 최대 2초 이내 완료
- **하위 주제 생성**: Gemini 2.0 Flash 사용으로 20-30초 이내 10개 주제 생성
- **동기화 지연**: Sheets 변경사항은 최대 5분 이내 DB에 반영 (폴링 주기)
- **동시 캘린더 처리**: 사용자당 최대 10개 캘린더 동시 관리 지원
- **대시보드 로딩**: 캘린더 뷰 초기 로딩 1.5초 이내 (캐싱 활용)
- **Google Sheets API 할당량 준수**:
  - 읽기: 분당 300 요청 제한
  - 쓰기: 분당 60 요청 제한
  - 배치 처리로 API 호출 최소화

### Security

- **OAuth 토큰 보안**:
  - Access Token은 Supabase Vault에 AES-256 암호화 저장
  - Refresh Token은 별도 암호화 키로 이중 보호
  - 토큰은 서버 사이드에서만 처리, 클라이언트 노출 금지
- **Google OAuth Scopes 최소 권한**:
  - `spreadsheets`: 시트 읽기/쓰기
  - `drive.file`: 앱이 생성한 파일만 접근
  - 불필요한 권한 요청 금지
- **토큰 자동 갱신**:
  - 만료 1시간 전 자동 갱신
  - 갱신 실패 시 사용자에게 재인증 요청
- **RLS 정책 적용**:
  - 사용자는 자신의 캘린더만 조회/수정 가능
  - cross-tenant 데이터 접근 완전 차단

### Reliability/Availability

- **토큰 갱신 실패 처리**:
  - 3회 재시도 후 사용자에게 재연동 안내
  - 실패 시 sync_status를 'error'로 표시
- **Google Sheets API 장애 대응**:
  - 지수 백오프: 1초, 2초, 4초 간격으로 재시도
  - 3회 실패 시 작업 큐에 재등록 (30분 후 재시도)
- **동기화 충돌 해결**:
  - Last Write Wins 정책
  - 동시 편집 시 마지막 변경사항 우선
- **데이터 일관성**:
  - 트랜잭션으로 calendar와 subtopics 원자적 업데이트
  - 부분 실패 시 롤백
- **폴링 실패 복구**:
  - 개별 캘린더 실패가 전체 동기화를 막지 않음
  - 실패한 캘린더는 다음 주기에 재시도

### Observability

- **로깅 요구사항**:
  - 모든 OAuth 플로우 단계별 로그 (성공/실패)
  - Google Sheets API 호출 로그 (요청/응답 시간)
  - AI 하위 주제 생성 로그 (프롬프트, 토큰 사용량)
  - 동기화 작업 로그 (변경사항 수, 처리 시간)
- **메트릭 수집**:
  - 일일 API 호출 수 (Google Sheets API 할당량 모니터링)
  - 평균 동기화 시간
  - AI 생성 성공률
  - 토큰 갱신 성공/실패율
- **알림 조건**:
  - Google Sheets API 할당량 80% 도달
  - 동기화 5회 연속 실패
  - 토큰 갱신 실패
  - AI 생성 에러율 10% 초과
- **대시보드 표시**:
  - 실시간 동기화 상태 (pending/syncing/success/error)
  - 마지막 동기화 시간
  - API 할당량 사용률

## Dependencies and Integrations

### External Dependencies

#### Google APIs
```json
{
  "googleapis": "^118.0.0",
  "@google-cloud/local-auth": "^3.0.0"
}
```
- **Google Sheets API v4**: 스프레드시트 읽기/쓰기
- **Google OAuth 2.0**: 사용자 인증 및 권한 관리
- **Google Drive API v3**: 파일 메타데이터 접근 (선택적)

#### AI Provider
```json
{
  "@google/generative-ai": "^0.1.0"
}
```
- **Gemini 2.0 Flash**: 하위 주제 생성 (비용 효율적)
- API Key 필요 (환경 변수: `GEMINI_API_KEY`)

#### Queue Management
```json
{
  "bullmq": "^5.63.0",
  "ioredis": "^5.3.0"
}
```
- **BullMQ**: 작업 큐 관리
- **Redis**: 큐 백엔드 (Upstash Redis 사용)

#### Frontend Libraries
```json
{
  "react-big-calendar": "^1.8.0",
  "date-fns": "^2.30.0",
  "@tanstack/react-query": "^5.0.0"
}
```
- **react-big-calendar**: 캘린더 UI 컴포넌트
- **date-fns**: 날짜 처리
- **TanStack Query**: 서버 상태 관리

### Internal Dependencies

- **Supabase Auth**: 사용자 인증 (Epic 2 완료 필수)
- **profiles 테이블**: 사용자 업종, 브랜드 정보 참조
- **Supabase Vault**: OAuth 토큰 암호화 저장
- **Supabase Realtime**: 동기화 완료 알림

### Integration Points

1. **Google Cloud Console 설정**
   - OAuth 2.0 클라이언트 ID 생성
   - 리다이렉트 URI: `{BACKEND_URL}/api/auth/google-sheets/callback`
   - 필수 Scopes: spreadsheets, drive.file

2. **환경 변수 요구사항**
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   GOOGLE_REDIRECT_URI=xxx

   # Google AI
   GEMINI_API_KEY=xxx

   # Redis (BullMQ)
   REDIS_URL=redis://xxx

   # Supabase
   SUPABASE_URL=xxx
   SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_KEY=xxx
   ```

3. **데이터베이스 마이그레이션**
   ```sql
   -- connected_accounts 테이블 생성
   -- content_calendar 테이블 생성
   -- RLS 정책 적용
   ```

## Acceptance Criteria (Authoritative)

### Story 3.1: Google Sheets OAuth 연동
1. ✅ Google OAuth 동의 화면이 올바른 권한(spreadsheets, drive.file)을 요청한다
2. ✅ 연동 성공 시 connected_accounts 테이블에 암호화된 토큰이 저장된다
3. ✅ Refresh Token이 저장되어 자동 갱신이 가능하다
4. ✅ 연동 실패 시 명확한 오류 메시지와 재시도 옵션이 제공된다

### Story 3.2: 콘텐츠 캘린더 템플릿 생성
1. ✅ "콘텐츠 캘린더 만들기" 클릭 시 Google Sheets에 템플릿이 생성된다
2. ✅ 템플릿은 한글 헤더를 포함한다 (카테고리, 메인 주제, 하위 주제 1-10, 발행 빈도)
3. ✅ 생성된 Sheet ID가 content_calendar 테이블에 저장된다
4. ✅ 사용자에게 생성된 시트 URL이 제공된다

### Story 3.3: 메인 주제 감지 및 동기화
1. ✅ Sheets 변경사항이 5분 이내에 자동 감지된다
2. ✅ 새 메인 주제가 content_calendar 테이블에 저장된다
3. ✅ 동기화 상태가 UI에 실시간 표시된다
4. ✅ 수동 동기화 버튼도 제공된다

### Story 3.4: AI 하위 주제 생성
1. ✅ 메인 주제 입력 후 "하위 주제 생성" 버튼이 활성화된다
2. ✅ AI가 20-30초 내에 10개 하위 주제를 생성한다
3. ✅ 생성된 주제가 Google Sheets C2:L2 범위에 자동 작성된다
4. ✅ 하위 주제가 중복 없이, 메인 주제와 관련성 있게 생성된다
5. ✅ 생성 실패 시 재시도 옵션이 제공된다

### Story 3.5: 발행 빈도 설정
1. ✅ Sheets "발행 빈도" 컬럼에 "주간" 또는 "월간" 입력 가능
2. ✅ 설정된 빈도에 따라 자동 콘텐츠 생성이 스케줄링된다
3. ✅ next_publish_date가 자동 계산되어 저장된다

### Story 3.6: 대시보드 캘린더 시각화
1. ✅ 월간 캘린더 뷰에 모든 주제가 표시된다
2. ✅ 각 주제의 상태가 색상으로 구분된다 (대기/진행/완료)
3. ✅ 캘린더에서 직접 주제를 클릭하여 상세 정보 확인 가능
4. ✅ 드래그 앤 드롭으로 발행 일정 조정 가능

### Story 3.7: 수동 콘텐츠 생성 트리거
1. ✅ 특정 주제에 대해 "지금 생성" 버튼이 제공된다
2. ✅ 수동 트리거가 자동 스케줄보다 우선 처리된다
3. ✅ 생성 작업이 큐에 추가되고 진행 상황이 표시된다

### Story 3.8: 연동 계정 관리
1. ✅ 연동된 Google 계정 목록이 표시된다
2. ✅ 각 계정의 연동 상태(활성/비활성)가 표시된다
3. ✅ 계정 연동 해제가 가능하다
4. ✅ 다중 계정 연동이 지원된다

### Story 3.9: 동기화 상태 표시
1. ✅ 각 캘린더의 마지막 동기화 시간이 표시된다
2. ✅ 동기화 중/성공/실패 상태가 실시간 업데이트된다
3. ✅ 동기화 오류 시 구체적인 오류 메시지가 제공된다

### Story 3.10: 캘린더 삭제
1. ✅ 캘린더 삭제 시 확인 모달이 표시된다
2. ✅ 삭제 시 관련 데이터가 소프트 삭제된다 (status='deleted')
3. ✅ Google Sheets 파일은 유지되지만 동기화가 중단된다

## Traceability Mapping

| AC | Spec Section | Component/API | Test Idea |
|----|--------------|---------------|-----------|
| 3.1.1: OAuth 권한 요청 | Security > OAuth Scopes | `SheetsAuthService` | OAuth URL에 올바른 scopes 포함 확인 |
| 3.1.2: 토큰 암호화 저장 | Security > OAuth 토큰 보안 | `connected_accounts` 테이블 | Vault 암호화 검증, 복호화 테스트 |
| 3.1.3: Refresh Token | APIs > OAuth 연동 | `SheetsAuthService.refreshToken()` | 토큰 만료 시 자동 갱신 테스트 |
| 3.2.1: 템플릿 생성 | Workflows > 템플릿 생성 | `CalendarTemplateService` | 시트 생성 API 호출 검증 |
| 3.2.2: 한글 헤더 | Data Models > CalendarTemplate | Google Sheets API | 한글 문자 인코딩 테스트 |
| 3.3.1: 5분 내 감지 | Performance > 동기화 지연 | `CalendarPollingProcessor` | Cron 주기 및 감지 시간 측정 |
| 3.3.2: DB 저장 | Data Models > ContentCalendar | `SheetsSyncService` | 변경사항 → DB 동기화 검증 |
| 3.4.1: AI 생성 버튼 | APIs > 하위 주제 생성 | Frontend UI | 버튼 활성화 조건 테스트 |
| 3.4.2: 20-30초 생성 | Performance > 하위 주제 생성 | `SubtopicGeneratorService` | Gemini API 응답 시간 측정 |
| 3.4.3: Sheets 작성 | Workflows > AI 생성 플로우 | Google Sheets API | C2:L2 범위 쓰기 검증 |
| 3.4.4: 중복 없음 | Data Models > SubtopicResponse | `SubtopicGeneratorService` | 생성된 10개 주제 유니크 검증 |
| 3.5.1: 빈도 입력 | APIs > 발행 빈도 설정 | `PATCH /calendars/{id}/frequency` | weekly/monthly 값 검증 |
| 3.5.2: 스케줄링 | Workflows > 자동 동기화 | BullMQ Scheduler | Cron 작업 등록 확인 |
| 3.6.1: 캘린더 뷰 | Frontend Libraries | `react-big-calendar` | 월간 뷰 렌더링 테스트 |
| 3.6.2: 상태 색상 | UI Components | `CalendarUIComponent` | 상태별 CSS 클래스 적용 |
| 3.7.1: 수동 트리거 | APIs > 수동 생성 | `POST /calendars/{id}/generate` | 즉시 큐 추가 검증 |
| 3.8.1: 계정 목록 | APIs > 연동 계정 관리 | `GET /connected-accounts` | 다중 계정 조회 테스트 |
| 3.9.1: 동기화 시간 | Observability > 대시보드 | `last_synced_at` 필드 | 타임스탬프 업데이트 확인 |
| 3.9.2: 실시간 상태 | Supabase Realtime | WebSocket 연결 | 상태 변경 이벤트 전파 |
| 3.10.1: 삭제 확인 | Frontend UI | 확인 모달 컴포넌트 | 모달 표시 및 동작 테스트 |
| 3.10.2: 소프트 삭제 | Data Models | `status='deleted'` | 데이터 보존 확인 |

## Risks, Assumptions, Open Questions

### Risks (위험)
1. **Risk: Google Sheets API 할당량 초과**
   - 영향: 동기화 실패, 서비스 중단
   - 완화: 배치 처리, 요청 throttling, 할당량 모니터링

2. **Risk: OAuth 토큰 유출**
   - 영향: 사용자 Google 계정 무단 접근
   - 완화: Vault 암호화, 서버사이드 전용, HTTPS 강제

3. **Risk: Gemini API 비용 초과**
   - 영향: 예상보다 높은 운영 비용
   - 완화: 사용량 제한, 캐싱, 비용 모니터링

4. **Risk: 동기화 충돌**
   - 영향: 데이터 불일치, 사용자 혼란
   - 완화: Last Write Wins, 충돌 알림

### Assumptions (가정)
1. **Assumption: 사용자는 Google 계정을 보유**
   - 근거: 한국 소상공인 대부분 Gmail 사용
   - 검증: 베타 테스트 시 확인

2. **Assumption: 5분 폴링 주기가 적절**
   - 근거: API 할당량과 UX 균형
   - 검증: 사용자 피드백 수집

3. **Assumption: 사용자당 평균 3개 캘린더**
   - 근거: 업종별 콘텐츠 분류
   - 검증: 사용 패턴 분석

4. **Assumption: Gemini Flash가 한국어 품질 충분**
   - 근거: 최신 모델 벤치마크
   - 검증: 생성 품질 평가

### Open Questions (미해결 질문)
1. **Question: Google Workspace 유료 계정 필요?**
   - 현재: 무료 계정 가정
   - 다음: Google API 정책 확인

2. **Question: 실시간 동기화 vs 폴링?**
   - 현재: 5분 폴링
   - 다음: Google Apps Script Webhook 검토

3. **Question: 다중 시트 탭 지원?**
   - 현재: 단일 시트
   - 다음: 사용자 요구사항 조사

4. **Question: 팀 협업 기능 범위?**
   - 현재: 개인 사용자만
   - 다음: Post-MVP 기획

## Test Strategy Summary

### 단위 테스트 (Unit Tests)
- **Services**: 각 서비스 메서드별 테스트
  - `SheetsAuthService`: OAuth 플로우 각 단계
  - `SubtopicGeneratorService`: AI 프롬프트 및 응답 처리
  - `SheetsSyncService`: 변경 감지 로직
- **Coverage 목표**: 80% 이상
- **도구**: Jest, NestJS Testing Module

### 통합 테스트 (Integration Tests)
- **API Endpoints**: 모든 REST API 엔드포인트
  - OAuth 콜백 플로우
  - 캘린더 CRUD 작업
  - 동기화 트리거
- **External API Mocking**:
  - Google Sheets API 응답 Mock
  - Gemini API 응답 Mock
- **도구**: Supertest, MSW (Mock Service Worker)

### E2E 테스트 (End-to-End Tests)
- **Critical Paths**:
  1. Google 계정 연동 → 캘린더 생성 → 주제 입력 → AI 생성
  2. Sheets 편집 → 자동 동기화 → DB 업데이트 → UI 반영
  3. 수동 트리거 → 큐 처리 → 결과 표시
- **도구**: Playwright, Cypress

### 성능 테스트 (Performance Tests)
- **부하 테스트**: 100명 동시 사용자, 1000개 캘린더
- **API 응답 시간**: P95 < 2초
- **동기화 지연**: 최대 5분 검증
- **도구**: k6, Apache JMeter

### 보안 테스트 (Security Tests)
- **OAuth 토큰 암호화 검증**
- **RLS 정책 우회 시도**
- **API Rate Limiting 테스트**
- **XSS/CSRF 취약점 스캔**
- **도구**: OWASP ZAP, Burp Suite

### 수동 테스트 시나리오
1. **Happy Path**: 전체 플로우 정상 동작
2. **Error Cases**:
   - 네트워크 오류 시 재시도
   - API 할당량 초과 시 안내
   - 토큰 만료 시 재인증
3. **Edge Cases**:
   - 빈 시트 처리
   - 특수문자 포함 주제
   - 동시 편집 충돌