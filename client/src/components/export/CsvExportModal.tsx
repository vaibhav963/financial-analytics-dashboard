import React, { useState, useEffect } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';
import {
  CsvColumnConfig,
  DateFormatOption,
  AmountFormatOption,
  StatusFormatOption,
  CsvExportScope,
  ITransaction,
  TransactionFilterParams,
} from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Button } from '../common/Button.js';
import {
  X,
  Download,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  Settings2,
  Table as TableIcon,
  Code2,
} from 'lucide-react';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredTransactions: ITransaction[];
  selectedIds: number[];
  filterParams: TransactionFilterParams;
  totalFilteredCount: number;
}

const defaultColumns: CsvColumnConfig[] = [
  { key: 'id', header: 'Transaction ID', enabled: true, order: 0 },
  { key: 'date', header: 'Date', enabled: true, order: 1 },
  { key: 'amount', header: 'Amount ($)', enabled: true, order: 2 },
  { key: 'category', header: 'Category', enabled: true, order: 3 },
  { key: 'status', header: 'Status', enabled: true, order: 4 },
  { key: 'user_id', header: 'Analyst ID', enabled: true, order: 5 },
  { key: 'user_profile', header: 'Profile URL', enabled: false, order: 6 },
];

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const friendlyDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  filteredTransactions,
  selectedIds,
  filterParams,
  totalFilteredCount,
}) => {
  const { showAlert } = useToast();

  const [columns, setColumns] = useState<CsvColumnConfig[]>(defaultColumns);
  const [dateFormat, setDateFormat] = useState<DateFormatOption>('friendly');
  const [amountFormat, setAmountFormat] = useState<AmountFormatOption>('currency_usd');
  const [statusFormat, setStatusFormat] = useState<StatusFormatOption>('original');
  const [scope, setScope] = useState<CsvExportScope>(
    selectedIds.length > 0 ? 'selected' : 'filtered'
  );
  const [activeTab, setActiveTab] = useState<'config' | 'tablePreview' | 'rawPreview'>('config');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (selectedIds.length > 0) {
      setScope('selected');
    }
  }, [selectedIds]);

  // Keyboard shortcut: Esc to dismiss modal
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, enabled: !col.enabled } : col))
    );
  };

  const updateHeader = (key: string, newHeader: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, header: newHeader } : col))
    );
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;

    // reassign order property
    const reordered = newCols.map((c, i) => ({ ...c, order: i }));
    setColumns(reordered);
  };

  const activeColumns = columns.filter((c) => c.enabled).sort((a, b) => a.order - b.order);

  const formatFieldValue = (key: string, val: any) => {
    if (val === null || val === undefined) return '';

    if (key === 'date') {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      switch (dateFormat) {
        case 'yyyy-mm-dd':
          return d.toISOString().slice(0, 10);
        case 'dd-mm-yyyy':
          return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(
            2,
            '0'
          )}/${d.getUTCFullYear()}`;
        case 'friendly':
          return friendlyDateFormatter.format(d);
        case 'iso':
        default:
          return d.toISOString();
      }
    }

    if (key === 'amount') {
      const num = Number(val);
      if (amountFormat === 'currency_usd') {
        return usdFormatter.format(num);
      }
      return num.toFixed(2);
    }

    if (key === 'status') {
      if (statusFormat === 'uppercase') return String(val).toUpperCase();
      return String(val);
    }

    return String(val);
  };

  // Generate Preview Sample Data (top 5 sample records)
  const previewSampleRecords = filteredTransactions.slice(0, 5);

  const rawCsvPreviewString = (() => {
    if (activeColumns.length === 0) return 'No columns enabled.';
    const headerLine = activeColumns.map((c) => `"${c.header || c.key}"`).join(',');
    const sampleLines = previewSampleRecords.map((item) =>
      activeColumns
        .map((c) => {
          const formatted = formatFieldValue(c.key, (item as any)[c.key]);
          return `"${String(formatted).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    return [headerLine, ...sampleLines, '... (remaining records)'].join('\n');
  })();

  const handleDownloadCsv = async () => {
    if (activeColumns.length === 0) {
      showAlert({
        type: 'error',
        title: 'Export Configuration Error',
        message: 'Please enable at least one column before exporting.',
      });
      return;
    }

    try {
      setIsExporting(true);

      const payload = {
        columns,
        dateFormat,
        amountFormat,
        statusFormat,
        scope,
        selectedIds,
        filterParams,
      };

      const res = await api.post('/export/csv', payload, {
        responseType: 'blob',
      });

      // Trigger automatic browser download
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `financial_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showAlert({
        type: 'success',
        title: 'CSV Report Downloaded',
        message: 'Your configured financial report has been successfully generated and saved.',
      });

      onClose();
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Export Failed',
        message: err.message || 'Failed to download CSV.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slateNavy-950/70 backdrop-blur-md animate-fade-in"
    >
      <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl bg-white border border-slateNavy-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slateNavy-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-loopr-50 text-loopr-600 flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="csv-export-title" className="text-lg font-bold text-slateNavy-900 font-display">
                  Configurable CSV Report Studio
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-loopr-50 text-loopr-700 border border-loopr-100">
                  Custom Exporter
                </span>
              </div>
              <p className="text-xs text-slateNavy-500 mt-0.5">
                Customize column headers, order, data transformers, and inspect live preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slateNavy-100 text-slateNavy-400 hover:text-slateNavy-700 transition-colors"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio View Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slateNavy-100 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'config'
                ? 'bg-loopr-600 text-white shadow-sm'
                : 'text-slateNavy-600 hover:bg-slateNavy-100'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Column Studio &amp; Formats</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tablePreview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'tablePreview'
                ? 'bg-loopr-600 text-white shadow-sm'
                : 'text-slateNavy-600 hover:bg-slateNavy-100'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Live Table Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rawPreview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'rawPreview'
                ? 'bg-loopr-600 text-white shadow-sm'
                : 'text-slateNavy-600 hover:bg-slateNavy-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw CSV Stream</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-6 text-xs">
          {activeTab === 'config' && (
            <>
              {/* 1. Export Scope Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slateNavy-400 tracking-wider block mb-2">
                  1. Export Data Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setScope('filtered')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      scope === 'filtered'
                        ? 'border-loopr-500 bg-loopr-50/50 shadow-sm'
                        : 'border-slateNavy-200 hover:border-slateNavy-300'
                    }`}
                  >
                    <span className="font-bold text-slateNavy-900 block">Filtered Matches</span>
                    <span className="text-[11px] text-slateNavy-500">
                      {totalFilteredCount} matching active filters
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('selected')}
                    disabled={selectedIds.length === 0}
                    className={`p-3 rounded-2xl border text-left transition-all disabled:opacity-40 ${
                      scope === 'selected'
                        ? 'border-loopr-500 bg-loopr-50/50 shadow-sm'
                        : 'border-slateNavy-200 hover:border-slateNavy-300'
                    }`}
                  >
                    <span className="font-bold text-slateNavy-900 block">Selected Rows Only</span>
                    <span className="text-[11px] text-slateNavy-500">
                      {selectedIds.length} rows checked
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('all')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      scope === 'all'
                        ? 'border-loopr-500 bg-loopr-50/50 shadow-sm'
                        : 'border-slateNavy-200 hover:border-slateNavy-300'
                    }`}
                  >
                    <span className="font-bold text-slateNavy-900 block">Full Database</span>
                    <span className="text-[11px] text-slateNavy-500">All 300 records</span>
                  </button>
                </div>
              </div>

              {/* 2. Format Transformers */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slateNavy-400 tracking-wider block mb-2">
                  2. Field Data Transformers
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Date Format */}
                  <div className="p-3 rounded-xl bg-slateNavy-50 border border-slateNavy-200">
                    <span className="text-[11px] font-bold text-slateNavy-700 block mb-1.5">
                      Date Formatting
                    </span>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value as DateFormatOption)}
                      className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg border border-slateNavy-300 bg-white"
                    >
                      <option value="friendly">Jan 15, 2024 (Friendly)</option>
                      <option value="yyyy-mm-dd">2024-01-15 (Standard)</option>
                      <option value="dd-mm-yyyy">15/01/2024 (European)</option>
                      <option value="iso">ISO 8601 UTC</option>
                    </select>
                  </div>

                  {/* Currency Format */}
                  <div className="p-3 rounded-xl bg-slateNavy-50 border border-slateNavy-200">
                    <span className="text-[11px] font-bold text-slateNavy-700 block mb-1.5">
                      Amount Formatting
                    </span>
                    <select
                      value={amountFormat}
                      onChange={(e) => setAmountFormat(e.target.value as AmountFormatOption)}
                      className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg border border-slateNavy-300 bg-white"
                    >
                      <option value="currency_usd">$1,500.00 (Formatted Currency)</option>
                      <option value="raw">1500.00 (Raw Numeric Decimal)</option>
                    </select>
                  </div>

                  {/* Status Format */}
                  <div className="p-3 rounded-xl bg-slateNavy-50 border border-slateNavy-200">
                    <span className="text-[11px] font-bold text-slateNavy-700 block mb-1.5">
                      Status Lettercase
                    </span>
                    <select
                      value={statusFormat}
                      onChange={(e) => setStatusFormat(e.target.value as StatusFormatOption)}
                      className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg border border-slateNavy-300 bg-white"
                    >
                      <option value="original">Titlecase (Paid / Pending)</option>
                      <option value="uppercase">Uppercase (PAID / PENDING)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Reorderable Columns & Header Aliases */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase text-slateNavy-400 tracking-wider">
                    3. Column Selection &amp; Header Renaming
                  </label>
                  <span className="text-[11px] font-bold text-loopr-600">
                    {activeColumns.length} of {columns.length} columns active
                  </span>
                </div>

                <div className="space-y-2 border border-slateNavy-200 rounded-2xl p-2 bg-slateNavy-50/50">
                  {columns.map((col, index) => (
                    <div
                      key={col.key}
                      className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 rounded-xl border transition-all ${
                        col.enabled
                          ? 'bg-white border-slateNavy-200 shadow-sm'
                          : 'bg-slateNavy-100/60 border-dashed border-slateNavy-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveColumn(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-slateNavy-100 disabled:opacity-30"
                            title="Move column up"
                          >
                            <ArrowUp className="w-3 h-3 text-slateNavy-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveColumn(index, 'down')}
                            disabled={index === columns.length - 1}
                            className="p-1 rounded hover:bg-slateNavy-100 disabled:opacity-30"
                            title="Move column down"
                          >
                            <ArrowDown className="w-3 h-3 text-slateNavy-600" />
                          </button>
                        </div>

                        {/* Enable Checkbox */}
                        <input
                          type="checkbox"
                          checked={col.enabled}
                          onChange={() => toggleColumn(col.key)}
                          className="w-4 h-4 rounded text-loopr-600 focus:ring-loopr-500 border-slateNavy-300 cursor-pointer"
                          id={`col-${col.key}`}
                        />

                        {/* Field Key Label */}
                        <label
                          htmlFor={`col-${col.key}`}
                          className="font-mono font-bold text-slateNavy-700 w-28 shrink-0 cursor-pointer"
                        >
                          {col.key}
                        </label>
                      </div>

                      {/* Custom Alias Input */}
                      <div className="flex-1 flex items-center gap-2 w-full sm:w-auto pl-8 sm:pl-0">
                        <span className="text-slateNavy-400 text-[11px] shrink-0">Header Alias:</span>
                        <input
                          type="text"
                          value={col.header}
                          onChange={(e) => updateHeader(col.key, e.target.value)}
                          disabled={!col.enabled}
                          className="flex-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slateNavy-200 bg-slateNavy-50/50 focus:bg-white focus:border-loopr-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'tablePreview' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slateNavy-800">
                  Formatted Sample Preview (Top 5 Records)
                </span>
                <span className="text-[11px] text-slateNavy-500">
                  Reflects applied order, formatters, and header aliases
                </span>
              </div>

              <div className="overflow-x-auto border border-slateNavy-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slateNavy-100/70 border-b border-slateNavy-200 text-slateNavy-800 font-bold">
                      {activeColumns.map((col) => (
                        <th key={col.key} className="py-2.5 px-3 whitespace-nowrap">
                          {col.header || col.key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slateNavy-100">
                    {previewSampleRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slateNavy-50">
                        {activeColumns.map((col) => (
                          <td key={col.key} className="py-2 px-3 whitespace-nowrap font-medium text-slateNavy-700">
                            {formatFieldValue(col.key, (item as any)[col.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rawPreview' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slateNavy-800">Raw RFC 4180 CSV Stream</span>
                <span className="text-[11px] text-slateNavy-500">Headers &amp; Quoted Fields</span>
              </div>
              <pre className="p-4 rounded-2xl bg-slateNavy-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slateNavy-800 leading-relaxed shadow-inner">
                {rawCsvPreviewString}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slateNavy-100 shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="glow"
            size="md"
            isLoading={isExporting}
            onClick={handleDownloadCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            <span>Download CSV File</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
