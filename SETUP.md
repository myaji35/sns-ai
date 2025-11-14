# ContentFlow AI - Setup Guide

## Google OAuth 설정

### 1. Google Cloud Console 설정 완료 ✅

**Client ID**: `YOUR_GOOGLE_CLIENT_ID`
**Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

⚠️ **보안 주의**: 이 정보는 민감한 정보입니다. 실제 값은 별도 관리하세요!

### 2. Supabase에서 Google Provider 활성화

#### 로컬 개발 (Supabase Local)

1. Supabase Dashboard 열기:
   ```bash
   supabase start
   ```
   - Studio URL: http://localhost:54323

2. **Authentication → Providers → Google** 메뉴로 이동

3. **Google Enabled** 토글을 ON으로 변경

4. 다음 정보 입력:
   - **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
   - **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

4. Redirect URL 확인:
   - Local: `http://localhost:54321/auth/v1/callback`

#### 프로덕션 배포

1. Supabase Cloud Dashboard 접속

2. Authentication → Providers → Google 활성화

3. 동일한 Client ID/Secret 입력

4. Google Cloud Console에서 Authorized redirect URIs 추가:
   - `https://your-project.supabase.co/auth/v1/callback`

### 3. 환경 변수 설정

프로덕션 배포 시 Vercel에서 다음 환경 변수 설정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Google Cloud Console Authorized URLs

**Authorized JavaScript origins**:
- `http://localhost:3001` (개발)
- `http://localhost:54321` (Supabase Local)
- `https://your-domain.com` (프로덕션)
- `https://your-project.supabase.co` (프로덕션)

**Authorized redirect URIs**:
- `http://localhost:54321/auth/v1/callback` (로컬)
- `https://your-project.supabase.co/auth/v1/callback` (프로덕션)

## 테스트

1. 개발 서버 실행:
   ```bash
   pnpm dev
   ```

2. Google 로그인 테스트:
   - http://localhost:3001/login
   - "Google로 계속하기" 버튼 클릭
   - Google 계정 선택
   - 대시보드로 리다이렉트 확인

## 현재 상태

- ✅ Google OAuth Client ID 생성
- ✅ Google OAuth Client Secret 생성
- ⏳ Supabase에 Google Provider 설정 필요 (수동 단계)
- ✅ 프론트엔드 Google 로그인 구현 완료
- ✅ OAuth 콜백 라우트 구현 완료
- ✅ 환경 변수 파일 업데이트

## 다음 단계

### 즉시 할 수 있는 작업:

1. **Supabase 프로젝트 생성** (아직 안 했다면):
   - https://supabase.com 에서 새 프로젝트 생성
   - 또는 `supabase start`로 로컬 개발 시작

2. **Supabase Dashboard에서 Google Provider 설정**:
   - Authentication → Providers → Google 활성화
   - Client ID와 Secret 입력 (위 참조)
   - Save 클릭

3. **Supabase 환경 변수 업데이트**:
   ```bash
   # Supabase 프로젝트 정보 가져오기
   supabase status  # 로컬인 경우
   ```

   `.env.local` 파일 업데이트:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

4. **Google 로그인 테스트**:
   - http://localhost:3001/login
   - "Google로 계속하기" 클릭
   - Google 계정으로 로그인
   - 대시보드로 리다이렉트 확인

### 프로덕션 배포 시:

1. Vercel 환경 변수 설정
2. Google Cloud Console에 프로덕션 Redirect URI 추가
3. Supabase Cloud에서 동일한 Google Provider 설정
