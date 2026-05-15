// ── Test App Factory ─────────────────────────────────────────────────────────
// Creates a fully isolated Express + in-memory SQLite instance for integration
// testing. The production database.sqlite is NEVER touched.
//
// Usage in a test file:
//   const { app, db, createToken, seedOrg, cleanup } = await createTestApp();
//   afterAll(() => cleanup());

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import sqlite3 from 'sqlite3';
import supertest from 'supertest';

// ── Constants ────────────────────────────────────────────────────────────────
const TEST_SECRET = process.env.JWT_SECRET || 'test-secret-do-not-use-in-production';
const TEST_SALT_ROUNDS = 4; // Fast hashing for tests (production uses 10)

// ── Schema DDL (mirrors server/db.js exactly) ────────────────────────────────
const SCHEMA_SQL = [
  'PRAGMA foreign_keys = ON',
  `CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT,
    plan TEXT DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'staff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
  )`,
  `CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    name TEXT,
    score INTEGER,
    data TEXT,
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
  )`,
  `CREATE TABLE IF NOT EXISTS cameras (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    name TEXT,
    type TEXT,
    status TEXT,
    data TEXT,
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
  )`,
  `CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    title TEXT,
    detail TEXT,
    severity TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'behavior',
    source TEXT,
    employee_name TEXT,
    station TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
  )`,
  // Indexes
  'CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id)',
  'CREATE INDEX IF NOT EXISTS idx_employees_org ON employees(organization_id)',
  'CREATE INDEX IF NOT EXISTS idx_cameras_org ON cameras(organization_id)',
  'CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(organization_id)',
  'CREATE INDEX IF NOT EXISTS idx_alerts_org_status ON alerts(organization_id, status)',
];

// ── Promisified SQLite helpers ───────────────────────────────────────────────
function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ── Auth Middleware (bound to test secret) ────────────────────────────────────
function createAuthMiddleware() {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token missing' });

    jwt.verify(token, TEST_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      req.user = decoded;
      next();
    });
  };
}

function createRequireAdmin() {
  return (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
  };
}

// ── Route Builders (use test db, not production db.js) ───────────────────────
function buildAuthRoutes(testDb) {
  const router = express.Router();
  const authenticateToken = createAuthMiddleware();

  // POST /signup
  router.post('/signup', async (req, res) => {
    const { orgName, name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Invalid email format' });

    try {
      const passwordHash = await bcrypt.hash(password, TEST_SALT_ROUNDS);
      const orgId = `org_${crypto.randomUUID()}`;
      const userId = `usr_${crypto.randomUUID()}`;

      await dbRun(testDb, 'INSERT INTO organizations (id, name, plan) VALUES (?, ?, ?)', [orgId, orgName || 'Test Org', 'free']);
      await dbRun(testDb, 'INSERT INTO users (id, organization_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [userId, orgId, name || null, email, passwordHash, 'admin']);

      const token = jwt.sign({ id: userId, organization_id: orgId, role: 'admin' }, TEST_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: userId, name: name || null, email, role: 'admin', organization_id: orgId } });
    } catch (err) {
      if (err.message?.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Invalid email format' });

    try {
      const user = await dbGet(testDb, 'SELECT * FROM users WHERE email = ?', [email]);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, organization_id: user.organization_id, role: user.role }, TEST_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, organization_id: user.organization_id } });
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /me
  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const row = await dbGet(testDb,
        `SELECT u.id, u.name as user_name, u.email, u.role, u.organization_id, o.name as org_name, o.plan 
         FROM users u JOIN organizations o ON u.organization_id = o.id WHERE u.id = ?`,
        [req.user.id]
      );
      if (!row) return res.status(404).json({ error: 'User not found' });
      res.json({
        user: { id: row.id, name: row.user_name, email: row.email, role: row.role, organization_id: row.organization_id },
        organization: { id: row.organization_id, name: row.org_name, plan: row.plan },
      });
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
}

function buildEmployeeRoutes(testDb) {
  const router = express.Router();
  const authenticateToken = createAuthMiddleware();
  const requireAdmin = createRequireAdmin();

  // GET /
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const rows = await dbAll(testDb, 'SELECT data FROM employees WHERE organization_id = ?', [req.user.organization_id]);
      res.json(rows.map(r => JSON.parse(r.data)));
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // POST /
  router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    const orgId = req.user.organization_id;
    const newEmployee = req.body;
    if (!newEmployee.profile?.employeeId) return res.status(400).json({ error: 'Missing employeeId' });

    const id = `emp_${crypto.randomUUID()}`;
    newEmployee.profile.employeeId = id;
    const data = JSON.stringify(newEmployee);

    try {
      await dbRun(testDb, 'INSERT INTO employees (id, organization_id, name, score, data) VALUES (?, ?, ?, ?, ?)',
        [id, orgId, newEmployee.name, newEmployee.score, data]);
      res.status(201).json(newEmployee);
    } catch (err) {
      if (err.message?.includes('UNIQUE constraint failed')) return res.status(409).json({ error: 'Employee ID already exists' });
      res.status(500).json({ error: 'Database error' });
    }
  });

  // DELETE /:id
  router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = await dbRun(testDb, 'DELETE FROM employees WHERE id = ? AND organization_id = ?', [req.params.id, req.user.organization_id]);
      if (result.changes === 0) return res.status(404).json({ error: 'Employee not found' });
      res.json({ success: true, id: req.params.id });
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
}

