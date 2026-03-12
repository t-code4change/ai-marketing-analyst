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

    const connection = await getGoogleConnection(websiteId, 'search_console') as any;
    if (!connection) return NextResponse.json({ error: 'Google not connected' }, { status: 404 });

    const accessToken = await getValidGoogleTokens(connection.id);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    const sitesResp = await searchconsole.sites.list();
    const sites = (sitesResp.data.siteEntry || []).map((site: any) => ({
      siteUrl: site.siteUrl,
      permissionLevel: site.permissionLevel,
    }));

    return NextResponse.json({ sites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
