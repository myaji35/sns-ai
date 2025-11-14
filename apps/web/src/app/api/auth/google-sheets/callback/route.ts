import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/connect?error=access_denied`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/connect?error=no_code`
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SHEETS_CLIENT_ID,
      process.env.GOOGLE_SHEETS_CLIENT_SECRET,
      process.env.GOOGLE_SHEETS_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Get current user from Supabase
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/login?error=not_authenticated`
      );
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'google_sheets')
      .single();

    if (existingAccount) {
      // Update existing account
      await supabase
        .from('connected_accounts')
        .update({
          account_name: userInfo.data.email || 'Google Account',
          access_token: tokens.access_token || '',
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAccount.id);
    } else {
      // Insert new account
      await supabase.from('connected_accounts').insert({
        user_id: user.id,
        platform: 'google_sheets',
        account_name: userInfo.data.email || 'Google Account',
        access_token: tokens.access_token || '',
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        is_active: true,
      });
    }

    return NextResponse.redirect(
      `${request.nextUrl.origin}/connect?success=true`
    );
  } catch (error) {
    console.error('Google Sheets OAuth callback error:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/connect?error=auth_failed`
    );
  }
}
