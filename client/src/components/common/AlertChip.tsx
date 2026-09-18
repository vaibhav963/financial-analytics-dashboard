import React from 'react';
import { CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export type AlertChipVariant = 'Paid' | 'Pending' | 'Revenue' | 'Expense' | 'Admin' | 'Analyst' | 'warning' | 'info';

interface AlertChipProps {
  variant: AlertChipVariant | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  onDismiss?: () => void;
}

export const AlertChip: React.FC<AlertChipProps> = ({
  variant,
  label,
  size = 'md',
  showIcon = true,
  className = '',
  onDismiss,
}) => {
  const displayLabel = label || variant;

  let styleClasses = 'bg-slateNavy-100 text-slateNavy-700 border-slateNavy-200';
  let IconComponent: React.ReactNode = null;

  switch (variant) {
    case 'Paid':
      styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm';
      IconComponent = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      break;
    case 'Pending':
      styleClasses = 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-sm';
      IconComponent = <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />;
      break;
    case 'Revenue':
      styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      IconComponent = <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      break;
    case 'Expense':
      styleClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
      IconComponent = <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      break;
    case 'Admin':
      styleClasses = 'bg-purple-50 text-purple-700 border-purple-200/80';
      IconComponent = <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
      break;
    case 'Analyst':
      styleClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
      IconComponent = <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
      break;
    case 'warning':
      styleClasses = 'bg-amber-100 text-amber-900 border-amber-300';
      IconComponent = <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2 py-0.5 gap-1'
      : size === 'lg'
      ? 'text-sm px-3.5 py-1.5 gap-2'
      : 'text-xs font-medium px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${sizeClasses} ${styleClasses} ${className}`}
    >
      {showIcon && IconComponent}
      <span className="leading-none font-semibold">{displayLabel}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="ml-0.5 hover:opacity-75 focus:outline-none"
          aria-label={`Remove ${displayLabel} filter`}
        >
          ×
        </button>
      )}
    </span>
  );
};
