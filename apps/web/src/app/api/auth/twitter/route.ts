import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const redirectUri = process.env.TWITTER_REDIRECT_URI || 'http://localhost:3001/api/auth/twitter/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Twitter credentials not configured' },
        { status: 500 }
      );
    }

    // Twitter OAuth 2.0 (User Context)
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');

    // Generate code challenge for PKCE
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code_verifier in a secure way (you might want to use a session or database)
    // For now, we'll pass it via state (not recommended for production)
    const state = Buffer.from(JSON.stringify({
      platform: 'twitter',
      code_verifier: codeVerifier,
    })).toString('base64');

    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Twitter authentication' },
      { status: 500 }
    );
  }
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64url');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('base64url');
}
