// ── Smoke Test ───────────────────────────────────────────────────────────────
// Verifies the test infrastructure itself works:
// - In-memory DB initializes with correct schema
// - seedOrg() creates an org + user + returns a valid JWT
// - Routes respond to authenticated requests
// - Multi-tenant isolation holds

import { createTestApp } from './helpers/testApp.js';

describe('Test Infrastructure Smoke Test', () => {
  let ctx;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it('creates an in-memory database with all tables', async () => {
    const tables = await ctx.dbAll(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    const tableNames = tables.map(t => t.name);

    expect(tableNames).toContain('organizations');
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('employees');
    expect(tableNames).toContain('cameras');
    expect(tableNames).toContain('alerts');
  });

  it('seeds an organization with admin user and valid token', async () => {
    const org = await ctx.seedOrg('Smoke Test Org');

    expect(org.orgId).toMatch(/^org_/);
    expect(org.userId).toMatch(/^usr_/);
    expect(org.token).toBeDefined();
    expect(org.email).toContain('@test.com');
  });

  it('authenticates via token and returns user profile', async () => {
    const org = await ctx.seedOrg('Profile Org');

    const res = await ctx.request
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${org.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(org.userId);
    expect(res.body.organization.name).toBe('Profile Org');
  });

  it('rejects requests without a token', async () => {
    const res = await ctx.request.get('/api/employees');
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await ctx.request
      .get('/api/employees')
      .set('Authorization', 'Bearer this-is-not-a-real-token');
    expect(res.status).toBe(403);
  });

  it('enforces multi-tenant isolation on employees', async () => {
    // Org A: has one employee
    const orgA = await ctx.seedOrg('Org Alpha');
    await ctx.seedEmployee(orgA.orgId, { name: 'Alice' });

    // Org B: has no employees
    const orgB = await ctx.seedOrg('Org Beta');

    // Org A should see 1 employee
    const resA = await ctx.request
      .get('/api/employees')
      .set('Authorization', `Bearer ${orgA.token}`);
    expect(resA.status).toBe(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Alice');

    // Org B should see 0 employees — cannot access Org A's data
    const resB = await ctx.request
      .get('/api/employees')
      .set('Authorization', `Bearer ${orgB.token}`);
    expect(resB.status).toBe(200);
    expect(resB.body).toHaveLength(0);
  });

  it('enforces multi-tenant isolation on alerts', async () => {
    const orgA = await ctx.seedOrg('Alert Org A');
    const orgB = await ctx.seedOrg('Alert Org B');

    await ctx.seedAlert(orgA.orgId, { title: 'A-only alert' });

    const resA = await ctx.request
      .get('/api/alerts')
      .set('Authorization', `Bearer ${orgA.token}`);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].title).toBe('A-only alert');

    const resB = await ctx.request
      .get('/api/alerts')
      .set('Authorization', `Bearer ${orgB.token}`);
    expect(resB.body).toHaveLength(0);
  });
});
