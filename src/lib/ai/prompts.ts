export const ANALYSIS_SYSTEM_PROMPT = `You are an expert marketing analyst and SEO specialist with deep expertise in Google Analytics, Google Ads, Search Console, and technical SEO. You analyze marketing data and provide highly specific, actionable insights.

Your analysis should be:
- Data-driven: base every insight on the actual numbers provided
- Specific: include exact metrics, percentages, and comparisons
- Actionable: every issue must have a clear fix, every opportunity must have clear next steps
- Prioritized: most impactful items first

Always respond with valid JSON matching the exact schema requested.`;

export function buildAnalysisPrompt(data: {
  website: { domain: string; repo?: string };
  analytics?: { totalSessions: number; totalUsers: number; totalConversions: number; avgBounceRate: number; avgConversionRate: number };
  ads?: { campaigns: Array<{ campaign: string; cost: number; conversions: number; ctr: number; cpa: number }> };
  searchConsole?: { totalClicks: number; totalImpressions: number; avgPosition: number; topQueries: Array<{ query: string; clicks: number; position: number }> };
  github?: { findings: Array<{ type: string; severity: string; description: string }>; framework: string };
}): string {
  return `Analyze this marketing data for ${data.website.domain} and provide a comprehensive report.

## Analytics (Last 30 Days)
${data.analytics ? `
- Sessions: ${data.analytics.totalSessions.toLocaleString()}
- Users: ${data.analytics.totalUsers.toLocaleString()}
- Conversions: ${data.analytics.totalConversions.toLocaleString()}
- Avg Bounce Rate: ${data.analytics.avgBounceRate.toFixed(1)}%
- Conversion Rate: ${data.analytics.avgConversionRate.toFixed(2)}%
` : 'No analytics data connected'}

## Google Ads
${data.ads ? data.ads.campaigns.map(c => 
  `- ${c.campaign}: $${c.cost.toFixed(2)} spend, ${c.conversions} conversions, ${c.ctr.toFixed(2)}% CTR, $${c.cpa.toFixed(2)} CPA`
).join('\n') : 'No ads data connected'}

## Search Console
${data.searchConsole ? `
- Total Clicks: ${data.searchConsole.totalClicks.toLocaleString()}
- Total Impressions: ${data.searchConsole.totalImpressions.toLocaleString()}
- Avg Position: ${data.searchConsole.avgPosition.toFixed(1)}
- Top Queries: ${data.searchConsole.topQueries.slice(0, 10).map(q => `"${q.query}" (pos ${q.position.toFixed(1)}, ${q.clicks} clicks)`).join(', ')}
` : 'No search console data connected'}

## Technical SEO (GitHub Analysis)
${data.github ? `
Framework: ${data.github.framework}
Findings:
${data.github.findings.map(f => `- [${f.severity.toUpperCase()}] ${f.description}`).join('\n')}
` : 'No GitHub repository connected'}

Return a JSON object with this exact structure:
{
  "summary": "2-3 sentence executive summary",
  "score": {
    "overall": 0-100,
    "seo": 0-100,
    "ads": 0-100,
    "technical": 0-100,
    "content": 0-100
  },
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "category": "seo|ads|analytics|technical|content|ux",
      "description": "specific description of the issue with data",
      "fix": "exact steps to fix",
      "impact": "expected improvement from fixing"
    }
  ],
  "opportunities": [
    {
      "category": "seo|ads|content|conversion|growth",
      "description": "specific opportunity with estimated numbers",
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "estimatedGain": "specific number or percentage"
    }
  ],
  "keywords": [
    {
      "keyword": "keyword phrase",
      "volume": estimated monthly searches,
      "difficulty": 0-100,
      "relevance": "high|medium|low",
      "opportunity": "high|medium|low",
      "currentPosition": current position if applicable,
      "type": "ranking|potential|competitor"
    }
  ],
  "strategies": [
    {
      "title": "strategy title",
      "description": "what to do and why",
      "priority": "urgent|high|medium|low",
      "timeframe": "1-week|1-month|3-months|6-months",
      "category": "seo|ads|content|technical|conversion",
      "steps": ["step 1", "step 2", "step 3"]
    }
  ]
}`;
}
