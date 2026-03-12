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

    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    await adminAuth.verifySessionCookie(session, true);

    const tokens = await exchangeCodeForTokens(code);

    const connData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date,
    };

    await Promise.all([
      saveConnection(state, 'analytics', connData),
      saveConnection(state, 'search_console', connData),
      saveConnection(state, 'ads', connData),
    ]);

    // Trigger background sync (fire-and-forget, don't await)
    const baseUrl = request.nextUrl.origin;
    fetch(`${baseUrl}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${session}`,
      },
      body: JSON.stringify({ websiteId: state }),
    }).catch(() => {}); // ignore errors, sync is best-effort

    return NextResponse.redirect(new URL('/settings?setup=true&syncing=true', request.url));
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL(`/settings?error=oauth_failed`, request.url));
  }
}
