import { google } from 'googleapis';
import { SearchConsoleData, SEOSummary } from '@/types';

export async function fetchSearchConsoleData(
  siteUrl: string,
  accessToken: string,
  days = 30
): Promise<{ queries: SearchConsoleData[]; pages: SearchConsoleData[] }> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date();

  const dateRange = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    rowLimit: 50,
  };

  const [queriesResponse, pagesResponse] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { ...dateRange, dimensions: ['query'] },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { ...dateRange, dimensions: ['page'] },
    }),
  ]);

  const queries: SearchConsoleData[] = (queriesResponse.data.rows || []).map(row => ({
    websiteId: '',
    date: startDate.toISOString().split('T')[0],
    type: 'query' as const,
    query: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  }));

  const pages: SearchConsoleData[] = (pagesResponse.data.rows || []).map(row => ({
    websiteId: '',
    date: startDate.toISOString().split('T')[0],
    type: 'page' as const,
    page: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  }));

  return { queries, pages };
}

export function summarizeSEO(
  queries: SearchConsoleData[],
  pages: SearchConsoleData[]
): SEOSummary {
  const totalClicks = queries.reduce((sum, q) => sum + q.clicks, 0);
  const totalImpressions = queries.reduce((sum, q) => sum + q.impressions, 0);

  return {
    totalClicks,
    totalImpressions,
    avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    avgPosition: queries.length > 0
      ? queries.reduce((sum, q) => sum + q.position, 0) / queries.length
      : 0,
    topQueries: queries.slice(0, 10),
    topPages: pages.slice(0, 10),
    clicksTrend: 0,
    impressionsTrend: 0,
  };
}
