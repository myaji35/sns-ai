import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      return NextResponse.redirect(
        `http://localhost:3001/connect?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(`http://localhost:3001/connect?error=no_code`);
    }

    // Get current user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`http://localhost:3001/login?error=not_authenticated`);
    }

    // Exchange code for access token
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3001/api/auth/instagram/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`http://localhost:3001/connect?error=missing_credentials`);
    }

    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams.toString()}`);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(`http://localhost:3001/connect?error=token_exchange_failed`);
    }

    const accessToken = tokenData.access_token;

    // Get user's Instagram Business Account
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,accounts{id,name,instagram_business_account{id,username}}&access_token=${accessToken}`
    );
    const meData = await meResponse.json();

    if (!meResponse.ok) {
      console.error('Failed to get user info:', meData);
      return NextResponse.redirect(`http://localhost:3001/connect?error=failed_to_get_user_info`);
    }

    // Find Instagram Business Account
    let instagramAccountId = null;
    let instagramUsername = null;

    if (meData.accounts && meData.accounts.data) {
      for (const page of meData.accounts.data) {
        if (page.instagram_business_account) {
          instagramAccountId = page.instagram_business_account.id;
          instagramUsername = page.instagram_business_account.username;
          break;
        }
      }
    }

    if (!instagramAccountId) {
      return NextResponse.redirect(
        `http://localhost:3001/connect?error=no_instagram_business_account`
      );
    }

    // Exchange for long-lived token
    const longLivedTokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: accessToken,
    });

    const longLivedResponse = await fetch(`${longLivedTokenUrl}?${longLivedParams.toString()}`);
    const longLivedData = await longLivedResponse.json();

    const finalAccessToken = longLivedData.access_token || accessToken;
    const expiresIn = longLivedData.expires_in; // Usually 60 days

    // Calculate expiry date
    const expiryDate = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    // Save to database
    const { error: dbError } = await supabase.from('connected_accounts').upsert(
      {
        user_id: user.id,
        platform: 'instagram',
        account_name: instagramUsername || 'Instagram Account',
        access_token: finalAccessToken,
        refresh_token: null,
        token_expires_at: expiryDate,
        platform_user_id: instagramAccountId,
        platform_username: instagramUsername,
        is_active: true,
        metadata: {
          facebook_user_id: meData.id,
          facebook_user_name: meData.name,
        },
      },
      { onConflict: 'user_id,platform' }
    );

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(`http://localhost:3001/connect?error=database_error`);
    }

    return NextResponse.redirect(`http://localhost:3001/connect?success=instagram`);
  } catch (error: any) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect(`http://localhost:3001/connect?error=callback_failed`);
  }
}
