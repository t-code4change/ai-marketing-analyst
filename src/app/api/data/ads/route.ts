import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getGoogleConnection } from '@/lib/utils/tokens';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    const connection = await getGoogleConnection(websiteId, 'ads');
    if (!connection) return NextResponse.json({ campaigns: [], connected: false });

    // Google Ads data - returns empty until MCC account is configured
    return NextResponse.json({ campaigns: [], connected: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
