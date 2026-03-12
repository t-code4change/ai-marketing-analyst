import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getGoogleConnection, getValidGoogleTokens } from '@/lib/utils/tokens';
import { fetchAnalyticsData, summarizeAnalytics } from '@/lib/google/analytics';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    const connection = await getGoogleConnection(websiteId, 'analytics') as any;
    if (!connection) return NextResponse.json({ error: 'Analytics not connected' }, { status: 404 });

    const accessToken = await getValidGoogleTokens(connection.id);
    const data = await fetchAnalyticsData(connection.propertyId, accessToken);
    const summary = summarizeAnalytics(data);

    // Cache in Firestore
    const batch = adminDb.batch();
    for (const item of data) {
      const ref = adminDb.collection('analytics_data').doc(`${websiteId}_${item.date}`);
      batch.set(ref, { ...item, websiteId });
    }
    await batch.commit();

    return NextResponse.json({ summary, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
