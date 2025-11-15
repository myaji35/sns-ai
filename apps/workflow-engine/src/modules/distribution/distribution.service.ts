import { Injectable } from '@nestjs/common';

@Injectable()
export class DistributionService {
  async distributeContent(contentId: string, platforms: string[]): Promise<any> {
    // 멀티 채널 배포 (Story 6.x에서 구현)
    return {
      contentId,
      platforms,
      status: 'distributing',
      results: [],
    };
  }

  async getDistributionStatus(contentId: string): Promise<any> {
    // 배포 상태 조회
    return { contentId, status: 'success' };
  }
}
