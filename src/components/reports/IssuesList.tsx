import { AIIssue } from '@/types';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const severityConfig = {
  critical: { icon: AlertTriangle, bg: '#FF6B6B', label: 'CRITICAL', shadow: '#FF0000' },
  high: { icon: AlertCircle, bg: '#FF8C00', label: 'HIGH', shadow: '#FF8C00' },
  medium: { icon: Info, bg: '#FFE500', label: 'MEDIUM', shadow: '#FFE500' },
  low: { icon: CheckCircle, bg: '#4DFFB4', label: 'LOW', shadow: '#4DFFB4' },
};

const categoryColors: Record<string, string> = {
  seo: '#4D79FF',
  ads: '#FFE500',
  analytics: '#4DFFB4',
  technical: '#FF6B6B',
  content: '#9B5DE5',
  ux: '#FF8C00',
};

export function IssuesList({ issues }: { issues: AIIssue[] }) {
  if (!issues.length) {
    return (
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-8 text-center">
        <CheckCircle className="w-8 h-8 mx-auto mb-3" strokeWidth={2.5} />
        <p className="font-black text-sm">NO ISSUES FOUND</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue, i) => {
        const config = severityConfig[issue.severity];
        const Icon = config.icon;
        return (
          <div
            key={i}
            className="border-[2px] border-black bg-white shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
          >
            <div className="flex items-start gap-0">
              {/* Severity badge */}
              <div
                className="border-r-[2px] border-black px-3 py-4 flex flex-col items-center gap-1 shrink-0 min-w-[70px]"
                style={{ backgroundColor: config.bg }}
              >
                <Icon className="w-4 h-4" strokeWidth={3} />
                <span className="text-[9px] font-black tracking-wider">{config.label}</span>
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-black text-sm leading-snug">{issue.description}</p>
                  <span
                    className="shrink-0 border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black uppercase"
                    style={{ backgroundColor: categoryColors[issue.category] || '#fff' }}
                  >
                    {issue.category}
                  </span>
                </div>
                <div className="border-l-[3px] border-black pl-3 mt-2">
                  <p className="text-xs font-black text-black/50 uppercase tracking-wider mb-0.5">FIX</p>
                  <p className="text-xs font-medium">{issue.fix}</p>
                </div>
                {issue.impact && (
                  <div className="mt-2 bg-[#4DFFB4]/20 border-[1.5px] border-black px-3 py-1.5">
                    <p className="text-xs font-bold">Expected: {issue.impact}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
