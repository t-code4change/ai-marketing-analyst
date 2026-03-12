export * from './analytics';
export * from './ads';
export * from './seo';
export * from './ai-report';

export interface Website {
  id?: string;
  userId: string;
  domain: string;
  githubOwner?: string;
  githubRepo?: string;
  createdAt: string;
  name?: string;
}

export interface Connection {
  id?: string;
  websiteId: string;
  type: 'analytics' | 'ads' | 'search_console' | 'github';
  accountId?: string;
  propertyId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  connected: boolean;
  connectedAt?: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  plan: 'free' | 'pro' | 'enterprise';
}
