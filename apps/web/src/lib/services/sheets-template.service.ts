import { google, sheets_v4 } from 'googleapis';
import { SheetsTokenService } from './sheets-token.service';

/**
 * Google Sheets 템플릿 생성 서비스
 *
 * 콘텐츠 캘린더 템플릿 생성 및 관리
 */
export class SheetsTemplateService {
  private static readonly TEMPLATE_HEADERS = [
    '카테고리',
    '메인 주제',
    '하위 주제 1',
    '하위 주제 2',
    '하위 주제 3',
    '하위 주제 4',
    '하위 주제 5',
    '하위 주제 6',
    '하위 주제 7',
    '하위 주제 8',
    '하위 주제 9',
    '하위 주제 10',
    '발행 빈도',
    '상태'
  ];

  /**
   * 새로운 콘텐츠 캘린더 Sheets 생성
   */
  static async createContentCalendar(
    userId: string,
    brandName: string
  ): Promise<{
    spreadsheetId: string;
    spreadsheetUrl: string;
  }> {
    try {
      // Sheets API 클라이언트 생성
      const sheets = await SheetsTokenService.createSheetsClient(userId);

      // 현재 날짜 포맷팅 (YYYY-MM-DD)
      const date = new Date().toISOString().split('T')[0];
      const title = `ContentFlow - ${brandName} - ${date}`;

      // 스프레드시트 생성 요청
      const request: sheets_v4.Schema$Spreadsheet = {
        properties: {
          title,
          locale: 'ko_KR',
          timeZone: 'Asia/Seoul',
        },
        sheets: [
          {
            properties: {
              title: '콘텐츠 캘린더',
              index: 0,
              gridProperties: {
                rowCount: 100,
                columnCount: 14,
                frozenRowCount: 1, // 헤더 행 고정
              },
            },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: this.TEMPLATE_HEADERS.map(header => ({
                      userEnteredValue: { stringValue: header },
                      userEnteredFormat: {
                        backgroundColor: { red: 0.2, green: 0.5, blue: 0.9 },
                        textFormat: {
                          foregroundColor: { red: 1, green: 1, blue: 1 },
                          fontSize: 11,
                          bold: true,
                        },
                        horizontalAlignment: 'CENTER',
                        verticalAlignment: 'MIDDLE',
                      },
                    })),
                  },
                ],
              },
            ],
          },
        ],
      };

      // 스프레드시트 생성
      const response = await sheets.spreadsheets.create({
        requestBody: request,
      });

      if (!response.data.spreadsheetId || !response.data.spreadsheetUrl) {
        throw new Error('스프레드시트 생성 실패');
      }

      // 열 너비 조정
      await this.adjustColumnWidths(sheets, response.data.spreadsheetId);

      // 데이터 유효성 검사 추가
      await this.addDataValidation(sheets, response.data.spreadsheetId);

      return {
        spreadsheetId: response.data.spreadsheetId,
        spreadsheetUrl: response.data.spreadsheetUrl,
      };
    } catch (error) {
      console.error('콘텐츠 캘린더 생성 오류:', error);
      throw new Error('콘텐츠 캘린더 생성에 실패했습니다');
    }
  }

  /**
   * 열 너비 조정
   */
  private static async adjustColumnWidths(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string
  ) {
    const requests: sheets_v4.Schema$Request[] = [
      // 카테고리 열
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 1,
          },
          properties: { pixelSize: 120 },
          fields: 'pixelSize',
        },
      },
      // 메인 주제 열
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 1,
            endIndex: 2,
          },
          properties: { pixelSize: 200 },
          fields: 'pixelSize',
        },
      },
      // 하위 주제 열들 (3-12)
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 2,
            endIndex: 12,
          },
          properties: { pixelSize: 150 },
          fields: 'pixelSize',
        },
      },
      // 발행 빈도 열
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 12,
            endIndex: 13,
          },
          properties: { pixelSize: 100 },
          fields: 'pixelSize',
        },
      },
      // 상태 열
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 13,
            endIndex: 14,
          },
          properties: { pixelSize: 100 },
          fields: 'pixelSize',
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
  }

  /**
   * 데이터 유효성 검사 추가 (드롭다운 메뉴)
   */
  private static async addDataValidation(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string
  ) {
    const requests: sheets_v4.Schema$Request[] = [
      // 발행 빈도 드롭다운
      {
        setDataValidation: {
          range: {
            sheetId: 0,
            startRowIndex: 1,
            endRowIndex: 100,
            startColumnIndex: 12,
            endColumnIndex: 13,
          },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '매일' },
                { userEnteredValue: '주 3회' },
                { userEnteredValue: '주 2회' },
                { userEnteredValue: '주 1회' },
                { userEnteredValue: '격주' },
                { userEnteredValue: '월 1회' },
              ],
            },
            showCustomUi: true,
          },
        },
      },
      // 상태 드롭다운
      {
        setDataValidation: {
          range: {
            sheetId: 0,
            startRowIndex: 1,
            endRowIndex: 100,
            startColumnIndex: 13,
            endColumnIndex: 14,
          },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '기획중' },
                { userEnteredValue: 'AI 생성 대기' },
                { userEnteredValue: 'AI 생성 완료' },
                { userEnteredValue: '발행 예정' },
                { userEnteredValue: '발행 완료' },
              ],
            },
            showCustomUi: true,
          },
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
  }

  /**
   * 스프레드시트 접근 권한 확인
   */
  static async verifyAccess(
    userId: string,
    spreadsheetId: string
  ): Promise<boolean> {
    try {
      const sheets = await SheetsTokenService.createSheetsClient(userId);

      // 스프레드시트 메타데이터 가져오기 시도
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'spreadsheetId',
      });

      return !!response.data.spreadsheetId;
    } catch (error) {
      console.error('스프레드시트 접근 확인 실패:', error);
      return false;
    }
  }

  /**
   * 샘플 데이터 추가 (선택사항)
   */
  static async addSampleData(
    userId: string,
    spreadsheetId: string
  ): Promise<void> {
    try {
      const sheets = await SheetsTokenService.createSheetsClient(userId);

      const sampleData = [
        ['마케팅', 'SNS 마케팅 전략', '', '', '', '', '', '', '', '', '', '', '주 2회', '기획중'],
        ['제품 소개', '신제품 출시 안내', '', '', '', '', '', '', '', '', '', '', '주 1회', '기획중'],
        ['고객 후기', '사용 후기 공유', '', '', '', '', '', '', '', '', '', '', '주 3회', '기획중'],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: '콘텐츠 캘린더!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: sampleData,
        },
      });
    } catch (error) {
      console.error('샘플 데이터 추가 실패:', error);
      // 샘플 데이터는 선택사항이므로 오류를 throw하지 않음
    }
  }
}