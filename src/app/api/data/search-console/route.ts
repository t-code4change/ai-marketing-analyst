import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getGoogleConnection, getValidGoogleTokens } from '@/lib/utils/tokens';
import { fetchSearchConsoleData, summarizeSEO } from '@/lib/google/search-console';
import { processSearchConsoleData } from '@/lib/data/processor';

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
      const cacheDoc = await adminDb.collection('data_cache').doc(`sc_${websiteId}`).get();
      if (cacheDoc.exists) {
        const cached = cacheDoc.data()!;
        const age = Date.now() - new Date(cached.syncedAt).getTime();
        if (age < CACHE_TTL_MS) {
          return NextResponse.json({
            summary: cached.summary,
            queries: cached.queries,
            pages: cached.pages,
            insights: cached.insights,
            fromCache: true,
            syncedAt: cached.syncedAt,
          });
        }
      }
    }

    // 2. Fetch from Google API — use siteUrl saved in connection (e.g. sc-domain:...)
    const connection = await getGoogleConnection(websiteId, 'search_console') as any;
    if (!connection) return NextResponse.json({ error: 'Search Console not connected' }, { status: 404 });
    const siteUrl = connection.siteUrl;
    if (!siteUrl) return NextResponse.json({ error: 'Search Console site not selected' }, { status: 400 });

    const websiteDoc = await adminDb.collection('websites').doc(websiteId).get();
    const domain = websiteDoc.data()?.domain || websiteId;

    const accessToken = await getValidGoogleTokens(connection.id);
    const { queries, pages } = await fetchSearchConsoleData(siteUrl, accessToken);
    const summary = summarizeSEO(queries, pages);

    // 3. AI processing
    const processed = await processSearchConsoleData(queries, pages, domain);

    // 4. Save to Firestore cache
    const syncedAt = new Date().toISOString();
    await adminDb.collection('data_cache').doc(`sc_${websiteId}`).set({
      websiteId,
      queries: processed.queries,
      pages: processed.pages,
      summary,
      insights: processed.insights,
      syncedAt,
    });

    return NextResponse.json({
      summary,
      queries: processed.queries,
      pages: processed.pages,
      insights: processed.insights,
      fromCache: false,
      syncedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
