'use client';

import { SearchConsoleData } from '@/types';

interface SEOTableProps {
  data: SearchConsoleData[];
  type: 'query' | 'page';
  loading?: boolean;
}

export function SEOTable({ data, type, loading }: SEOTableProps) {
  if (loading) {
    return (
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
        <div className="border-b-[2px] border-black px-4 py-3">
          <div className="h-4 w-32 bg-black/10 animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-black/10 px-4 py-3">
            <div className="h-3 w-full bg-black/5 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
      <div className="border-b-[2px] border-black px-4 py-3">
        <h3 className="font-black text-sm uppercase tracking-wider">
          TOP {type === 'query' ? 'QUERIES' : 'PAGES'}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-[2px] border-black bg-black/5">
              <th className="text-left px-4 py-2.5 font-black uppercase tracking-wider">
                {type === 'query' ? 'Query' : 'Page'}
              </th>
              <th className="text-right px-3 py-2.5 font-black uppercase tracking-wider">Clicks</th>
              <th className="text-right px-3 py-2.5 font-black uppercase tracking-wider">Impr.</th>
              <th className="text-right px-3 py-2.5 font-black uppercase tracking-wider">CTR</th>
              <th className="text-right px-4 py-2.5 font-black uppercase tracking-wider">Pos.</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-black/40 font-bold">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-black/10 hover:bg-[#FFE500]/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">
                    {type === 'query' ? row.query : row.page}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold">{row.clicks.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-black/60">{row.impressions.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-bold">{row.ctr.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-black border-[1.5px] border-black px-1.5 py-0.5 text-[10px] ${
                      row.position <= 3 ? 'bg-[#4DFFB4]' :
                      row.position <= 10 ? 'bg-[#FFE500]' : 'bg-white'
                    }`}>
                      #{row.position.toFixed(0)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
