import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { saveConnection } from '@/lib/utils/firestore';
import { analyzeGitHubRepo } from '@/lib/github/analyzer';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await adminAuth.verifySessionCookie(session, true);

    const { websiteId, owner, repo } = await request.json();
    if (!websiteId || !owner || !repo) {
      return NextResponse.json({ error: 'websiteId, owner, and repo are required' }, { status: 400 });
    }

    // Save GitHub connection
    await saveConnection(websiteId, 'github', {
      accountId: owner,
      propertyId: repo,
    });

    // Update website with GitHub info
    await adminDb.collection('websites').doc(websiteId).update({
      githubOwner: owner,
      githubRepo: repo,
    });

    // Run initial analysis
    const analysis = await analyzeGitHubRepo(owner, repo, websiteId);
    await adminDb.collection('github_analysis').add(analysis);

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
