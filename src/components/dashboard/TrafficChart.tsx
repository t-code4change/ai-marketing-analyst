'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AnalyticsData } from '@/types';
import { format, parseISO } from 'date-fns';

interface TrafficChartProps {
  data: AnalyticsData[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-[2px] border-black bg-white shadow-[3px_3px_0px_#000] p-3 text-xs">
      <p className="font-black mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>
          {p.name}: <span className="font-black text-black">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export function TrafficChart({ data, loading }: TrafficChartProps) {
  if (loading) {
    return (
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-4">
        <div className="h-5 w-32 bg-black/10 border border-black/20 animate-pulse mb-4" />
        <div className="h-48 bg-black/5 border border-black/10 animate-pulse" />
      </div>
    );
  }

  const chartData = data.map(d => ({
    date: format(parseISO(d.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'MMM d'),
    Sessions: d.sessions,
    Users: d.users,
  }));

  return (
    <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
      <div className="border-b-[2px] border-black px-4 py-3 flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-wider">TRAFFIC (30 DAYS)</h3>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-xs font-bold">
            <span className="inline-block w-3 h-0.5 bg-[#4D79FF]" /> Sessions
          </span>
          <span className="flex items-center gap-1 text-xs font-bold">
            <span className="inline-block w-3 h-0.5 bg-[#FF6B6B]" /> Users
          </span>
        </div>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#00000015" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }}
              tickLine={false}
              axisLine={{ stroke: '#000', strokeWidth: 2 }}
            />
            <YAxis
              tick={{ fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }}
              tickLine={false}
              axisLine={{ stroke: '#000', strokeWidth: 2 }}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Sessions"
              stroke="#4D79FF"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, stroke: '#000', strokeWidth: 2, fill: '#4D79FF' }}
            />
            <Line
              type="monotone"
              dataKey="Users"
              stroke="#FF6B6B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, stroke: '#000', strokeWidth: 2, fill: '#FF6B6B' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
