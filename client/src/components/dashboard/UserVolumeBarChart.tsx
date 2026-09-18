import React from 'react';
import { UserVolumeData } from '../../types/index.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { UserAvatar } from '../common/UserAvatar.js';

interface UserVolumeBarChartProps {
  data: UserVolumeData[];
  isLoading: boolean;
}

export const UserVolumeBarChart: React.FC<UserVolumeBarChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl h-96 flex items-center justify-center animate-shimmer" />
    );
  }

  const chartData = data.map((u) => ({
    user: u.user_id.replace('user_', 'Analyst #'),
    user_id: u.user_id,
    Revenue: u.revenue,
    Expenses: u.expenses,
    count: u.totalTransactions,
  }));

  const formatYAxis = (val: number) => {
    return `$${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slateNavy-900 font-display">
            Analyst / Entity Distribution
          </h2>
          <p className="text-xs text-slateNavy-500 mt-0.5">
            Revenue generated vs Expense disbursements by user
          </p>
        </div>
      </div>

      <div className="w-full h-64 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="user"
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
            <Tooltip
              formatter={(val: number) => [
                `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              ]}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }}
            />
            <Bar name="Revenue" dataKey="Revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            <Bar name="Expenses" dataKey="Expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Mini Badges */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slateNavy-100">
        {data.map((u) => (
          <div
            key={u.user_id}
            className="flex flex-col items-center p-2 rounded-xl bg-slateNavy-50 border border-slateNavy-100 text-center"
          >
            <UserAvatar userId={u.user_id} size="sm" />
            <span className="text-[11px] font-bold text-slateNavy-800 mt-1 truncate w-full">
              {u.user_id}
            </span>
            <span className="text-[10px] text-slateNavy-500 font-medium">
              {u.totalTransactions} txns
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
