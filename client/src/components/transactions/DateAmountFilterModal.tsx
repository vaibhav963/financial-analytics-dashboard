import React, { useState } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';
import { Button } from '../common/Button.js';
import { X, SlidersHorizontal, Calendar, DollarSign, RotateCcw } from 'lucide-react';

interface DateAmountFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  minAmount?: number;
  maxAmount?: number;
  rangeBounds: {
    minDate: string;
    maxDate: string;
    minAmount: number;
    maxAmount: number;
  };
  onApply: (filters: {
    startDate: string;
    endDate: string;
    minAmount?: number;
    maxAmount?: number;
  }) => void;
}

export const DateAmountFilterModal: React.FC<DateAmountFilterModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  minAmount,
  maxAmount,
  onApply,
}) => {
  const [localStart, setLocalStart] = useState<string>(startDate);
  const [localEnd, setLocalEnd] = useState<string>(endDate);
  const [localMin, setLocalMin] = useState<string>(minAmount !== undefined ? String(minAmount) : '');
  const [localMax, setLocalMax] = useState<string>(maxAmount !== undefined ? String(maxAmount) : '');

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      startDate: localStart,
      endDate: localEnd,
      minAmount: localMin ? Number(localMin) : undefined,
      maxAmount: localMax ? Number(localMax) : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStart('');
    setLocalEnd('');
    setLocalMin('');
    setLocalMax('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slateNavy-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl bg-white border border-slateNavy-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slateNavy-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-loopr-50 text-loopr-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 id="filter-modal-title" className="text-base font-bold text-slateNavy-900 font-display">
                Advanced Filter Criteria
              </h3>
              <p className="text-xs text-slateNavy-500">
                Custom date boundaries and amount threshold filtering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slateNavy-100 text-slateNavy-400 hover:text-slateNavy-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-6">
          {/* Custom Date Range */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slateNavy-800 uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-loopr-600" />
              <span>Custom Date Range</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slateNavy-500 block mb-1">
                  Start Date
                </span>
                <input
                  type="date"
                  value={localStart ? localStart.slice(0, 10) : ''}
                  onChange={(e) => setLocalStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slateNavy-200 bg-slateNavy-50/50 focus:bg-white focus:border-loopr-500 focus:ring-1 focus:ring-loopr-500 transition-all"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slateNavy-500 block mb-1">
                  End Date
                </span>
                <input
                  type="date"
                  value={localEnd ? localEnd.slice(0, 10) : ''}
                  onChange={(e) => setLocalEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slateNavy-200 bg-slateNavy-50/50 focus:bg-white focus:border-loopr-500 focus:ring-1 focus:ring-loopr-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slateNavy-800 uppercase tracking-wider mb-2">
              <DollarSign className="w-3.5 h-3.5 text-loopr-600" />
              <span>Transaction Amount Range ($)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slateNavy-500 block mb-1">
                  Min Amount ($)
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slateNavy-200 bg-slateNavy-50/50 focus:bg-white focus:border-loopr-500 focus:ring-1 focus:ring-loopr-500 transition-all"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slateNavy-500 block mb-1">
                  Max Amount ($)
                </span>
                <input
                  type="number"
                  placeholder="5000.00"
                  min="0"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slateNavy-200 bg-slateNavy-50/50 focus:bg-white focus:border-loopr-500 focus:ring-1 focus:ring-loopr-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slateNavy-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear Modal
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
