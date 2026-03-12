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

    const connection = await getGoogleConnection(websiteId, 'analytics') as any;
    if (!connection) return NextResponse.json({ connected: false });

    const accessToken = await getValidGoogleTokens(connection.id);

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
      propertyId: connection.propertyId,
      siteUrl: connection.siteUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message });
  }
}
