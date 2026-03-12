'use client';

import { useWebsite } from '@/hooks/useWebsite';
import { useAIReport } from '@/hooks/useAIReport';
import { AIReportCard } from '@/components/reports/AIReportCard';
import { IssuesList } from '@/components/reports/IssuesList';
import { OpportunitiesList } from '@/components/reports/OpportunitiesList';
import { KeywordsTable } from '@/components/reports/KeywordsTable';
import { AIProviderSelector } from '@/components/settings/AIProviderSelector';
import { Zap, AlertTriangle, TrendingUp, Key, Map, Settings2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { AIStrategy } from '@/types';

function StrategiesList({ strategies }: { strategies: AIStrategy[] }) {
  const priorityColors = { urgent: '#FF6B6B', high: '#FF8C00', medium: '#FFE500', low: '#4DFFB4' };
  
  return (
    <div className="space-y-3">
      {strategies.map((s, i) => (
        <div key={i} className="border-[2px] border-black bg-white shadow-[3px_3px_0px_#000]">
          <div className="border-b-[2px] border-black px-4 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: priorityColors[s.priority] || '#fff' }}>
            <span className="font-black text-sm">{s.title}</span>
            <div className="flex gap-2">
              <span className="border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black bg-white uppercase">{s.timeframe}</span>
              <span className="border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black bg-white uppercase">{s.category}</span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm font-medium text-black/70 mb-3">{s.description}</p>
            <div className="space-y-1">
              {s.steps.map((step, j) => (
                <div key={j} className="flex items-start gap-2 text-xs font-medium">
                  <span className="shrink-0 w-5 h-5 border-[1.5px] border-black bg-[#FFE500] flex items-center justify-center font-black text-[10px]">{j + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const tabs = [
  { id: 'overview', label: 'OVERVIEW', icon: Zap },
  { id: 'issues', label: 'ISSUES', icon: AlertTriangle },
  { id: 'opportunities', label: 'OPPORTUNITIES', icon: TrendingUp },
  { id: 'keywords', label: 'KEYWORDS', icon: Key },
  { id: 'strategies', label: 'STRATEGIES', icon: Map },
];

export default function ReportsPage() {
  const { currentWebsite } = useWebsite();
  const { latestReport, loading, generating, generateReport } = useAIReport(currentWebsite?.id);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProviderSelector, setShowProviderSelector] = useState(false);
  const [providerType, setProviderType] = useState<'claude-cli' | 'openai'>('claude-cli');
  const [providerConfig, setProviderConfig] = useState<{ apiKey?: string; model?: string }>({});

  function handleGenerate() {
    generateReport({ provider: providerType, ...providerConfig });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black text-2xl tracking-tight">AI REPORTS</h1>
          <p className="text-sm font-bold text-black/50 uppercase tracking-wider">MARKETING INTELLIGENCE</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProviderSelector(!showProviderSelector)}
            className={`border-[2px] border-black p-2.5 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ${showProviderSelector ? 'bg-black text-[#FFE500]' : 'bg-white'}`}
            title="AI Provider"
          >
            <Settings2 className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !currentWebsite}
            className="flex items-center gap-2 border-[2px] border-black bg-[#FFE500] px-5 py-2.5 font-black text-sm shadow-[3px_3px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" strokeWidth={3} />
            {generating ? `ANALYZING via ${providerType === 'claude-cli' ? 'CLAUDE' : 'GPT-4o'}...` : 'GENERATE REPORT'}
          </button>
        </div>
      </div>

      {/* Provider selector panel */}
      {showProviderSelector && (
        <div className="border-[3px] border-black bg-[#FFFEF0] shadow-[4px_4px_0px_#000] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4" strokeWidth={2.5} />
            <h3 className="font-black text-sm uppercase tracking-wider">AI PROVIDER</h3>
            <div className={`ml-2 border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black ${providerType === 'claude-cli' ? 'bg-[#FFE500]' : 'bg-[#4D79FF] text-white'}`}>
              {providerType === 'claude-cli' ? 'CLAUDE CODE' : 'OPENAI'}
            </div>
          </div>
          <AIProviderSelector
            value={providerType}
            onChange={(type, config) => {
              setProviderType(type);
              setProviderConfig(config || {});
            }}
            disabled={generating}
          />
        </div>
      )}

      {!latestReport && !loading ? (
        <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_#000] p-12 text-center">
          <div className="border-[3px] border-black bg-[#FFE500] p-5 shadow-[4px_4px_0px_#000] inline-block mb-6">
            <Zap className="w-10 h-10" strokeWidth={3} />
          </div>
          <h2 className="font-black text-xl mb-2">NO REPORTS YET</h2>
          <p className="font-medium text-black/60 mb-6 max-w-sm mx-auto text-sm">
            Generate your first AI analysis to get actionable insights on your marketing performance.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating || !currentWebsite}
            className="border-[2px] border-black bg-black text-[#FFE500] px-8 py-3 font-black shadow-[4px_4px_0px_#FFE500] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#FFE500] transition-all disabled:opacity-50"
          >
            {generating ? 'ANALYZING DATA...' : 'RUN FIRST ANALYSIS →'}
          </button>
        </div>
      ) : latestReport ? (
        <div className="space-y-4">
          <div className="flex gap-0 border-[2px] border-black overflow-hidden">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-r-[2px] border-black last:border-r-0 transition-colors ${
                  activeTab === id ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-[#FFE500]/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={3} />
                {label}
                {id === 'issues' && latestReport.issues.length > 0 && (
                  <span className={`ml-1 border-[1.5px] border-current px-1.5 py-0.5 text-[10px] font-black`}>
                    {latestReport.issues.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && <AIReportCard report={latestReport} />}
          {activeTab === 'issues' && (
            <div>
              <p className="font-black text-xs text-black/50 uppercase tracking-widest mb-4">
                {latestReport.issues.length} ISSUE{latestReport.issues.length !== 1 ? 'S' : ''} FOUND
              </p>
              <IssuesList issues={latestReport.issues} />
            </div>
          )}
          {activeTab === 'opportunities' && (
            <div>
              <p className="font-black text-xs text-black/50 uppercase tracking-widest mb-4">
                {latestReport.opportunities.length} GROWTH OPPORTUNITIES
              </p>
              <OpportunitiesList opportunities={latestReport.opportunities} />
            </div>
          )}
          {activeTab === 'keywords' && <KeywordsTable keywords={latestReport.keywords} />}
          {activeTab === 'strategies' && (
            <div>
              <p className="font-black text-xs text-black/50 uppercase tracking-widest mb-4">
                {latestReport.strategies.length} STRATEGIES
              </p>
              <StrategiesList strategies={latestReport.strategies} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
