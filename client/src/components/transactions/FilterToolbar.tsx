import React, { useState } from 'react';
import { FilterState } from '../../hooks/useTransactions.js';
import { AlertChip } from '../common/AlertChip.js';
import { Button } from '../common/Button.js';
import { DateAmountFilterModal } from './DateAmountFilterModal.js';
import {
  Search,
  X,
  SlidersHorizontal,
  Users,
  Calendar,
  Filter,
} from 'lucide-react';

interface FilterToolbarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyDatePreset: (preset: FilterState['datePreset']) => void;
  resetFilters: () => void;
  rangeBounds: {
    minDate: string;
    maxDate: string;
    minAmount: number;
    maxAmount: number;
  };
  totalResults: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  setFilters,
  applyDatePreset,
  resetFilters,
  rangeBounds,
  totalResults,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Calculate active filter count
  let activeCount = 0;
  if (filters.search.trim()) activeCount++;
  if (filters.category !== 'All') activeCount++;
  if (filters.status !== 'All') activeCount++;
  if (filters.user_id !== 'All') activeCount++;
  if (filters.datePreset !== 'all') activeCount++;
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) activeCount++;

  return (
    <div className="space-y-4">
      {/* Primary Toolbar Row */}
      <div className="glass-card p-4 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slateNavy-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID, User, Category, Amount..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl border border-slateNavy-200 bg-slateNavy-50/70 focus:bg-white focus:border-loopr-500 focus:ring-2 focus:ring-loopr-500/20 transition-all placeholder:text-slateNavy-400"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slateNavy-400 hover:text-slateNavy-700 p-0.5 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Pill Groups */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slateNavy-100 border border-slateNavy-200 text-xs">
            {(['All', 'Revenue', 'Expense'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filters.category === cat
                    ? 'bg-white text-loopr-700 shadow-sm'
                    : 'text-slateNavy-600 hover:text-slateNavy-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slateNavy-100 border border-slateNavy-200 text-xs">
            {(['All', 'Paid', 'Pending'] as const).map((stat) => (
              <button
                key={stat}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: stat }))}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filters.status === stat
                    ? 'bg-white text-loopr-700 shadow-sm'
                    : 'text-slateNavy-600 hover:text-slateNavy-900'
                }`}
              >
                {stat}
              </button>
            ))}
          </div>

          {/* User Select Dropdown */}
          <div className="relative">
            <select
              value={filters.user_id}
              onChange={(e) => setFilters((prev) => ({ ...prev, user_id: e.target.value }))}
              className="text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border border-slateNavy-200 bg-slateNavy-50/70 text-slateNavy-700 hover:bg-white focus:bg-white focus:border-loopr-500 cursor-pointer transition-all appearance-none"
              aria-label="Filter by user"
            >
              <option value="All">All Users</option>
              <option value="user_001">User 001</option>
              <option value="user_002">User 002</option>
              <option value="user_003">User 003</option>
              <option value="user_004">User 004</option>
            </select>
            <Users className="w-3.5 h-3.5 text-slateNavy-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Advanced Date & Amount Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-loopr-600" />}
            className="border-slateNavy-200"
          >
            <span>Date &amp; Amount</span>
            {(filters.datePreset !== 'all' || filters.minAmount !== undefined) && (
              <span className="w-2 h-2 rounded-full bg-loopr-600 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Date Preset Pill Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slateNavy-400 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Period:
        </span>
        {[
          { label: 'All Records', preset: 'all' as const },
          { label: 'Full Year YTD', preset: 'ytd' as const },
          { label: 'Q1', preset: 'q1' as const },
          { label: 'Q2', preset: 'q2' as const },
          { label: 'Q3', preset: 'q3' as const },
          { label: 'Q4', preset: 'q4' as const },
        ].map((item) => (
          <button
            key={item.preset}
            type="button"
            onClick={() => applyDatePreset(item.preset)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              filters.datePreset === item.preset
                ? 'bg-loopr-600 text-white border-loopr-600 shadow-sm'
                : 'bg-white text-slateNavy-600 border-slateNavy-200 hover:border-slateNavy-300 hover:bg-slateNavy-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Active Filter Alert Chips Bar */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 animate-fade-in">
          <span className="text-[11px] font-bold text-slateNavy-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-loopr-600" /> Active Filters ({totalResults} matches):
          </span>

          {filters.search && (
            <AlertChip
              variant="info"
              label={`Search: "${filters.search}"`}
              size="sm"
              onDismiss={() => setFilters((prev) => ({ ...prev, search: '' }))}
            />
          )}

          {filters.category !== 'All' && (
            <AlertChip
              variant={filters.category}
              size="sm"
              onDismiss={() => setFilters((prev) => ({ ...prev, category: 'All' }))}
            />
          )}

          {filters.status !== 'All' && (
            <AlertChip
              variant={filters.status}
              size="sm"
              onDismiss={() => setFilters((prev) => ({ ...prev, status: 'All' }))}
            />
          )}

          {filters.user_id !== 'All' && (
            <AlertChip
              variant="Analyst"
              label={`User: ${filters.user_id}`}
              size="sm"
              onDismiss={() => setFilters((prev) => ({ ...prev, user_id: 'All' }))}
            />
          )}

          {filters.datePreset !== 'all' && (
            <AlertChip
              variant="info"
              label={`Period: ${filters.datePreset.toUpperCase()}`}
              size="sm"
              onDismiss={() => applyDatePreset('all')}
            />
          )}

          {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
            <AlertChip
              variant="info"
              label={`Amount: $${filters.minAmount || 0} – $${filters.maxAmount || '∞'}`}
              size="sm"
              onDismiss={() =>
                setFilters((prev) => ({
                  ...prev,
                  minAmount: undefined,
                  maxAmount: undefined,
                }))
              }
            />
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline ml-2 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Advanced Filter Modal */}
      <DateAmountFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        startDate={filters.startDate}
        endDate={filters.endDate}
        minAmount={filters.minAmount}
        maxAmount={filters.maxAmount}
        rangeBounds={rangeBounds}
        onApply={(updated) => {
          setFilters((prev) => ({
            ...prev,
            ...updated,
            datePreset: updated.startDate ? 'custom' : prev.datePreset,
          }));
        }}
      />
    </div>
  );
};
