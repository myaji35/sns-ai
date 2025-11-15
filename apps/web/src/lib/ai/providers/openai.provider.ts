import OpenAI from 'openai';
import {
  LLMProvider,
  LLMResponse,
  GenerationOptions,
} from '../types';

/**
 * OpenAI GPT-4 Turbo 프로바이더
 */
export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model = 'gpt-4-turbo-preview';

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateContent(
    prompt: string,
    options?: GenerationOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (options?.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        top_p: options?.topP ?? 1,
        frequency_penalty: options?.frequencyPenalty ?? 0,
        presence_penalty: options?.presencePenalty ?? 0,
        stop: options?.stopSequences,
        response_format: options?.responseFormat === 'json'
          ? { type: 'json_object' }
          : undefined,
      });

      const content = completion.choices[0].message.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        provider: 'openai',
        model: this.model,
        content,
        tokensUsed,
        latency: Date.now() - startTime,
        metadata: {
          finishReason: completion.choices[0].finish_reason,
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
        },
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      return {
        provider: 'openai',
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
    const response = await this.generateContent(prompt, {
      ...options,
      responseFormat: 'json',
    });

    if (response.error) {
      throw new Error(response.error);
    }

    try {
      return JSON.parse(response.content) as T;
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('Failed to parse JSON response');
    }
  }

  getModelName(): string {
    return this.model;
  }

  estimateCost(tokens: number): number {
    // GPT-4 Turbo pricing (approximate)
    // Input: $0.01 / 1K tokens
    // Output: $0.03 / 1K tokens
    // Using average for estimation
    const pricePerToken = 0.02 / 1000;
    return tokens * pricePerToken;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.models.retrieve(this.model);
      return !!response.id;
    } catch (error) {
      console.error('OpenAI availability check failed:', error);
      return false;
    }
  }
}