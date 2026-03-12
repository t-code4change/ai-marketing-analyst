'use client';

import { useWebsite } from '@/hooks/useWebsite';
import { useAIReport } from '@/hooks/useAIReport';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrafficChart } from '@/components/dashboard/TrafficChart';
import { AdsChart } from '@/components/dashboard/AdsChart';
import { SEOTable } from '@/components/dashboard/SEOTable';
import { useEffect, useState } from 'react';
import { AnalyticsSummary, SEOSummary } from '@/types';
import { Zap, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentWebsite, loading: siteLoading } = useWebsite();
  const { latestReport, generating, generateReport } = useAIReport(currentWebsite?.id);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [seo, setSeo] = useState<SEOSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!currentWebsite?.id) return;
    setDataLoading(true);
    Promise.all([
      fetch(`/api/data/analytics?websiteId=${currentWebsite.id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/data/search-console?websiteId=${currentWebsite.id}&siteUrl=https://${currentWebsite.domain}`).then(r => r.ok ? r.json() : null),
    ]).then(([analyticsData, seoData]) => {
      if (analyticsData?.summary) setAnalytics(analyticsData.summary);
      if (seoData?.summary) setSeo(seoData.summary);
    }).finally(() => setDataLoading(false));
  }, [currentWebsite?.id]);

  if (siteLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="border-[3px] border-black bg-[#FFE500] px-6 py-3 shadow-[4px_4px_0px_#000] animate-pulse">
          <p className="font-black">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!currentWebsite) {
    return (
      <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_#000] p-8 text-center max-w-md mx-auto mt-12">
        <div className="border-[3px] border-black bg-[#FFE500] p-4 shadow-[4px_4px_0px_#000] mb-6 inline-block">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="font-black text-xl mb-2">NO WEBSITE CONNECTED</h2>
        <p className="font-medium text-black/60 mb-6 text-sm">Add your first website to start analyzing your marketing data.</p>
        <Link
          href="/settings/websites"
          className="inline-block border-[2px] border-black bg-black text-[#FFE500] px-6 py-3 font-black text-sm shadow-[3px_3px_0px_#FFE500] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#FFE500] transition-all"
        >
          ADD WEBSITE →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black text-2xl tracking-tight">{currentWebsite.domain}</h1>
          <p className="text-sm font-bold text-black/50 uppercase tracking-wider">OVERVIEW — LAST 30 DAYS</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="flex items-center gap-2 border-[2px] border-black bg-[#FFE500] px-4 py-2.5 font-black text-sm shadow-[3px_3px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all disabled:opacity-50"
        >
          <Zap className="w-4 h-4" strokeWidth={3} />
          {generating ? 'ANALYZING...' : 'RUN AI ANALYSIS'}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Sessions"
          value={analytics?.totalSessions || 0}
          trend={analytics?.sessionsTrend}
          accentColor="#4D79FF"
          loading={dataLoading}
        />
        <MetricCard
          title="Conversions"
          value={analytics?.totalConversions || 0}
          trend={analytics?.conversionsTrend}
          accentColor="#4DFFB4"
          loading={dataLoading}
        />
        <MetricCard
          title="SEO Clicks"
          value={seo?.totalClicks || 0}
          accentColor="#FFE500"
          loading={dataLoading}
        />
        <MetricCard
          title="Avg Position"
          value={seo ? `#${seo.avgPosition.toFixed(0)}` : '—'}
          accentColor="#FF6B6B"
          loading={dataLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrafficChart data={analytics?.dailyData || []} loading={dataLoading} />
        </div>
        <div>
          <AdsChart data={[]} loading={dataLoading} />
        </div>
      </div>

      {/* AI Insights + SEO Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Report snippet */}
        {latestReport && (
          <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black px-4 py-3 bg-black">
              <h3 className="font-black text-sm text-[#FFE500] uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4" strokeWidth={3} /> AI INSIGHTS
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm font-medium text-black/70 leading-relaxed">{latestReport.summary}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="border-[2px] border-black p-3 bg-[#FF6B6B]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={3} />
                    <span className="font-black text-xs">ISSUES</span>
                  </div>
                  <span className="font-black text-2xl">{latestReport.issues.length}</span>
                </div>
                <div className="border-[2px] border-black p-3 bg-[#4DFFB4]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} />
                    <span className="font-black text-xs">OPPORTUNITIES</span>
                  </div>
                  <span className="font-black text-2xl">{latestReport.opportunities.length}</span>
                </div>
              </div>
              <Link
                href="/reports"
                className="inline-block w-full text-center border-[2px] border-black bg-[#FFE500] py-2 font-black text-xs shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                VIEW FULL REPORT →
              </Link>
            </div>
          </div>
        )}

        <SEOTable data={seo?.topQueries || []} type="query" loading={dataLoading} />
      </div>
    </div>
  );
}
