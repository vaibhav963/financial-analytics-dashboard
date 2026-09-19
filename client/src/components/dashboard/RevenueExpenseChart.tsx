import React, { useState } from 'react';
import { MonthlyTrendData } from '../../types/index.js';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface RevenueExpenseChartProps {
  data: MonthlyTrendData[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
    const exp = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
    const net = rev - exp;

    return (
      <div className="glass-pill-nav p-3.5 rounded-xl border border-slateNavy-200 shadow-xl text-xs space-y-1.5 min-w-44">
        <p className="font-bold text-slateNavy-900 border-b border-slateNavy-100 pb-1">{label}</p>
        <div className="flex items-center justify-between text-loopr-600 font-medium">
          <span>Revenue:</span>
          <span className="font-bold">${rev.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between text-rose-600 font-medium">
          <span>Expenses:</span>
          <span className="font-bold">${exp.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slateNavy-100 font-bold">
          <span className={net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>Net Flow:</span>
          <span className={net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
            {net >= 0 ? '+' : ''}${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({ data, isLoading }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl h-96 flex items-center justify-center animate-shimmer" />
    );
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slateNavy-900 font-display">
              Revenue vs. Expenses Trend
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-loopr-50 text-loopr-700 border border-loopr-100">
              Monthly Aggregation
            </span>
          </div>
          <p className="text-xs text-slateNavy-500 mt-0.5">
            Comparative performance across dynamic monthly periods
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slateNavy-100/80 border border-slateNavy-200 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              chartType === 'area'
                ? 'bg-white text-loopr-700 shadow-sm'
                : 'text-slateNavy-600 hover:text-slateNavy-900'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Area</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              chartType === 'bar'
                ? 'bg-white text-loopr-700 shadow-sm'
                : 'text-slateNavy-600 hover:text-slateNavy-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(val: string) => val.slice(0, 3)}
                interval="preserveStartEnd"
                minTickGap={6}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                name="Revenue"
                dataKey="revenue"
                stroke="#4F46E5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
              <Area
                type="monotone"
                name="Expenses"
                dataKey="expenses"
                stroke="#F43F5E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(val: string) => val.slice(0, 3)}
                interval="preserveStartEnd"
                minTickGap={6}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar name="Revenue" dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              <Bar name="Expenses" dataKey="expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
