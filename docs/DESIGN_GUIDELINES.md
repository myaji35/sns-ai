# UI/UX 디자인 가이드라인

## 개요
본 문서는 SNS AI 콘텐츠 관리 플랫폼의 일관된 사용자 경험을 위한 디자인 가이드라인을 정의합니다.

## 1. 폼 입력 필드 (Form Input Fields)

### 1.1 텍스트 입력 (Text Input)

#### 필수 스타일
모든 텍스트 입력 필드는 다음 Tailwind CSS 클래스를 **반드시** 포함해야 합니다:

```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
```

#### 스타일 구성 요소

| 클래스 | 목적 | 필수 여부 |
|--------|------|-----------|
| `text-gray-900` | **입력 텍스트를 검은색으로 표시 (가독성 확보)** | ✅ 필수 |
| `focus:outline-none` | 기본 outline 제거 | ✅ 필수 |
| `focus:ring-2` | 포커스 시 링 표시 | ✅ 필수 |
| `focus:ring-blue-500` | 포커스 링 색상 | ✅ 필수 |
| `border-gray-300` | 기본 테두리 색상 | ✅ 필수 |
| `rounded-lg` | 둥근 모서리 | 권장 |
| `px-3 py-2` | 내부 여백 | 권장 |

#### 예시 코드

```tsx
// ✅ 올바른 예시
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="회사명을 입력하세요"
/>

// ❌ 잘못된 예시 (text-gray-900 누락)
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
  placeholder="회사명을 입력하세요"
/>
```

### 1.2 Placeholder 스타일

placeholder 텍스트를 회색으로 표시하려면 `placeholder:text-gray-400`를 추가합니다:

```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="선택 사항"
/>
```

### 1.3 Select (드롭다운)

```tsx
<select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
  <option value="option1">옵션 1</option>
  <option value="option2">옵션 2</option>
</select>
```

### 1.4 Textarea

```tsx
<textarea
  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
  rows={4}
/>
```

### 1.5 비활성화된 입력 (Disabled Input)

비활성화된 입력 필드는 배경색을 회색으로 변경하되, 텍스트는 여전히 읽을 수 있어야 합니다:

```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
  disabled
/>
```

## 2. 버튼 (Buttons)

### 2.1 Primary 버튼 (주요 액션)

```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
  저장
</button>
```

### 2.2 Secondary 버튼 (보조 액션)

```tsx
<button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700">
  취소
</button>
```

### 2.3 Danger 버튼 (삭제/경고)

```tsx
<button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium">
  삭제
</button>
```

## 3. 모달 (Modals)

### 3.1 모달 구조

```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">모달 제목</h3>

    {/* 모달 내용 */}
    <form>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">라벨</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
        >
          취소
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          저장
        </button>
      </div>
    </form>
  </div>
</div>
```

## 4. 색상 팔레트

### 4.1 텍스트 색상

| 용도 | 색상 클래스 | 용례 |
|------|------------|------|
| 주요 텍스트 | `text-gray-900` | 제목, 입력값, 중요 정보 |
| 보조 텍스트 | `text-gray-600` | 라벨, 설명 |
| 비활성 텍스트 | `text-gray-500` | placeholder, 비활성 상태 |

### 4.2 배경 색상

| 용도 | 색상 클래스 | 용례 |
|------|------------|------|
| 기본 배경 | `bg-white` | 카드, 모달 |
| 페이지 배경 | `bg-gray-50` | 대시보드 배경 |
| 비활성 배경 | `bg-gray-50` | disabled 입력 필드 |

### 4.3 강조 색상

| 용도 | 색상 클래스 | 용례 |
|------|------------|------|
| Primary | `bg-blue-600`, `text-blue-600` | 주요 버튼, 링크 |
| Success | `bg-green-600`, `text-green-600` | 성공 메시지, 긍정 상태 |
| Warning | `bg-yellow-500`, `text-yellow-600` | 경고 메시지 |
| Danger | `bg-red-600`, `text-red-600` | 삭제, 오류 |

## 5. 타이포그래피

### 5.1 제목

```tsx
// 페이지 제목
<h1 className="text-3xl font-bold text-gray-900">페이지 제목</h1>

// 섹션 제목
<h2 className="text-xl font-semibold text-gray-900">섹션 제목</h2>

// 카드 제목
<h3 className="text-lg font-semibold text-gray-900">카드 제목</h3>
```

### 5.2 본문

```tsx
// 일반 본문
<p className="text-gray-600">본문 텍스트</p>

// 강조 텍스트
<p className="font-medium text-gray-900">강조된 텍스트</p>

// 작은 텍스트
<p className="text-sm text-gray-500">작은 텍스트</p>
```

## 6. 체크리스트

새로운 폼을 작성할 때 다음 사항을 확인하세요:

- [ ] 모든 `<input>` 태그에 `text-gray-900` 클래스가 있는가?
- [ ] 모든 `<select>` 태그에 `text-gray-900` 클래스가 있는가?
- [ ] 모든 `<textarea>` 태그에 `text-gray-900` 클래스가 있는가?
- [ ] 포커스 스타일(`focus:outline-none focus:ring-2 focus:ring-blue-500`)이 적용되었는가?
- [ ] placeholder가 있는 경우 `placeholder:text-gray-400`가 적용되었는가?
- [ ] 비활성 입력 필드의 경우 `text-gray-900`이 여전히 포함되어 있는가?

## 7. 일반 원칙

1. **가독성 최우선**: 입력 필드의 텍스트는 항상 명확하게 읽을 수 있어야 합니다.
2. **일관성**: 동일한 유형의 컴포넌트는 동일한 스타일을 사용합니다.
3. **접근성**: 색상만으로 정보를 전달하지 말고, 텍스트나 아이콘을 함께 사용합니다.
4. **피드백**: 사용자 액션(클릭, 포커스)에 대한 시각적 피드백을 제공합니다.

## 8. 참고 파일

이 가이드라인이 적용된 파일 예시:
- `/apps/web/src/app/(dashboard)/management/page.tsx` (회원사 관리 페이지)
- `/apps/web/src/app/(dashboard)/management/[id]/page.tsx` (회원사 상세 페이지)
- `/apps/web/src/components/QuotaRechargeModal.tsx` (쿼터 충전 모달)

---

**마지막 업데이트**: 2025-11-15
**버전**: 1.0
