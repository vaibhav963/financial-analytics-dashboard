import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/layout/Navbar.js';
import { HeroBanner } from './components/layout/HeroBanner.js';
import { KpiGrid } from './components/dashboard/KpiGrid.js';
import { FilterToolbar } from './components/transactions/FilterToolbar.js';
import { TransactionTable } from './components/transactions/TransactionTable.js';
import { SplitLoginPage } from './components/auth/SplitLoginPage.js';
import { useAnalytics } from './hooks/useAnalytics.js';
import { useTransactions } from './hooks/useTransactions.js';
import { useAuth } from './context/AuthContext.js';
import { Button } from './components/common/Button.js';
import { ErrorPage } from './components/common/ErrorPage.js';
import { Download, Layers } from 'lucide-react';

// Code-split heavy Recharts and modal views to minimize initial bundle size
const RevenueExpenseChart = lazy(() =>
  import('./components/dashboard/RevenueExpenseChart.js').then((m) => ({ default: m.RevenueExpenseChart }))
);
const CumulativeCashflowChart = lazy(() =>
  import('./components/dashboard/CumulativeCashflowChart.js').then((m) => ({ default: m.CumulativeCashflowChart }))
);
const CategoryDonutChart = lazy(() =>
  import('./components/dashboard/CategoryDonutChart.js').then((m) => ({ default: m.CategoryDonutChart }))
);
const SettlementStatusDonutChart = lazy(() =>
  import('./components/dashboard/SettlementStatusDonutChart.js').then((m) => ({ default: m.SettlementStatusDonutChart }))
);
const UserVolumeBarChart = lazy(() =>
  import('./components/dashboard/UserVolumeBarChart.js').then((m) => ({ default: m.UserVolumeBarChart }))
);
const DynamicTimeline = lazy(() =>
  import('./components/dashboard/DynamicTimeline.js').then((m) => ({ default: m.DynamicTimeline }))
);

const CsvExportModal = lazy(() =>
  import('./components/export/CsvExportModal.js').then((m) => ({ default: m.CsvExportModal }))
);
const UserProfileModal = lazy(() =>
  import('./components/auth/UserProfileModal.js').then((m) => ({ default: m.UserProfileModal }))
);

const ChartSkeleton: React.FC<{ height?: string; className?: string }> = ({
  height = 'h-80',
  className = '',
}) => (
  <div className={`glass-card p-6 rounded-3xl animate-pulse bg-white/70 border border-slateNavy-100 flex flex-col justify-between ${height} ${className}`}>
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slateNavy-200 rounded w-1/3" />
      <div className="h-4 bg-slateNavy-200 rounded w-1/6" />
    </div>
    <div className="w-full h-48 bg-slateNavy-100/60 rounded-2xl mt-4" />
  </div>
);

