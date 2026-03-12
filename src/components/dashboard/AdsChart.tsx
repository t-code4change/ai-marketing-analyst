'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AdsCampaignSummary } from '@/types';

interface AdsChartProps {
  data: AdsCampaignSummary[];
  loading?: boolean;
}

const COLORS = ['#FFE500', '#4D79FF', '#4DFFB4', '#FF6B6B', '#9B5DE5'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-[2px] border-black bg-white shadow-[3px_3px_0px_#000] p-3 text-xs">
      <p className="font-black mb-1 text-xs">{label}</p>
      <p className="font-bold">Spend: <span className="font-black">${payload[0]?.value?.toFixed(2)}</span></p>
      <p className="font-bold">Conv: <span className="font-black">{payload[1]?.value}</span></p>
    </div>
  );
};

export function AdsChart({ data, loading }: AdsChartProps) {
  if (loading) {
    return (
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-4">
        <div className="h-5 w-40 bg-black/10 border border-black/20 animate-pulse mb-4" />
        <div className="h-48 bg-black/5 border border-black/10 animate-pulse" />
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: d.campaign.length > 15 ? d.campaign.slice(0, 15) + '...' : d.campaign,
    Spend: d.totalCost,
    Conversions: d.totalConversions,
  }));

  return (
    <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
      <div className="border-b-[2px] border-black px-4 py-3">
        <h3 className="font-black text-sm uppercase tracking-wider">AD SPEND VS CONVERSIONS</h3>
      </div>
      <div className="p-4">
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm font-bold text-black/40">No ads data connected</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#00000015" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fontWeight: 700, fontFamily: 'inherit' }}
                tickLine={false}
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
              />
              <YAxis
                tick={{ fontSize: 9, fontWeight: 700, fontFamily: 'inherit' }}
                tickLine={false}
                axisLine={{ stroke: '#000', strokeWidth: 2 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Spend" fill="#FFE500" stroke="#000" strokeWidth={1.5} radius={0}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
