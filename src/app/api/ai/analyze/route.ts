import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { runAIAnalysis } from '@/lib/ai/analyzer';
import { getLatestAnalytics, getLatestSearchConsoleData } from '@/lib/utils/firestore';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { websiteId } = await request.json();
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    // Fetch website info
    const websiteDoc = await adminDb.collection('websites').doc(websiteId).get();
    if (!websiteDoc.exists) return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    const website = websiteDoc.data()!;

    // Gather all data
    const [analyticsData, searchConsoleRaw] = await Promise.all([
      getLatestAnalytics(websiteId),
      getLatestSearchConsoleData(websiteId),
    ]);

    // Summarize analytics
    let analyticsSummary = undefined;
    if (analyticsData.length > 0) {
      const totals = (analyticsData as any[]).reduce(
        (acc: any, d: any) => ({
          sessions: acc.sessions + (d.sessions || 0),
          users: acc.users + (d.users || 0),
          conversions: acc.conversions + (d.conversions || 0),
          bounceRate: acc.bounceRate + (d.bounceRate || 0),
        }),
        { sessions: 0, users: 0, conversions: 0, bounceRate: 0 }
      );
      analyticsSummary = {
        totalSessions: totals.sessions,
        totalUsers: totals.users,
        totalConversions: totals.conversions,
        avgBounceRate: analyticsData.length > 0 ? totals.bounceRate / analyticsData.length : 0,
        avgConversionRate: totals.sessions > 0 ? (totals.conversions / totals.sessions) * 100 : 0,
      };
    }

    // Get GitHub analysis
    const githubSnapshot = await adminDb
      .collection('github_analysis')
      .where('websiteId', '==', websiteId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    const githubAnalysis = githubSnapshot.empty ? undefined : githubSnapshot.docs[0].data();

    // Run AI analysis
    const report = await runAIAnalysis({
      websiteId,
      website: { domain: website.domain, repo: website.githubRepo },
      analytics: analyticsSummary,
      searchConsole: searchConsoleRaw.length > 0 ? {
        totalClicks: (searchConsoleRaw as any[]).reduce((s: number, d: any) => s + (d.clicks || 0), 0),
        totalImpressions: (searchConsoleRaw as any[]).reduce((s: number, d: any) => s + (d.impressions || 0), 0),
        avgPosition: (searchConsoleRaw as any[]).reduce((s: number, d: any) => s + (d.position || 0), 0) / searchConsoleRaw.length,
        topQueries: (searchConsoleRaw as any[]).filter((d: any) => d.type === 'query').slice(0, 10),
      } : undefined,
      github: githubAnalysis ? {
        findings: githubAnalysis.findings,
        framework: githubAnalysis.framework,
      } : undefined,
    });

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
