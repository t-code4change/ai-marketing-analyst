const ADS_API_VERSION = 'v17';
const ADS_BASE_URL = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

function adsHeaders(accessToken: string) {
  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!devToken) throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
  return {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': devToken,
    'Content-Type': 'application/json',
  };
}

export interface AdsAccount {
  customerId: string;
  name: string;
  currencyCode: string;
}

export interface AdsCampaign {
  id: string;
  name: string;
  status: string;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpa: number;
}

export async function listGoogleAdsAccounts(accessToken: string): Promise<AdsAccount[]> {
  const headers = adsHeaders(accessToken);

  const res = await fetch(`${ADS_BASE_URL}/customers:listAccessibleCustomers`, { headers });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Google Ads API error: ${res.status}`);
  }

  const data = await res.json();
  const resourceNames: string[] = data.resourceNames || [];
  if (resourceNames.length === 0) return [];

  // Fetch name + currency for each account
  const accounts = await Promise.all(
    resourceNames.map(async (name) => {
      const id = name.replace('customers/', '');
      try {
        const detailRes = await fetch(`${ADS_BASE_URL}/customers/${id}/googleAds:search`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: 'SELECT customer.id, customer.descriptive_name, customer.currency_code FROM customer LIMIT 1',
          }),
        });
        const detail = await detailRes.json();
        const c = detail.results?.[0]?.customer;
        return {
          customerId: id,
          name: c?.descriptiveName || `Account ${id}`,
          currencyCode: c?.currencyCode || 'USD',
        };
      } catch {
        return { customerId: id, name: `Account ${id}`, currencyCode: 'USD' };
      }
    })
  );

  return accounts;
}

export async function fetchAdsData(customerId: string, accessToken: string): Promise<{
  campaigns: AdsCampaign[];
  totalSpend: number;
  totalConversions: number;
  avgCtr: number;
}> {
  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    return { campaigns: [], totalSpend: 0, totalConversions: 0, avgCtr: 0 };
  }

  const headers = adsHeaders(accessToken);

  const res = await fetch(`${ADS_BASE_URL}/customers/${customerId}/googleAds:search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `
        SELECT
          campaign.id, campaign.name, campaign.status,
          metrics.clicks, metrics.impressions, metrics.cost_micros,
          metrics.conversions, metrics.ctr
        FROM campaign
        WHERE segments.date DURING LAST_30_DAYS
          AND campaign.status != 'REMOVED'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch Google Ads campaigns');
  }

  const data = await res.json();
  const campaigns: AdsCampaign[] = (data.results || []).map((r: any) => {
    const cost = (r.metrics?.costMicros || 0) / 1_000_000;
    const conversions = parseFloat(r.metrics?.conversions || '0');
    return {
      id: r.campaign?.id || '',
      name: r.campaign?.name || '',
      status: r.campaign?.status || '',
      clicks: parseInt(r.metrics?.clicks || '0'),
      impressions: parseInt(r.metrics?.impressions || '0'),
      cost,
      conversions,
      ctr: parseFloat(r.metrics?.ctr || '0'),
      cpa: conversions > 0 ? cost / conversions : 0,
    };
  });

  const totalSpend = campaigns.reduce((s, c) => s + c.cost, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const avgCtr = campaigns.length > 0
    ? campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length
    : 0;

  return { campaigns, totalSpend, totalConversions, avgCtr };
}
