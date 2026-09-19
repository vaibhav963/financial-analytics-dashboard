import React, { useState } from 'react';
import { MonthlyTrendData } from '../../types/index.js';
import { Sparkles, Calendar, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface DynamicTimelineProps {
  trends: MonthlyTrendData[];
  onSelectMonth?: (monthStr: string) => void;
  isLoading: boolean;
}

export const DynamicTimeline: React.FC<DynamicTimelineProps> = ({
  trends,
  onSelectMonth,
  isLoading,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (isLoading || !trends || trends.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl h-48 animate-shimmer" />
    );
  }

  const selectedTrend = trends[activeStep] || trends[0];

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-loopr-50 text-loopr-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slateNavy-900 font-display">
              Cashflow Milestone Journey
            </h2>
            <p className="text-xs text-slateNavy-500">
              Interactive timeline of monthly cash velocity &amp; transaction milestones
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-loopr-50 text-loopr-700 border border-loopr-100">
          <Sparkles className="w-3.5 h-3.5 text-loopr-500" /> {trends.length} Monthly Milestones
        </span>
      </div>

      {/* Stepper Timeline Bar */}
      <div className="overflow-x-auto pb-4 pt-2 px-1">
        <div className="relative flex items-center justify-between gap-1 min-w-[840px] w-full px-4">
          {/* Continuous Connecting Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-slateNavy-200 -z-0" />

          {trends.map((item, idx) => {
            const isActive = idx === activeStep;
            const isNetPositive = item.netCashFlow >= 0;

            return (
              <button
                key={item.month}
                type="button"
                onClick={() => {
                  setActiveStep(idx);
                  if (onSelectMonth) onSelectMonth(item.month);
                }}
                className="group relative z-10 flex flex-col items-center min-w-[70px] focus:outline-none cursor-pointer"
              >
                {/* Stepper Node */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2 ${
                    isActive
                      ? 'bg-loopr-600 text-white border-loopr-600 shadow-glow scale-110'
                      : isNetPositive
                      ? 'bg-white text-emerald-600 border-emerald-400 group-hover:border-loopr-500'
                      : 'bg-white text-rose-600 border-rose-400 group-hover:border-loopr-500'
                  }`}
                >
                  {isActive ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span>{item.month.slice(0, 3)}</span>
                  )}
                </div>

                {/* Month Label */}
                <span
                  className={`text-[11px] font-bold mt-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-loopr-700 font-extrabold'
                      : 'text-slateNavy-500 group-hover:text-slateNavy-900'
                  }`}
                >
                  {item.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Milestone Detail Card */}
      {selectedTrend && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-loopr-50/60 via-slateNavy-50/80 to-cyan-50/60 border border-loopr-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-loopr-800 tracking-wider">
                Milestone Summary: {selectedTrend.month}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedTrend.netCashFlow >= 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {selectedTrend.netCashFlow >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
            <p className="text-xs text-slateNavy-600 mt-1">
              Executed <strong>{selectedTrend.transactionCount} transactions</strong> with a net cash outcome of{' '}
              <strong
                className={
                  selectedTrend.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }
              >
                ${selectedTrend.netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slateNavy-200/50">
            <div className="flex items-center gap-1.5 font-semibold text-loopr-700">
              <TrendingUp className="w-4 h-4 text-loopr-600" />
              <span>
                Rev: ${selectedTrend.revenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-rose-700">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>
                Exp: ${selectedTrend.expenses.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
