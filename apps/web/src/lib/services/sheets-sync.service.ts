import { google, sheets_v4 } from 'googleapis';
import { SheetsTokenService } from './sheets-token.service';
import { createClient } from '@supabase/supabase-js';

/**
 * Google Sheets 동기화 서비스
 *
 * Sheets의 데이터를 읽어와 DB와 동기화
 */
export class SheetsSyncService {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  /**
   * 콘텐츠 캘린더 동기화
   */
  static async syncContentCalendar(
    userId: string,
    calendarId: string
  ): Promise<{
    added: number;
    updated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let added = 0;
    let updated = 0;

    try {
      // 캘린더 정보 가져오기
      const { data: calendar, error: calendarError } = await this.supabase
        .from('content_calendars')
        .select('*')
        .eq('id', calendarId)
        .eq('user_id', userId)
        .single();

      if (calendarError || !calendar) {
        throw new Error('캘린더를 찾을 수 없습니다');
      }

      // Sheets API 클라이언트 생성
      const sheets = await SheetsTokenService.createSheetsClient(userId);

      // Sheets 데이터 읽기 (헤더 제외)
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: calendar.google_sheet_id,
        range: '콘텐츠 캘린더!A2:N100', // 최대 99개 행 읽기
      });

      const rows = response.data.values || [];

      // 기존 토픽 가져오기
      const { data: existingTopics } = await this.supabase
        .from('calendar_topics')
        .select('*')
        .eq('calendar_id', calendarId);

      const existingTopicMap = new Map(
        existingTopics?.map(topic => [topic.sheet_row_number, topic]) || []
      );

      // 각 행 처리
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // 실제 시트 행 번호 (헤더가 1행)

        // 빈 행 건너뛰기
        if (!row || row.length === 0 || !row[1]) {
          continue;
        }

        try {
          const topicData = {
            calendar_id: calendarId,
            category: row[0] || null,
            main_topic: row[1],
            subtopics: this.extractSubtopics(row),
            publish_frequency: row[12] || null,
            status: row[13] || '기획중',
            sheet_row_number: rowNumber,
            ai_generated: false,
          };

          const existingTopic = existingTopicMap.get(rowNumber);

          if (existingTopic) {
            // 기존 토픽 업데이트
            const { error: updateError } = await this.supabase
              .from('calendar_topics')
              .update(topicData)
              .eq('id', existingTopic.id);

            if (updateError) {
              errors.push(`행 ${rowNumber} 업데이트 실패: ${updateError.message}`);
            } else {
              updated++;
            }
          } else {
            // 새 토픽 추가
            const { error: insertError } = await this.supabase
              .from('calendar_topics')
              .insert(topicData);

            if (insertError) {
              errors.push(`행 ${rowNumber} 추가 실패: ${insertError.message}`);
            } else {
              added++;
            }
          }
        } catch (err) {
          errors.push(`행 ${rowNumber} 처리 오류: ${err}`);
        }
      }

      // 동기화 시간 업데이트
      await this.supabase
        .from('content_calendars')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', calendarId);

      return { added, updated, errors };
    } catch (error) {
      console.error('동기화 오류:', error);
      errors.push(error instanceof Error ? error.message : '알 수 없는 오류');
      return { added, updated, errors };
    }
  }

  /**
   * 하위 주제 추출
   */
  private static extractSubtopics(row: string[]): string[] {
    const subtopics: string[] = [];

    // 인덱스 2-11이 하위 주제 1-10
    for (let i = 2; i <= 11; i++) {
      if (row[i] && row[i].trim()) {
        subtopics.push(row[i].trim());
      }
    }

    return subtopics;
  }

  /**
   * AI 생성 하위 주제를 Sheets에 다시 쓰기
   */
  static async writeBackSubtopics(
    userId: string,
    calendarId: string,
    topicId: string,
    subtopics: string[]
  ): Promise<boolean> {
    try {
      // 캘린더와 토픽 정보 가져오기
      const { data: calendar } = await this.supabase
        .from('content_calendars')
        .select('google_sheet_id')
        .eq('id', calendarId)
        .single();

      const { data: topic } = await this.supabase
        .from('calendar_topics')
        .select('sheet_row_number')
        .eq('id', topicId)
        .single();

      if (!calendar || !topic || !topic.sheet_row_number) {
        throw new Error('캘린더 또는 토픽 정보를 찾을 수 없습니다');
      }

      // Sheets API 클라이언트 생성
      const sheets = await SheetsTokenService.createSheetsClient(userId);

      // 하위 주제를 시트에 쓰기 (C열부터 L열까지)
      const values = [subtopics.slice(0, 10)]; // 최대 10개

      await sheets.spreadsheets.values.update({
        spreadsheetId: calendar.google_sheet_id,
        range: `콘텐츠 캘린더!C${topic.sheet_row_number}:L${topic.sheet_row_number}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      // 상태를 'AI 생성 완료'로 업데이트
      await sheets.spreadsheets.values.update({
        spreadsheetId: calendar.google_sheet_id,
        range: `콘텐츠 캘린더!N${topic.sheet_row_number}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['AI 생성 완료']] },
      });

      // DB 업데이트
      await this.supabase
        .from('calendar_topics')
        .update({
          subtopics,
          ai_generated: true,
          status: 'AI 생성 완료',
        })
        .eq('id', topicId);

      return true;
    } catch (error) {
      console.error('하위 주제 쓰기 오류:', error);
      return false;
    }
  }

  /**
   * 변경사항 감지 (폴링용)
   */
  static async detectChanges(
    userId: string,
    calendarId: string
  ): Promise<{
    hasChanges: boolean;
    newTopics: number;
    updatedTopics: number;
  }> {
    try {
      const { data: calendar } = await this.supabase
        .from('content_calendars')
        .select('google_sheet_id, last_synced_at')
        .eq('id', calendarId)
        .single();

      if (!calendar) {
        throw new Error('캘린더를 찾을 수 없습니다');
      }

      const sheets = await SheetsTokenService.createSheetsClient(userId);

      // 시트 메타데이터로 수정 시간 확인
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId: calendar.google_sheet_id,
        fields: 'properties.title,sheets.properties.sheetId',
      });

      // 간단한 변경 감지를 위해 행 수 비교
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: calendar.google_sheet_id,
        range: '콘텐츠 캘린더!A2:N100',
      });

      const currentRows = response.data.values?.filter(row => row && row[1]) || [];

      const { data: existingTopics } = await this.supabase
        .from('calendar_topics')
        .select('id')
        .eq('calendar_id', calendarId);

      const hasChanges = currentRows.length !== (existingTopics?.length || 0);

      return {
        hasChanges,
        newTopics: Math.max(0, currentRows.length - (existingTopics?.length || 0)),
        updatedTopics: 0, // 정확한 업데이트 감지는 동기화 시 수행
      };
    } catch (error) {
      console.error('변경사항 감지 오류:', error);
      return { hasChanges: false, newTopics: 0, updatedTopics: 0 };
    }
  }
}