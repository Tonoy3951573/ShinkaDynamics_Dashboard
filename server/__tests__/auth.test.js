// ── Auth Integration Tests ───────────────────────────────────────────────────
// Tests: signup, login, Zod validation, duplicate email, /me profile retrieval

import { createTestApp } from './helpers/testApp.js';

describe('Auth Routes', () => {
  let ctx;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  // ── Signup ───────────────────────────────────────────────────────────────

  describe('POST /api/auth/signup', () => {
    it('creates a new organization and admin user', async () => {
      const res = await ctx.request.post('/api/auth/signup').send({
        orgName: 'Acme Corp',
        name: 'John Doe',
        email: 'john@acme.test',
        password: 'StrongPass123',
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('john@acme.test');
      expect(res.body.user.role).toBe('admin');
      expect(res.body.user.organization_id).toMatch(/^org_/);
      expect(res.body.user.id).toMatch(/^usr_/);
    });

    it('returns 409 for duplicate email', async () => {
      const email = 'duplicate@test.com';
      // First signup
      await ctx.request.post('/api/auth/signup').send({
        orgName: 'First Org',
        email,
        password: 'StrongPass123',
      });

      // Second signup with same email
      const res = await ctx.request.post('/api/auth/signup').send({
        orgName: 'Second Org',
        email,
        password: 'AnotherPass456',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/email/i);
    });

    it('rejects signup with missing email', async () => {
      const res = await ctx.request.post('/api/auth/signup').send({
        orgName: 'No Email Org',
        password: 'StrongPass123',
      });

      expect(res.status).toBe(400);
    });

    it('rejects signup with missing password', async () => {
      const res = await ctx.request.post('/api/auth/signup').send({
        orgName: 'No Pass Org',
        email: 'nopass@test.com',
      });

      expect(res.status).toBe(400);
    });
  });

  // ── Login ────────────────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('returns a token for valid credentials', async () => {
      const email = 'login-test@test.com';
      const password = 'LoginPass123';

      // Create user first
      await ctx.request.post('/api/auth/signup').send({
        orgName: 'Login Org',
        email,
        password,
      });

      const res = await ctx.request.post('/api/auth/login').send({
        email,
        password,
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(email);
    });

    it('returns 401 for wrong password', async () => {
      const email = 'wrong-pass@test.com';

      await ctx.request.post('/api/auth/signup').send({
        orgName: 'Wrong Pass Org',
        email,
        password: 'CorrectPass123',
      });

      const res = await ctx.request.post('/api/auth/login').send({
        email,
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid credentials/i);
    });

    it('returns 401 for non-existent email', async () => {
      const res = await ctx.request.post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'DoesntMatter',
      });

      expect(res.status).toBe(401);
    });

    it('rejects login with missing fields', async () => {
      const res = await ctx.request.post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });

  // ── /me Profile ──────────────────────────────────────────────────────────

  describe('GET /api/auth/me', () => {
    it('returns user profile and organization data', async () => {
      const org = await ctx.seedOrg('Me Org');

      const res = await ctx.request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${org.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(org.userId);
      expect(res.body.user.organization_id).toBe(org.orgId);
      expect(res.body.organization.name).toBe('Me Org');
      expect(res.body.organization.plan).toBe('free');
    });

    it('returns 401 without token', async () => {
      const res = await ctx.request.get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 403 with invalid token', async () => {
      const res = await ctx.request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer garbage-token');
      expect(res.status).toBe(403);
    });

    it('returns 404 for deleted user', async () => {
      const org = await ctx.seedOrg('Ghost Org');
      // Delete the user directly from DB
      await ctx.dbRun('DELETE FROM users WHERE id = ?', [org.userId]);

      const res = await ctx.request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${org.token}`);
      expect(res.status).toBe(404);
    });
  });
});
