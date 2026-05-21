import express from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { authenticateToken, requireSuperUser } from '../middleware/auth.js';

const router = express.Router();

// ── 1. POST /api/reports (Submit issue report - Standard User & Admin) ──
router.post('/reports', authenticateToken, (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, category, and description are required' });
  }

  if (!['bug', 'stream_failure', 'other'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category. Must be one of: bug, stream_failure, other' });
  }

  const id = `rep_${crypto.randomUUID()}`;
  const orgId = req.user.organization_id;
  const reporterId = req.user.id;

  const stmt = db.prepare(`
    INSERT INTO system_reports (id, organization_id, reporter_id, title, description, category, status)
    VALUES (?, ?, ?, ?, ?, ?, 'open')
  `);

  stmt.run(id, orgId, reporterId, title, description, category, (err) => {
    if (err) {
      console.error('[reports] DB Insertion Error:', err);
      return res.status(500).json({ error: 'Failed to record system report in database' });
    }

    res.status(201).json({
      message: 'System report submitted successfully',
      report: { id, organization_id: orgId, reporter_id: reporterId, title, description, category, status: 'open' }
    });
  });

  stmt.finalize();
});

// Helper to query single row as Promise
const queryRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ── 2. GET /api/admin/metrics (Metrics dashboard - Super User Only) ──
router.get('/admin/metrics', authenticateToken, requireSuperUser, async (req, res) => {
  try {
    const [usersRow, orgsRow, camerasRow, reportsRow] = await Promise.all([
      queryRow('SELECT COUNT(*) AS count FROM users'),
      queryRow('SELECT COUNT(*) AS count FROM organizations'),
      queryRow('SELECT COUNT(*) AS count FROM cameras'),
      queryRow("SELECT COUNT(*) AS count FROM system_reports WHERE status = 'open'")
    ]);

    res.json({
      total_users: usersRow?.count || 0,
      total_organizations: orgsRow?.count || 0,
      active_streams: camerasRow?.count || 0,
      open_reports: reportsRow?.count || 0
    });
  } catch (err) {
    console.error('[admin-metrics] Aggregation query failed:', err);
    res.status(500).json({ error: 'Failed to aggregate system metrics' });
  }
});

// ── 3. GET /api/admin/reports (List all tickets with detailed user JOIN - Super User Only) ──
router.get('/admin/reports', authenticateToken, requireSuperUser, (req, res) => {
  db.all(`
    SELECT r.*, o.name AS organization_name, u.email AS reporter_email, u.name AS reporter_name
    FROM system_reports r
    LEFT JOIN organizations o ON r.organization_id = o.id
    LEFT JOIN users u ON r.reporter_id = u.id
    ORDER BY r.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('[reports] Failed to retrieve system reports:', err);
      return res.status(500).json({ error: 'Failed to query system reports database' });
    }

    res.json(rows);
  });
});

// ── 4. POST /api/admin/remote-action (Remote debugging actions - Super User Only) ──
router.post('/admin/remote-action', authenticateToken, requireSuperUser, (req, res) => {
  const { action, targetOrgId, targetCameraId } = req.body;

  if (!action || !targetOrgId) {
    return res.status(400).json({ error: 'Action and targetOrgId are required parameters' });
  }

  const io = req.app.get('io');
  if (!io) {
    return res.status(500).json({ error: 'Socket.IO system instance is not loaded' });
  }

  if (action === 'RESTART_STREAM') {
    // Send event directly to the tenant's room
    io.to(`org:${targetOrgId}`).emit('admin:force_restart', { cameraId: targetCameraId });
    return res.json({ message: `Successfully broadcast restart request for camera stream to org room ${targetOrgId}` });
  } 
  
  if (action === 'PURGE_ALERTS') {
    // 1. Purge alerts in DB
    db.run('DELETE FROM alerts WHERE organization_id = ?', [targetOrgId], (err) => {
      if (err) {
        console.error('[admin-action] Purge alerts failed:', err);
        return res.status(500).json({ error: 'Failed to purge tenant alerts' });
      }

      // 2. Broadcast state:refresh so the client resets active displays
      io.to(`org:${targetOrgId}`).emit('state:refresh');
      return res.json({ message: `Successfully purged alerts database and emitted client refreshes for org ${targetOrgId}` });
    });
    return;
  }

  res.status(400).json({ error: `Unsupported admin remote action: ${action}` });
});

export default router;
