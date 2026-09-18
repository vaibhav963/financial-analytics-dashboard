export type TransactionCategory = 'Revenue' | 'Expense';
export type TransactionStatus = 'Paid' | 'Pending';

export interface ITransaction {
  id: number;
  date: string; // ISO String
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  user_id: string;
  user_profile: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'analyst' | 'admin';

export interface UserNotifications {
  emailDigest: boolean;
  highValueAlerts: boolean;
  securityAlerts: boolean;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  title?: string;
  phone?: string;
  timezone?: string;
  currency?: string;
  bio?: string;
  notifications?: UserNotifications;
  twoFactorEnabled?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}

export interface TransactionFilterParams {
  page?: number;
  limit?: number;
  sortBy?: keyof ITransaction;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  category?: TransactionCategory | 'All' | string | string[];
  status?: TransactionStatus | 'All' | string | string[];
  user_id?: string | string[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTransactionsResponse {
  data: ITransaction[];
  pagination: PaginationMeta;
  appliedFilters: {
    search?: string;
    category?: string[];
    status?: string[];
    user_id?: string[];
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  };
  rangeBounds: {
    minDate: string;
    maxDate: string;
    minAmount: number;
    maxAmount: number;
  };
}

export interface MonthlyTrendData {
  month: string; // e.g. "2024-01" or "Jan 2024"
  revenue: number;
  expenses: number;
  netCashFlow: number;
  transactionCount: number;
}

export interface CategoryBreakdownData {
  category: TransactionCategory;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface StatusBreakdownData {
  status: TransactionStatus;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface UserVolumeData {
  user_id: string;
  revenue: number;
  expenses: number;
  totalTransactions: number;
  avgTicket: number;
}


export interface AnalyticsSummary {
  kpis: {
    totalRevenue: number;
    totalExpenses: number;
    netCashFlow: number;
    netMarginPercentage: number;
    pendingAmount: number;
    pendingCount: number;
    totalTransactions: number;
    avgTransactionAmount: number;
    successRatePercentage: number;
  };
  monthlyTrends: MonthlyTrendData[];
  categoryBreakdown: CategoryBreakdownData[];
  statusBreakdown: StatusBreakdownData[];
  userVolumes: UserVolumeData[];
  dateRange: {
    startDate: string;
    endDate: string;
    totalMonths: number;
  };
}

export type CsvColumnKey = 'id' | 'date' | 'amount' | 'category' | 'status' | 'user_id' | 'user_profile';

export type DateFormatOption = 'iso' | 'yyyy-mm-dd' | 'dd-mm-yyyy' | 'friendly';
export type AmountFormatOption = 'raw' | 'currency_usd';
export type StatusFormatOption = 'original' | 'uppercase';

export interface CsvColumnConfig {
  key: CsvColumnKey;
  header: string;
  enabled: boolean;
  order: number;
}

export type CsvExportScope = 'filtered' | 'selected' | 'all';

export interface CsvExportRequest {
  columns: CsvColumnConfig[];
  dateFormat: DateFormatOption;
  amountFormat: AmountFormatOption;
  statusFormat: StatusFormatOption;
  scope: CsvExportScope;
  selectedIds?: number[];
  filterParams?: TransactionFilterParams;
}

export interface AlertNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}
