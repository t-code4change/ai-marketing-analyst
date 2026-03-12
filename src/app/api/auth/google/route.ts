import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google/oauth';
import { saveConnection } from '@/lib/utils/firestore';
import { adminAuth } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // websiteId
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/settings?error=${error}`, request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?error=missing_params', request.url));
    }

    // Verify user session
    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    await adminAuth.verifySessionCookie(session, true);

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Save tokens for analytics connection
    await saveConnection(state, 'analytics', {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date,
    });

    // Also save for search console
    await saveConnection(state, 'search_console', {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date,
    });

    return NextResponse.redirect(new URL('/settings?success=google_connected', request.url));
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL(`/settings?error=oauth_failed`, request.url));
  }
}
