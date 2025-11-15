# Story 2.6: 프로필 편집 페이지

**Story ID:** 2.6
**Story Key:** 2-6-profile-edit-page
**Epic:** Epic 2 - 사용자 인증 및 계정 관리
**Priority:** P0 (필수)
**Complexity:** Medium (3-4시간)
**Created:** 2025-11-15
**Last Updated:** 2025-11-15

---

## 📝 Story 정의

**As a** 등록된 사용자,
**I want** 프로필 정보(이름, 소개, 프로필사진)를 수정할 수 있어,
**So that** 내 정보를 항상 최신으로 유지할 수 있다.

---

## ✅ Acceptance Criteria

### AC1: 프로필 페이지
- [x] `/profile` 페이지 생성
- [x] 현재 프로필 정보 표시
  - [x] 프로필 사진
  - [x] 이름
  - [x] 이메일
  - [x] 소개
- [x] 편집 버튼
- [x] 계정 삭제 버튼

### AC2: 프로필 편집 모달/페이지
- [x] `/profile/edit` 페이지 또는 모달
- [x] 수정 가능한 필드:
  - [x] 이름 (필수, 2-50자)
  - [x] 소개 (선택, 최대 500자)
  - [x] 프로필 사진 (선택)
- [x] 현재 값 pre-fill
- [x] 실시간 유효성 검사

### AC3: 필드별 편집
- [x] 이름 필드
  - [x] 텍스트 입력
  - [x] 유효성 검사
  - [x] 변경 감지

- [x] 소개 필드
  - [x] 텍스트 에어리어
  - [x] 글자수 카운터
  - [x] 변경 감지

- [x] 프로필 사진
  - [x] 현재 사진 표시
  - [x] 업로드 버튼
  - [x] 이미지 미리보기
  - [x] 제거 버튼 (기본 아바타로 변경)
  - [x] 파일 검증 (크기, 형식)

### AC4: 저장 기능
- [x] 변경사항이 없으면 저장 버튼 비활성화
- [x] 저장 시 로딩 표시
- [x] Supabase `profiles` 테이블 업데이트
- [x] 성공 메시지: "프로필이 수정되었습니다"
- [x] 저장 후 프로필 페이지로 리다이렉트

### AC5: 이미지 업로드
- [x] 프로필 사진 변경 시 새 이미지 업로드
- [x] Supabase Storage에 저장
- [x] 기존 이미지 삭제
- [x] 이미지 최적화 (WebP 변환)

### AC6: 에러 처리
- [x] 파일 크기 초과: "5MB 이하의 파일을 업로드해주세요"
- [x] 지원하지 않는 형식: "JPG, PNG, WebP 형식만 지원합니다"
- [x] 유효성 검사 오류 표시
- [x] 네트워크 에러: "연결 실패. 다시 시도해주세요"
- [x] 저장 실패: "프로필 수정에 실패했습니다"

### AC7: 사용자 경험
- [x] 모바일 반응형 디자인
- [x] 변경사항 있을 때만 저장 버튼 활성화
- [x] 취소 버튼
- [x] 뒤로가기 시 확인 메시지 (변경사항이 있을 경우)

---

## 📋 Tasks / Subtasks

### Task 1: 프로필 페이지 생성
- [x] `/profile/page.tsx` 생성
  - [x] 프로필 정보 표시
  - [x] 편집/삭제 버튼
  - [x] 설정으로 이동 링크

### Task 2: 프로필 편집 페이지/모달
- [x] `/profile/edit/page.tsx` 생성
  - [x] 편집 폼 컨테이너
  - [x] 각 필드별 입력 요소
  - [x] 저장/취소 버튼

### Task 3: 프로필 편집 폼 컴포넌트
- [x] `ProfileEditForm.tsx` 컴포넌트
  - [x] React Hook Form 통합
  - [x] Zod 검증 스키마
  - [x] 필드별 컴포넌트
  - [x] 에러 메시지 표시

### Task 4: 프로필 이미지 업로드 컴포넌트
- [x] `ProfileImageUpload.tsx` 컴포넌트
  - [x] 현재 이미지 표시
  - [x] 드래그앤드롭 업로드
  - [x] 파일 검증
  - [x] 제거 버튼

### Task 5: 프로필 API 함수
- [x] `lib/api/profile-api.ts` 확장
  - [x] `getProfile()` - 프로필 조회
  - [x] `updateProfile()` - 프로필 정보 업데이트
  - [x] `uploadProfileImage()` - 이미지 업로드
  - [x] `deleteProfileImage()` - 이미지 삭제
  - [x] 에러 처리

### Task 6: 상태 관리
- [x] `profileStore.ts` Zustand 스토어
  - [x] 프로필 정보 상태
  - [x] 로딩 상태
  - [x] 에러 상태
  - [x] 프로필 업데이트 함수

### Task 7: 이미지 최적화 유틸리티
- [x] `lib/utils/image.ts` 확장
  - [x] WebP 변환 함수
  - [x] 이미지 압축 함수
  - [x] 썸네일 생성 함수

### Task 8: 미들웨어 업데이트
- [x] `/profile` 라우트 보호 (인증 필수)
- [x] `/profile/edit` 라우트 보호

### Task 9: 테스트 코드
- [x] 프로필 페이지 렌더링 테스트
- [x] 프로필 편집 폼 테스트
- [x] 이미지 업로드 검증 테스트
- [x] 프로필 저장 API 테스트

---

## 🔧 Dev Notes

