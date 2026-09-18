import { Request, Response } from 'express';
import { stringify } from 'csv-stringify';
import { Transaction } from '../models/Transaction.js';
import { buildTransactionFilter } from './transactionController.js';
import type { CsvExportRequest, CsvColumnConfig } from '../types/index.js';

const formatValue = (
  key: string,
  value: any,
  dateFormat: string,
  amountFormat: string,
  statusFormat: string
): string => {
  if (value === null || value === undefined) return '';

  if (key === 'date') {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);

    switch (dateFormat) {
      case 'yyyy-mm-dd':
        return d.toISOString().slice(0, 10);
      case 'dd-mm-yyyy':
        return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
      case 'friendly':
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
      case 'iso':
      default:
        return d.toISOString();
    }
  }

  if (key === 'amount') {
    const num = Number(value);
    if (amountFormat === 'currency_usd') {
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return num.toFixed(2);
  }

  if (key === 'status') {
    if (statusFormat === 'uppercase') {
      return String(value).toUpperCase();
    }
    return String(value);
  }

  return String(value);
};

export const exportTransactionsCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      columns = [],
      dateFormat = 'yyyy-mm-dd',
      amountFormat = 'currency_usd',
      statusFormat = 'original',
      scope = 'filtered',
      selectedIds = [],
      filterParams = {},
    }: CsvExportRequest = req.body;

    // Filter active and ordered columns
    const activeColumns: CsvColumnConfig[] = columns
      .filter((c) => c.enabled)
      .sort((a, b) => a.order - b.order);

    if (activeColumns.length === 0) {
      res.status(400).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Export Failed',
          message: 'At least one column must be enabled for CSV export.',
        },
      });
      return;
    }

    // Determine query filter by scope
    let filter: any = {};
    if (scope === 'selected' && selectedIds && selectedIds.length > 0) {
      filter = { id: { $in: selectedIds } };
    } else if (scope === 'filtered') {
      filter = buildTransactionFilter(filterParams);
    } // 'all' uses empty filter

    const transactions = await Transaction.find(filter).sort({ date: -1, id: -1 }).lean();

    const headers = activeColumns.map((c) => c.header || c.key);
    const rows = transactions.map((tx: any) =>
      activeColumns.map((col) => {
        const rawVal = tx[col.key];
        return formatValue(col.key, rawVal, dateFormat, amountFormat, statusFormat);
      })
    );

    const filename = `financial_report_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const stringifier = stringify({ header: true, columns: headers, bom: true });
    stringifier.pipe(res);

    for (const row of rows) {
      stringifier.write(row);
    }
    stringifier.end();
  } catch (error: any) {
    console.error('CSV Export Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Export Error',
          message: error.message || 'Failed to stream CSV file.',
        },
      });
    }
  }
};

export const getExportPreview = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      columns = [],
      dateFormat = 'yyyy-mm-dd',
      amountFormat = 'currency_usd',
      statusFormat = 'original',
      scope = 'filtered',
      selectedIds = [],
      filterParams = {},
    }: CsvExportRequest = req.body;

    const activeColumns = columns
      .filter((c) => c.enabled)
      .sort((a, b) => a.order - b.order);

    let filter: any = {};
    if (scope === 'selected' && selectedIds && selectedIds.length > 0) {
      filter = { id: { $in: selectedIds } };
    } else if (scope === 'filtered') {
      filter = buildTransactionFilter(filterParams);
    }

    const [sampleDocs, totalCount] = await Promise.all([
      Transaction.find(filter).sort({ date: -1, id: -1 }).limit(5).lean(),
      Transaction.countDocuments(filter),
    ]);

    const headers = activeColumns.map((c) => c.header || c.key);
    const previewRows = sampleDocs.map((tx: any) => {
      const obj: Record<string, string> = {};
      activeColumns.forEach((col) => {
        const rawVal = tx[col.key];
        obj[col.header || col.key] = formatValue(col.key, rawVal, dateFormat, amountFormat, statusFormat);
      });
      return obj;
    });

    res.json({
      success: true,
      data: {
        headers,
        previewRows,
        totalMatchingRecords: totalCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Preview Failed',
        message: error.message,
      },
    });
  }
};
