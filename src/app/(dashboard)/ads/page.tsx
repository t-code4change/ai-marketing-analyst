'use client';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { AdsChart } from '@/components/dashboard/AdsChart';
import { useWebsite } from '@/hooks/useWebsite';

export default function AdsPage() {
  const { currentWebsite } = useWebsite();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-2xl tracking-tight">GOOGLE ADS</h1>
        <p className="text-sm font-bold text-black/50 uppercase tracking-wider">CAMPAIGN PERFORMANCE — 30 DAYS</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Spend" value="—" prefix="$" accentColor="#FF6B6B" />
        <MetricCard title="Conversions" value="—" accentColor="#4DFFB4" />
        <MetricCard title="Avg CTR" value="—" suffix="%" accentColor="#4D79FF" />
        <MetricCard title="Avg CPA" value="—" prefix="$" accentColor="#FFE500" />
      </div>

      <AdsChart data={[]} />

      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-8 text-center">
        <p className="font-black text-sm mb-2">GOOGLE ADS NOT CONNECTED</p>
        <p className="text-sm font-medium text-black/60 mb-4">Connect your Google Ads account in Settings to see campaign data.</p>
        <a href="/settings" className="inline-block border-[2px] border-black bg-[#FFE500] px-5 py-2 font-black text-xs shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all">
          GO TO SETTINGS →
        </a>
      </div>
    </div>
  );
}