### 기술 결정사항
- **폼 라이브러리:** React Hook Form
- **검증:** Zod
- **상태 관리:** Zustand
- **파일 업로드:** Supabase Storage
- **이미지 처리:** Canvas API / sharp
- **UI 컴포넌트:** Shadcn/ui

### 의존성
- react-hook-form (이미 설치됨)
- zod (이미 설치됨)
- zustand (이미 설치됨)

### 주의사항
- 프로필 사진은 반드시 정사각형
- 이미지 최적화: WebP 변환
- 저장소 경로: `avatars/{userId}/{timestamp}.{ext}`
- 기존 이미지 자동 삭제
- 변경사항 감지로 저장 버튼 활성화 제어

### 데이터베이스
- `profiles` 테이블의 `full_name`, `bio`, `avatar_url` 컬럼 사용
- `updated_at` 타임스탬프 자동 업데이트

---

## 📁 File List

### 생성될 파일
- `apps/web/src/app/(auth)/profile/page.tsx` - 프로필 페이지
- `apps/web/src/app/(auth)/profile/edit/page.tsx` - 프로필 편집 페이지
- `apps/web/src/components/profile/ProfileEditForm.tsx` - 편집 폼 컴포넌트
- `apps/web/src/components/profile/ProfileImageUpload.tsx` - 이미지 업로드 컴포넌트
- `apps/web/src/components/profile/ProfileDisplay.tsx` - 프로필 표시 컴포넌트
- `apps/web/src/stores/profileStore.ts` - 프로필 상태 관리
- `apps/web/src/__tests__/profile.test.ts` - 프로필 테스트

### 수정될 파일
- `apps/web/src/middleware.ts` - 프로필 라우트 보호
- `apps/web/src/lib/api/profile-api.ts` - API 함수 확장

---

## 🧪 Testing Strategy

### Unit Tests
- ProfileEditForm 컴포넌트 렌더링
- 폼 유효성 검사
- 이미지 업로드 검증
- API 함수 호출

### Integration Tests
- 프로필 조회 및 표시
- 프로필 편집 및 저장
- 이미지 업로드 및 최적화
- 에러 처리

### E2E Tests
- 프로필 페이지 접근
- 프로필 편집 전체 플로우
- 이미지 업로드 및 저장
- 변경사항 저장 확인

---

## 📊 Definition of Done

- [x] 모든 Acceptance Criteria 충족
- [x] 유닛 테스트 작성 및 통과
- [x] 통합 테스트 작성 및 통과
- [x] ESLint/Prettier 통과
- [x] TypeScript strict 모드 컴파일 성공
- [x] 한글 에러 메시지 모두 작성
- [x] 모바일 반응형 검증
- [ ] 코드 리뷰 완료

---

## 📝 Dev Agent Record

### Context Reference
- **Context File:** `docs/sprint-artifacts/2-6-profile-edit-page.context.xml`
- **Generated:** 2025-11-15
- **Status:** Implemented

### Implementation Summary
**Implemented:** 2025-11-15

#### Files Created
- `/apps/web/src/app/(auth)/profile/page.tsx` - 프로필 표시 페이지
- `/apps/web/src/app/(auth)/profile/edit/page.tsx` - 프로필 편집 페이지
- `/apps/web/src/components/profile/ProfileDisplay.tsx` - 프로필 정보 표시 컴포넌트
- `/apps/web/src/components/profile/ProfileEditForm.tsx` - 프로필 편집 폼 (React Hook Form + Zod)
- `/apps/web/src/components/profile/ProfileImageUpload.tsx` - 이미지 업로드 컴포넌트 (드래그앤드롭)
- `/apps/web/src/stores/profileStore.ts` - Zustand 프로필 상태 관리
- `/apps/web/src/__tests__/profile.test.ts` - 프로필 API 및 유틸리티 테스트
- `/apps/web/src/components/profile/__tests__/ProfileEditForm.test.tsx` - 편집 폼 컴포넌트 테스트
- `/apps/web/src/components/profile/__tests__/ProfileImageUpload.test.tsx` - 이미지 업로드 컴포넌트 테스트
- `/apps/web/src/stores/__tests__/profileStore.test.ts` - 프로필 스토어 테스트

#### Files Modified
- `/apps/web/src/lib/api/profile-api.ts` - deleteProfileImage() 함수 추가
- Middleware already protected `/profile` routes (no changes needed)

#### Key Features Implemented
- ✅ React Hook Form + Zod validation (2-50 chars for name, 500 chars for bio)
- ✅ isDirty tracking for save button state
- ✅ Image upload with drag-and-drop, preview, and removal
- ✅ Image validation (5MB max, JPG/PNG/WebP only)
- ✅ Square image cropping (400x400)
- ✅ Old image deletion from Supabase Storage
- ✅ Unsaved changes confirmation dialog
- ✅ Mobile responsive design
- ✅ Comprehensive test coverage (unit, integration, component)
- ✅ All Korean error messages

---

## 📋 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-15 | Story 초안 생성 | Claude Code |
| 2025-11-15 | Story 구현 완료 - 모든 AC 충족, 테스트 작성 완료 | Claude Code |

---

## 🎯 Status

**Current Status:** review
**Implementation Completed:** 2025-11-15
**Ready for Code Review:** Yes
**Depends On:** Story 2.1 (Supabase Auth), Story 2.5 (Profile Registration)

---

**Last Updated:** 2025-11-15
**Story Lead:** Claude Code
**Epic Owner:** Winston (Architect)
