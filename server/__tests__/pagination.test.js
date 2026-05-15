// ── Pagination Utility Unit Tests ─────────────────────────────────────────────
// Tests: parsePagination input clamping, paginatedQuery COUNT+LIMIT/OFFSET logic

import { parsePagination, paginatedQuery } from '../utils/pagination.js';
import sqlite3 from 'sqlite3';

// ── parsePagination ──────────────────────────────────────────────────────────

describe('parsePagination', () => {
  function mockReq(query = {}) {
    return { query };
  }

  it('returns defaults when no query params', () => {
    const result = parsePagination(mockReq());
    expect(result).toEqual({ page: 1, limit: 25, offset: 0 });
  });

  it('parses valid page and limit', () => {
    const result = parsePagination(mockReq({ page: '3', limit: '10' }));
    expect(result).toEqual({ page: 3, limit: 10, offset: 20 });
  });

  it('clamps page to minimum 1', () => {
    expect(parsePagination(mockReq({ page: '0' })).page).toBe(1);
    expect(parsePagination(mockReq({ page: '-5' })).page).toBe(1);
  });

  it('clamps limit to maximum 100', () => {
    expect(parsePagination(mockReq({ limit: '999' })).limit).toBe(100);
    expect(parsePagination(mockReq({ limit: '100' })).limit).toBe(100);
  });

  it('clamps limit to minimum 1', () => {
    expect(parsePagination(mockReq({ limit: '0' })).limit).toBe(25); // falls to default
    expect(parsePagination(mockReq({ limit: '-10' })).limit).toBe(25);
  });

  it('handles non-numeric input gracefully', () => {
    const result = parsePagination(mockReq({ page: 'abc', limit: 'xyz' }));
    expect(result).toEqual({ page: 1, limit: 25, offset: 0 });
  });

  it('accepts custom defaults', () => {
    const result = parsePagination(mockReq(), { limit: 50, maxLimit: 200 });
    expect(result.limit).toBe(50);
  });

  it('respects custom maxLimit', () => {
    const result = parsePagination(mockReq({ limit: '150' }), { maxLimit: 200 });
    expect(result.limit).toBe(150);
  });

  it('calculates offset correctly', () => {
    const r1 = parsePagination(mockReq({ page: '1', limit: '10' }));
    expect(r1.offset).toBe(0);

    const r2 = parsePagination(mockReq({ page: '2', limit: '10' }));
    expect(r2.offset).toBe(10);

    const r3 = parsePagination(mockReq({ page: '5', limit: '20' }));
    expect(r3.offset).toBe(80);
  });
});

// ── paginatedQuery ───────────────────────────────────────────────────────────

describe('paginatedQuery', () => {
  let db;

  beforeAll(async () => {
    db = new sqlite3.Database(':memory:');

    // Create a simple test table and seed 15 rows
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('CREATE TABLE items (id INTEGER PRIMARY KEY, org_id TEXT, value TEXT)');
        const stmt = db.prepare('INSERT INTO items (org_id, value) VALUES (?, ?)');
        for (let i = 1; i <= 15; i++) {
          stmt.run('org_a', `item-${i}`);
        }
        // Add 3 items for org_b
        for (let i = 1; i <= 3; i++) {
          stmt.run('org_b', `other-${i}`);
        }
        stmt.finalize();
        db.run('SELECT 1', (err) => err ? reject(err) : resolve());
      });
    });
  });

  afterAll(() => {
    db.close();
  });

  it('returns first page with correct metadata', async () => {
    const result = await paginatedQuery(db, {
      countSql: 'SELECT COUNT(*) as total FROM items WHERE org_id = ?',
      dataSql: 'SELECT value FROM items WHERE org_id = ?',
      params: ['org_a'],
      page: 1,
      limit: 5,
    });

    expect(result.data).toHaveLength(5);
    expect(result.pagination).toEqual({
      currentPage: 1,
      totalPages: 3,
      totalCount: 15,
      limit: 5,
    });
  });

  it('returns correct data for page 2', async () => {
    const result = await paginatedQuery(db, {
      countSql: 'SELECT COUNT(*) as total FROM items WHERE org_id = ?',
      dataSql: 'SELECT value FROM items WHERE org_id = ?',
      params: ['org_a'],
      page: 2,
      limit: 5,
    });

    expect(result.data).toHaveLength(5);
    expect(result.pagination.currentPage).toBe(2);
  });

  it('returns partial last page', async () => {
    const result = await paginatedQuery(db, {
      countSql: 'SELECT COUNT(*) as total FROM items WHERE org_id = ?',
      dataSql: 'SELECT value FROM items WHERE org_id = ?',
      params: ['org_a'],
      page: 3,
      limit: 5,
    });

    expect(result.data).toHaveLength(5);
    expect(result.pagination.currentPage).toBe(3);
    expect(result.pagination.totalPages).toBe(3);
  });

  it('returns empty data for page beyond total', async () => {
    const result = await paginatedQuery(db, {
      countSql: 'SELECT COUNT(*) as total FROM items WHERE org_id = ?',
      dataSql: 'SELECT value FROM items WHERE org_id = ?',
      params: ['org_a'],
      page: 99,
      limit: 5,
    });

    expect(result.data).toHaveLength(0);
    expect(result.pagination.currentPage).toBe(99);
    expect(result.pagination.totalCount).toBe(15);
  });

  it('enforces tenant isolation via params', async () => {
    const result = await paginatedQuery(db, {
      countSql: 'SELECT COUNT(*) as total FROM items WHERE org_id = ?',
      dataSql: 'SELECT value FROM items WHERE org_id = ?',
      params: ['org_b'],
      page: 1,
      limit: 25,
    });

    expect(result.data).toHaveLength(3);
    expect(result.pagination.totalCount).toBe(3);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('supports orderBy clause', async () => {
    const result = await paginatedQuery(db, {
      countSql: 'SELECT COUNT(*) as total FROM items WHERE org_id = ?',
      dataSql: 'SELECT value FROM items WHERE org_id = ?',
      params: ['org_a'],
      page: 1,
      limit: 3,
      orderBy: 'ORDER BY id DESC',
    });

    expect(result.data).toHaveLength(3);
    // Descending — should get items 15, 14, 13
    expect(result.data[0].value).toBe('item-15');
  });

  it('handles empty table', async () => {
    const result = await paginatedQuery(db, {
      countSql: 'SELECT COUNT(*) as total FROM items WHERE org_id = ?',
      dataSql: 'SELECT value FROM items WHERE org_id = ?',
      params: ['org_nonexistent'],
      page: 1,
      limit: 10,
    });

    expect(result.data).toHaveLength(0);
    expect(result.pagination).toEqual({
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    });
  });
});
