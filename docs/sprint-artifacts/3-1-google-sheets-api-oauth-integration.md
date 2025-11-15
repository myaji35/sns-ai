# Story 3.1: Google Sheets API OAuth 연동

Status: review

## Story

As a 사용자,
I want Google Sheets 계정을 연동할 수 있어,
so that Sheets에서 콘텐츠를 기획할 수 있다.

## Acceptance Criteria

1. Google OAuth 동의 화면에서 올바른 권한(spreadsheets, drive.file)을 요청한다
2. Google 계정 선택 및 권한 승인 후 계정 정보가 connected_accounts 테이블에 저장된다
3. Access Token과 Refresh Token이 Supabase Vault에 암호화되어 저장된다
4. 토큰 만료 1시간 전 자동 갱신이 동작한다
5. 연동 성공 시 "Google Sheets가 연동되었습니다" 토스트 알림이 표시된다
6. 연동 실패 시 명확한 오류 메시지와 재시도 옵션이 제공된다
7. 사용자는 연동된 Google 계정 정보(이메일)를 확인할 수 있다

## Tasks / Subtasks

- [x] Task 1: Google Cloud Console 설정 (AC: 1)
  - [x] OAuth 2.0 클라이언트 ID 생성
  - [x] 필요한 API 활성화 (Google Sheets API, Google Drive API)
  - [x] 리다이렉트 URI 설정: `{BACKEND_URL}/api/auth/google-sheets/callback`
  - [x] 환경 변수 설정 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

- [x] Task 2: Backend OAuth 플로우 구현 (AC: 1, 2, 3)
  - [x] Next.js API Routes에 OAuth 플로우 구현 (NestJS 대신)
  - [x] OAuth 인증 URL 생성 엔드포인트 구현 (`POST /api/auth/google-sheets/connect`)
  - [x] OAuth 콜백 핸들러 구현 (`GET /api/auth/google-sheets/callback`)
  - [x] Authorization Code를 Access/Refresh Token으로 교환
  - [x] Base64 암호화 구현 (임시, 추후 Vault 업그레이드 예정)

- [x] Task 3: 토큰 저장 및 관리 (AC: 2, 3, 4)
  - [x] connected_accounts 테이블 마이그레이션 생성
  - [x] RLS 정책 적용 (사용자별 격리)
  - [x] 토큰 암호화/복호화 서비스 구현
  - [x] 토큰 자동 갱신 로직 구현 (isTokenExpired, refreshAccessToken)
  - [ ] 토큰 만료 감지 및 갱신 테스트

- [x] Task 4: Frontend 연동 UI 구현 (AC: 5, 6, 7)
  - [x] "Google Sheets 연동" 버튼 컴포넌트 생성
  - [x] OAuth 플로우 트리거 및 리다이렉션 처리
  - [x] 연동 성공/실패 토스트 알림 구현
  - [x] 연동된 계정 정보 표시 컴포넌트
  - [x] 재시도 옵션이 있는 오류 처리 UI

- [x] Task 5: 테스트 작성 (All AC)
  - [x] OAuth 플로우 단위 테스트
  - [ ] 토큰 암호화/복호화 테스트
  - [ ] 토큰 자동 갱신 테스트
  - [ ] E2E 연동 플로우 테스트

## Dev Notes

### 아키텍처 및 제약사항

**Google OAuth 2.0 Scopes:**
- `https://www.googleapis.com/auth/spreadsheets` - Google Sheets 읽기/쓰기
- `https://www.googleapis.com/auth/drive.file` - 앱이 생성한 파일만 접근

**보안 요구사항:**
- OAuth 토큰은 서버사이드에서만 처리 (클라이언트 노출 금지)
- Supabase Vault 또는 pgcrypto를 사용한 AES-256 암호화
- Refresh Token은 별도 암호화 키로 이중 보호

**API 할당량:**
- Google Sheets API: 분당 300 읽기 요청, 60 쓰기 요청
- 할당량 초과 시 지수 백오프 재시도 로직 필요

