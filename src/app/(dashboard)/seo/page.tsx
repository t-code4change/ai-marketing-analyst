'use client';

import { useWebsite } from '@/hooks/useWebsite';
import { useEffect, useState } from 'react';
import { SEOSummary } from '@/types';
import { SEOTable } from '@/components/dashboard/SEOTable';
import { MetricCard } from '@/components/dashboard/MetricCard';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function SEOPage() {
  const { currentWebsite } = useWebsite();
  const [seo, setSeo] = useState<SEOSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTable, setActiveTable] = useState<'query' | 'page'>('query');

  useEffect(() => {
    if (!currentWebsite?.id) return;
    setLoading(true);
    fetch(`/api/data/search-console?websiteId=${currentWebsite.id}&siteUrl=https://${currentWebsite.domain}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.summary) setSeo(data.summary); })
      .finally(() => setLoading(false));
  }, [currentWebsite?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-2xl tracking-tight">SEO PERFORMANCE</h1>
        <p className="text-sm font-bold text-black/50 uppercase tracking-wider">SEARCH CONSOLE DATA — 30 DAYS</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Clicks" value={seo?.totalClicks || 0} accentColor="#4D79FF" loading={loading} />
        <MetricCard title="Impressions" value={seo?.totalImpressions || 0} accentColor="#FFE500" loading={loading} />
        <MetricCard title="Avg CTR" value={seo ? `${seo.avgCtr.toFixed(1)}%` : '—'} accentColor="#4DFFB4" loading={loading} />
        <MetricCard title="Avg Position" value={seo ? `#${seo.avgPosition.toFixed(0)}` : '—'} accentColor="#FF6B6B" loading={loading} />
      </div>

      {/* Tables */}
      <div className="flex gap-0 border-[2px] border-black overflow-hidden w-fit">
        {(['query', 'page'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTable(t)}
            className={`px-5 py-2.5 text-xs font-black border-r-[2px] border-black last:border-r-0 transition-colors ${
              activeTable === t ? 'bg-black text-[#FFE500]' : 'bg-white hover:bg-[#FFE500]/30'
            }`}
          >
            {t === 'query' ? 'TOP QUERIES' : 'TOP PAGES'}
          </button>
        ))}
      </div>

      <SEOTable
        data={activeTable === 'query' ? (seo?.topQueries || []) : (seo?.topPages || [])}
        type={activeTable}
        loading={loading}
      />
    </div>
  );
}
