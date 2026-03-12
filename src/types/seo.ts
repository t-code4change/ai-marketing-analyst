export interface SearchConsoleData {
  websiteId: string;
  date: string;
  type: 'query' | 'page';
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SEOSummary {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topQueries: SearchConsoleData[];
  topPages: SearchConsoleData[];
  clicksTrend: number;
  impressionsTrend: number;
}

export interface GitHubFinding {
  type: string;
  file: string;
  line?: number;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export interface GitHubAnalysis {
  websiteId: string;
  repo: string;
  createdAt: string;
  findings: GitHubFinding[];
  framework?: string;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  hasStructuredData: boolean;
}
