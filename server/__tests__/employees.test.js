// ── Employee Integration Tests ───────────────────────────────────────────────
// Tests: CRUD operations, multi-tenant isolation, admin-only guards, server-generated IDs

import { createTestApp } from './helpers/testApp.js';

describe('Employee Routes', () => {
  let ctx;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  // ── GET /api/employees ─────────────────────────────────────────────────

  describe('GET /api/employees', () => {
    it('returns an empty array for a new org', async () => {
      const org = await ctx.seedOrg('Empty Org');

      const res = await ctx.request
        .get('/api/employees')
        .set('Authorization', `Bearer ${org.token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns employees belonging to the requesting org only', async () => {
      const orgA = await ctx.seedOrg('Emp Org A');
      const orgB = await ctx.seedOrg('Emp Org B');

      await ctx.seedEmployee(orgA.orgId, { name: 'Alice', score: 90 });
      await ctx.seedEmployee(orgA.orgId, { name: 'Bob', score: 75 });
      await ctx.seedEmployee(orgB.orgId, { name: 'Charlie', score: 80 });

      // Org A sees 2
      const resA = await ctx.request
        .get('/api/employees')
        .set('Authorization', `Bearer ${orgA.token}`);
      expect(resA.body).toHaveLength(2);
      const namesA = resA.body.map(e => e.name);
      expect(namesA).toContain('Alice');
      expect(namesA).toContain('Bob');
      expect(namesA).not.toContain('Charlie');

      // Org B sees 1
      const resB = await ctx.request
        .get('/api/employees')
        .set('Authorization', `Bearer ${orgB.token}`);
      expect(resB.body).toHaveLength(1);
      expect(resB.body[0].name).toBe('Charlie');
    });

    it('returns 401 without authentication', async () => {
      const res = await ctx.request.get('/api/employees');
      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/employees ────────────────────────────────────────────────

  describe('POST /api/employees', () => {
    it('creates an employee with a server-generated ID', async () => {
      const org = await ctx.seedOrg('Create Org');

      const res = await ctx.request
        .post('/api/employees')
        .set('Authorization', `Bearer ${org.token}`)
        .send({
          name: 'New Hire',
          score: 85,
          role: 'Staff',
          profile: { employeeId: 'client-supplied-id' },
          metrics: { facialExpression: 80, verbalExpression: 85, greetingBehavior: 90 },
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Hire');
      // Server should have overwritten the client-supplied ID
      expect(res.body.profile.employeeId).toMatch(/^emp_/);
      expect(res.body.profile.employeeId).not.toBe('client-supplied-id');
    });

    it('returns 400 when profile.employeeId is missing', async () => {
      const org = await ctx.seedOrg('Bad Create Org');

      const res = await ctx.request
        .post('/api/employees')
        .set('Authorization', `Bearer ${org.token}`)
        .send({ name: 'No Profile', score: 50 });

      expect(res.status).toBe(400);
    });

    it('rejects non-admin users', async () => {
      const org = await ctx.seedOrg('Staff Org');
      // Create a staff-level token (not admin)
      const staffToken = ctx.createToken({
        id: 'usr_staff',
        organization_id: org.orgId,
        role: 'staff',
      });

      const res = await ctx.request
        .post('/api/employees')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          name: 'Unauthorized',
          score: 50,
          profile: { employeeId: 'x' },
        });

      expect(res.status).toBe(403);
    });

    it('prevents cross-tenant employee creation (employee is scoped to token org)', async () => {
      const orgA = await ctx.seedOrg('Cross A');
      const orgB = await ctx.seedOrg('Cross B');

      // Create employee using org A's token
      await ctx.request
        .post('/api/employees')
        .set('Authorization', `Bearer ${orgA.token}`)
        .send({
          name: 'OrgA Employee',
          score: 90,
          profile: { employeeId: 'x' },
        });

      // Org B should not see it
      const resB = await ctx.request
        .get('/api/employees')
        .set('Authorization', `Bearer ${orgB.token}`);
      expect(resB.body).toHaveLength(0);
    });
  });

  // ── DELETE /api/employees/:id ──────────────────────────────────────────

  describe('DELETE /api/employees/:id', () => {
    it('deletes an employee belonging to the org', async () => {
      const org = await ctx.seedOrg('Delete Org');
      const emp = await ctx.seedEmployee(org.orgId, { name: 'To Delete' });

      const res = await ctx.request
        .delete(`/api/employees/${emp.id}`)
        .set('Authorization', `Bearer ${org.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's actually gone
      const getRes = await ctx.request
        .get('/api/employees')
        .set('Authorization', `Bearer ${org.token}`);
      expect(getRes.body).toHaveLength(0);
    });

    it('returns 404 for non-existent employee', async () => {
      const org = await ctx.seedOrg('No Such Org');

      const res = await ctx.request
        .delete('/api/employees/emp_nonexistent')
        .set('Authorization', `Bearer ${org.token}`);

      expect(res.status).toBe(404);
    });

    it('prevents deleting another org\'s employee', async () => {
      const orgA = await ctx.seedOrg('Owner Org');
      const orgB = await ctx.seedOrg('Attacker Org');
      const emp = await ctx.seedEmployee(orgA.orgId, { name: 'Protected' });

      // Org B tries to delete Org A's employee
      const res = await ctx.request
        .delete(`/api/employees/${emp.id}`)
        .set('Authorization', `Bearer ${orgB.token}`);

      expect(res.status).toBe(404); // Not found (because org filter)

      // Verify it still exists for Org A
      const getRes = await ctx.request
        .get('/api/employees')
        .set('Authorization', `Bearer ${orgA.token}`);
      expect(getRes.body).toHaveLength(1);
    });

    it('rejects non-admin users', async () => {
      const org = await ctx.seedOrg('Admin Only Org');
      const emp = await ctx.seedEmployee(org.orgId, { name: 'Guarded' });

      const staffToken = ctx.createToken({
        id: 'usr_staff2',
        organization_id: org.orgId,
        role: 'staff',
      });

      const res = await ctx.request
        .delete(`/api/employees/${emp.id}`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
    });
  });
});
