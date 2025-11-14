import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: 'Google Sheets not connected' },
        { status: 404 }
      );
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

    // List spreadsheets from Google Drive
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      pageSize: 50,
      fields: 'files(id, name, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
    });

    return NextResponse.json({
      sheets: response.data.files || [],
    });
  } catch (error: any) {
    console.error('Error listing Google Sheets:', error);

    // Check if token expired
    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Token expired. Please reconnect Google Sheets.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to list Google Sheets' },
      { status: 500 }
    );
  }
}
