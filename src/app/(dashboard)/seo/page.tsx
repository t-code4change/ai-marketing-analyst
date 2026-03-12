'use client';

import { useWebsite } from '@/hooks/useWebsite';
import { usePageSpeed } from '@/hooks/usePageSpeed';
import { getScoreColor, getScoreLabel, PageSpeedResult } from '@/lib/google/pagespeed';
import { RefreshCw, Smartphone, Monitor, Zap } from 'lucide-react';

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const color = getScoreColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 border-[3px] border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_#000]"
        style={{ backgroundColor: color }}
      >
        {score}
      </div>
      <span className="text-xs font-bold text-black uppercase">{label}</span>
    </div>
  );
}

function ScoreCard({ title, icon, result }: { title: string; icon: React.ReactNode; result: PageSpeedResult }) {
  return (
    <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
      <div className="border-b-[3px] border-black bg-[#FFE500] px-4 py-3 flex items-center gap-2">
        {icon}
        <span className="font-black text-sm uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-around mb-4">
          <ScoreCircle score={result.scores.performance} label="Performance" />
          <ScoreCircle score={result.scores.seo} label="SEO" />
          <ScoreCircle score={result.scores.accessibility} label="Accessibility" />
          <ScoreCircle score={result.scores.bestPractices} label="Best Practices" />
        </div>

        {/* Core Web Vitals */}
        <div className="border-t-[2px] border-black pt-3 mt-3">
          <p className="text-xs font-black uppercase tracking-wider mb-2">Core Web Vitals</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'LCP', value: result.coreWebVitals.lcp, unit: 'ms', good: 2500 },
              { label: 'FCP', value: result.coreWebVitals.fcp, unit: 'ms', good: 1800 },
              { label: 'CLS', value: result.coreWebVitals.cls, unit: '', good: 0.1 },
              { label: 'TTFB', value: result.coreWebVitals.ttfb, unit: 'ms', good: 800 },
              { label: 'SI', value: result.coreWebVitals.si, unit: 'ms', good: 3400 },
            ].map(({ label, value, unit, good }) => (
              <div key={label} className="border-[2px] border-black p-2 text-center"
                style={{ backgroundColor: value !== null ? getScoreColor(value <= good ? 95 : value <= good * 2 ? 70 : 30) : '#fff' }}>
                <div className="text-xs font-black">{label}</div>
                <div className="text-xs font-bold">
                  {value !== null ? `${label === 'CLS' ? value.toFixed(3) : Math.round(value)}${unit}` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        {result.opportunities.length > 0 && (
          <div className="border-t-[2px] border-black pt-3 mt-3">
            <p className="text-xs font-black uppercase tracking-wider mb-2">Top Opportunities</p>
            <div className="space-y-1">
              {result.opportunities.slice(0, 3).map(opp => (
                <div key={opp.id} className="border-[2px] border-black bg-[#FFF9E6] p-2">
                  <p className="text-xs font-bold text-black">{opp.title}</p>
                  {opp.savings && <p className="text-xs text-black/60">{opp.savings}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SEOPage() {
  const { currentWebsite } = useWebsite();
  const { mobile, desktop, fromCache, syncedAt, loading, error, refresh } = usePageSpeed(currentWebsite?.id);

  const data = mobile && desktop ? { mobile, desktop, fromCache, syncedAt } : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-black text-3xl text-black uppercase tracking-tight">PageSpeed & SEO</h1>
          <p className="text-sm font-bold text-black/60 mt-1">
            {currentWebsite?.domain || 'Select a website'}
            {data && <span className="ml-2 text-black/40">• {data.fromCache ? 'Cached' : 'Fresh'} • {new Date(data.syncedAt).toLocaleString()}</span>}
          </p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={loading || !currentWebsite}
          className="border-[2px] border-black bg-[#FFE500] px-4 py-2 font-black text-xs shadow-[3px_3px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all disabled:opacity-50 flex items-center gap-2 uppercase"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="border-[2px] border-black bg-[#FF6B6B] px-4 py-3 shadow-[3px_3px_0px_#000]">
          <p className="font-bold text-sm text-black">{error}</p>
        </div>
      )}

      {loading && !data && (
        <div className="border-[3px] border-black bg-white p-12 shadow-[4px_4px_0px_#000] text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="font-black text-sm uppercase">Analyzing {currentWebsite?.domain}...</p>
          <p className="text-xs text-black/50 mt-1">This may take 20-30 seconds</p>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoreCard
            title="Mobile"
            icon={<Smartphone className="w-4 h-4" />}
            result={data.mobile}
          />
          <ScoreCard
            title="Desktop"
            icon={<Monitor className="w-4 h-4" />}
            result={data.desktop}
          />
        </div>
      )}

      {!data && !loading && !error && currentWebsite && (
        <div className="border-[3px] border-black bg-white p-12 shadow-[4px_4px_0px_#000] text-center">
          <Zap className="w-8 h-8 mx-auto mb-3" />
          <p className="font-black text-sm uppercase mb-3">No PageSpeed data yet</p>
          <button
            onClick={() => refresh()}
            className="border-[2px] border-black bg-[#FFE500] px-6 py-2 font-black text-sm shadow-[3px_3px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] transition-all"
          >
            ANALYZE NOW →
          </button>
        </div>
      )}
    </div>
  );
}
