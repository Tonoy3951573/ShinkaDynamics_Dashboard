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
    
    // Cleanup registry
    webcamHeartbeats.delete(cameraId);

    res.json({ success: true });
  });
});

// GET stream info and quality indicators
router.get('/:id/stream', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const cameraId = req.params.id;

  db.get('SELECT * FROM cameras WHERE id = ? AND organization_id = ?', [cameraId, orgId], (err, camera) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!camera) return res.status(404).json({ error: 'Camera not found' });

    const data = JSON.parse(camera.data);
    const streamUrl = camera.type === 'webcam' ? 'webcam' : (data.url || '');

    res.json({
      id: camera.id,
      name: camera.name,
      type: camera.type,
      status: camera.status,
      streamUrl,
      diagnostics: {
        latencyMs: camera.status === 'online' ? Math.floor(Math.random() * 45) + 15 : 0,
        jitterMs: camera.status === 'online' ? Math.floor(Math.random() * 5) + 1 : 0,
        fps: camera.status === 'online' ? 30 : 0
      }
    });
  });
});

// ── In-Memory Webcam Heartbeat Registry ───────────────────────────────
const webcamHeartbeats = new Map(); // cameraId -> timestamp

export function handleWebcamHeartbeat(cameraId) {
  webcamHeartbeats.set(cameraId, Date.now());
}

// ── Background Camera Health Checker ─────────────────────────────────
export function startCameraHealthCheck(io) {
  console.log('[health-check] Starting camera surveillance health checker (15s interval)...');

  setInterval(async () => {
    db.all('SELECT * FROM cameras', [], async (err, rows) => {
      if (err || !rows) return;

      for (const camera of rows) {
        const data = JSON.parse(camera.data);
        let isOnline = false;

        if (camera.type === 'webcam') {
          // Check if heartbeat exists and is fresh (< 12 seconds)
          const lastSeen = webcamHeartbeats.get(camera.id);
          isOnline = !!(lastSeen && (Date.now() - lastSeen < 12000));
        } else if (camera.type === 'hls' && data.url) {
          // active network ping
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            
            const response = await fetch(data.url, { 
              method: 'HEAD', 
              signal: controller.signal 
            }).catch(() => null);

            clearTimeout(timeoutId);
            isOnline = !!(response && response.ok);
          } catch (e) {
            isOnline = false;
          }
        }

        const targetStatus = isOnline ? 'online' : 'offline';

        if (camera.status !== targetStatus) {
          db.run('UPDATE cameras SET status = ? WHERE id = ?', [targetStatus, camera.id], (updateErr) => {
            if (!updateErr) {
              console.log(`[health-check] Camera ${camera.id} (${camera.name}) changed state to ${targetStatus}`);
              
              // Broadcast state changes globally or in organization room
              io.to(`org:${camera.organization_id}`).emit(isOnline ? 'camera:online' : 'camera:offline', {
                cameraId: camera.id,
                name: camera.name,
                type: camera.type,
                status: targetStatus
              });
            }
          });
        }
      }
    });
  }, 15000);
}

export default router;

