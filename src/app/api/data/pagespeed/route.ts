import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { fetchPageSpeed } from '@/lib/google/pagespeed';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const forceRefresh = searchParams.get('refresh') === 'true';
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    const websiteDoc = await adminDb.collection('websites').doc(websiteId).get();
    if (!websiteDoc.exists) return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    const domain = websiteDoc.data()!.domain;
    const url = `https://${domain}`;

    // 1. Check cache
    if (!forceRefresh) {
      const cacheDoc = await adminDb.collection('data_cache').doc(`pagespeed_${websiteId}`).get();
      if (cacheDoc.exists) {
        const cached = cacheDoc.data()!;
        const age = Date.now() - new Date(cached.syncedAt).getTime();
        if (age < CACHE_TTL_MS) {
          return NextResponse.json({ ...cached, fromCache: true });
        }
      }
    }

    // 2. Fetch both mobile and desktop in parallel
    const [mobile, desktop] = await Promise.all([
      fetchPageSpeed(url, 'mobile'),
      fetchPageSpeed(url, 'desktop'),
    ]);

    const syncedAt = new Date().toISOString();
    const result = { websiteId, domain, mobile, desktop, syncedAt };

    // 3. Save to Firestore
    await adminDb.collection('data_cache').doc(`pagespeed_${websiteId}`).set(result);

    return NextResponse.json({ ...result, fromCache: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
