import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number; // percentage change
  prefix?: string;
  suffix?: string;
  accentColor?: string; // tailwind bg color or hex
  description?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  trend,
  prefix = '',
  suffix = '',
  accentColor = '#FFE500',
  description,
  loading = false,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isNeutral = trend !== undefined && trend === 0;

  return (
    <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
      {/* Accent top bar */}
      <div className="h-1.5 border-b-[2px] border-black" style={{ backgroundColor: accentColor }} />
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <p className="text-xs font-black text-black/50 uppercase tracking-widest">{title}</p>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 border-[1.5px] border-black px-1.5 py-0.5 text-xs font-black',
              isPositive && 'bg-[#4DFFB4]',
              isNegative && 'bg-[#FF6B6B]',
              isNeutral && 'bg-white',
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> :
               isNegative ? <TrendingDown className="w-3 h-3" strokeWidth={3} /> :
               <Minus className="w-3 h-3" strokeWidth={3} />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-2 h-8 w-24 bg-black/10 border-[1px] border-black/20 animate-pulse" />
        ) : (
          <div className="mt-2">
            <span className="text-3xl font-black text-black tracking-tight">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </span>
          </div>
        )}

        {description && (
          <p className="mt-2 text-xs font-medium text-black/50">{description}</p>
        )}
      </div>
    </div>
  );
}
