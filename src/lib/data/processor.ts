import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Normalize and enrich analytics data with AI insights
export async function processAnalyticsData(raw: any[], domain: string): Promise<{
  data: any[];
  insights: {
    summary: string;
    trend: 'up' | 'down' | 'stable';
    topMetric: string;
    anomalies: string[];
    opportunities: string[];
  };
}> {
  // Sort by date
  const data = [...raw].sort((a, b) => a.date.localeCompare(b.date));

  // Calculate totals
  const totals = data.reduce((acc, d) => ({
    sessions: acc.sessions + (d.sessions || 0),
    users: acc.users + (d.users || 0),
    pageviews: acc.pageviews + (d.pageviews || 0),
    bounceRate: acc.bounceRate + (d.bounceRate || 0),
  }), { sessions: 0, users: 0, pageviews: 0, bounceRate: 0 });

  // Compare first half vs second half to detect trend
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid).reduce((s, d) => s + (d.sessions || 0), 0);
  const secondHalf = data.slice(mid).reduce((s, d) => s + (d.sessions || 0), 0);
  const trend: 'up' | 'down' | 'stable' = secondHalf > firstHalf * 1.05 ? 'up' : secondHalf < firstHalf * 0.95 ? 'down' : 'stable';

  // AI insights
  let insights = {
    summary: `${domain} had ${totals.sessions} sessions from ${data.length} days of data.`,
    trend,
    topMetric: `${totals.sessions} total sessions`,
    anomalies: [] as string[],
    opportunities: [] as string[],
  };

  try {
    const prompt = `Analyze this Google Analytics data for ${domain}:
- Total sessions: ${totals.sessions}
- Total users: ${totals.users}
- Total pageviews: ${totals.pageviews}
- Avg bounce rate: ${(totals.bounceRate / (data.length || 1)).toFixed(1)}%
- Traffic trend: ${trend} (first half: ${firstHalf} sessions, second half: ${secondHalf} sessions)
- Date range: ${data[0]?.date} to ${data[data.length - 1]?.date}

Return JSON with keys: summary (1 sentence), anomalies (array of max 2 strings), opportunities (array of max 2 strings)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    insights = { ...insights, ...parsed, trend };
  } catch {
    // Keep default insights if AI fails
  }

  return { data, insights };
}

export async function processSearchConsoleData(queries: any[], pages: any[], domain: string): Promise<{
  queries: any[];
  pages: any[];
  insights: {
    summary: string;
    topKeyword: string;
    avgPosition: number;
    totalClicks: number;
    opportunities: string[];
  };
}> {
  const totalClicks = queries.reduce((s, q) => s + (q.clicks || 0), 0);
  const avgPosition = queries.length
    ? queries.reduce((s, q) => s + (q.position || 0), 0) / queries.length
    : 0;
  const topKeyword = queries[0]?.query || 'N/A';

  // Sort queries by clicks desc, pages by clicks desc
  const sortedQueries = [...queries].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  const sortedPages = [...pages].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  let insights = {
    summary: `${domain} has ${totalClicks} total clicks with avg position ${avgPosition.toFixed(1)}.`,
    topKeyword,
    avgPosition: Math.round(avgPosition * 10) / 10,
    totalClicks,
    opportunities: [] as string[],
  };

  try {
    const top5 = sortedQueries.slice(0, 5).map(q => `"${q.query}" (pos: ${q.position?.toFixed(1)}, clicks: ${q.clicks})`).join(', ');
    const prompt = `Analyze Search Console data for ${domain}:
- Total clicks: ${totalClicks}
- Avg position: ${avgPosition.toFixed(1)}
- Top keywords: ${top5}

Return JSON with: summary (1 sentence), opportunities (array of max 2 actionable strings like "Optimize title for 'keyword' to improve position from X to top 3")`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    insights = { ...insights, ...parsed, topKeyword, avgPosition: Math.round(avgPosition * 10) / 10, totalClicks };
  } catch {
    // Keep defaults
  }

  return { queries: sortedQueries, pages: sortedPages, insights };
}
