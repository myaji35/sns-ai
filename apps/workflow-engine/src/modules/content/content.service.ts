import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentService {
  async generateContent(topic: string, userId: string): Promise<any> {
    // AI 콘텐츠 생성 로직 (Story 4.6에서 구현)
    console.log(`Generating content for user ${userId} with topic: ${topic}`);
    return {
      id: 'content-1',
      title: 'Sample Content',
      body: 'This is sample content...',
      status: 'draft',
    };
  }

  async getContent(contentId: string): Promise<any> {
    // 콘텐츠 조회 로직
    return null;
  }
}
