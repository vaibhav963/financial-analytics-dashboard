import React, { useState, useMemo } from 'react';
import { MonthlyTrendData } from '../../types/index.js';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';

interface CumulativeCashflowChartProps {
  data: MonthlyTrendData[];
  isLoading: boolean;
}

const CustomCashflowTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const cumulative = payload.find((p: any) => p.dataKey === 'cumulative')?.value || 0;
    const netFlow = payload.find((p: any) => p.dataKey === 'netCashFlow')?.value || 0;
    const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
    const exp = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;

    return (
      <div className="glass-pill-nav p-3.5 rounded-xl border border-slateNavy-200 shadow-xl text-xs space-y-1.5 min-w-48">
        <p className="font-bold text-slateNavy-900 border-b border-slateNavy-100 pb-1">{label}</p>
        <div className="flex items-center justify-between text-cyan-700 font-semibold">
          <span>Cumulative Balance:</span>
          <span className="font-bold">${cumulative.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between text-emerald-600 font-medium">
          <span>Monthly Net:</span>
          <span className="font-bold">
            {netFlow >= 0 ? '+' : ''}${netFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slateNavy-100 text-slateNavy-500 text-[11px]">
          <span>Inflow: ${rev.toLocaleString()}</span>
          <span>Outflow: ${exp.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const CumulativeCashflowChart: React.FC<CumulativeCashflowChartProps> = ({
  data,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'cumulative' | 'netMonthly'>('cumulative');

  // Compute running cumulative liquidity
  const processedData = useMemo(() => {
    let runningTotal = 0;
    return data.map((item) => {
      const net = item.revenue - item.expenses;
      runningTotal += net;
      return {
        ...item,
        netCashFlow: net,
        cumulative: runningTotal,
      };
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl h-96 flex items-center justify-center animate-shimmer" />
    );
  }

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  const finalCumulative = processedData[processedData.length - 1]?.cumulative || 0;

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slateNavy-900 font-display">
              Cumulative Liquidity &amp; Net Cashflow Curve
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-100">
              Running Growth
            </span>
          </div>
          <p className="text-xs text-slateNavy-500 mt-0.5">
            12-Month cumulative financial surplus trajectory: ending at{' '}
            <strong className="text-emerald-600 font-semibold">
              +${(finalCumulative / 1000).toFixed(1)}k
            </strong>
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slateNavy-100/80 border border-slateNavy-200 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('cumulative')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'cumulative'
                ? 'bg-white text-loopr-700 shadow-sm'
                : 'text-slateNavy-600 hover:text-slateNavy-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('netMonthly')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'netMonthly'
                ? 'bg-white text-loopr-700 shadow-sm'
                : 'text-slateNavy-600 hover:text-slateNavy-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Monthly Net</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomCashflowTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="3 3" />

            {viewMode === 'cumulative' ? (
              <>
                <Area
                  type="monotone"
                  name="Cumulative Cash Balance"
                  dataKey="cumulative"
                  stroke="#0891B2"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#cumulativeGradient)"
                />
                <Bar
                  name="Monthly Surplus/Deficit"
                  dataKey="netCashFlow"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                  opacity={0.7}
                />
              </>
            ) : (
              <>
                <Bar
                  name="Monthly Net Cash Flow"
                  dataKey="netCashFlow"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  type="monotone"
                  name="Cumulative Trend"
                  dataKey="cumulative"
                  stroke="#0891B2"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0891B2' }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
