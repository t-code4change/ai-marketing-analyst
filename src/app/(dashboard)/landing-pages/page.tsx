'use client';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { FileText } from 'lucide-react';

export default function LandingPagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-2xl tracking-tight">LANDING PAGES</h1>
        <p className="text-sm font-bold text-black/50 uppercase tracking-wider">CONVERSION ANALYSIS</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Pages" value="—" accentColor="#4D79FF" />
        <MetricCard title="Avg Bounce Rate" value="—" suffix="%" accentColor="#FF6B6B" />
        <MetricCard title="Avg Conv. Rate" value="—" suffix="%" accentColor="#4DFFB4" />
        <MetricCard title="Top Page Sessions" value="—" accentColor="#FFE500" />
      </div>

      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
        <div className="border-b-[2px] border-black px-4 py-3">
          <h3 className="font-black text-sm uppercase tracking-wider">PAGE PERFORMANCE</h3>
        </div>
        <div className="p-8 text-center">
          <FileText className="w-8 h-8 mx-auto mb-3 text-black/30" strokeWidth={1.5} />
          <p className="font-black text-sm mb-2">CONNECT GOOGLE ANALYTICS</p>
          <p className="text-sm font-medium text-black/60 mb-4">Landing page data requires Google Analytics integration.</p>
          <a href="/settings" className="inline-block border-[2px] border-black bg-[#FFE500] px-5 py-2 font-black text-xs shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all">
            CONNECT NOW →
          </a>
        </div>
      </div>
    </div>
  );
}
