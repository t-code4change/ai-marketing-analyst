'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2, XCircle, Loader2, ChevronRight, ExternalLink,
  BarChart3, Search, Megaphone, User, RefreshCw, LogOut
} from 'lucide-react';

interface AccountInfo {
  connected: boolean;
  email?: string;
  name?: string;
  picture?: string;
  propertyId?: string;
  siteUrl?: string;
  adsCustomerId?: string;
}

interface GAProperty {
  accountName: string;
  accountId: string;
  propertyId: string;
  propertyName: string;
  websiteUrl: string;
}

interface GSCSite {
  siteUrl: string;
  permissionLevel: string;
}

interface AdsAccount {
  customerId: string;
  name: string;
  currencyCode: string;
}

interface GoogleConnectFlowProps {
  websiteId: string;
}

export function GoogleConnectFlow({ websiteId }: GoogleConnectFlowProps) {
  const [step, setStep] = useState<'loading' | 'disconnected' | 'connected' | 'selecting'>('loading');
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [properties, setProperties] = useState<GAProperty[]>([]);
  const [sites, setSites] = useState<GSCSite[]>([]);
  const [adsAccounts, setAdsAccounts] = useState<AdsAccount[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedAdsCustomer, setSelectedAdsCustomer] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingProps, setLoadingProps] = useState(false);
  const [error, setError] = useState('');
  const [adsError, setAdsError] = useState('');

  useEffect(() => {
    loadAccountInfo();
  }, [websiteId]);

  async function loadAccountInfo() {
    setStep('loading');
    try {
      const res = await fetch(`/api/google/account-info?websiteId=${websiteId}`);
      const data = await res.json();
      setAccountInfo(data);
      if (data.connected) {
        setStep('connected');
        if (data.propertyId) setSelectedProperty(data.propertyId);
        if (data.siteUrl) setSelectedSite(data.siteUrl);
        if (data.adsCustomerId) setSelectedAdsCustomer(data.adsCustomerId);
      } else {
        setStep('disconnected');
      }
    } catch {
      setStep('disconnected');
    }
  }

  async function loadPropertiesAndSites() {
    setLoadingProps(true);
    setError('');
    setAdsError('');
    try {
      const [propsRes, sitesRes, adsRes] = await Promise.all([
        fetch(`/api/google/properties?websiteId=${websiteId}`),
        fetch(`/api/google/sites?websiteId=${websiteId}`),
        fetch(`/api/google/ads-accounts?websiteId=${websiteId}`),
      ]);
      const propsData = await propsRes.json();
      const sitesData = await sitesRes.json();
      const adsData = await adsRes.json();
      setProperties(propsData.properties || []);
      setSites(sitesData.sites || []);
      setAdsAccounts(adsData.accounts || []);
      if (adsData.warning) setAdsError(adsData.warning);
      if (adsData.error && !adsData.accounts) setAdsError(adsData.error);
      setStep('selecting');
    } catch (err: any) {
      setError('Failed to load your Google properties. Try reconnecting.');
    } finally {
      setLoadingProps(false);
    }
  }

  async function handleSaveSelection() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/google/select-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          analyticsPropertyId: selectedProperty,
          searchConsoleSiteUrl: selectedSite,
          adsCustomerId: selectedAdsCustomer || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save selection');
      await loadAccountInfo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleConnect() {
    window.location.href = `/api/connect/google?websiteId=${websiteId}`;
  }

  async function handleDisconnect() {
    try {
      await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, types: ['analytics', 'search_console', 'ads'] }),
      });
      setStep('disconnected');
      setAccountInfo(null);
    } catch {}
  }

  if (step === 'loading') {
    return (
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-8 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
        <span className="font-black text-sm">LOADING...</span>
      </div>
    );
  }

  if (step === 'disconnected') {
    return (
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
        <div className="border-b-[3px] border-black bg-[#FFE500] px-6 py-4">
          <h2 className="font-black text-lg uppercase tracking-wide">CONNECT GOOGLE ACCOUNT</h2>
          <p className="text-sm font-bold text-black/60 mt-0.5">
            Cấp quyền để lấy data Analytics, Search Console và Ads của tài khoản bạn
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {[
              { icon: BarChart3, color: '#4D79FF', title: 'Google Analytics 4', desc: 'Sessions, users, conversions, bounce rate' },
              { icon: Search, color: '#4DFFB4', title: 'Google Search Console', desc: 'Organic clicks, impressions, keywords, rankings' },
              { icon: Megaphone, color: '#FF8C00', title: 'Google Ads', desc: 'Campaigns, spend, CPC, conversions, CTR' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-center gap-3 border-[2px] border-black p-3">
                <div className="w-8 h-8 border-[2px] border-black flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-sm">{title}</p>
                  <p className="text-xs font-medium text-black/50">{desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 ml-auto text-black/30" strokeWidth={2} />
              </div>
            ))}
          </div>

          <div className="border-[2px] border-black bg-[#FFFEF0] px-4 py-3 text-xs font-medium text-black/60">
            🔒 Read-only access. Chúng tôi không thể chỉnh sửa data, campaign hay cài đặt của bạn.
          </div>

          <button
            onClick={handleConnect}
            className="w-full border-[3px] border-black bg-white px-4 py-3 font-black text-sm shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            CONNECT GOOGLE ACCOUNT
            <ChevronRight className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'selecting') {
    return (
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
        <div className="border-b-[3px] border-black bg-black px-6 py-4">
          <h2 className="font-black text-lg text-[#FFE500] uppercase tracking-wide">CHỌN PROPERTY</h2>
          <p className="text-sm font-bold text-white/60 mt-0.5">
            Chọn GA4 property, Search Console site và Google Ads account
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="border-[2px] border-black bg-[#FF6B6B] px-4 py-3">
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Analytics property */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 border-[2px] border-black bg-[#4D79FF] flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <label className="font-black text-xs uppercase tracking-widest">Google Analytics 4 Property</label>
            </div>
            {properties.length === 0 ? (
              <div className="border-[2px] border-black bg-[#FFE500]/20 px-4 py-3 text-xs font-bold">
                ⚠ Không tìm thấy GA4 property nào. Hãy chắc chắn tài khoản Google của bạn có quyền truy cập GA4.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto border-[2px] border-black">
                {properties.map((prop) => (
                  <label
                    key={prop.propertyId}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b-[1px] border-black/10 last:border-0 transition-colors ${
                      selectedProperty === prop.propertyId ? 'bg-[#4D79FF]/10' : 'hover:bg-[#FFE500]/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ga-property"
                      value={prop.propertyId}
                      checked={selectedProperty === prop.propertyId}
                      onChange={() => setSelectedProperty(prop.propertyId)}
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="font-black text-sm">{prop.propertyName}</p>
                      <p className="text-xs font-medium text-black/50">{prop.accountName} · ID: {prop.propertyId}</p>
                      {prop.websiteUrl && (
                        <p className="text-xs font-medium text-[#4D79FF]">{prop.websiteUrl}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Search Console site */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 border-[2px] border-black bg-[#4DFFB4] flex items-center justify-center">
                <Search className="w-3 h-3" strokeWidth={3} />
              </div>
              <label className="font-black text-xs uppercase tracking-widest">Search Console Site</label>
            </div>
            {sites.length === 0 ? (
              <div className="border-[2px] border-black bg-[#FFE500]/20 px-4 py-3 text-xs font-bold">
                ⚠ Không tìm thấy site nào trong Search Console. Hãy verify domain tại search.google.com/search-console
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto border-[2px] border-black">
                {sites.map((site) => (
                  <label
                    key={site.siteUrl}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b-[1px] border-black/10 last:border-0 transition-colors ${
                      selectedSite === site.siteUrl ? 'bg-[#4DFFB4]/20' : 'hover:bg-[#FFE500]/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gsc-site"
                      value={site.siteUrl}
                      checked={selectedSite === site.siteUrl}
                      onChange={() => setSelectedSite(site.siteUrl)}
                      className="shrink-0"
                    />
                    <div>
                      <p className="font-black text-sm">{site.siteUrl}</p>
                      <p className="text-xs font-medium text-black/50 uppercase">{site.permissionLevel}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Google Ads accounts */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 border-[2px] border-black bg-[#FF8C00] flex items-center justify-center">
                <Megaphone className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <label className="font-black text-xs uppercase tracking-widest">Google Ads Account</label>
              <span className="text-xs font-medium text-black/40">(optional)</span>
            </div>
            {adsError ? (
              <div className="border-[2px] border-black bg-[#FFE500]/20 px-4 py-3 text-xs font-bold">
                ⚠ {adsError.includes('GOOGLE_ADS_DEVELOPER_TOKEN')
                  ? 'Google Ads chưa được cấu hình. Cần GOOGLE_ADS_DEVELOPER_TOKEN.'
                  : adsError}
              </div>
            ) : adsAccounts.length === 0 ? (
              <div className="border-[2px] border-black bg-black/5 px-4 py-3 text-xs font-medium text-black/50">
                Không tìm thấy Google Ads account nào. Bỏ qua nếu bạn không chạy Ads.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto border-[2px] border-black">
                <label
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b-[1px] border-black/10 transition-colors ${
                    selectedAdsCustomer === '' ? 'bg-black/5' : 'hover:bg-[#FFE500]/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="ads-account"
                    value=""
                    checked={selectedAdsCustomer === ''}
                    onChange={() => setSelectedAdsCustomer('')}
                    className="shrink-0"
                  />
                  <p className="font-black text-sm text-black/40">Không chọn (skip)</p>
                </label>
                {adsAccounts.map((acc) => (
                  <label
                    key={acc.customerId}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b-[1px] border-black/10 last:border-0 transition-colors ${
                      selectedAdsCustomer === acc.customerId ? 'bg-[#FF8C00]/10' : 'hover:bg-[#FFE500]/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ads-account"
                      value={acc.customerId}
                      checked={selectedAdsCustomer === acc.customerId}
                      onChange={() => setSelectedAdsCustomer(acc.customerId)}
                      className="shrink-0"
                    />
                    <div>
                      <p className="font-black text-sm">{acc.name}</p>
                      <p className="text-xs font-medium text-black/50">ID: {acc.customerId} · {acc.currencyCode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveSelection}
              disabled={saving || (!selectedProperty && !selectedSite)}
              className="flex-1 border-[2px] border-black bg-[#FFE500] py-3 font-black text-sm shadow-[3px_3px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> SAVING...</>
              ) : (
                'SAVE SELECTION →'
              )}
            </button>
            <button
              onClick={() => setStep('connected')}
              className="border-[2px] border-black bg-white px-5 py-3 font-black text-sm shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected state
  return (
    <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
      <div className="border-b-[3px] border-black bg-[#4DFFB4] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
          <h2 className="font-black text-lg uppercase tracking-wide">GOOGLE CONNECTED</h2>
        </div>
        <button
          onClick={handleDisconnect}
          className="border-[2px] border-black bg-white px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000] hover:bg-[#FF6B6B] hover:shadow-[3px_3px_0px_#000] transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
          DISCONNECT
        </button>
      </div>

      <div className="p-6 space-y-4">
        {accountInfo?.email && (
          <div className="flex items-center gap-3 border-[2px] border-black p-3 bg-[#FFFEF0]">
            {accountInfo.picture ? (
              <img src={accountInfo.picture} alt="" className="w-8 h-8 border-[2px] border-black" />
            ) : (
              <div className="w-8 h-8 border-[2px] border-black bg-[#FFE500] flex items-center justify-center">
                <User className="w-4 h-4" strokeWidth={2.5} />
              </div>
            )}
            <div>
              <p className="font-black text-sm">{accountInfo.name}</p>
              <p className="text-xs font-medium text-black/60">{accountInfo.email}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between border-[2px] border-black p-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-[2px] border-black bg-[#4D79FF] flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span className="font-black text-xs uppercase tracking-wider">Analytics Property</span>
            </div>
            {accountInfo?.propertyId ? (
              <span className="border-[1.5px] border-black bg-[#4DFFB4] px-2 py-0.5 text-xs font-black">
                ID: {accountInfo.propertyId}
              </span>
            ) : (
              <span className="border-[1.5px] border-black bg-[#FFE500] px-2 py-0.5 text-xs font-black">
                NOT SELECTED
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-[2px] border-black p-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-[2px] border-black bg-[#4DFFB4] flex items-center justify-center">
                <Search className="w-3 h-3" strokeWidth={3} />
              </div>
              <span className="font-black text-xs uppercase tracking-wider">Search Console Site</span>
            </div>
            {accountInfo?.siteUrl ? (
              <span className="border-[1.5px] border-black bg-[#4DFFB4] px-2 py-0.5 text-xs font-black max-w-[200px] truncate">
                {accountInfo.siteUrl}
              </span>
            ) : (
              <span className="border-[1.5px] border-black bg-[#FFE500] px-2 py-0.5 text-xs font-black">
                NOT SELECTED
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-[2px] border-black p-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-[2px] border-black bg-[#FF8C00] flex items-center justify-center">
                <Megaphone className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span className="font-black text-xs uppercase tracking-wider">Google Ads</span>
            </div>
            {accountInfo?.adsCustomerId ? (
              <span className="border-[1.5px] border-black bg-[#FF8C00]/20 px-2 py-0.5 text-xs font-black">
                ID: {accountInfo.adsCustomerId}
              </span>
            ) : (
              <span className="border-[1.5px] border-black bg-black/10 px-2 py-0.5 text-xs font-black text-black/40">
                NOT CONNECTED
              </span>
            )}
          </div>
        </div>

        <button
          onClick={loadingProps ? undefined : loadPropertiesAndSites}
          disabled={loadingProps}
          className="w-full border-[2px] border-black bg-white py-2.5 font-black text-xs shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingProps ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> LOADING PROPERTIES...</>
          ) : (
            <><RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} /> CHANGE PROPERTY SELECTION</>
          )}
        </button>
      </div>
    </div>
  );
}
