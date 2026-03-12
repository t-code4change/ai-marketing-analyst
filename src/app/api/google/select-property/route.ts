import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getGoogleConnection } from '@/lib/utils/tokens';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { websiteId, analyticsPropertyId, searchConsoleSiteUrl, accountId, adsCustomerId } = await request.json();
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    const updates: Promise<any>[] = [];

    if (analyticsPropertyId) {
      const conn = await getGoogleConnection(websiteId, 'analytics') as any;
      if (conn) {
        updates.push(
          adminDb.collection('connections').doc(conn.id).update({
            propertyId: analyticsPropertyId,
            accountId: accountId || '',
            configuredAt: new Date().toISOString(),
          })
        );
      }
    }

    if (searchConsoleSiteUrl) {
      const conn = await getGoogleConnection(websiteId, 'search_console') as any;
      if (conn) {
        updates.push(
          adminDb.collection('connections').doc(conn.id).update({
            propertyId: searchConsoleSiteUrl,
            siteUrl: searchConsoleSiteUrl,
            configuredAt: new Date().toISOString(),
          })
        );
      }
    }

    if (adsCustomerId) {
      const conn = await getGoogleConnection(websiteId, 'ads') as any;
      if (conn) {
        updates.push(
          adminDb.collection('connections').doc(conn.id).update({
            customerId: adsCustomerId,
            configuredAt: new Date().toISOString(),
          })
        );
      }
    }

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