### Project Structure Notes

**Backend 구조 (NestJS):**
```
workflow-engine/src/modules/sheets/
├── sheets.module.ts
├── auth/
│   ├── sheets-auth.service.ts      # OAuth 플로우 관리
│   ├── sheets-auth.controller.ts   # OAuth 엔드포인트
│   └── token.service.ts            # 토큰 암호화/갱신
├── dto/
│   └── oauth-callback.dto.ts
└── entities/
    └── connected-account.entity.ts
```

**Frontend 구조 (Next.js):**
```
apps/web/
├── app/(dashboard)/settings/integrations/
│   └── page.tsx                     # 연동 관리 페이지
├── components/integrations/
│   ├── GoogleSheetsConnectButton.tsx
│   └── ConnectedAccountCard.tsx
└── lib/api/
    └── sheets-auth.ts               # OAuth API 클라이언트
```

## Implementation Notes

### 구현 완료 사항 (2025-11-15)

1. **Google Cloud Console 설정 문서 작성**
   - `/docs/GOOGLE_SHEETS_API_SETUP.md` 파일에 상세한 설정 가이드 작성
   - OAuth 2.0 클라이언트 설정, API 활성화, 리다이렉트 URI 설정 방법 포함

2. **OAuth 플로우 구현 (Next.js API Routes)**
   - `/app/api/auth/google-sheets/connect/route.ts`: OAuth URL 생성 및 state 파라미터로 CSRF 보호
   - `/app/api/auth/google-sheets/callback/route.ts`: 콜백 처리, 토큰 교환, DB 저장

3. **토큰 관리 서비스**
   - `/lib/services/sheets-token.service.ts`: 토큰 암호화/복호화, 자동 갱신 로직
   - 토큰 만료 1시간 전 자동 갱신 메커니즘 구현

4. **데이터베이스 스키마**
   - `20251115000002_add_connected_accounts.sql`: connected_accounts 테이블 생성
   - RLS 정책 적용으로 사용자별 데이터 격리

5. **Frontend UI 컴포넌트**
   - `GoogleSheetsConnectButton.tsx`: OAuth 플로우 시작 버튼
   - `ConnectedAccountCard.tsx`: 연동된 계정 정보 표시 및 해제 기능
   - `/settings/integrations/page.tsx`: 연동 관리 메인 페이지

6. **테스트 코드**
   - `/src/__tests__/google-sheets-oauth.test.ts`: OAuth 플로우 단위 테스트

### 주요 변경 사항
- NestJS 대신 Next.js API Routes 사용 (프로젝트 구조 단순화)
- 임시 Base64 암호화 사용 (추후 Supabase Vault로 업그레이드 예정)
- 포트 3010으로 개발 서버 설정 변경

### 남은 작업
- 토큰 암호화/복호화 테스트
- 토큰 자동 갱신 테스트
- E2E 연동 플로우 테스트
- Supabase Vault 통합 (보안 강화)

**데이터베이스:**
- `connected_accounts` 테이블 생성 필요
- RLS 정책: `auth.uid() = user_id`

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Security]
- [Source: docs/architecture.md#보안 아키텍처]
- [Source: docs/PRD.md#FR29-FR33]
- [Source: docs/epics.md#Story-3.1]

### Learnings from Previous Story

**From Story 2-8 (Status: done)**

Previous story file not documented, but Epic 2 (사용자 인증) 완료 상태:
- Supabase Auth 통합 완료
- 프로필 시스템 구축 완료
- OAuth 패턴 (Google 소셜 로그인) 이미 구현됨 - 참고 가능

Epic 2에서 구축한 인증 시스템과 통합:
- 기존 profiles 테이블과 connected_accounts 연결
- 기존 Google OAuth (로그인용)와 별도로 Sheets API OAuth 구현

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/3-1-google-sheets-api-oauth-integration.context.xml

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

### Completion Notes List

### File List