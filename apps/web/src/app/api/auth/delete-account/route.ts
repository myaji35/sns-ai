import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteAllUserProfileImages } from '@/lib/api/profile-api';

/**
 * 계정 삭제 API 엔드포인트
 *
 * POST /api/auth/delete-account
 *
 * 기능:
 * 1. 사용자 인증 확인
 * 2. Supabase Storage에서 프로필 이미지 삭제
 * 3. profiles 테이블에서 사용자 정보 삭제 (또는 soft delete)
 * 4. Supabase Auth에서 사용자 삭제 (auth.users)
 * 5. 삭제 이력 로깅
 *
 * 보안:
 * - HTTPS 연결만 허용
 * - 인증된 사용자만 자신의 계정 삭제 가능
 * - GDPR 규정 준수
 */
export async function POST(request: NextRequest) {
  try {
    // HTTPS 연결 확인 (production 환경에서만)
    if (
      process.env.NODE_ENV === 'production' &&
      !request.url.startsWith('https://')
    ) {
      return NextResponse.json(
        { message: 'HTTPS 연결만 허용됩니다' },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: '사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // Supabase 서버 클라이언트 생성
    const supabase = await createClient();

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: '세션이 만료되었습니다. 다시 로그인하세요' },
        { status: 401 }
      );
    }

    // 요청한 userId와 현재 사용자가 일치하는지 확인 (본인만 삭제 가능)
    if (user.id !== userId) {
      return NextResponse.json(
        { message: '본인의 계정만 삭제할 수 있습니다' },
        { status: 403 }
      );
    }

    // 삭제 시작 로그
    console.log(`[Account Deletion] Starting deletion for user: ${userId}`);
    console.log(`[Account Deletion] Email: ${user.email}`);
    console.log(`[Account Deletion] Timestamp: ${new Date().toISOString()}`);

    // Step 1: Storage에서 프로필 이미지 삭제
    try {
      const imagesDeletionSuccess = await deleteAllUserProfileImages(userId);
      if (imagesDeletionSuccess) {
        console.log(`[Account Deletion] Storage files deleted for user: ${userId}`);
      } else {
        console.warn(
          `[Account Deletion] Failed to delete some storage files for user: ${userId}`
        );
        // Storage 삭제 실패는 치명적이지 않으므로 계속 진행
      }
    } catch (storageError) {
      console.error('[Account Deletion] Storage deletion error:', storageError);
      // Storage 삭제 실패해도 계정 삭제는 계속 진행
    }

    // Step 2: profiles 테이블 처리
    // 옵션 1: Soft delete (deleted_at 타임스탬프 추가)
    // 옵션 2: Hard delete (레코드 완전 삭제)
    // 여기서는 Hard delete 구현 (Soft delete는 마이그레이션 후 주석 해제)

    // Soft delete 옵션 (deleted_at 컬럼이 있는 경우)
    /*
    const { error: softDeleteError } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId);

    if (softDeleteError) {
      console.error('[Account Deletion] Soft delete error:', softDeleteError);
      return NextResponse.json(
        { message: '계정 삭제에 실패했습니다. 나중에 다시 시도해주세요' },
        { status: 500 }
      );
    }
    */

    // Hard delete 옵션 (기본)
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileDeleteError) {
      console.error('[Account Deletion] Profile deletion error:', profileDeleteError);
      return NextResponse.json(
        { message: '프로필 삭제에 실패했습니다. 나중에 다시 시도해주세요' },
        { status: 500 }
      );
    }

    console.log(`[Account Deletion] Profile deleted for user: ${userId}`);

    // Step 3: Supabase Auth에서 사용자 삭제
    // 주의: auth.admin.deleteUser()는 서버 사이드에서만 작동
    // Service Role Key가 필요함
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      userId
    );

    if (authDeleteError) {
      console.error('[Account Deletion] Auth deletion error:', authDeleteError);
      return NextResponse.json(
        { message: '계정 삭제에 실패했습니다. 관리자에게 문의하세요' },
        { status: 500 }
      );
    }

    console.log(`[Account Deletion] Auth user deleted: ${userId}`);

    // 삭제 완료 로그
    console.log(`[Account Deletion] Successfully deleted account: ${userId}`);
    console.log(`[Account Deletion] Completion timestamp: ${new Date().toISOString()}`);

    // GDPR 규정 준수: 삭제 이력 로깅 (별도 감사 로그 테이블에 기록 가능)
    // 예: audit_logs 테이블에 기록
    /*
    await supabase.from('audit_logs').insert({
      action: 'account_deletion',
      user_id: userId,
      user_email: user.email,
      timestamp: new Date().toISOString(),
      metadata: { reason: 'User requested account deletion' },
    });
    */

    return NextResponse.json(
      {
        message: '계정이 성공적으로 삭제되었습니다',
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Account Deletion] Unexpected error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요' },
      { status: 500 }
    );
  }
}
