import React from 'react';
import { AnalyticsSummary } from '../../types/index.js';
import { Button } from '../common/Button.js';
import { FileSpreadsheet, RefreshCw, Calendar } from 'lucide-react';

interface HeroBannerProps {
  analytics: AnalyticsSummary | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  analytics,
  onRefresh,
  isLoading,
}) => {
  const startDateStr = analytics?.dateRange?.startDate
    ? new Date(analytics.dateRange.startDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Jan 2024';

  const endDateStr = analytics?.dateRange?.endDate
    ? new Date(analytics.dateRange.endDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Dec 2024';

  return (
    <section className="mt-8 lg:mt-10 mb-6 w-full">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slateNavy-200/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slateNavy-950 font-display tracking-tight">
            Financial Analytics Overview
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-slateNavy-500 font-medium">
            <span className="inline-flex items-center gap-1 text-slateNavy-700 font-semibold bg-slateNavy-100 px-2 py-0.5 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-slateNavy-500" />
              {startDateStr} – {endDateStr}
            </span>
            <span>•</span>
            <span>{analytics?.kpis?.totalTransactions || 300} Verified Records</span>
            <span>•</span>
            <span>USD Cashflow Ledger</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </section>
  );
};
