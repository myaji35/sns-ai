/**
 * AI 프로바이더 공통 타입 정의
 */

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  responseFormat?: 'text' | 'json';
  systemPrompt?: string;
}

export interface LLMResponse {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  content: string;
  tokensUsed: number;
  latency: number; // ms
  quality?: number; // 품질 점수 (0-100)
  error?: string;
  metadata?: Record<string, any>;
}

export interface LLMProvider {
  generateContent(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;
  generateJSON<T = any>(prompt: string, options?: GenerationOptions): Promise<T>;
  getModelName(): string;
  estimateCost(tokens: number): number;
  isAvailable(): Promise<boolean>;
}

export interface ContentGenerationRequest {
  type: 'subtopics' | 'blog_post' | 'social_media' | 'image_prompt';
  mainTopic?: string;
  subtopics?: string[];
  brandContext?: {
    name?: string;
    industry?: string;
    toneAndManner?: string;
    targetAudience?: string;
    keywords?: string[];
  };
  platform?: 'instagram' | 'facebook' | 'linkedin' | 'blog';
  language?: string;
  contentLength?: 'short' | 'medium' | 'long';
}

export interface GeneratedContent {
  id: string;
  type: string;
  title?: string;
  content: string;
  imagePrompt?: string;
  hashtags?: string[];
  metadata?: {
    wordCount?: number;
    readingTime?: number;
    seoScore?: number;
    sentiment?: string;
  };
  versions?: ContentVersion[];
  createdAt: Date;
}

export interface ContentVersion {
  id: string;
  provider: 'openai' | 'anthropic' | 'google';
  content: string;
  quality: number;
  selected: boolean;
  feedback?: string;
}

export interface QualityMetrics {
  relevance: number; // 0-100
  coherence: number; // 0-100
  creativity: number; // 0-100
  grammar: number; // 0-100
  brandAlignment: number; // 0-100
  overall: number; // 0-100
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ContentJob {
  id: string;
  type: ContentGenerationRequest['type'];
  status: JobStatus;
  request: ContentGenerationRequest;
  result?: GeneratedContent;
  error?: string;
  progress: number; // 0-100
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}