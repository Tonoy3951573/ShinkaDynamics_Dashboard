import express from 'express'
import { db } from '../db.js'
import { authenticateToken, requireSuperUser } from '../middleware/auth.js'

const router = express.Router()

// Helper to query single row as Promise
const queryRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ── 1. GET /api/admin/metrics (Global System Metrics) ──
router.get('/admin/metrics', authenticateToken, requireSuperUser, async (req, res) => {
  try {
    const [orgsRow, usersRow, onlineRow, offlineRow] = await Promise.all([
      queryRow('SELECT COUNT(*) AS count FROM organizations'),
      queryRow('SELECT COUNT(*) AS count FROM users'),
      queryRow("SELECT COUNT(*) AS count FROM cameras WHERE status = 'online'"),
      queryRow("SELECT COUNT(*) AS count FROM cameras WHERE status = 'offline' OR status != 'online' OR status IS NULL")
    ]);

    res.json({
      totalOrganizations: orgsRow?.count || 0,
      totalUsers: usersRow?.count || 0,
      onlineFeeds: onlineRow?.count || 0,
      offlineFeeds: offlineRow?.count || 0
    });
  } catch (err) {
    console.error('[admin-api] Metrics aggregation failed:', err);
    res.status(500).json({ error: 'Failed to aggregate global metrics' });
  }
});

// ── 2. GET /api/admin/tenants (Multi-tenant Health Audit) ──
router.get('/admin/tenants', authenticateToken, requireSuperUser, (req, res) => {
  db.all(`
    SELECT 
      o.id, 
      o.name, 
      o.plan,
      (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id) AS user_count,
      (SELECT COUNT(*) FROM cameras c WHERE c.organization_id = o.id AND (c.status = 'offline' OR c.status != 'online')) AS offline_cameras_count,
      (SELECT COUNT(*) FROM system_reports r WHERE r.organization_id = o.id AND r.status = 'open') AS open_reports_count
    FROM organizations o
    ORDER BY o.name ASC
  `, [], (err, rows) => {
    if (err) {
      console.error('[admin-api] Tenants list loading failed:', err);
      return res.status(500).json({ error: 'Failed to query tenant organizations health' });
    }

    res.json(rows);
  });
});

// ── 3. GET /api/admin/users (All onboarded users) ──
router.get('/admin/users', authenticateToken, requireSuperUser, (req, res) => {
  db.all(`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role, 
      u.created_at, 
      u.organization_id,
      o.name AS organization_name,
      o.plan AS organization_plan
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    ORDER BY u.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('[admin-api] Users query failed:', err);
      return res.status(500).json({ error: 'Failed to query users list' });
    }
    res.json(rows);
  });
});

// ── 4. POST /api/admin/users/:userId/suspend (Suspend user) ──
router.post('/admin/users/:userId/suspend', authenticateToken, requireSuperUser, (req, res) => {
  const { userId } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) {
      console.error('[admin-api] User suspension failed:', err);
      return res.status(500).json({ error: 'Failed to suspend user' });
    }
    res.json({ message: `Successfully suspended user ${userId}` });
  });
});

export default router;
