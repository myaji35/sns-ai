import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AISubtopicService } from '@/lib/services/ai-subtopic.service';
import { SheetsSyncService } from '@/lib/services/sheets-sync.service';

/**
 * POST /api/ai/generate-subtopics
 *
 * AI를 사용하여 하위 주제 생성
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
    const {
      topicId,
      mainTopic,
      category,
      provider = 'auto',
      writeBack = true, // Sheets에 다시 쓸지 여부
    } = body;

    if (!mainTopic) {
      return NextResponse.json(
        { error: '메인 주제가 필요합니다' },
        { status: 400 }
      );
    }

    // 사용자 프로필에서 브랜드 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_type, tone_manner, target_audience')
      .eq('id', user.id)
      .single();

    // 사용자 AI API 키 가져오기 (암호화된 상태로 저장됨)
    const { data: apiKeys } = await supabase
      .from('user_api_keys')
      .select('provider, api_key')
      .eq('user_id', user.id);

    let userApiKey: string | undefined;
    if (apiKeys && apiKeys.length > 0) {
      const keyRecord = apiKeys.find(k => k.provider === provider) || apiKeys[0];
      if (keyRecord) {
        // 실제로는 복호화 필요
        userApiKey = keyRecord.api_key;
      }
    }

    // AI로 하위 주제 생성
    const subtopics = await AISubtopicService.generateSubtopics(mainTopic, {
      category,
      brandContext: profile ? {
        industry: profile.business_type,
        toneAndManner: profile.tone_manner,
        targetAudience: profile.target_audience,
      } : undefined,
      provider: provider as any,
      userApiKey,
    });

    // topicId가 제공되면 DB 업데이트 및 Sheets 쓰기
    if (topicId && writeBack) {
      // calendar_topics 테이블 업데이트
      const { data: topic, error: topicError } = await supabase
        .from('calendar_topics')
        .update({
          subtopics,
          ai_generated: true,
          status: 'AI 생성 완료',
        })
        .eq('id', topicId)
        .select('calendar_id')
        .single();

      if (!topicError && topic) {
        // Google Sheets에 다시 쓰기
        await SheetsSyncService.writeBackSubtopics(
          user.id,
          topic.calendar_id,
          topicId,
          subtopics
        );
      }
    }

    return NextResponse.json({
      success: true,
      subtopics,
      count: subtopics.length,
      message: `${subtopics.length}개의 하위 주제가 생성되었습니다`,
    });

  } catch (error) {
    console.error('하위 주제 생성 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '하위 주제 생성 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/generate-subtopics/batch
 *
 * 여러 주제에 대해 일괄적으로 하위 주제 생성
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { calendarId, topicIds = [] } = body;

    if (!calendarId) {
      return NextResponse.json(
        { error: '캘린더 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 캘린더 소유권 확인
    const { data: calendar } = await supabase
      .from('content_calendars')
      .select('id')
      .eq('id', calendarId)
      .eq('user_id', user.id)
      .single();

    if (!calendar) {
      return NextResponse.json(
        { error: '캘린더를 찾을 수 없습니다' },
        { status: 403 }
      );
    }

    // 처리할 토픽 가져오기
    let query = supabase
      .from('calendar_topics')
      .select('*')
      .eq('calendar_id', calendarId)
      .is('ai_generated', false);

    if (topicIds.length > 0) {
      query = query.in('id', topicIds);
    }

    const { data: topics, error: topicsError } = await query;

    if (topicsError || !topics) {
      return NextResponse.json(
        { error: '토픽을 가져올 수 없습니다' },
        { status: 500 }
      );
    }

    // 각 토픽에 대해 하위 주제 생성
    const results = [];
    const errors = [];

    for (const topic of topics) {
      try {
        const subtopics = await AISubtopicService.generateSubtopics(
          topic.main_topic,
          {
            category: topic.category,
            provider: 'auto',
          }
        );

        // DB 업데이트 및 Sheets 쓰기
        await supabase
          .from('calendar_topics')
          .update({
            subtopics,
            ai_generated: true,
            status: 'AI 생성 완료',
          })
          .eq('id', topic.id);

        await SheetsSyncService.writeBackSubtopics(
          user.id,
          calendarId,
          topic.id,
          subtopics
        );

        results.push({
          topicId: topic.id,
          mainTopic: topic.main_topic,
          success: true,
        });

        // API 제한을 피하기 위해 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errors.push({
          topicId: topic.id,
          mainTopic: topic.main_topic,
          error: error instanceof Error ? error.message : '생성 실패',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      results,
      errors,
    });

  } catch (error) {
    console.error('일괄 하위 주제 생성 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '일괄 처리 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}