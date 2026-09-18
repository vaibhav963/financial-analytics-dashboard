import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CsvExportModal } from '../components/export/CsvExportModal.js';
import { ToastProvider } from '../context/ToastContext.js';
import { ITransaction } from '../types/index.js';

const mockTransactions: ITransaction[] = [
  {
    id: 1,
    date: '2024-01-15T08:34:12Z',
    amount: 1500,
    category: 'Revenue',
    status: 'Paid',
    user_id: 'user_001',
    user_profile: 'https://thispersondoesnotexist.com/',
  },
  {
    id: 2,
    date: '2024-02-21T11:14:38Z',
    amount: 1200.5,
    category: 'Expense',
    status: 'Paid',
    user_id: 'user_002',
    user_profile: 'https://thispersondoesnotexist.com/',
  },
];

describe('CsvExportModal Component', () => {
  it('renders modal with studio title when open', () => {
    render(
      <ToastProvider>
        <CsvExportModal
          isOpen={true}
          onClose={vi.fn()}
          filteredTransactions={mockTransactions}
          selectedIds={[]}
          filterParams={{}}
          totalFilteredCount={2}
        />
      </ToastProvider>
    );

    expect(screen.getByText(/Configurable CSV Report Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Data Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/Field Data Transformers/i)).toBeInTheDocument();
  });

  it('switches to live table preview tab and displays columns', () => {
    render(
      <ToastProvider>
        <CsvExportModal
          isOpen={true}
          onClose={vi.fn()}
          filteredTransactions={mockTransactions}
          selectedIds={[]}
          filterParams={{}}
          totalFilteredCount={2}
        />
      </ToastProvider>
    );

    const previewTabBtn = screen.getByRole('button', { name: /Live Table Preview/i });
    fireEvent.click(previewTabBtn);

    expect(screen.getByText(/Formatted Sample Preview/i)).toBeInTheDocument();
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
  });

  it('switches to raw CSV stream tab and shows CSV format', () => {
    render(
      <ToastProvider>
        <CsvExportModal
          isOpen={true}
          onClose={vi.fn()}
          filteredTransactions={mockTransactions}
          selectedIds={[]}
          filterParams={{}}
          totalFilteredCount={2}
        />
      </ToastProvider>
    );

    const rawTabBtn = screen.getByRole('button', { name: /Raw CSV Stream/i });
    fireEvent.click(rawTabBtn);

    expect(screen.getByText(/Raw RFC 4180 CSV Stream/i)).toBeInTheDocument();
  });
});
