import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getGoogleConnection, getValidGoogleTokens } from '@/lib/utils/tokens';
import { fetchAnalyticsData, summarizeAnalytics } from '@/lib/google/analytics';
import { processAnalyticsData } from '@/lib/data/processor';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const forceRefresh = searchParams.get('refresh') === 'true';
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    // 1. Check Firestore cache
    if (!forceRefresh) {
      const cacheDoc = await adminDb.collection('data_cache').doc(`analytics_${websiteId}`).get();
      if (cacheDoc.exists) {
        const cached = cacheDoc.data()!;
        const age = Date.now() - new Date(cached.syncedAt).getTime();
        if (age < CACHE_TTL_MS) {
          return NextResponse.json({
            summary: cached.summary,
            data: cached.data,
            insights: cached.insights,
            fromCache: true,
            syncedAt: cached.syncedAt,
          });
        }
      }
    }

    // 2. Fetch from Google API
    const connection = await getGoogleConnection(websiteId, 'analytics') as any;
    if (!connection) return NextResponse.json({ error: 'Analytics not connected' }, { status: 404 });

    const websiteDoc = await adminDb.collection('websites').doc(websiteId).get();
    const domain = websiteDoc.data()?.domain || websiteId;

    const accessToken = await getValidGoogleTokens(connection.id);
    const rawData = await fetchAnalyticsData(connection.propertyId, accessToken);
    const summary = summarizeAnalytics(rawData);

    // 3. AI processing
    const { data, insights } = await processAnalyticsData(rawData, domain);

    // 4. Save to Firestore cache
    const syncedAt = new Date().toISOString();
    await adminDb.collection('data_cache').doc(`analytics_${websiteId}`).set({
      websiteId, data, summary, insights, syncedAt,
    });

    // Also save individual day records
    const batch = adminDb.batch();
    for (const item of data) {
      const ref = adminDb.collection('analytics_data').doc(`${websiteId}_${item.date}`);
      batch.set(ref, { ...item, websiteId, syncedAt });
    }
    await batch.commit();

    return NextResponse.json({ summary, data, insights, fromCache: false, syncedAt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
