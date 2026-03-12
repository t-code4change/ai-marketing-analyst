import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getGoogleConnection, getValidGoogleTokens } from '@/lib/utils/tokens';
import { listGoogleAdsAccounts } from '@/lib/google/ads';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    // Use the analytics connection token (same OAuth token covers adwords scope)
    const conn = await getGoogleConnection(websiteId, 'analytics') as any;
    if (!conn) return NextResponse.json({ error: 'Not connected to Google' }, { status: 400 });

    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
      return NextResponse.json({ accounts: [], warning: 'GOOGLE_ADS_DEVELOPER_TOKEN not configured' });
    }

    const token = await getValidGoogleTokens(conn.id);
    const accounts = await listGoogleAdsAccounts(token);
    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
