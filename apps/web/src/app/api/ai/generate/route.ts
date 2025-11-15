import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ContentOrchestrator } from '@/lib/ai/orchestrator';
import { ContentGenerationRequest } from '@/lib/ai/types';

/**
 * POST /api/ai/generate
 *
 * AI 콘텐츠 생성 엔드포인트
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
    const body: ContentGenerationRequest = await request.json();

    // 요청 유효성 검증
    if (!body.type) {
      return NextResponse.json(
        { error: '콘텐츠 타입이 필요합니다' },
        { status: 400 }
      );
    }

    if (body.type === 'subtopics' && !body.mainTopic) {
      return NextResponse.json(
        { error: '메인 주제가 필요합니다' },
        { status: 400 }
      );
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_type, tone_manner, target_audience, brand_name')
      .eq('id', user.id)
      .single();

    // 브랜드 컨텍스트 병합
    if (profile) {
      body.brandContext = {
        ...body.brandContext,
        name: body.brandContext?.name || profile.brand_name,
        industry: body.brandContext?.industry || profile.business_type,
        toneAndManner: body.brandContext?.toneAndManner || profile.tone_manner,
        targetAudience: body.brandContext?.targetAudience || profile.target_audience,
      };
    }

    // 사용자 API 키 가져오기
    const { data: apiKeys } = await supabase
      .from('user_api_keys')
      .select('provider, api_key')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const userApiKeys: Record<string, string> = {};
    if (apiKeys) {
      for (const key of apiKeys) {
        // 실제로는 복호화 필요
        userApiKeys[key.provider] = key.api_key;
      }
    }

    // ContentOrchestrator 초기화
    const orchestrator = new ContentOrchestrator(userApiKeys);

    // 사용 가능한 프로바이더 확인
    const availableProviders = await orchestrator.getAvailableProviders();
    if (availableProviders.length === 0) {
      return NextResponse.json(
        {
          error: 'AI 프로바이더를 사용할 수 없습니다. API 키를 설정해주세요.',
          availableProviders,
        },
        { status: 503 }
      );
    }

    // 콘텐츠 생성
    const generatedContent = await orchestrator.generateContent(body);

    // 생성된 콘텐츠 저장
    const { data: savedContent, error: saveError } = await supabase
      .from('generated_contents')
      .insert({
        user_id: user.id,
        type: body.type,
        main_topic: body.mainTopic,
        content: generatedContent.content,
        metadata: generatedContent.metadata,
        versions: generatedContent.versions,
        platform: body.platform,
        status: 'draft',
      })
      .select()
      .single();

    if (saveError) {
      console.error('콘텐츠 저장 오류:', saveError);
      // 저장 실패해도 생성된 콘텐츠는 반환
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      contentId: savedContent?.id,
      availableProviders,
      message: `${availableProviders.length}개 프로바이더를 사용하여 콘텐츠를 생성했습니다`,
    });

  } catch (error) {
    console.error('콘텐츠 생성 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '콘텐츠 생성 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/generate/health
 *
 * AI 프로바이더 상태 확인
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

    // 사용자 API 키 가져오기
    const { data: apiKeys } = await supabase
      .from('user_api_keys')
      .select('provider, api_key')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const userApiKeys: Record<string, string> = {};
    if (apiKeys) {
      for (const key of apiKeys) {
        userApiKeys[key.provider] = key.api_key;
      }
    }

    // 환경 변수 키도 확인
    const hasOpenAI = !!userApiKeys.openai || !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!userApiKeys.anthropic || !!process.env.ANTHROPIC_API_KEY;
    const hasGoogle = !!userApiKeys.google || !!process.env.GOOGLE_AI_API_KEY;

    // 실제 가용성 확인
    const orchestrator = new ContentOrchestrator(userApiKeys);
    const availableProviders = await orchestrator.getAvailableProviders();

    return NextResponse.json({
      status: 'healthy',
      providers: {
        openai: {
          hasKey: hasOpenAI,
          available: availableProviders.includes('openai'),
        },
        anthropic: {
          hasKey: hasAnthropic,
          available: availableProviders.includes('anthropic'),
        },
        google: {
          hasKey: hasGoogle,
          available: availableProviders.includes('google'),
        },
      },
      availableCount: availableProviders.length,
      availableProviders,
    });

  } catch (error) {
    console.error('Health check 오류:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Health check 실패',
      },
      { status: 500 }
    );
  }
}