import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction.js';
import { z } from 'zod';

export const filterQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(500).default(25),
  sortBy: z.enum(['id', 'date', 'amount', 'category', 'status', 'user_id']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  category: z.string().optional(), // e.g. "Revenue" or "Revenue,Expense"
  status: z.string().optional(), // e.g. "Paid" or "Paid,Pending"
  user_id: z.string().optional(), // e.g. "user_001,user_002"
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export const buildTransactionFilter = (query: any) => {
  const filter: any = {};

  // Category filter
  if (query.category && query.category !== 'All') {
    const categories = query.category.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (categories.length > 0) {
      filter.category = { $in: categories };
    }
  }

  // Status filter
  if (query.status && query.status !== 'All') {
    const statuses = query.status.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (statuses.length > 0) {
      filter.status = { $in: statuses };
    }
  }

  // User filter
  if (query.user_id && query.user_id !== 'All') {
    const users = query.user_id.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (users.length > 0) {
      filter.user_id = { $in: users };
    }
  }

  // Date Range filter
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      // Include whole end date
      const end = new Date(query.endDate);
      if (query.endDate.length <= 10) {
        end.setUTCHours(23, 59, 59, 999);
      }
      filter.date.$lte = end;
    }
  }

  // Amount Range filter
  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    filter.amount = {};
    if (query.minAmount !== undefined && !isNaN(query.minAmount)) {
      filter.amount.$gte = Number(query.minAmount);
    }
    if (query.maxAmount !== undefined && !isNaN(query.maxAmount)) {
      filter.amount.$lte = Number(query.maxAmount);
    }
  }

  // Free text search across ID, User ID, Category, Status
  if (query.search && query.search.trim()) {
    const term = query.search.trim();
    const searchConditions: any[] = [
      { user_id: { $regex: term, $options: 'i' } },
      { category: { $regex: term, $options: 'i' } },
      { status: { $regex: term, $options: 'i' } },
    ];

    // If numeric search, also match exact ID or Amount prefix
    const num = Number(term);
    if (!isNaN(num)) {
      searchConditions.push({ id: num });
      searchConditions.push({ amount: num });
    }

    filter.$or = searchConditions;
  }

  return filter;
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = filterQuerySchema.parse(req.query);
    const filter = buildTransactionFilter(query);

    const sortField = query.sortBy;
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortField]: sortDirection };
    if (sortField !== 'id') {
      sortOptions.id = -1; // deterministic secondary sort
    }

    const skip = (query.page - 1) * query.limit;

    // Parallel execution for paginated data, total count, and dataset range bounds
    const [transactions, total, bounds] = await Promise.all([
      Transaction.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Transaction.countDocuments(filter),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: '$date' },
            maxDate: { $max: '$date' },
            minAmount: { $min: '$amount' },
            maxAmount: { $max: '$amount' },
          },
        },
      ]),
    ]);

    const totalPages = Math.ceil(total / query.limit) || 1;

    const rangeBounds = bounds[0]
      ? {
          minDate: bounds[0].minDate?.toISOString() || new Date().toISOString(),
          maxDate: bounds[0].maxDate?.toISOString() || new Date().toISOString(),
          minAmount: bounds[0].minAmount || 0,
          maxAmount: bounds[0].maxAmount || 5000,
        }
      : {
          minDate: new Date().toISOString(),
          maxDate: new Date().toISOString(),
          minAmount: 0,
          maxAmount: 5000,
        };

    res.json({
      success: true,
      data: transactions.map((t: any) => ({
        ...t,
        id: t.id,
        date: t.date instanceof Date ? t.date.toISOString() : new Date(t.date).toISOString(),
      })),
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1,
      },
      appliedFilters: {
        search: query.search,
        category: query.category?.split(','),
        status: query.status?.split(','),
        user_id: query.user_id?.split(','),
        startDate: query.startDate,
        endDate: query.endDate,
        minAmount: query.minAmount,
        maxAmount: query.maxAmount,
      },
      rangeBounds,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Query Failed',
        message: error.message || 'Failed to fetch transaction listings.',
      },
    });
  }
};

export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const transaction = await Transaction.findOne({ id }).lean();

    if (!transaction) {
      res.status(404).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Transaction Not Found',
          message: `No transaction with ID #${id} was found.`,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...transaction,
        id: transaction.id,
        date: transaction.date instanceof Date ? transaction.date.toISOString() : new Date(transaction.date).toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Error Fetching Transaction',
        message: error.message,
      },
    });
  }
};
