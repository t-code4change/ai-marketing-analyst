import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getGoogleConnection, getValidGoogleTokens } from '@/lib/utils/tokens';
import { fetchSearchConsoleData, summarizeSEO } from '@/lib/google/search-console';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const siteUrl = searchParams.get('siteUrl');
    if (!websiteId || !siteUrl) return NextResponse.json({ error: 'websiteId and siteUrl required' }, { status: 400 });

    const connection = await getGoogleConnection(websiteId, 'search_console') as any;
    if (!connection) return NextResponse.json({ error: 'Search Console not connected' }, { status: 404 });

    const accessToken = await getValidGoogleTokens(connection.id);
    const { queries, pages } = await fetchSearchConsoleData(siteUrl, accessToken);
    const summary = summarizeSEO(queries, pages);

    return NextResponse.json({ summary, queries, pages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
