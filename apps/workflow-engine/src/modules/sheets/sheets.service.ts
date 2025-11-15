import { Injectable } from '@nestjs/common';

@Injectable()
export class SheetsService {
  async syncGoogleSheets(userId: string, sheetId: string): Promise<any> {
    // Google Sheets 동기화 (Story 3.x에서 구현)
    return {
      userId,
      sheetId,
      synced: true,
      items: [],
    };
  }

  async getSheetsList(userId: string): Promise<any> {
    // 사용자의 Google Sheets 목록 조회
    return { userId, sheets: [] };
  }
}
