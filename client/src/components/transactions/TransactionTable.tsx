import React, { useState } from 'react';
import { ITransaction, PaginationMeta } from '../../types/index.js';
import { formatCurrency } from '../../utils/formatters.js';
import { AlertChip } from '../common/AlertChip.js';
import { UserAvatar } from '../common/UserAvatar.js';
import { Button } from '../common/Button.js';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Layers,
  Calendar,
  DollarSign,
  User,
} from 'lucide-react';

interface TransactionTableProps {
  transactions: ITransaction[];
  pagination: PaginationMeta;
  sortBy: keyof ITransaction;
  sortOrder: 'asc' | 'desc';
  onSort: (column: keyof ITransaction) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  selectedIds: number[];
  onToggleSelectRow: (id: number) => void;
  onToggleSelectAllOnPage: () => void;
  isLoading: boolean;
  onResetFilters: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  pagination,
  sortBy,
  sortOrder,
  onSort,
  page,
  onPageChange,
  limit,
  onLimitChange,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAllOnPage,
  isLoading,
  onResetFilters,
}) => {
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  const allOnPageSelected =
    transactions.length > 0 && transactions.every((t) => selectedIds.includes(t.id));

  const someOnPageSelected =
    transactions.some((t) => selectedIds.includes(t.id)) && !allOnPageSelected;

  const renderSortIndicator = (columnKey: keyof ITransaction) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slateNavy-300 group-hover:text-slateNavy-500 ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-loopr-600 ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-loopr-600 ml-1" />
    );
  };

  const getAriaSort = (columnKey: keyof ITransaction) => {
    if (sortBy !== columnKey) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(jumpPageInput);
    if (!isNaN(target) && target >= 1 && target <= pagination.totalPages) {
      onPageChange(target);
      setJumpPageInput('');
    }
  };

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
      {/* Table Top Summary Bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slateNavy-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slateNavy-50/40">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <h2 className="text-base font-bold text-slateNavy-900 font-display">
            Transaction Ledger
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-loopr-50 text-loopr-700 border border-loopr-100">
            {pagination.total} Records
          </span>
          {selectedIds.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slateNavy-900 text-white">
              {selectedIds.length} Selected
            </span>
          )}
        </div>

        {/* Rows Per Page Selector */}
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 text-xs text-slateNavy-600">
          <span className="font-semibold">Show rows:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="text-xs font-bold py-1 px-2.5 rounded-lg border border-slateNavy-200 bg-white text-slateNavy-800 focus:outline-none focus:border-loopr-500"
            aria-label="Rows per page"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[680px] text-left border-collapse" aria-label="Financial Transactions">
          <thead>
            <tr className="border-b border-slateNavy-200/80 bg-slateNavy-50 text-[11px] font-bold uppercase tracking-wider text-slateNavy-500">
              {/* Select All Checkbox */}
              <th scope="col" className="p-4 w-12 text-center">
                <button
                  type="button"
                  onClick={onToggleSelectAllOnPage}
                  className="text-slateNavy-400 hover:text-loopr-600 focus:outline-none"
                  title={allOnPageSelected ? 'Deselect all on page' : 'Select all on page'}
                  aria-label="Select all rows on page"
                >
                  {allOnPageSelected ? (
                    <CheckSquare className="w-4 h-4 text-loopr-600" />
                  ) : someOnPageSelected ? (
                    <div className="w-4 h-4 rounded border-2 border-loopr-600 bg-loopr-50 flex items-center justify-center">
                      <div className="w-2 h-0.5 bg-loopr-600" />
                    </div>
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>

              {/* ID */}
              <th
                scope="col"
                aria-sort={getAriaSort('id')}
                onClick={() => onSort('id')}
                className="py-3.5 px-4 cursor-pointer hover:text-slateNavy-900 select-none group whitespace-nowrap"
              >
                <div className="flex items-center">
                  <span>Tx ID</span>
                  {renderSortIndicator('id')}
                </div>
              </th>

              {/* Date */}
              <th
                scope="col"
                aria-sort={getAriaSort('date')}
                onClick={() => onSort('date')}
                className="py-3.5 px-4 cursor-pointer hover:text-slateNavy-900 select-none group whitespace-nowrap"
              >
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-slateNavy-400" />
                  <span>Timestamp</span>
                  {renderSortIndicator('date')}
                </div>
              </th>

              {/* Amount */}
              <th
                scope="col"
                aria-sort={getAriaSort('amount')}
                onClick={() => onSort('amount')}
                className="py-3.5 px-4 cursor-pointer hover:text-slateNavy-900 select-none group whitespace-nowrap"
              >
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1 text-slateNavy-400" />
                  <span>Amount (USD)</span>
                  {renderSortIndicator('amount')}
                </div>
              </th>

              {/* Category */}
              <th
                scope="col"
                aria-sort={getAriaSort('category')}
                onClick={() => onSort('category')}
                className="py-3.5 px-4 cursor-pointer hover:text-slateNavy-900 select-none group whitespace-nowrap"
              >
                <div className="flex items-center">
                  <span>Category</span>
                  {renderSortIndicator('category')}
                </div>
              </th>

              {/* Status */}
              <th
                scope="col"
                aria-sort={getAriaSort('status')}
                onClick={() => onSort('status')}
                className="py-3.5 px-4 cursor-pointer hover:text-slateNavy-900 select-none group whitespace-nowrap"
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>

              {/* User ID / Avatar */}
              <th
                scope="col"
                aria-sort={getAriaSort('user_id')}
                onClick={() => onSort('user_id')}
                className="py-3.5 px-4 cursor-pointer hover:text-slateNavy-900 select-none group whitespace-nowrap"
              >
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1 text-slateNavy-400" />
                  <span>Analyst / User</span>
                  {renderSortIndicator('user_id')}
                </div>
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-slateNavy-100 text-xs">
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className="animate-shimmer">
              <td colSpan={7} className="py-4 px-6 h-12 bg-slateNavy-50/50" />
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 px-4 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slateNavy-100 flex items-center justify-center text-slateNavy-400 mb-3">
                      <Layers className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slateNavy-800">No Transactions Found</p>
                    <p className="text-xs text-slateNavy-500 mt-1">
                      No matching records found for the applied filter criteria.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onResetFilters}
                      className="mt-4"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isSelected = selectedIds.includes(tx.id);
                const { date, time } = formatDateTime(tx.date);
                const isRevenue = tx.category === 'Revenue';

                return (
                  <tr
                    key={tx.id}
                    className={`table-row-hover ${
                      isSelected ? 'bg-loopr-50/60 font-medium' : ''
                    }`}
                  >
                    {/* Row Select Checkbox */}
                    <td
                      className="p-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectRow(tx.id);
                      }}
                    >
                      <button
                        type="button"
                        className="text-slateNavy-400 hover:text-loopr-600 focus:outline-none"
                        aria-label={`Select transaction ${tx.id}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-loopr-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Transaction ID */}
                    <td className="py-3 px-4 font-bold text-slateNavy-900 font-mono whitespace-nowrap">
                      #{tx.id}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slateNavy-800">{date}</span>
                        <span className="text-[11px] text-slateNavy-400 font-mono">{time}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-bold font-mono text-sm ${
                          isRevenue ? 'text-emerald-600' : 'text-slateNavy-900'
                        }`}
                      >
                        {isRevenue ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <AlertChip variant={tx.category} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <AlertChip variant={tx.status} size="sm" />
                    </td>

                    {/* User Profile */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          userId={tx.user_id}
                          userProfile={tx.user_profile}
                          size="sm"
                        />
                        <span className="font-semibold text-slateNavy-800">{tx.user_id}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slateNavy-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-slateNavy-50/30">
        {/* Record Range Text */}
        <p className="text-xs font-semibold text-slateNavy-500 text-center sm:text-left">
          Showing <span className="text-slateNavy-900">{pagination.total > 0 ? startRecord : 0}</span> to{' '}
          <span className="text-slateNavy-900">{endRecord}</span> of{' '}
          <span className="text-slateNavy-900">{pagination.total}</span> entries
        </p>

        {/* Page Nav Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => onPageChange(page - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Prev
            </Button>

            <span className="px-3 py-1 text-xs font-bold text-slateNavy-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => onPageChange(page + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>

          {/* Jump to page form */}
          {pagination.totalPages > 1 && (
            <form onSubmit={handleJumpPage} className="hidden md:flex items-center gap-1.5 text-xs">
              <span className="text-slateNavy-400">Go:</span>
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={jumpPageInput}
                placeholder={String(page)}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-12 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slateNavy-200 focus:outline-none focus:border-loopr-500"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
