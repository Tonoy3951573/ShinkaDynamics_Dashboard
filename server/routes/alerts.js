import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { parsePagination, paginatedQuery } from '../utils/pagination.js';

const router = express.Router();

// GET all alerts for the user's organization, with optional filters (paginated)
router.get('/', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const { status, severity, category } = req.query;
  const { page, limit } = parsePagination(req);

  let whereClause = 'WHERE organization_id = ?';
  const params = [orgId];

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }
  if (severity) {
    whereClause += ' AND severity = ?';
    params.push(severity);
  }
  if (category) {
    whereClause += ' AND category = ?';
    params.push(category);
  }

  paginatedQuery(db, {
    countSql: `SELECT COUNT(*) as total FROM alerts ${whereClause}`,
    dataSql: `SELECT * FROM alerts ${whereClause}`,
    params,
    page,
    limit,
    orderBy: 'ORDER BY created_at DESC',
  })
    .then(result => res.json(result))
    .catch(() => res.status(500).json({ error: 'Database error' }));
});

// PATCH acknowledge an alert
router.patch('/:id/acknowledge', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const alertId = req.params.id;

  db.run(
    'UPDATE alerts SET status = ? WHERE id = ? AND organization_id = ?',
    ['acknowledged', alertId, orgId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json({ id: alertId, status: 'acknowledged' });
    }
  );
});

// PATCH resolve an alert
router.patch('/:id/resolve', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const alertId = req.params.id;

  db.run(
    'UPDATE alerts SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ? AND organization_id = ?',
    ['resolved', alertId, orgId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json({ id: alertId, status: 'resolved' });
    }
  );
});

// PATCH dismiss an alert
router.patch('/:id/dismiss', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const alertId = req.params.id;

  db.run(
    'UPDATE alerts SET status = ? WHERE id = ? AND organization_id = ?',
    ['dismissed', alertId, orgId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json({ id: alertId, status: 'dismissed' });
    }
  );
});

// DELETE an alert permanently
router.delete('/:id', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const alertId = req.params.id;

  db.run(
    'DELETE FROM alerts WHERE id = ? AND organization_id = ?',
    [alertId, orgId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json({ id: alertId, deleted: true });
    }
  );
});

export default router;