function buildAlertRoutes(testDb) {
  const router = express.Router();
  const authenticateToken = createAuthMiddleware();

  // GET /
  router.get('/', authenticateToken, async (req, res) => {
    const orgId = req.user.organization_id;
    const { status, severity, category } = req.query;
    let query = 'SELECT * FROM alerts WHERE organization_id = ?';
    const params = [orgId];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (severity) { query += ' AND severity = ?'; params.push(severity); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY created_at DESC';

    try {
      const rows = await dbAll(testDb, query, params);
      res.json(rows);
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // PATCH /:id/acknowledge
  router.patch('/:id/acknowledge', authenticateToken, async (req, res) => {
    try {
      const result = await dbRun(testDb, 'UPDATE alerts SET status = ? WHERE id = ? AND organization_id = ?', ['acknowledged', req.params.id, req.user.organization_id]);
      if (result.changes === 0) return res.status(404).json({ error: 'Alert not found' });
      res.json({ id: req.params.id, status: 'acknowledged' });
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
}

// ── Factory Function ─────────────────────────────────────────────────────────
/**
 * Creates a fully isolated test environment with:
 * - In-memory SQLite database (production DB never touched)
 * - Express app with the same route structure as production
 * - JWT token generation helpers
 * - Org/user seeding helpers
 *
 * @returns {Promise<{app, db, request, createToken, seedOrg, seedEmployee, seedAlert, cleanup}>}
 */
export async function createTestApp() {
  // 1. Create in-memory database
  const testDb = new sqlite3.Database(':memory:');

  // 2. Run schema (serialized to ensure order)
  await new Promise((resolve, reject) => {
    testDb.serialize(() => {
      for (const sql of SCHEMA_SQL) {
        testDb.run(sql);
      }
      // Final no-op to ensure all previous statements complete
      testDb.run('SELECT 1', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  // 3. Build Express app with test middleware + routes
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/auth', buildAuthRoutes(testDb));
  app.use('/api/employees', buildEmployeeRoutes(testDb));
  app.use('/api/alerts', buildAlertRoutes(testDb));

  // 4. Error handler
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
  });

  // 5. Helper: generate a JWT for any payload
  function createToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, TEST_SECRET, { expiresIn });
  }

  // 6. Helper: seed an organization + admin user, return { orgId, userId, token, email }
  async function seedOrg(name = 'Test Org', email = null) {
    const orgId = `org_${crypto.randomUUID()}`;
    const userId = `usr_${crypto.randomUUID()}`;
    const userEmail = email || `admin-${crypto.randomUUID().slice(0, 8)}@test.com`;
    const passwordHash = await bcrypt.hash('TestPass123', TEST_SALT_ROUNDS);

    await dbRun(testDb, 'INSERT INTO organizations (id, name, plan) VALUES (?, ?, ?)', [orgId, name, 'free']);
    await dbRun(testDb, 'INSERT INTO users (id, organization_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, orgId, 'Test Admin', userEmail, passwordHash, 'admin']);

    const token = createToken({ id: userId, organization_id: orgId, role: 'admin' });
    return { orgId, userId, token, email: userEmail };
  }

  // 7. Helper: seed an employee into a specific org
  async function seedEmployee(orgId, overrides = {}) {
    const id = `emp_${crypto.randomUUID()}`;
    const name = overrides.name || 'Test Employee';
    const score = overrides.score ?? 85;
    const employeeData = {
      name,
      score,
      role: overrides.role || 'Staff',
      profile: { employeeId: id },
      metrics: overrides.metrics || { facialExpression: 80, verbalExpression: 85, greetingBehavior: 90 },
      ...overrides,
    };
    const data = JSON.stringify(employeeData);

    await dbRun(testDb, 'INSERT INTO employees (id, organization_id, name, score, data) VALUES (?, ?, ?, ?, ?)',
      [id, orgId, name, score, data]);
    return { id, ...employeeData };
  }

  // 8. Helper: seed an alert into a specific org
  async function seedAlert(orgId, overrides = {}) {
    const id = `alert_${crypto.randomUUID()}`;
    const alert = {
      id,
      organization_id: orgId,
      title: overrides.title || 'Test Alert',
      detail: overrides.detail || 'Test detail',
      severity: overrides.severity || 'medium',
      category: overrides.category || 'behavior',
      source: overrides.source || 'test',
      employee_name: overrides.employee_name || null,
      station: overrides.station || null,
      status: overrides.status || 'active',
    };

    await dbRun(testDb,
      'INSERT INTO alerts (id, organization_id, title, detail, severity, category, source, employee_name, station, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [alert.id, alert.organization_id, alert.title, alert.detail, alert.severity, alert.category, alert.source, alert.employee_name, alert.station, alert.status]
    );
    return alert;
  }

  // 9. Cleanup — close the in-memory DB
  function cleanup() {
    return new Promise((resolve) => {
      testDb.close(resolve);
    });
  }

  return {
    app,
    db: testDb,
    request: supertest(app),
    createToken,
    seedOrg,
    seedEmployee,
    seedAlert,
    cleanup,
    // Expose promisified helpers for direct DB assertions in tests
    dbRun: (sql, params) => dbRun(testDb, sql, params),
    dbGet: (sql, params) => dbGet(testDb, sql, params),
    dbAll: (sql, params) => dbAll(testDb, sql, params),
  };
}
