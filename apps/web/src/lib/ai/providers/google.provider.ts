import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {
  LLMProvider,
  LLMResponse,
  GenerationOptions,
} from '../types';

/**
 * Google Gemini 2.0 Flash 프로바이더
 */
export class GoogleProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private modelName = 'gemini-1.5-flash'; // 2.0 Flash는 아직 GA가 아니므로 1.5 사용

  constructor(apiKey?: string) {
    this.client = new GoogleGenerativeAI(
      apiKey || process.env.GOOGLE_AI_API_KEY!
    );
    this.model = this.client.getGenerativeModel({ model: this.modelName });
  }

  async generateContent(
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // System prompt를 사용자 프롬프트와 결합
      const fullPrompt = options?.systemPrompt
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;

      // Generation config
      const generationConfig = {
        temperature: options?.temperature ?? 0.7,
        topP: options?.topP ?? 1,
        maxOutputTokens: options?.maxTokens ?? 2000,
        stopSequences: options?.stopSequences,
      };

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig,
      });

      const response = result.response;
      const content = response.text();

      // Gemini doesn't provide exact token count, so we estimate
      const estimatedTokens = Math.ceil(content.length / 4);

      return {
        provider: 'google',
        model: this.modelName,
        content,
        tokensUsed: estimatedTokens,
        latency: Date.now() - startTime,
        metadata: {
          promptFeedback: response.promptFeedback,
          finishReason: response.candidates?.[0]?.finishReason,
        },
      };
    } catch (error) {
      console.error('Google generation error:', error);
      return {
        provider: 'google',
        model: this.modelName,
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
    // Gemini에게 JSON 응답을 요청
    const jsonPrompt = `${prompt}\n\n응답을 유효한 JSON 형식으로만 제공하세요. 추가 설명이나 마크다운 없이 JSON만 출력하세요.`;

    const response = await this.generateContent(jsonPrompt, {
      ...options,
      temperature: Math.min(options?.temperature ?? 0.7, 0.5), // JSON은 더 낮은 temperature
    });

    if (response.error) {
      throw new Error(response.error);
    }

    try {
      // JSON 부분만 추출
      const jsonMatch = response.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response.content;
      return JSON.parse(jsonStr) as T;
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('Failed to parse JSON response');
    }
  }

  getModelName(): string {
    return this.modelName;
  }

  estimateCost(tokens: number): number {
    // Gemini 1.5 Flash pricing (very cheap)
    // $0.075 / 1M tokens (input)
    // $0.30 / 1M tokens (output)
    // Using average for estimation
    const pricePerToken = 0.1875 / 1000000;
    return tokens * pricePerToken;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple test to check if API is accessible
      const result = await this.model.generateContent('Hi');
      return !!result.response.text();
    } catch (error) {
      console.error('Google availability check failed:', error);
      return false;
    }
  }
}