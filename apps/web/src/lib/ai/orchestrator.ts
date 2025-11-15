import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GoogleProvider } from './providers/google.provider';
import {
  LLMProvider,
  LLMResponse,
  GenerationOptions,
  ContentGenerationRequest,
  GeneratedContent,
  ContentVersion,
} from './types';

/**
 * 멀티 LLM 오케스트레이터
 *
 * 여러 LLM을 동시에 호출하고 최적의 결과를 선택
 */
export class ContentOrchestrator {
  private providers: Map<string, LLMProvider> = new Map();
  private timeouts = {
    openai: 60000, // 60초
    anthropic: 60000, // 60초
    google: 45000, // 45초
  };

  constructor(apiKeys?: {
    openai?: string;
    anthropic?: string;
    google?: string;
  }) {
    // 프로바이더 초기화
    if (apiKeys?.openai || process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider(apiKeys?.openai));
    }

    if (apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider(apiKeys?.anthropic));
    }

    if (apiKeys?.google || process.env.GOOGLE_AI_API_KEY) {
      this.providers.set('google', new GoogleProvider(apiKeys?.google));
    }
  }

  /**
   * 사용 가능한 프로바이더 확인
   */
  async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];

    for (const [name, provider] of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          available.push(name);
        }
      } catch (error) {
        console.error(`Provider ${name} availability check failed:`, error);
      }
    }

    return available;
  }

  /**
   * 타임아웃이 있는 프로미스 래퍼
   */
  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      ),
    ]);
  }

  /**
   * 모든 프로바이더에 동시 요청
   */
  async generateWithAllProviders(
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse[]> {
    const availableProviders = await this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    const promises = availableProviders.map(async (providerName) => {
      const provider = this.providers.get(providerName)!;
      const timeout = this.timeouts[providerName as keyof typeof this.timeouts] || 60000;

      try {
        return await this.withTimeout(
          provider.generateContent(prompt, options),
          timeout,
          `${providerName} timeout after ${timeout}ms`
        );
      } catch (error) {
        console.error(`Provider ${providerName} failed:`, error);
        return {
          provider: providerName as any,
          model: provider.getModelName(),
          content: '',
          tokensUsed: 0,
          latency: timeout,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.allSettled(promises);

    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<LLMResponse>).value)
      .filter((response) => !response.error && response.content);
  }

  /**
   * 콘텐츠 품질 점수 계산
   */
  private calculateQualityScore(
    content: string,
    request: ContentGenerationRequest
  ): number {
    let score = 50; // 기본 점수

    // 길이 체크
    const wordCount = content.split(/\s+/).length;
    if (request.contentLength === 'short' && wordCount >= 100 && wordCount <= 300) {
      score += 10;
    } else if (request.contentLength === 'medium' && wordCount >= 300 && wordCount <= 800) {
      score += 10;
    } else if (request.contentLength === 'long' && wordCount >= 800) {
      score += 10;
    }

    // 키워드 포함 체크
    if (request.brandContext?.keywords) {
      const keywordMatches = request.brandContext.keywords.filter((keyword) =>
        content.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += Math.min(keywordMatches * 5, 20);
    }

    // 구조 체크 (제목, 단락 등)
    if (content.includes('#') || content.includes('\n\n')) {
      score += 10;
    }

    // 이모지나 특수문자 사용 (SNS 콘텐츠인 경우)
    if (request.platform && request.platform !== 'blog') {
      if (/[\u{1F300}-\u{1F9FF}]/u.test(content)) {
        score += 5;
      }
    }

    // 한국어 자연스러움 (간단한 체크)
    if (!/[a-zA-Z]{20,}/.test(content)) { // 긴 영어 단어가 없으면
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * 최고 품질 콘텐츠 선택
   */
  private selectBestContent(
    responses: LLMResponse[],
    request: ContentGenerationRequest
  ): ContentVersion[] {
    const versions: ContentVersion[] = responses.map((response, index) => {
      const quality = this.calculateQualityScore(response.content, request);

      return {
        id: `v${index + 1}`,
        provider: response.provider,
        content: response.content,
        quality,
        selected: false,
      };
    });

    // 품질 점수로 정렬
    versions.sort((a, b) => b.quality - a.quality);

    // 최고 점수 선택
    if (versions.length > 0) {
      versions[0].selected = true;
    }

    return versions;
  }

  /**
   * 콘텐츠 생성 메인 메서드
   */
  async generateContent(
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(request);
    const options: GenerationOptions = {
      temperature: 0.8,
      maxTokens: request.contentLength === 'long' ? 3000 : 1500,
      systemPrompt: this.getSystemPrompt(request),
    };

    // 모든 프로바이더에 동시 요청
    const responses = await this.generateWithAllProviders(prompt, options);

    if (responses.length === 0) {
      throw new Error('No valid responses from AI providers');
    }

    // 최고 품질 콘텐츠 선택
    const versions = this.selectBestContent(responses, request);
    const selectedVersion = versions.find((v) => v.selected)!;

    // 결과 구성
    const generatedContent: GeneratedContent = {
      id: this.generateId(),
      type: request.type,
      content: selectedVersion.content,
      versions,
      createdAt: new Date(),
    };

    // 메타데이터 추가
    if (request.type === 'blog_post') {
      const wordCount = selectedVersion.content.split(/\s+/).length;
      generatedContent.metadata = {
        wordCount,
        readingTime: Math.ceil(wordCount / 200), // 분당 200단어 기준
      };
    }

    // 해시태그 추출 (SNS 콘텐츠)
    if (request.platform && request.platform !== 'blog') {
      const hashtags = selectedVersion.content.match(/#\w+/g);
      if (hashtags) {
        generatedContent.hashtags = hashtags;
      }
    }

    return generatedContent;
  }

  /**
   * 프롬프트 생성
   */
  private buildPrompt(request: ContentGenerationRequest): string {
    switch (request.type) {
      case 'subtopics':
        return this.buildSubtopicsPrompt(request);
      case 'blog_post':
        return this.buildBlogPostPrompt(request);
      case 'social_media':
        return this.buildSocialMediaPrompt(request);
      default:
        throw new Error(`Unsupported content type: ${request.type}`);
    }
  }

  /**
   * 시스템 프롬프트 생성
   */
  private getSystemPrompt(request: ContentGenerationRequest): string {
    const { brandContext } = request;

    let systemPrompt = '당신은 전문 콘텐츠 크리에이터입니다.';

    if (brandContext?.industry) {
      systemPrompt += ` ${brandContext.industry} 분야의 전문 지식을 가지고 있습니다.`;
    }

    if (brandContext?.toneAndManner) {
      systemPrompt += ` ${brandContext.toneAndManner} 톤으로 작성합니다.`;
    }

    if (brandContext?.targetAudience) {
      systemPrompt += ` 타겟 고객은 ${brandContext.targetAudience}입니다.`;
    }

    return systemPrompt;
  }

  /**
   * 하위 주제 생성 프롬프트
   */
  private buildSubtopicsPrompt(request: ContentGenerationRequest): string {
    const { mainTopic, brandContext } = request;

    return `메인 주제: "${mainTopic}"

위 주제에 대해 블로그 포스트나 SNS 콘텐츠로 작성할 수 있는 구체적인 하위 주제 10개를 생성해주세요.

요구사항:
- 각 주제는 구체적이고 실행 가능해야 함
- ${brandContext?.targetAudience || '일반'} 고객에게 유용한 정보
- 중복 없이 다양한 관점에서 접근
- 한국어로 자연스럽게 표현
- 각 주제는 15-25자 이내

JSON 배열 형식으로 출력:
["주제1", "주제2", ..., "주제10"]`;
  }

  /**
   * 블로그 포스트 생성 프롬프트
   */
  private buildBlogPostPrompt(request: ContentGenerationRequest): string {
    const { mainTopic, subtopics, contentLength } = request;

    const lengthGuide = {
      short: '300-500단어',
      medium: '800-1200단어',
      long: '1500-2000단어',
    };

    return `주제: ${mainTopic}
${subtopics ? `하위 주제: ${subtopics.join(', ')}` : ''}

위 주제에 대한 블로그 포스트를 작성해주세요.

요구사항:
- 길이: ${lengthGuide[contentLength || 'medium']}
- 구조: 도입부, 본문(2-3개 섹션), 결론
- SEO 최적화된 제목 포함
- 자연스럽고 읽기 쉬운 문체
- 실용적인 정보와 인사이트 제공
- 필요시 불릿 포인트나 번호 목록 사용

마크다운 형식으로 작성해주세요.`;
  }

  /**
   * SNS 콘텐츠 생성 프롬프트
   */
  private buildSocialMediaPrompt(request: ContentGenerationRequest): string {
    const { mainTopic, platform, contentLength } = request;

    const platformGuide = {
      instagram: '캡션 150-300자, 이모지 사용, 해시태그 5-10개',
      facebook: '본문 100-500자, 공유 유도 문구',
      linkedin: '전문적 톤, 200-1000자, 인사이트 중심',
    };

    return `주제: ${mainTopic}
플랫폼: ${platform}

위 주제에 대한 ${platform} 포스트를 작성해주세요.

플랫폼 가이드라인:
${platformGuide[platform as keyof typeof platformGuide] || '적절한 길이와 톤'}

요구사항:
- 주목을 끄는 첫 문장
- 명확한 메시지 전달
- 행동 유도 문구(CTA) 포함
- 플랫폼에 맞는 해시태그
- 이모지 적절히 사용 (과하지 않게)

완성된 포스트를 그대로 사용할 수 있는 형태로 작성해주세요.`;
  }

  /**
   * ID 생성
   */
  private generateId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}