# Google Sheets API Setup Guide

## Prerequisites
- Google Cloud Console 계정
- 프로젝트 생성 권한

## Setup Steps

### 1. Google Cloud Console 프로젝트 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 2. API 활성화

1. 좌측 메뉴에서 "API 및 서비스" → "라이브러리" 선택
2. 다음 API를 검색하여 활성화:
   - **Google Sheets API**
   - **Google Drive API**

### 3. OAuth 2.0 자격 증명 생성

1. "API 및 서비스" → "자격 증명" 메뉴로 이동
2. "자격 증명 만들기" → "OAuth 클라이언트 ID" 선택
3. 애플리케이션 유형: "웹 애플리케이션" 선택
4. 이름: "ContentFlow AI Sheets Integration" (또는 원하는 이름)
5. 승인된 리디렉션 URI 추가:
   - 개발: `http://localhost:3000/api/auth/google-sheets/callback`
   - 프로덕션: `https://your-domain.com/api/auth/google-sheets/callback`

### 4. OAuth 동의 화면 구성

1. "OAuth 동의 화면" 메뉴로 이동
2. 앱 정보 입력:
   - 앱 이름: "ContentFlow AI"
   - 사용자 지원 이메일: 유효한 이메일 주소
   - 앱 도메인: 프로덕션 도메인 (선택사항)
3. 범위(Scopes) 추가:
   - `https://www.googleapis.com/auth/spreadsheets` - Google Sheets 읽기/쓰기
   - `https://www.googleapis.com/auth/drive.file` - 앱이 생성한 파일만 접근
4. 테스트 사용자 추가 (개발 중인 경우)

### 5. 자격 증명 다운로드

1. 생성된 OAuth 2.0 클라이언트 ID의 다운로드 버튼 클릭
2. JSON 파일 다운로드
3. 파일에서 다음 값을 확인:
   - `client_id`
   - `client_secret`

### 6. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수 추가:

```env
# Google OAuth for Sheets API
GOOGLE_SHEETS_CLIENT_ID=your_client_id_here
GOOGLE_SHEETS_CLIENT_SECRET=your_client_secret_here
GOOGLE_SHEETS_REDIRECT_URI=http://localhost:3000/api/auth/google-sheets/callback
```

## Important Notes

- **별도의 OAuth 클라이언트**: Google 로그인용 OAuth와 Sheets API용 OAuth는 별도로 관리됩니다.
- **스코프 제한**: 최소 필요 권한만 요청하여 사용자 신뢰도를 높입니다.
- **테스트 모드**: 초기에는 테스트 모드로 시작하여 제한된 사용자만 접근 가능합니다.
- **프로덕션 전환**: 실제 배포 시 OAuth 동의 화면 검증이 필요할 수 있습니다.

## Troubleshooting

### "redirect_uri_mismatch" 오류
- Google Cloud Console에서 설정한 리디렉션 URI가 정확히 일치하는지 확인
- 프로토콜(http/https), 도메인, 포트, 경로가 모두 일치해야 함

### "invalid_client" 오류
- Client ID와 Client Secret이 올바르게 설정되었는지 확인
- 환경 변수가 제대로 로드되는지 확인

### "access_denied" 오류
- OAuth 동의 화면에서 필요한 스코프가 추가되었는지 확인
- 테스트 모드인 경우 테스트 사용자로 등록되었는지 확인