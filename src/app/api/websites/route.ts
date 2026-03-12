import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { fetchPageSpeed } from '@/lib/google/pagespeed';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await adminAuth.verifySessionCookie(session, true);

    const snapshot = await adminDb
      .collection('websites')
      .where('userId', '==', decoded.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const websites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ websites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await adminAuth.verifySessionCookie(session, true);

    const { domain, name } = await request.json();
    if (!domain) return NextResponse.json({ error: 'domain required' }, { status: 400 });

    const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const existing = await adminDb
      .collection('websites')
      .where('userId', '==', decoded.uid)
      .where('domain', '==', normalizedDomain)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ error: 'Website with this domain already exists' }, { status: 409 });
    }

    const ref = await adminDb.collection('websites').add({
      userId: decoded.uid,
      domain: normalizedDomain,
      name: name || normalizedDomain,
      createdAt: new Date().toISOString(),
    });

    // Background: fetch PageSpeed data immediately (fire-and-forget)
    const websiteId = ref.id;
    Promise.all([
      fetchPageSpeed(`https://${normalizedDomain}`, 'mobile'),
      fetchPageSpeed(`https://${normalizedDomain}`, 'desktop'),
    ]).then(([mobile, desktop]) => {
      const syncedAt = new Date().toISOString();
      adminDb.collection('data_cache').doc(`pagespeed_${websiteId}`).set({
        websiteId, domain: normalizedDomain, mobile, desktop, syncedAt,
      }).catch(() => {});
    }).catch(() => {});

    return NextResponse.json({ id: ref.id, domain: normalizedDomain, name: name || normalizedDomain });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
