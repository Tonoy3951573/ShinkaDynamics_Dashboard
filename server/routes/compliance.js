import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET compliance settings and logs
router.get('/', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;

  // Retrieve or create settings
  db.get('SELECT * FROM compliance_settings WHERE organization_id = ?', [orgId], (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error retrieving settings' });
    }

    const deliverSettings = (currSettings) => {
      // Get all audit logs
      db.all(
        'SELECT * FROM compliance_audits WHERE organization_id = ? ORDER BY timestamp DESC LIMIT 100',
        [orgId],
        (err, logs) => {
          if (err) {
            return res.status(500).json({ error: 'Database error retrieving logs' });
          }
          res.json({
            settings: {
              consentActive: currSettings.consent_active === 1,
              supervisorGate: currSettings.supervisor_gate === 1,
              audioRecording: currSettings.audio_recording === 1,
              smileSensitivity: currSettings.smile_sensitivity,
              pitchThreshold: currSettings.pitch_threshold,
              retentionDays: currSettings.retention_days
            },
            logs: logs.map(l => ({
              id: l.id,
              actor: l.actor,
              action: l.action,
              target: l.target,
              timestamp: l.timestamp,
              status: l.status
            }))
          });
        }
      );
    };

    if (!settings) {
      // Insert default settings
      db.run(
        `INSERT INTO compliance_settings 
         (organization_id, consent_active, supervisor_gate, audio_recording, smile_sensitivity, pitch_threshold, retention_days)
         VALUES (?, 1, 1, 0, 70, 65, 30)`,
        [orgId],
        function(insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: 'Failed to create default settings' });
          }
          deliverSettings({
            consent_active: 1,
            supervisor_gate: 1,
            audio_recording: 0,
            smile_sensitivity: 70,
            pitch_threshold: 65,
            retention_days: 30
          });
        }
      );
    } else {
      deliverSettings(settings);
    }
  });
});

// POST update compliance settings
router.post('/settings', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const { consentActive, supervisorGate, audioRecording, smileSensitivity, pitchThreshold, retentionDays } = req.body;

  db.run(
    `UPDATE compliance_settings
     SET consent_active = ?, supervisor_gate = ?, audio_recording = ?, 
         smile_sensitivity = ?, pitch_threshold = ?, retention_days = ?
     WHERE organization_id = ?`,
    [
      consentActive ? 1 : 0,
      supervisorGate ? 1 : 0,
      audioRecording ? 1 : 0,
      smileSensitivity || 70,
      pitchThreshold || 65,
      retentionDays || 30,
      orgId
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating settings' });
      }
      res.json({ message: 'Settings updated successfully' });
    }
  );
});

// POST append an audit log
router.post('/audit', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const { actor, action, target } = req.body;

  if (!actor || !action || !target) {
    return res.status(400).json({ error: 'Missing log fields' });
  }

  const id = `aud-${Date.now()}`;
  db.run(
    `INSERT INTO compliance_audits (id, organization_id, actor, action, target, timestamp, status)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'Success')`,
    [id, orgId, actor, action, target],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error logging action' });
      }
      res.json({ id, status: 'Success' });
    }
  );
});

// POST manual data purge based on retention setting
router.post('/purge', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const { retentionDays } = req.body;

  const days = retentionDays || 30;
  
  // Calculate date cut-off
  const cutoffDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * days).toISOString();

  // Delete alerts older than cut-off date
  db.run(
    'DELETE FROM alerts WHERE organization_id = ? AND created_at < ?',
    [orgId, cutoffDate],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error purging alerts' });
      }

      // Add a dynamic audit log
      const auditId = `aud-${Date.now()}`;
      db.run(
        `INSERT INTO compliance_audits (id, organization_id, actor, action, target, timestamp, status)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'Success')`,
        [
          auditId,
          orgId,
          req.user.name || 'Admin',
          `Manual data purge request completed (purged alerts older than ${days} days)`,
          `Alerts prior to ${cutoffDate.slice(0, 10)}`
        ],
        function(auditErr) {
          if (auditErr) {
            console.error('Failed to log purge action:', auditErr);
          }
          res.json({ message: 'Historical surveillance data purged successfully', deletedCount: this.changes });
        }
      );
    }
  );
});

export default router;
