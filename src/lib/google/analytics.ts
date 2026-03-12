import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { AnalyticsData, AnalyticsSummary } from '@/types';

export async function fetchAnalyticsData(
  propertyId: string,
  accessToken: string,
  days = 30
): Promise<AnalyticsData[]> {
  const client = new BetaAnalyticsDataClient({
    authClient: { getRequestHeaders: async () => ({ Authorization: `Bearer ${accessToken}` }) } as any,
  });

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'conversions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });

  return (response.rows || []).map((row: any) => ({
    websiteId: '',
    date: row.dimensionValues?.[0]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
    newUsers: parseInt(row.metricValues?.[2]?.value || '0'),
    conversions: parseInt(row.metricValues?.[3]?.value || '0'),
    conversionRate: 0,
    bounceRate: parseFloat(row.metricValues?.[4]?.value || '0'),
    avgSessionDuration: parseFloat(row.metricValues?.[5]?.value || '0'),
  }));
}

export function summarizeAnalytics(data: AnalyticsData[]): AnalyticsSummary {
  const totals = data.reduce(
    (acc, d) => ({
      sessions: acc.sessions + d.sessions,
      users: acc.users + d.users,
      conversions: acc.conversions + d.conversions,
      bounceRate: acc.bounceRate + d.bounceRate,
    }),
    { sessions: 0, users: 0, conversions: 0, bounceRate: 0 }
  );

  return {
    totalSessions: totals.sessions,
    totalUsers: totals.users,
    totalConversions: totals.conversions,
    avgConversionRate: totals.sessions > 0 ? (totals.conversions / totals.sessions) * 100 : 0,
    avgBounceRate: data.length > 0 ? totals.bounceRate / data.length : 0,
    sessionsTrend: 0,
    conversionsTrend: 0,
    dailyData: data,
  };
}
