import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SheetsTemplateService } from '@/lib/services/sheets-template.service';

/**
 * POST /api/sheets/create-calendar
 *
 * 새로운 콘텐츠 캘린더 Google Sheets 생성
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
    const { brandName, addSampleData } = body;

    if (!brandName) {
      return NextResponse.json(
        { error: '브랜드명이 필요합니다' },
        { status: 400 }
      );
    }

    // Google Sheets 연동 확인
    const { data: connection, error: connectionError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'google_sheets')
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'Google Sheets 연동이 필요합니다' },
        { status: 400 }
      );
    }

    // 콘텐츠 캘린더 생성
    const { spreadsheetId, spreadsheetUrl } = await SheetsTemplateService.createContentCalendar(
      user.id,
      brandName
    );

    // 샘플 데이터 추가 (선택사항)
    if (addSampleData) {
      await SheetsTemplateService.addSampleData(user.id, spreadsheetId);
    }

    // content_calendar 테이블에 저장
    const { data: calendar, error: saveError } = await supabase
      .from('content_calendars')
      .insert({
        user_id: user.id,
        google_sheet_id: spreadsheetId,
        google_sheet_url: spreadsheetUrl,
        brand_name: brandName,
        is_active: true,
      })
      .select()
      .single();

    if (saveError) {
      console.error('캘린더 정보 저장 실패:', saveError);
      // Sheets는 생성되었으므로 URL은 반환
      return NextResponse.json({
        spreadsheetId,
        spreadsheetUrl,
        warning: '캘린더가 생성되었지만 DB 저장에 실패했습니다',
      });
    }

    return NextResponse.json({
      success: true,
      calendar: {
        id: calendar.id,
        spreadsheetId,
        spreadsheetUrl,
        brandName,
      },
      message: '콘텐츠 캘린더가 성공적으로 생성되었습니다',
    });

  } catch (error) {
    console.error('콘텐츠 캘린더 생성 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '캘린더 생성 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}