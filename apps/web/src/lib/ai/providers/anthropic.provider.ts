import Anthropic from '@anthropic-ai/sdk';
import {
  LLMProvider,
  LLMResponse,
  GenerationOptions,
} from '../types';

/**
 * Anthropic Claude 3.5 Sonnet 프로바이더
 */
export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model = 'claude-3-5-sonnet-20241022';

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateContent(
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const systemPrompt = options?.systemPrompt ||
        '당신은 도움이 되고 창의적인 AI 어시스턴트입니다.';

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens ?? 2000,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP ?? 1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stop_sequences: options?.stopSequences,
      });

      const content = message.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('\n');

      const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

      return {
        provider: 'anthropic',
        model: this.model,
        content,
        tokensUsed,
        latency: Date.now() - startTime,
        metadata: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          stopReason: message.stop_reason,
        },
      };
    } catch (error) {
      console.error('Anthropic generation error:', error);
      return {
        provider: 'anthropic',
        model: this.model,
        content: '',
        tokensUsed: 0,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateJSON<T = any>(
    prompt: string,
    options?: GenerationOptions
  ): Promise<T> {
    // Claude는 JSON 모드를 직접 지원하지 않으므로 프롬프트로 지시
    const jsonPrompt = `${prompt}\n\n응답을 유효한 JSON 형식으로만 제공하세요. 추가 설명이나 마크다운 없이 JSON만 출력하세요.`;

    const response = await this.generateContent(jsonPrompt, options);

    if (response.error) {
      throw new Error(response.error);
    }

    try {
      // JSON 부분만 추출 (혹시 다른 텍스트가 포함된 경우)
      const jsonMatch = response.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response.content;
      return JSON.parse(jsonStr) as T;
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('Failed to parse JSON response');
    }
  }

  getModelName(): string {
    return this.model;
  }

  estimateCost(tokens: number): number {
    // Claude 3.5 Sonnet pricing (approximate)
    // Input: $3 / 1M tokens
    // Output: $15 / 1M tokens
    // Using average for estimation
    const pricePerToken = 9 / 1000000;
    return tokens * pricePerToken;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple test to check if API is accessible
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hi',
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('Anthropic availability check failed:', error);
      return false;
    }
  }
}