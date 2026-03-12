import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getGoogleConnection, getValidGoogleTokens } from '@/lib/utils/tokens';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    const [analyticsConn, scConn, adsConn] = await Promise.all([
      getGoogleConnection(websiteId, 'analytics') as Promise<any>,
      getGoogleConnection(websiteId, 'search_console') as Promise<any>,
      getGoogleConnection(websiteId, 'ads') as Promise<any>,
    ]);
    if (!analyticsConn) return NextResponse.json({ connected: false });

    const accessToken = await getValidGoogleTokens(analyticsConn.id);

    // Get user info
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userInfo = await oauth2.userinfo.get();

    return NextResponse.json({
      connected: true,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
      propertyId: analyticsConn.propertyId,
      siteUrl: scConn?.siteUrl || null,
      adsCustomerId: adsConn?.customerId || null,
    });
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message });
  }
}
