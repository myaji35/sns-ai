import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateRequest {
  topic: string;
  provider: 'openai' | 'anthropic' | 'google' | 'all';
  tone?: string;
  industry?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, provider, tone, industry } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Get current user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's API keys
    const { data: apiKeys } = await supabase
      .from('llm_api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!apiKeys || apiKeys.length === 0) {
      return NextResponse.json(
        { error: 'No API keys configured. Please add API keys in settings.' },
        { status: 400 }
      );
    }

    const keyMap = new Map(apiKeys.map((k) => [k.provider, k.api_key]));

    // Create prompt
    const systemPrompt = `당신은 전문 콘텐츠 작가입니다. 주어진 주제에 대해 블로그 포스트를 작성하세요.`;
    const userPrompt = `
주제: ${topic}
${industry ? `업종: ${industry}` : ''}
${tone ? `톤앤매너: ${tone}` : ''}

다음 형식으로 블로그 포스트를 작성해주세요:
1. 제목 (매력적이고 SEO에 최적화된)
2. 메타 설명 (150자 이내)
3. 본문 (마크다운 형식, 최소 800자)
4. 결론
5. 관련 키워드 10개 (쉼표로 구분)

전문적이고 가치 있는 콘텐츠를 작성해주세요.
`;

    const results: any = {};

    // Generate content based on provider
    if (provider === 'openai' || provider === 'all') {
      if (keyMap.has('openai')) {
        try {
          const openai = new OpenAI({ apiKey: keyMap.get('openai') });
          const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          });

          results.openai = {
            content: completion.choices[0]?.message?.content || '',
            model: 'gpt-4-turbo-preview',
            usage: completion.usage,
          };
        } catch (error: any) {
          results.openai = {
            error: error.message || 'Failed to generate with OpenAI',
          };
        }
      }
    }

    if (provider === 'anthropic' || provider === 'all') {
      if (keyMap.has('anthropic')) {
        try {
          const anthropic = new Anthropic({ apiKey: keyMap.get('anthropic') });
          const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          });

          results.anthropic = {
            content:
              message.content[0]?.type === 'text' ? message.content[0].text : '',
            model: 'claude-3-5-sonnet-20241022',
            usage: message.usage,
          };
        } catch (error: any) {
          results.anthropic = {
            error: error.message || 'Failed to generate with Anthropic',
          };
        }
      }
    }

    if (provider === 'google' || provider === 'all') {
      if (keyMap.has('google')) {
        try {
          const genAI = new GoogleGenerativeAI(keyMap.get('google')!);
          const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
          const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
          const response = await result.response;

          results.google = {
            content: response.text(),
            model: 'gemini-pro',
          };
        } catch (error: any) {
          results.google = {
            error: error.message || 'Failed to generate with Google',
          };
        }
      }
    }

    if (Object.keys(results).length === 0) {
      return NextResponse.json(
        { error: 'No API keys available for the selected provider(s)' },
        { status: 400 }
      );
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
