import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/seeds/seed.js';

let app: any;
let authToken: string;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  await seedDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Financial Analytics API Suite', () => {
  it('GET /api/health - should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toContain('Financial Analytics');
  });

  describe('Authentication & Security Endpoints', () => {
    it('POST /api/auth/login - should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@gmail.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.alert.type).toBe('error');
    });

    it('POST /api/auth/login - should succeed with valid credentials and return JWT & cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@gmail.com', password: 'Pass@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@gmail.com');
      expect(res.body.data.user.role).toBe('admin');

      // Check for httpOnly refreshToken cookie
      const cookies = res.headers['set-cookie'] as any;
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('refreshToken='))).toBe(true);

      authToken = res.body.data.accessToken;
    });

    it('GET /api/auth/me - should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@gmail.com');
    });

    it('GET /api/transactions - should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Transaction Query, Filter & Server-Side Sort Endpoints', () => {
    it('GET /api/transactions - should return paginated list of transactions', async () => {
      const res = await request(app)
        .get('/api/transactions?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(10);
      expect(res.body.pagination.total).toBe(300);
      expect(res.body.pagination.totalPages).toBe(30);
      expect(res.body.rangeBounds.minAmount).toBeGreaterThanOrEqual(0);
    });

    it('GET /api/transactions - should filter by category correctly', async () => {
      const res = await request(app)
        .get('/api/transactions?category=Revenue&limit=50')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((t: any) => t.category === 'Revenue')).toBe(true);
    });

    it('GET /api/transactions - should filter by status correctly', async () => {
      const res = await request(app)
        .get('/api/transactions?status=Pending&limit=50')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((t: any) => t.status === 'Pending')).toBe(true);
    });

    it('GET /api/transactions - should execute 100% server-side sort by amount desc', async () => {
      const res = await request(app)
        .get('/api/transactions?sortBy=amount&sortOrder=desc&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const amounts = res.body.data.map((t: any) => t.amount);
      for (let i = 0; i < amounts.length - 1; i++) {
        expect(amounts[i]).toBeGreaterThanOrEqual(amounts[i + 1]);
      }
    });

    it('GET /api/transactions - should search across user_id', async () => {
      const res = await request(app)
        .get('/api/transactions?search=user_004&limit=50')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((t: any) => t.user_id === 'user_004')).toBe(true);
    });
  });

  describe('Financial Analytics Aggregation Pipeline', () => {
    it('GET /api/analytics/summary - should compute dynamic KPIs, trends and breakdown', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { kpis, monthlyTrends, categoryBreakdown, statusBreakdown, userVolumes, insights } =
        res.body.data;

      expect(kpis.totalTransactions).toBe(300);
      expect(kpis.totalRevenue).toBeGreaterThan(0);
      expect(kpis.totalExpenses).toBeGreaterThan(0);
      expect(kpis.netCashFlow).toBe(kpis.totalRevenue - kpis.totalExpenses);

      expect(monthlyTrends.length).toBeGreaterThan(0);
      expect(categoryBreakdown.length).toBe(2);
      expect(statusBreakdown.length).toBe(2);
      expect(userVolumes.length).toBe(4); // user_001 to user_004
      expect(insights.length).toBeGreaterThan(0);
    });
  });

  describe('Configurable CSV Export System', () => {
    it('POST /api/export/preview - should return customized column preview', async () => {
      const res = await request(app)
        .post('/api/export/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          columns: [
            { key: 'id', header: 'Tx ID', enabled: true, order: 0 },
            { key: 'amount', header: 'Total ($)', enabled: true, order: 1 },
            { key: 'category', header: 'Flow Type', enabled: true, order: 2 },
          ],
          dateFormat: 'friendly',
          amountFormat: 'currency_usd',
          statusFormat: 'original',
          scope: 'all',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.headers).toEqual(['Tx ID', 'Total ($)', 'Flow Type']);
      expect(res.body.data.previewRows.length).toBeLessThanOrEqual(5);
      expect(res.body.data.previewRows[0]['Total ($)']).toContain('$');
    });

    it('POST /api/export/csv - should stream CSV file with custom columns', async () => {
      const res = await request(app)
        .post('/api/export/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          columns: [
            { key: 'id', header: 'Reference', enabled: true, order: 0 },
            { key: 'date', header: 'Timestamp', enabled: true, order: 1 },
            { key: 'amount', header: 'Amount', enabled: true, order: 2 },
          ],
          dateFormat: 'yyyy-mm-dd',
          amountFormat: 'raw',
          statusFormat: 'original',
          scope: 'all',
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Reference,Timestamp,Amount');
    });
  });
});
