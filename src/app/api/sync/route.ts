import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getGoogleConnection, getValidGoogleTokens } from '@/lib/utils/tokens';
import { fetchAnalyticsData } from '@/lib/google/analytics';
import { fetchSearchConsoleData } from '@/lib/google/search-console';
import { runAIAnalysis } from '@/lib/ai/analyzer';

export async function POST(request: NextRequest) {
  try {
    // Verify auth (support both session cookie and cron secret)
    const cronSecret = request.headers.get('x-cron-secret');
    const session = request.cookies.get('session')?.value;
    
    if (cronSecret !== process.env.CRON_SECRET && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session) {
      await adminAuth.verifySessionCookie(session, true);
    }

    const { websiteId } = await request.json();
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    const websiteDoc = await adminDb.collection('websites').doc(websiteId).get();
    if (!websiteDoc.exists) return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    const website = websiteDoc.data()!;

    const results: Record<string, any> = {};

    // Sync Analytics
    try {
      const analyticsConn = await getGoogleConnection(websiteId, 'analytics') as any;
      if (analyticsConn) {
        const token = await getValidGoogleTokens(analyticsConn.id);
        const data = await fetchAnalyticsData(analyticsConn.propertyId, token);
        const batch = adminDb.batch();
        for (const item of data) {
          const ref = adminDb.collection('analytics_data').doc(`${websiteId}_${item.date}`);
          batch.set(ref, { ...item, websiteId });
        }
        await batch.commit();
        results.analytics = `${data.length} records synced`;
      }
    } catch (e: any) {
      results.analyticsError = e.message;
    }

    // Sync Search Console
    try {
      const scConn = await getGoogleConnection(websiteId, 'search_console') as any;
      if (scConn) {
        const token = await getValidGoogleTokens(scConn.id);
        const { queries, pages } = await fetchSearchConsoleData(`https://${website.domain}`, token);
        const batch = adminDb.batch();
        for (const item of [...queries, ...pages]) {
          const key = item.type === 'query' ? item.query : item.page;
          const ref = adminDb.collection('search_console_data').doc(`${websiteId}_${item.type}_${key}`);
          batch.set(ref, { ...item, websiteId });
        }
        await batch.commit();
        results.searchConsole = `${queries.length + pages.length} records synced`;
      }
    } catch (e: any) {
      results.searchConsoleError = e.message;
    }

    // Update last sync time
    await websiteDoc.ref.update({ lastSyncAt: new Date().toISOString() });

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
