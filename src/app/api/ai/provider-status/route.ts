import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { checkClaudeCLIAvailable, checkOpenAIAvailable } from '@/lib/ai/providers';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const [claudeStatus, openaiStatus] = await Promise.all([
      checkClaudeCLIAvailable(),
      process.env.OPENAI_API_KEY
        ? checkOpenAIAvailable(process.env.OPENAI_API_KEY)
        : Promise.resolve({ available: false, error: 'No API key configured' }),
    ]);

    return NextResponse.json({
      providers: {
        'claude-cli': {
          ...claudeStatus,
          label: 'Claude Code CLI',
          description: 'Uses your Claude Code subscription — no API key needed',
          requiresKey: false,
        },
        openai: {
          ...openaiStatus,
          label: 'ChatGPT / OpenAI',
          description: 'GPT-4o via OpenAI API key',
          requiresKey: true,
          configured: !!process.env.OPENAI_API_KEY,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
