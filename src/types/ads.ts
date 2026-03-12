export interface AdsData {
  websiteId: string;
  date: string;
  campaign: string;
  campaignId: string;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpa: number;
  roas: number;
}

export interface AdsCampaignSummary {
  campaign: string;
  campaignId: string;
  totalClicks: number;
  totalImpressions: number;
  totalCost: number;
  totalConversions: number;
  avgCtr: number;
  avgCpa: number;
  avgRoas: number;
  trend: number;
}
