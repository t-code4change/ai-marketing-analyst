export const queryKeys = {
  websites: ['websites'] as const,
  analytics: (websiteId: string) => ['analytics', websiteId] as const,
  searchConsole: (websiteId: string) => ['search-console', websiteId] as const,
  pagespeed: (websiteId: string) => ['pagespeed', websiteId] as const,
  accountInfo: (websiteId: string) => ['account-info', websiteId] as const,
  aiReports: (websiteId: string) => ['ai-reports', websiteId] as const,
};
