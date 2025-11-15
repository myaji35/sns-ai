import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI 하위 주제 생성 서비스
 *
 * 메인 주제를 기반으로 10개의 하위 주제를 자동 생성
 */
export class AISubtopicService {
  private static openai: OpenAI | null = null;
  private static anthropic: Anthropic | null = null;
  private static gemini: GoogleGenerativeAI | null = null;

  /**
   * AI 클라이언트 초기화
   */
  private static initializeClients() {
    if (process.env.OPENAI_API_KEY && !this.openai) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.ANTHROPIC_API_KEY && !this.anthropic) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    if (process.env.GOOGLE_AI_API_KEY && !this.gemini) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }
  }

  /**
   * 하위 주제 생성 프롬프트
   */
  private static generatePrompt(
    mainTopic: string,
    category?: string,
    brandContext?: {
      industry?: string;
      toneAndManner?: string;
      targetAudience?: string;
    }
  ): string {
    let prompt = `당신은 콘텐츠 기획 전문가입니다. 다음 메인 주제에 대해 SNS 콘텐츠로 활용할 수 있는 10개의 구체적인 하위 주제를 생성해주세요.

메인 주제: "${mainTopic}"`;

    if (category) {
      prompt += `\n카테고리: ${category}`;
    }

    if (brandContext) {
      if (brandContext.industry) {
        prompt += `\n업종: ${brandContext.industry}`;
      }
      if (brandContext.toneAndManner) {
        prompt += `\n톤앤매너: ${brandContext.toneAndManner}`;
      }
      if (brandContext.targetAudience) {
        prompt += `\n타겟 고객: ${brandContext.targetAudience}`;
      }
    }

    prompt += `

요구사항:
1. 각 하위 주제는 구체적이고 실행 가능해야 합니다
2. SNS(인스타그램, 페이스북, 링크드인 등)에 적합한 콘텐츠여야 합니다
3. 타겟 고객의 관심을 끌 수 있는 주제여야 합니다
4. 다양한 관점과 접근 방식을 포함해야 합니다
5. 각 주제는 15-30자 이내로 간결하게 작성해주세요

출력 형식:
1. [첫 번째 하위 주제]
2. [두 번째 하위 주제]
...
10. [열 번째 하위 주제]

하위 주제 10개를 생성해주세요:`;

    return prompt;
  }

  /**
   * OpenAI GPT를 사용한 하위 주제 생성
   */
  private static async generateWithOpenAI(prompt: string): Promise<string[]> {
    if (!this.openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 콘텐츠 기획 전문가입니다. 주어진 주제에 대해 창의적이고 실용적인 하위 주제를 생성합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content || '';
      return this.parseSubtopics(response);
    } catch (error) {
      console.error('OpenAI 하위 주제 생성 오류:', error);
      throw error;
    }
  }

  /**
   * Anthropic Claude를 사용한 하위 주제 생성
   */
  private static async generateWithAnthropic(prompt: string): Promise<string[]> {
    if (!this.anthropic) {
      throw new Error('Anthropic API 키가 설정되지 않았습니다');
    }

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const response = message.content[0].type === 'text'
        ? message.content[0].text
        : '';
      return this.parseSubtopics(response);
    } catch (error) {
      console.error('Anthropic 하위 주제 생성 오류:', error);
      throw error;
    }
  }

  /**
   * Google Gemini를 사용한 하위 주제 생성
   */
  private static async generateWithGemini(prompt: string): Promise<string[]> {
    if (!this.gemini) {
      throw new Error('Google AI API 키가 설정되지 않았습니다');
    }

    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      return this.parseSubtopics(response);
    } catch (error) {
      console.error('Gemini 하위 주제 생성 오류:', error);
      throw error;
    }
  }

  /**
   * AI 응답을 하위 주제 배열로 파싱
   */
  private static parseSubtopics(response: string): string[] {
    const subtopics: string[] = [];

    // 번호가 매겨진 항목 추출 (1. xxx, 2. xxx 형식)
    const lines = response.split('\n');
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match && match[1]) {
        subtopics.push(match[1].trim());
      }
    }

    // 10개가 안 되면 추가 파싱 시도
    if (subtopics.length < 10) {
      for (const line of lines) {
        // - 또는 * 로 시작하는 항목도 추출
        const match = line.match(/^[-*]\s*(.+)/);
        if (match && match[1] && subtopics.length < 10) {
          subtopics.push(match[1].trim());
        }
      }
    }

    return subtopics.slice(0, 10); // 최대 10개까지만 반환
  }

  /**
   * 하위 주제 생성 (메인 메서드)
   */
  static async generateSubtopics(
    mainTopic: string,
    options: {
      category?: string;
      brandContext?: {
        industry?: string;
        toneAndManner?: string;
        targetAudience?: string;
      };
      provider?: 'openai' | 'anthropic' | 'gemini' | 'auto';
      userApiKey?: string;
    } = {}
  ): Promise<string[]> {
    this.initializeClients();

    const prompt = this.generatePrompt(
      mainTopic,
      options.category,
      options.brandContext
    );

    let provider = options.provider || 'auto';

    // 사용자가 제공한 API 키가 있으면 임시로 설정
    if (options.userApiKey) {
      if (provider === 'openai') {
        this.openai = new OpenAI({ apiKey: options.userApiKey });
      } else if (provider === 'anthropic') {
        this.anthropic = new Anthropic({ apiKey: options.userApiKey });
      } else if (provider === 'gemini') {
        this.gemini = new GoogleGenerativeAI(options.userApiKey);
      }
    }

    // Auto 모드: 사용 가능한 첫 번째 프로바이더 사용
    if (provider === 'auto') {
      if (this.openai) provider = 'openai';
      else if (this.anthropic) provider = 'anthropic';
      else if (this.gemini) provider = 'gemini';
      else throw new Error('사용 가능한 AI 프로바이더가 없습니다. API 키를 설정해주세요.');
    }

    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt);
        case 'anthropic':
          return await this.generateWithAnthropic(prompt);
        case 'gemini':
          return await this.generateWithGemini(prompt);
        default:
          throw new Error(`지원하지 않는 프로바이더: ${provider}`);
      }
    } catch (error) {
      console.error('하위 주제 생성 실패:', error);

      // 폴백: 기본 하위 주제 생성
      return this.generateDefaultSubtopics(mainTopic);
    }
  }

  /**
   * 기본 하위 주제 생성 (AI 실패 시 폴백)
   */
  private static generateDefaultSubtopics(mainTopic: string): string[] {
    return [
      `${mainTopic}의 기본 개념`,
      `${mainTopic}의 장점과 특징`,
      `${mainTopic} 활용 사례`,
      `${mainTopic} 시작하기`,
      `${mainTopic} 관련 팁`,
      `${mainTopic}의 트렌드`,
      `${mainTopic} Q&A`,
      `${mainTopic} 체크리스트`,
      `${mainTopic} 성공 사례`,
      `${mainTopic} 주의사항`,
    ];
  }
}