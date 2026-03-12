import { AIReport } from '@/types';
import { format } from 'date-fns';
import { Zap, AlertTriangle, TrendingUp, Key, Target } from 'lucide-react';

interface ScoreBarProps {
  label: string;
  score: number;
  color: string;
}

function ScoreBar({ label, score, color }: ScoreBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-black uppercase tracking-wider">{label}</span>
        <span className="text-xs font-black">{score}/100</span>
      </div>
      <div className="h-4 border-[2px] border-black bg-white">
        <div
          className="h-full border-r-[2px] border-black transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function AIReportCard({ report }: { report: AIReport }) {
  return (
    <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_#000]">
      {/* Header */}
      <div className="border-b-[3px] border-black bg-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#FFE500]" strokeWidth={3} />
          <div>
            <h2 className="font-black text-[#FFE500] uppercase tracking-wider">AI ANALYSIS REPORT</h2>
            <p className="text-white/50 text-xs font-bold">
              {format(new Date(report.createdAt), 'MMM d, yyyy — h:mm a')}
            </p>
          </div>
        </div>
        <div className="border-[2px] border-[#FFE500] bg-[#FFE500] px-3 py-1.5">
          <span className="font-black text-black text-lg">{report.score?.overall || 0}</span>
          <span className="font-bold text-black text-xs">/100</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="border-[2px] border-black p-4 bg-[#FFFEF0]">
          <p className="font-medium text-sm leading-relaxed">{report.summary}</p>
        </div>

        {/* Scores */}
        {report.score && (
          <div className="space-y-3">
            <h3 className="font-black text-xs uppercase tracking-widest">PERFORMANCE SCORES</h3>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBar label="SEO" score={report.score.seo} color="#4D79FF" />
              <ScoreBar label="Ads" score={report.score.ads} color="#FFE500" />
              <ScoreBar label="Technical" score={report.score.technical} color="#4DFFB4" />
              <ScoreBar label="Content" score={report.score.content} color="#FF6B6B" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
