// Google Ads API — requires google-ads-api package + MCC account configuration
export async function fetchAdsData(
  customerId: string,
  accessToken: string,
  days = 30
) {
  // Google Ads API requires Manager Account setup
  // This is a placeholder - actual implementation requires google-ads-api package
  // For now returns empty data until Google Ads MCC is configured
  return {
    campaigns: [],
    totalSpend: 0,
    totalConversions: 0,
    avgCtr: 0,
  };
}
