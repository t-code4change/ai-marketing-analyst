export interface AIIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'seo' | 'ads' | 'analytics' | 'technical' | 'content' | 'ux';
  description: string;
  fix: string;
  impact: string;
}

export interface AIOpportunity {
  category: 'seo' | 'ads' | 'content' | 'conversion' | 'growth';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  estimatedGain?: string;
}

export interface AIKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  relevance: 'high' | 'medium' | 'low';
  opportunity: 'high' | 'medium' | 'low';
  currentPosition?: number;
  type: 'ranking' | 'potential' | 'competitor';
}

export interface AIStrategy {
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  timeframe: '1-week' | '1-month' | '3-months' | '6-months';
  category: 'seo' | 'ads' | 'content' | 'technical' | 'conversion';
  steps: string[];
}

export interface AIReport {
  id?: string;
  websiteId: string;
  createdAt: string;
  period: 'weekly' | 'monthly' | 'custom';
  summary: string;
  issues: AIIssue[];
  opportunities: AIOpportunity[];
  keywords: AIKeyword[];
  strategies: AIStrategy[];
  score: {
    overall: number;
    seo: number;
    ads: number;
    technical: number;
    content: number;
  };
}
