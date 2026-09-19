import React from 'react';
import { StatusBreakdownData } from '../../types/index.js';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface SettlementStatusDonutChartProps {
  data: StatusBreakdownData[];
  successRate: number;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Paid: '#10B981',    // Emerald
  Pending: '#F59E0B', // Amber
};

export const SettlementStatusDonutChart: React.FC<SettlementStatusDonutChartProps> = ({
  data,
  successRate,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl h-96 flex items-center justify-center animate-shimmer" />
    );
  }

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.totalAmount,
    count: item.count,
    percentage: item.percentage,
  }));

  const total = data.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slateNavy-900 font-display">
              Settlement &amp; Clearance Rate
            </h2>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            Payment Health
          </span>
        </div>
        <p className="text-xs text-slateNavy-500 mt-0.5">
          Settled cashflow vs pending in-flight transactions
        </p>
      </div>

      {/* Donut Chart with Center Percentage */}
      <div className="relative w-full h-52 my-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-status-${entry.name}`}
                  fill={STATUS_COLORS[entry.name] || '#94A3B8'}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [
                `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                'Volume',
              ]}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Success Rate Callout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-slateNavy-400 uppercase tracking-wider">
            Settled Rate
          </span>
          <span className="text-xl font-extrabold text-emerald-600 font-display">
            {successRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Status Breakdown Legend Cards */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slateNavy-100">
        {data.map((item) => {
          const isPaid = item.status === 'Paid';
          const textColor = isPaid ? 'text-emerald-600' : 'text-amber-600';
          const bgBadge = isPaid
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-amber-50 text-amber-700 border border-amber-100';

          return (
            <div
              key={item.status}
              className="p-2.5 rounded-xl bg-slateNavy-50/70 border border-slateNavy-100 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slateNavy-800 flex items-center gap-1">
                  {isPaid ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  {item.status}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${bgBadge}`}>
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
              <p className={`text-sm font-bold mt-1 ${textColor}`}>
                ${item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-slateNavy-500 mt-0.5">
                {item.count} records ({((item.totalAmount / total) * 100).toFixed(0)}% volume)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
