# Story 2.7: 계정 삭제 기능

**Story ID:** 2.7
**Story Key:** 2-7-account-deletion-feature
**Epic:** Epic 2 - 사용자 인증 및 계정 관리
**Priority:** P0 (필수)
**Complexity:** Medium (2-3시간)
**Created:** 2025-11-15
**Last Updated:** 2025-11-15

---

## 📝 Story 정의

**As a** 등록된 사용자,
**I want** 내 계정을 완전히 삭제할 수 있어,
**So that** 서비스에서 나가고 개인정보를 완전히 삭제할 수 있다.

---

## ✅ Acceptance Criteria

### AC1: 계정 삭제 버튼
- [ ] 프로필 페이지(`/profile`)에 계정 삭제 버튼 표시
- [ ] 버튼 위치: 프로필 정보 하단
- [ ] 버튼 색상: 위험(빨강색) 표시
- [ ] 설정 페이지(`/settings`)에도 계정 삭제 옵션 제공

### AC2: 삭제 확인 모달
- [ ] 삭제 버튼 클릭 시 확인 모달 표시
- [ ] 경고 메시지: "계정을 삭제하면 모든 데이터가 삭제됩니다. 되돌릴 수 없습니다."
- [ ] 사용자 이메일 표시
- [ ] 실제 이메일 입력으로 재확인
  - [ ] 입력 필드: "계정 삭제를 확인하려면 이메일을 입력하세요"
  - [ ] 이메일이 일치해야 삭제 버튼 활성화
- [ ] 취소 버튼

### AC3: 2단계 인증
- [ ] 이메일 인증 링크 발송
- [ ] 인증 링크 클릭 시 계정 삭제 처리
- [ ] 인증 링크는 24시간 유효
- [ ] 만료된 링크: 재전송 옵션 제공

### AC4: 데이터 삭제
- [ ] Supabase `auth.users` 테이블에서 사용자 삭제
- [ ] `profiles` 테이블에서 사용자 정보 삭제
- [ ] `user_sessions` 테이블(있는 경우) 삭제
- [ ] Supabase Storage에서 프로필 사진 삭제
- [ ] 관련된 모든 데이터 삭제 (향후 콘텐츠, 설정 등)

### AC5: 데이터 보관 정책
- [ ] 소프트 삭제 고려: `deleted_at` 타임스탬프 추가
- [ ] 복구 기능 검토 (선택사항)
- [ ] GDPR 규정 준수

### AC6: 에러 처리
- [ ] 이미 삭제된 계정: "이미 삭제된 계정입니다"
- [ ] 삭제 실패: "계정 삭제에 실패했습니다. 나중에 다시 시도해주세요"
- [ ] 네트워크 에러: "연결 실패. 다시 시도해주세요"
- [ ] 인증 토큰 만료: "세션이 만료되었습니다. 다시 로그인하세요"

### AC7: 사용자 경험
- [ ] 모바일 반응형 디자인
- [ ] 로딩 상태 표시
- [ ] 삭제 완료 후 로그인 페이지로 리다이렉트
- [ ] 성공 메시지: "계정이 삭제되었습니다"

### AC8: 보안
- [ ] 비밀번호 입력으로 추가 보안 (선택사항)
- [ ] 계정 삭제 이력 로깅
- [ ] 민감한 작업이므로 HTTPS만 허용

---

## 📋 Tasks / Subtasks

### Task 1: 계정 삭제 버튼 추가
- [ ] `/profile/page.tsx`에 삭제 버튼 추가
  - [ ] 버튼 스타일 (위험색)
  - [ ] 삭제 모달 트리거

### Task 2: 계정 삭제 확인 모달
- [ ] `AccountDeletionModal.tsx` 컴포넌트
  - [ ] 경고 메시지 표시
  - [ ] 이메일 입력 필드
  - [ ] 이메일 유효성 검사
  - [ ] 취소/확인 버튼

### Task 3: 계정 삭제 API 함수
- [ ] `lib/api/auth-api.ts` 확장
  - [ ] `deleteAccount()` - 삭제 요청
  - [ ] `deleteAccountWithEmailVerification()` - 이메일 인증 기반 삭제
  - [ ] 에러 처리

