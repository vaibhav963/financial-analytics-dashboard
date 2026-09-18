import { useState, useEffect, useCallback, useRef } from 'react';
import { ITransaction, PaginationMeta, TransactionFilterParams } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export interface FilterState {
  search: string;
  category: string; // 'All' | 'Revenue' | 'Expense'
  status: string; // 'All' | 'Paid' | 'Pending'
  user_id: string; // 'All' | 'user_001' etc.
  datePreset: 'all' | 'ytd' | 'q1' | 'q2' | 'q3' | 'q4' | 'custom';
  startDate: string;
  endDate: string;
  minAmount?: number;
  maxAmount?: number;
}

const initialFilterState: FilterState = {
  search: '',
  category: 'All',
  status: 'All',
  user_id: 'All',
  datePreset: 'all',
  startDate: '',
  endDate: '',
  minAmount: undefined,
  maxAmount: undefined,
};

export const useTransactions = () => {
  const { isAuthenticated } = useAuth();
  const { showAlert } = useToast();

  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [rangeBounds, setRangeBounds] = useState<{
    minDate: string;
    maxDate: string;
    minAmount: number;
    maxAmount: number;
  }>({
    minDate: '',
    maxDate: '',
    minAmount: 0,
    maxAmount: 5000,
  });

  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof ITransaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1); // reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Derive preset dates dynamically from range bounds or current year
  const applyDatePreset = (preset: FilterState['datePreset']) => {
    if (preset === 'all') {
      setFilters((prev) => ({ ...prev, datePreset: 'all', startDate: '', endDate: '' }));
      setPage(1);
      return;
    }

    const baseYear = rangeBounds.minDate ? new Date(rangeBounds.minDate).getFullYear() : 2024;
    const presetsMap: Record<string, [string, string]> = {
      ytd: [`${baseYear}-01-01`, `${baseYear}-12-31`],
      q1: [`${baseYear}-01-01`, `${baseYear}-03-31`],
      q2: [`${baseYear}-04-01`, `${baseYear}-06-30`],
      q3: [`${baseYear}-07-01`, `${baseYear}-09-30`],
      q4: [`${baseYear}-10-01`, `${baseYear}-12-31`],
    };
    const [start, end] = presetsMap[preset] || ['', ''];

    setFilters((prev) => ({
      ...prev,
      datePreset: preset,
      startDate: start,
      endDate: end,
    }));
    setPage(1);
  };

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);

      const params: TransactionFilterParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        search: debouncedSearch.trim() || undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        user_id: filters.user_id !== 'All' ? filters.user_id : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
      };

      const res = await api.get('/transactions', {
        params,
        signal: abortControllerRef.current.signal,
      });

      if (res.data?.success) {
        setTransactions(res.data.data);
        setPagination(res.data.pagination);
        if (res.data.rangeBounds) {
          setRangeBounds(res.data.rangeBounds);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
      const msg = err.response?.data?.alert?.message || err.message || 'Failed to fetch transactions.';
      showAlert({
        type: 'error',
        title: 'Query Error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    isAuthenticated,
    page,
    limit,
    sortBy,
    sortOrder,
    debouncedSearch,
    filters.category,
    filters.status,
    filters.user_id,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
    showAlert,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle Sort Change (Always triggers server-side query)
  const handleSort = (columnKey: keyof ITransaction) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Selection handlers
  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = transactions.map((t) => t.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const resetFilters = () => {
    setFilters(initialFilterState);
    setPage(1);
  };

  return {
    transactions,
    pagination,
    rangeBounds,
    filters,
    setFilters,
    sortBy,
    sortOrder,
    handleSort,
    page,
    setPage,
    limit,
    setLimit,
    selectedIds,
    toggleSelectRow,
    toggleSelectAllOnPage,
    clearSelection,
    applyDatePreset,
    resetFilters,
    isLoading,
    isRefreshing,
    refreshTransactions: () => {
      setIsRefreshing(true);
      fetchTransactions();
    },
  };
};
