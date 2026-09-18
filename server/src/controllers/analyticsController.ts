import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction.js';
import { buildTransactionFilter } from './transactionController.js';
import type {
  AnalyticsSummary,
  MonthlyTrendData,
  CategoryBreakdownData,
  StatusBreakdownData,
  UserVolumeData,
} from '../types/index.js';

export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // Optional filter query support for analytics (e.g. user or date sliced metrics)
    const filter = buildTransactionFilter(req.query);

    // 1. Faceted Aggregation Pipeline for fast parallel aggregation
    const [results] = await Transaction.aggregate([
      { $match: filter },
      {
        $facet: {
          kpiTotals: [
            {
              $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                totalRevenue: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0],
                  },
                },
                totalExpenses: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0],
                  },
                },
                pendingAmount: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0],
                  },
                },
                pendingCount: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0],
                  },
                },
                paidCount: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0],
                  },
                },
                minDate: { $min: '$date' },
                maxDate: { $max: '$date' },
              },
            },
          ],
          monthlyTrends: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                revenue: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0],
                  },
                },
                expenses: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0],
                  },
                },
                transactionCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          categoryBreakdown: [
            {
              $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { totalAmount: -1 } },
          ],
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { totalAmount: -1 } },
          ],
          userVolumes: [
            {
              $group: {
                _id: '$user_id',
                revenue: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0],
                  },
                },
                expenses: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0],
                  },
                },
                totalTransactions: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const kpiRaw = results.kpiTotals[0] || {
      totalTransactions: 0,
      totalAmount: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      pendingAmount: 0,
      pendingCount: 0,
      paidCount: 0,
      minDate: new Date(),
      maxDate: new Date(),
    };

    const totalRevenue = kpiRaw.totalRevenue || 0;
    const totalExpenses = kpiRaw.totalExpenses || 0;
    const netCashFlow = totalRevenue - totalExpenses;
    const netMarginPercentage = totalRevenue > 0 ? (netCashFlow / totalRevenue) * 100 : 0;
    const totalTransactions = kpiRaw.totalTransactions || 0;
    const avgTransactionAmount = totalTransactions > 0 ? kpiRaw.totalAmount / totalTransactions : 0;
    const successRatePercentage =
      totalTransactions > 0 ? (kpiRaw.paidCount / totalTransactions) * 100 : 0;

    // Monthly Trends formatting
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends: MonthlyTrendData[] = (results.monthlyTrends || []).map((m: any) => {
      const [yearStr, monthStr] = m._id.split('-');
      const monthIndex = parseInt(monthStr, 10) - 1;
      const formattedMonth = `${monthNames[monthIndex]} ${yearStr}`;
      return {
        month: formattedMonth,
        revenue: m.revenue,
        expenses: m.expenses,
        netCashFlow: m.revenue - m.expenses,
        transactionCount: m.transactionCount,
      };
    });

    // Category Breakdown formatting
    const totalCategoryVolume = (results.categoryBreakdown || []).reduce(
      (sum: number, c: any) => sum + c.totalAmount,
      0
    );
    const categoryBreakdown: CategoryBreakdownData[] = (results.categoryBreakdown || []).map((c: any) => ({
      category: c._id,
      totalAmount: c.totalAmount,
      count: c.count,
      percentage: totalCategoryVolume > 0 ? (c.totalAmount / totalCategoryVolume) * 100 : 0,
    }));

    // Status Breakdown formatting
    const totalStatusVolume = (results.statusBreakdown || []).reduce(
      (sum: number, s: any) => sum + s.totalAmount,
      0
    );
    const statusBreakdown: StatusBreakdownData[] = (results.statusBreakdown || []).map((s: any) => ({
      status: s._id,
      totalAmount: s.totalAmount,
      count: s.count,
      percentage: totalStatusVolume > 0 ? (s.totalAmount / totalStatusVolume) * 100 : 0,
    }));

    // User Volumes formatting
    const userVolumes: UserVolumeData[] = (results.userVolumes || []).map((u: any) => ({
      user_id: u._id,
      revenue: u.revenue,
      expenses: u.expenses,
      totalTransactions: u.totalTransactions,
      avgTicket: u.totalTransactions > 0 ? u.totalAmount / u.totalTransactions : 0,
    }));

    const responsePayload: AnalyticsSummary = {
      kpis: {
        totalRevenue,
        totalExpenses,
        netCashFlow,
        netMarginPercentage,
        pendingAmount: kpiRaw.pendingAmount || 0,
        pendingCount: kpiRaw.pendingCount || 0,
        totalTransactions,
        avgTransactionAmount,
        successRatePercentage,
      },
      monthlyTrends,
      categoryBreakdown,
      statusBreakdown,
      userVolumes,
      dateRange: {
        startDate: kpiRaw.minDate ? new Date(kpiRaw.minDate).toISOString() : new Date().toISOString(),
        endDate: kpiRaw.maxDate ? new Date(kpiRaw.maxDate).toISOString() : new Date().toISOString(),
        totalMonths: monthlyTrends.length,
      },
    };

    res.json({
      success: true,
      data: responsePayload,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Analytics Aggregation Failed',
        message: error.message || 'Failed to compute financial analytics metrics.',
      },
    });
  }
};