export const DashboardContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isProfileModalOpen,
    closeProfileModal,
  } = useAuth();
  const { analytics, isLoading: isAnalyticsLoading, refreshAnalytics } = useAnalytics();
  const {
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
    applyDatePreset,
    resetFilters,
    isLoading: isTxLoading,
    refreshTransactions,
  } = useTransactions();

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Synchronize route pathname changes
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);



  const handleNavigateHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  const handleRefreshAll = () => {
    refreshAnalytics();
    refreshTransactions();
  };

  // Check for dedicated route error states (404, 403, 500, 503, 400 or unmatched routes)
  if (currentPath !== '/' && currentPath !== '') {
    if (currentPath === '/403') {
      return <ErrorPage statusCode={403} onReset={handleNavigateHome} />;
    }
    if (currentPath === '/500') {
      return <ErrorPage statusCode={500} onReset={handleNavigateHome} />;
    }
    if (currentPath === '/503') {
      return <ErrorPage statusCode={503} onReset={handleNavigateHome} />;
    }
    if (currentPath === '/400') {
      return <ErrorPage statusCode={400} onReset={handleNavigateHome} />;
    }
    // Default unmatched routes to 404 Not Found
    return <ErrorPage statusCode={404} onReset={handleNavigateHome} />;
  }

  // Keyboard shortcut: Ctrl+E (or Cmd+E) for CSV Export Studio
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isAuthenticated]);

  // Initial auth check loading spinner
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-loopr-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slateNavy-500">Hydrating secure session...</p>
        </div>
      </div>
    );
  }

  // When unauthenticated, render the 2-section split login page
  if (!isAuthenticated) {
    return <SplitLoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-lavenderBg text-slateNavy-900 pb-16">

      {/* Floating Pill Navigation */}
      <Navbar
        onOpenExportModal={() => setIsExportModalOpen(true)}
        selectedCount={selectedIds.length}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8">
        {/* Enterprise Analytics Header */}
        <HeroBanner
          analytics={analytics}
          onRefresh={handleRefreshAll}
          isLoading={isAnalyticsLoading || isTxLoading}
        />

        <div className="space-y-8">
          {/* 1. Executive Metric KPI Cards */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Executive Financial Metrics</h2>
            <KpiGrid analytics={analytics} isLoading={isAnalyticsLoading} />
          </section>

          {/* 2. Primary Financial Trends & Cashflow Share Grid */}
          <section aria-label="Visual Analytics - Primary Trends" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Dual-Gradient Trend (2 cols) */}
            <div className="lg:col-span-2">
              <Suspense fallback={<ChartSkeleton height="h-88" />}>
                <RevenueExpenseChart
                  data={analytics?.monthlyTrends || []}
                  isLoading={isAnalyticsLoading}
                />
              </Suspense>
            </div>

            {/* Category Breakdown Donut (1 col) */}
            <div className="lg:col-span-1">
              <Suspense fallback={<ChartSkeleton height="h-88" />}>
                <CategoryDonutChart
                  data={analytics?.categoryBreakdown || []}
                  isLoading={isAnalyticsLoading}
                />
              </Suspense>
            </div>
          </section>

          {/* 3. Liquidity Growth Curve & Settlement Clearance Health Grid */}
          <section aria-label="Visual Analytics - Liquidity & Settlement" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cumulative Liquidity & Net Cashflow Curve (2 cols) */}
            <div className="lg:col-span-2">
              <Suspense fallback={<ChartSkeleton height="h-88" />}>
                <CumulativeCashflowChart
                  data={analytics?.monthlyTrends || []}
                  isLoading={isAnalyticsLoading}
                />
              </Suspense>
            </div>

            {/* Settlement Rate & Payment Status Donut (1 col) */}
            <div className="lg:col-span-1">
              <Suspense fallback={<ChartSkeleton height="h-88" />}>
                <SettlementStatusDonutChart
                  data={analytics?.statusBreakdown || []}
                  successRate={analytics?.kpis?.successRatePercentage || 62}
                  isLoading={isAnalyticsLoading}
                />
              </Suspense>
            </div>
          </section>

          {/* 4. User Volume Distribution & Dynamic Timeline Stepper */}
          <section aria-label="Milestone & Entity Analysis" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User/Analyst Spend Comparison */}
            <div className="lg:col-span-1">
              <Suspense fallback={<ChartSkeleton height="h-88" />}>
                <UserVolumeBarChart
                  data={analytics?.userVolumes || []}
                  isLoading={isAnalyticsLoading}
                />
              </Suspense>
            </div>

            {/* 2024 Dynamic Cashflow Stepper */}
            <div className="lg:col-span-2">
              <Suspense fallback={<ChartSkeleton height="h-88" />}>
                <DynamicTimeline
                  trends={analytics?.monthlyTrends || []}
                  isLoading={isAnalyticsLoading}
                />
              </Suspense>
            </div>
          </section>

          {/* 5. Transactions Ledger with Multi-Field Filtering */}
          <section aria-labelledby="ledger-heading" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 id="ledger-heading" className="text-xl font-bold text-slateNavy-900 font-display">
                  Company Transaction Ledger
                </h2>
                <p className="text-xs text-slateNavy-500">
                  Real-time server-side paginated queries, multi-field filters, and column sorting
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
                leftIcon={<Download className="w-3.5 h-3.5 text-loopr-600" />}
                title="Keyboard shortcut: Ctrl+E / Cmd+E"
              >
                <span>Configure CSV Export</span>
                <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slateNavy-400 bg-slateNavy-100 rounded border border-slateNavy-200">
                  Ctrl+E
                </kbd>
              </Button>
            </div>

            {/* Filter Toolbar & Active Chips */}
            <FilterToolbar
              filters={filters}
              setFilters={setFilters}
              applyDatePreset={applyDatePreset}
              resetFilters={resetFilters}
              rangeBounds={rangeBounds}
              totalResults={pagination.total}
            />

            {/* Sortable, Paginated Table */}
            <TransactionTable
              transactions={transactions}
              pagination={pagination}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              page={page}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={setLimit}
              selectedIds={selectedIds}
              onToggleSelectRow={toggleSelectRow}
              onToggleSelectAllOnPage={toggleSelectAllOnPage}

              isLoading={isTxLoading}
              onResetFilters={resetFilters}
            />
          </section>
        </div>
      </main>



      {/* Configurable CSV Export Modal */}
      <Suspense fallback={null}>
        <CsvExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          filteredTransactions={transactions}
          selectedIds={selectedIds}
          filterParams={{
            search: filters.search.trim() || undefined,
            category: filters.category !== 'All' ? filters.category : undefined,
            status: filters.status !== 'All' ? filters.status : undefined,
            user_id: filters.user_id !== 'All' ? filters.user_id : undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            minAmount: filters.minAmount,
            maxAmount: filters.maxAmount,
          }}
          totalFilteredCount={pagination.total}
        />
      </Suspense>

      {/* User Profile & Workspace Settings Modal */}
      <Suspense fallback={null}>
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
        />
      </Suspense>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slateNavy-200/80 max-w-7xl mx-auto px-4 sm:px-8 w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slateNavy-500">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-loopr-600" />
          <span className="font-bold text-slateNavy-700">Financial Analytics Platform</span>
        </div>
        <p>© 2026 Enterprise Financial Intelligence Platform.</p>
      </footer>
    </div>
  );
};
