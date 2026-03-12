export interface AnalyticsData {
  websiteId: string;
  date: string;
  sessions: number;
  users: number;
  newUsers: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalUsers: number;
  totalConversions: number;
  avgConversionRate: number;
  avgBounceRate: number;
  sessionsTrend: number; // percentage change vs previous period
  conversionsTrend: number;
  dailyData: AnalyticsData[];
}
