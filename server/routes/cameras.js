import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all cameras for the user's organization
router.get('/', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  
  db.all('SELECT data FROM cameras WHERE organization_id = ?', [orgId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    const cameras = rows.map(row => JSON.parse(row.data));
    res.json(cameras);
  });
});

// POST a new camera (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const orgId = req.user.organization_id;
  const newCamera = req.body;
  
  if (!newCamera.id) {
    return res.status(400).json({ error: 'Missing camera ID' });
  }
  
  const id = newCamera.id;
  const name = newCamera.name || 'Unnamed Camera';
  const type = newCamera.type || 'unknown';
  const status = newCamera.status || 'offline';
  const data = JSON.stringify(newCamera);

  // Check limits based on plan (basic implementation)
  db.get('SELECT plan FROM organizations WHERE id = ?', [orgId], (err, org) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    db.get('SELECT COUNT(*) as count FROM cameras WHERE organization_id = ?', [orgId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      const cameraCount = row.count;
      if (org.plan === 'free' && cameraCount >= 3) {
        return res.status(403).json({ error: 'Free plan limit reached (3 cameras). Please upgrade.' });
      }

      const stmt = db.prepare('INSERT INTO cameras (id, organization_id, name, type, status, data) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(id, orgId, name, type, status, data, function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json(newCamera);
      });
    });
  });
});

// DELETE a camera
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const orgId = req.user.organization_id;
  const cameraId = req.params.id;

  const stmt = db.prepare('DELETE FROM cameras WHERE id = ? AND organization_id = ?');
  stmt.run(cameraId, orgId, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Camera not found' });
    
    res.json({ success: true });
  });
});

export default router;