### Task 4: 계정 삭제 이메일 템플릿
- [ ] 계정 삭제 확인 이메일 템플릿
  - [ ] 확인 링크 포함
  - [ ] 24시간 유효 메시지
  - [ ] 다시 요청 옵션

### Task 5: 백엔드 라우트 (선택사항)
- [ ] `/api/auth/delete-account` POST 라우트
  - [ ] 사용자 인증 확인
  - [ ] 이메일 인증 검증
  - [ ] 데이터 삭제 처리

### Task 6: 데이터베이스 정리
- [ ] 프로필 사진 삭제 함수
  - [ ] Supabase Storage에서 이미지 삭제
  - [ ] 존재하지 않는 파일 에러 처리

### Task 7: 마이그레이션 (선택사항)
- [ ] `profiles` 테이블에 `deleted_at` 컬럼 추가
  ```sql
  ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMP;
  ```

### Task 8: 테스트 코드
- [ ] 계정 삭제 버튼 렌더링 테스트
- [ ] 모달 입력 유효성 검사 테스트
- [ ] API 호출 테스트

---

## 🔧 Dev Notes

### 기술 결정사항
- **폼 라이브러리:** React Hook Form
- **검증:** Zod
- **API 호출:** Supabase Client
- **이메일 인증:** Supabase Auth
- **UI 컴포넌트:** Shadcn/ui

### 의존성
- react-hook-form (이미 설치됨)
- zod (이미 설치됨)
- @supabase/supabase-js (이미 설치됨)

### 주의사항
- 계정 삭제는 되돌릴 수 없음 (충분한 경고 필요)
- 이메일 재확인 필수 (사용자 실수 방지)
- 24시간 유효한 이메일 링크 구현
- 모든 관련 데이터 정리 필수
- 법적 규정 준수 (GDPR, 한국 개인정보보호법)

### 데이터베이스
- Supabase `auth.users` 테이블의 사용자 삭제
- `profiles` 테이블에서 사용자 정보 삭제
- Supabase Storage에서 프로필 사진 삭제
- 감사 로그 기록

---

## 📁 File List

### 생성될 파일
- `apps/web/src/components/profile/AccountDeletionModal.tsx` - 계정 삭제 모달
- `apps/web/src/app/api/auth/delete-account/route.ts` - 계정 삭제 API (선택)
- `apps/web/src/__tests__/account-deletion.test.ts` - 계정 삭제 테스트

### 수정될 파일
- `apps/web/src/app/(auth)/profile/page.tsx` - 삭제 버튼 추가
- `apps/web/src/lib/api/auth-api.ts` - 삭제 API 함수 추가

### 마이그레이션 파일 (선택)
- `supabase/migrations/[timestamp]_add_deleted_at_to_profiles.sql`

---

## 🧪 Testing Strategy

### Unit Tests
- AccountDeletionModal 컴포넌트 렌더링
- 이메일 입력 유효성 검사
- API 함수 호출

### Integration Tests
- 계정 삭제 요청 및 확인
- 이메일 검증 링크 처리
- 데이터 삭제 확인

### E2E Tests
- 계정 삭제 전체 플로우
- 이메일 인증 후 삭제 확인
- 로그인 페이지로 리다이렉트 확인

---

## 📊 Definition of Done

- [ ] 모든 Acceptance Criteria 충족
- [ ] 유닛 테스트 작성 및 통과
- [ ] 통합 테스트 작성 및 통과
- [ ] ESLint/Prettier 통과
- [ ] TypeScript strict 모드 컴파일 성공
- [ ] 한글 에러 메시지 모두 작성
- [ ] 모바일 반응형 검증
- [ ] 코드 리뷰 완료
- [ ] 보안 검토 완료

---

## 📝 Dev Agent Record

### Context Reference
- **Context File:** `docs/sprint-artifacts/2-7-account-deletion-feature.context.xml`
- **Generated:** 2025-11-15
- **Status:** Drafted

---

## 📋 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-15 | Story 초안 생성 | Claude Code |

---

## 🎯 Status

**Current Status:** drafted
**Ready to Start:** Context generation required
**Depends On:** Story 2.5 (Profile Registration), Story 2.6 (Profile Edit)

---

**Last Updated:** 2025-11-15
**Story Lead:** Claude Code
**Epic Owner:** Winston (Architect)
