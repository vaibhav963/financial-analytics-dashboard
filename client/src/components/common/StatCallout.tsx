import React from 'react';

interface StatCalloutProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: string;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'slate';
  className?: string;
}

export const StatCallout: React.FC<StatCalloutProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
  badge,
  accentColor = 'indigo',
  className = '',
}) => {
  const accentBorder = {
    indigo: 'hover:border-loopr-400 hover:shadow-indigo-500/10',
    emerald: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
    amber: 'hover:border-amber-400 hover:shadow-amber-500/10',
    cyan: 'hover:border-cyan-400 hover:shadow-cyan-500/10',
    rose: 'hover:border-rose-400 hover:shadow-rose-500/10',
    slate: 'hover:border-slateNavy-400 hover:shadow-slate-500/10',
  }[accentColor];

  const iconBg = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slateNavy-100 text-slateNavy-700',
  }[accentColor];

  return (
    <div
      className={`glass-card p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 border border-slateNavy-200/80 bg-white hover:shadow-md h-full min-h-[140px] ${accentBorder} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slateNavy-500">
          {label}
        </span>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="text-2xl xl:text-3xl font-bold tracking-tight text-slateNavy-900 font-display">
            {value}
          </span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0 whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>

        {(change || subtitle) && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            {change && (
              <span
                className={`font-semibold flex items-center gap-0.5 ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isPositive ? '↑' : '↓'} {change}
              </span>
            )}
            {subtitle && <span className="text-slateNavy-500 font-medium">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
