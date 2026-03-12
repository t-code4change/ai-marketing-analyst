import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }
    
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return NextResponse.json({ uid: decoded.uid, email: decoded.email });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
