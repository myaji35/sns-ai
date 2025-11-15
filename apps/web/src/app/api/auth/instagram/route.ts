import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3001/api/auth/instagram/callback';

    if (!clientId) {
      return NextResponse.json({ error: 'Instagram client ID not configured' }, { status: 500 });
    }

    // Instagram uses Facebook OAuth
    const scope = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement';

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', 'instagram'); // To identify platform in callback

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Instagram OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Instagram authentication' },
      { status: 500 }
    );
  }
}
