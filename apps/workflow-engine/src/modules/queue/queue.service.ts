import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueService {
  async addContentGenerationJob(userId: string, topic: string): Promise<any> {
    // BullMQ 작업 큐 추가 (Story 4.2에서 구현)
    return {
      jobId: 'job-123',
      status: 'queued',
      userId,
      topic,
    };
  }

  async getJobStatus(jobId: string): Promise<any> {
    // 작업 상태 조회
    return { jobId, status: 'processing' };
  }
}
