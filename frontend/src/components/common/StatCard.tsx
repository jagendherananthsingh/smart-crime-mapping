import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  accentColor?: string;
  variant?: 'indigo' | 'purple' | 'amber' | 'rose' | 'emerald' | 'cyan' | string;
}

const VARIANT_STYLES: Record<string, { accent: string; icon: string }> = {
  indigo: { accent: 'bg-indigo-500/10 border-indigo-500/20', icon: 'text-indigo-400' },
  purple: { accent: 'bg-purple-500/10 border-purple-500/20', icon: 'text-purple-400' },
  amber: { accent: 'bg-amber-500/10 border-amber-500/20', icon: 'text-amber-400' },
  rose: { accent: 'bg-rose-500/10 border-rose-500/20', icon: 'text-rose-400' },
  emerald: { accent: 'bg-emerald-500/10 border-emerald-500/20', icon: 'text-emerald-400' },
  cyan: { accent: 'bg-cyan-500/10 border-cyan-500/20', icon: 'text-cyan-400' },
  default: { accent: 'bg-indigo-500/10 border-indigo-500/20', icon: 'text-indigo-400' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor,
  accentColor,
  variant = 'indigo',
}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES['default'];
  const resolvedAccent = accentColor || variantStyle.accent;
  const resolvedIcon = iconColor || variantStyle.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-all duration-200 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">{title}</p>
          <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight truncate group-hover:text-indigo-100 transition-colors">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${resolvedAccent} ${resolvedIcon} shrink-0 ml-3`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded ${
                trend.isPositive
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
