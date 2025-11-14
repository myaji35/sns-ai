import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SHEETS_CLIENT_ID,
      process.env.GOOGLE_SHEETS_CLIENT_SECRET,
      process.env.GOOGLE_SHEETS_REDIRECT_URI
    );

    // Google Sheets와 Drive API 스코프
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google Sheets OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google Sheets authentication' },
      { status: 500 }
    );
  }
}
