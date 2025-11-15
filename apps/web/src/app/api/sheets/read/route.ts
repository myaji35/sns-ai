import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { spreadsheetId, range = 'Sheet1!A:F' } = await request.json();

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Spreadsheet ID is required' }, { status: 400 });
    }

    // Get current user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get Google Sheets credentials
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'google_sheets')
      .eq('is_active', true)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Google Sheets not connected' }, { status: 404 });
    }

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SHEETS_CLIENT_ID,
      process.env.GOOGLE_SHEETS_CLIENT_SECRET,
      process.env.GOOGLE_SHEETS_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    // Read spreadsheet data
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Get spreadsheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Get values
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    // Parse data (assuming first row is header)
    if (rows.length === 0) {
      return NextResponse.json({
        title: metadata.data.properties?.title || 'Untitled',
        headers: [],
        data: [],
      });
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return NextResponse.json({
      title: metadata.data.properties?.title || 'Untitled',
      headers,
      data,
      rowCount: data.length,
    });
  } catch (error: any) {
    console.error('Error reading Google Sheets:', error);

    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { error: 'Token expired or invalid. Please reconnect Google Sheets.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: 'Failed to read Google Sheets' }, { status: 500 });
  }
}
