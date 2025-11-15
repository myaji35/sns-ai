import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SheetsSyncService } from '@/lib/services/sheets-sync.service';

/**
 * POST /api/sheets/sync
 *
 * Google Sheets와 데이터베이스 동기화
 */
export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 요청 바디 파싱
    const body = await request.json();
    const { calendarId } = body;

    if (!calendarId) {
      return NextResponse.json(
        { error: '캘린더 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 캘린더 소유권 확인
    const { data: calendar, error: calendarError } = await supabase
      .from('content_calendars')
      .select('*')
      .eq('id', calendarId)
      .eq('user_id', user.id)
      .single();

    if (calendarError || !calendar) {
      return NextResponse.json(
        { error: '캘린더를 찾을 수 없거나 권한이 없습니다' },
        { status: 403 }
      );
    }

    // 동기화 실행
    const syncResult = await SheetsSyncService.syncContentCalendar(
      user.id,
      calendarId
    );

    return NextResponse.json({
      success: true,
      message: `동기화 완료: ${syncResult.added}개 추가, ${syncResult.updated}개 업데이트`,
      result: syncResult,
      lastSyncedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('동기화 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '동기화 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sheets/sync?calendarId=xxx
 *
 * 변경사항 확인 (폴링용)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId');

    if (!calendarId) {
      return NextResponse.json(
        { error: '캘린더 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 변경사항 감지
    const changes = await SheetsSyncService.detectChanges(user.id, calendarId);

    return NextResponse.json({
      success: true,
      ...changes,
    });

  } catch (error) {
    console.error('변경사항 확인 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '변경사항 확인 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}