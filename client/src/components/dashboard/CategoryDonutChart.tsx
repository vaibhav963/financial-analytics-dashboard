import React from 'react';
import { CategoryBreakdownData } from '../../types/index.js';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface CategoryDonutChartProps {
  data: CategoryBreakdownData[];
  isLoading: boolean;
}

const COLORS = {
  Revenue: '#4F46E5', // Tech Indigo
  Expense: '#F43F5E', // Slate Rose
};

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl h-96 flex items-center justify-center animate-shimmer" />
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.totalAmount,
    count: item.count,
    percentage: item.percentage,
  }));

  const total = data.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slateNavy-900 font-display">
            Category Breakdown
          </h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slateNavy-100 text-slateNavy-700">
            Cashflow Share
          </span>
        </div>
        <p className="text-xs text-slateNavy-500 mt-0.5">
          Revenue inflow vs Operational expense split
        </p>
      </div>

      {/* Donut Chart with Center Aggregate */}
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
                  key={`cell-${entry.name}`}
                  fill={COLORS[entry.name as keyof typeof COLORS] || '#94A3B8'}
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

        {/* Center Total Callout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-bold text-slateNavy-400 uppercase tracking-wider">
            Total Flow
          </span>
          <span className="text-base font-extrabold text-slateNavy-900 font-display">
            ${(total / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Breakdown Legend Cards */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slateNavy-100">
        {data.map((cat) => {
          const isRevenue = cat.category === 'Revenue';
          const colorClass = isRevenue ? 'text-loopr-600' : 'text-rose-600';
          const bgBadge = isRevenue ? 'bg-loopr-50 text-loopr-700' : 'bg-rose-50 text-rose-700';

          return (
            <div
              key={cat.category}
              className="p-2.5 rounded-xl bg-slateNavy-50/70 border border-slateNavy-100 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slateNavy-800">{cat.category}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${bgBadge}`}>
                  {cat.percentage.toFixed(0)}%
                </span>
              </div>
              <p className={`text-sm font-bold mt-1 ${colorClass}`}>
                ${cat.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-slateNavy-500 mt-0.5">{cat.count} txns</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
