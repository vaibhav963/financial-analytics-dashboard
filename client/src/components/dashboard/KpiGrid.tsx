import React from 'react';
import { AnalyticsSummary } from '../../types/index.js';
import { formatCurrency } from '../../utils/formatters.js';
import { StatCallout } from '../common/StatCallout.js';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
} from 'lucide-react';

interface KpiGridProps {
  analytics: AnalyticsSummary | null;
  isLoading: boolean;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ analytics, isLoading }) => {
  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl h-36 animate-shimmer" />
        ))}
      </div>
    );
  }

  const { kpis } = analytics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Revenue */}
      <StatCallout
        label="Total Revenue"
        value={formatCurrency(kpis.totalRevenue)}
        subtitle="Gross Inflow"
        badge="Topline"
        accentColor="indigo"
        icon={<TrendingUp className="w-5 h-5 text-loopr-600" />}
      />

      {/* 2. Total Expenses */}
      <StatCallout
        label="Total Expenses"
        value={formatCurrency(kpis.totalExpenses)}
        subtitle="Operational Outflow"
        accentColor="rose"
        isPositive={false}
        icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
      />

      {/* 3. Net Cash Flow */}
      <StatCallout
        label="Net Cash Flow"
        value={formatCurrency(kpis.netCashFlow)}
        badge={`${kpis.netMarginPercentage.toFixed(1)}% margin`}
        subtitle="Net Operating Profit"
        accentColor={kpis.netCashFlow >= 0 ? 'emerald' : 'rose'}
        isPositive={kpis.netCashFlow >= 0}
        icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
      />

      {/* 4. Total Transactions */}
      <StatCallout
        label="Total Transactions"
        value={kpis.totalTransactions.toLocaleString()}
        badge={`${kpis.successRatePercentage.toFixed(0)}% paid`}
        subtitle="Verified Ledger Records"
        accentColor="slate"
        icon={<CreditCard className="w-5 h-5 text-slateNavy-700" />}
      />
    </div>
  );
};
