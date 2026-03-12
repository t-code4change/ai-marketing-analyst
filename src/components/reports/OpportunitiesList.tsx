import { AIOpportunity } from '@/types';
import { TrendingUp, Zap } from 'lucide-react';

const impactColors = { high: '#4DFFB4', medium: '#FFE500', low: '#fff' };
const effortColors = { low: '#4DFFB4', medium: '#FFE500', high: '#FF6B6B' };

export function OpportunitiesList({ opportunities }: { opportunities: AIOpportunity[] }) {
  return (
    <div className="space-y-3">
      {opportunities.map((opp, i) => (
        <div
          key={i}
          className="border-[2px] border-black bg-white shadow-[3px_3px_0px_#000] p-4 hover:shadow-[4px_4px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 shrink-0" strokeWidth={3} />
              <p className="font-black text-sm">{opp.description}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black uppercase"
              style={{ backgroundColor: impactColors[opp.impact] }}>
              IMPACT: {opp.impact.toUpperCase()}
            </span>
            <span className="border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black uppercase"
              style={{ backgroundColor: effortColors[opp.effort] }}>
              EFFORT: {opp.effort.toUpperCase()}
            </span>
            <span className="border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black bg-white uppercase">
              {opp.category}
            </span>
            {opp.estimatedGain && (
              <span className="border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black bg-[#4D79FF] text-white uppercase">
                +{opp.estimatedGain}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
