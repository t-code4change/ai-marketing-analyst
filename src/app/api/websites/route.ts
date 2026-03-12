import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

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

    const ref = await adminDb.collection('websites').add({
      userId: decoded.uid,
      domain: domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      name: name || domain,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: ref.id, domain, name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
