import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { z } from 'zod';
import { db } from '../db.js';
import { config } from '../config.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── Zod Validation Schemas ───────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  orgName: z.string().min(1, 'Organization name is required').max(100),
  name: z.string().max(100).optional(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const profileSchema = z.object({
  name: z.string().max(100).nullable().optional(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

const orgSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100),
});

// ── Helper: parse Zod schema and return 400 on failure ───────────────────────
function validate(schema, body, res) {
  const result = schema.safeParse(body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return null;
  }
  return result.data;
}

// ── POST /signup ─────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const data = validate(signupSchema, req.body, res);
  if (!data) return;

  const { orgName, name, email, password } = data;

  try {
    const passwordHash = await bcrypt.hash(password, config.SALT_ROUNDS);
    
    // crypto.randomUUID() — zero collision risk, no timestamp leakage
    const orgId = `org_${crypto.randomUUID()}`;
    const userId = `usr_${crypto.randomUUID()}`;

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      const stmtOrg = db.prepare('INSERT INTO organizations (id, name, plan) VALUES (?, ?, ?)');
      stmtOrg.run(orgId, orgName, 'free', (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error creating organization' });
        }
      });

      const stmtUser = db.prepare('INSERT INTO users (id, organization_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)');
      stmtUser.run(userId, orgId, name || null, email, passwordHash, 'admin', (err) => {
        if (err) {
          db.run('ROLLBACK');
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }
        
        db.run('COMMIT', (err) => {
          if (err) return res.status(500).json({ error: 'Transaction commit failed' });
          
          const token = jwt.sign({ id: userId, organization_id: orgId, role: 'admin' }, config.JWT_SECRET, { expiresIn: '24h' });
          res.status(201).json({ token, user: { id: userId, name: name || null, email, role: 'admin', organization_id: orgId } });
        });
      });
      
      stmtOrg.finalize();
      stmtUser.finalize();
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /login ──────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const data = validate(loginSchema, req.body, res);
  if (!data) return;

  const { email, password } = data;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, organization_id: user.organization_id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      }
    });
  });
});

// ── GET /me ──────────────────────────────────────────────────────────────────
// Uses the shared authenticateToken middleware (no local duplicate)
router.get('/me', authenticateToken, (req, res) => {
  db.get(
    `SELECT u.id, u.name as user_name, u.email, u.role, u.organization_id, o.name as org_name, o.plan 
     FROM users u 
     JOIN organizations o ON u.organization_id = o.id 
     WHERE u.id = ?`,
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'User not found' });
      
      res.json({
        user: {
          id: row.id,
          name: row.user_name,
          email: row.email,
          role: row.role,
          organization_id: row.organization_id
        },
        organization: {
          id: row.organization_id,
          name: row.org_name,
          plan: row.plan
        }
      });
    }
  );
});

// ── PUT /profile ─────────────────────────────────────────────────────────────
router.put('/profile', authenticateToken, async (req, res) => {
  const data = validate(profileSchema, req.body, res);
  if (!data) return;

  const { name, email, password } = data;

  try {
    if (password) {
      const passwordHash = await bcrypt.hash(password, config.SALT_ROUNDS);
      db.run(
        'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
        [name || null, email, passwordHash, req.user.id],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(409).json({ error: 'Email already in use' });
            }
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ success: true, message: 'Profile updated' });
        }
      );
    } else {
      db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name || null, email, req.user.id],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(409).json({ error: 'Email already in use' });
            }
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ success: true, message: 'Profile updated' });
        }
      );
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /organization ────────────────────────────────────────────────────────
router.put('/organization', authenticateToken, (req, res) => {
  const data = validate(orgSchema, req.body, res);
  if (!data) return;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update organization settings' });
  }

  db.run(
    'UPDATE organizations SET name = ? WHERE id = ?',
    [data.name, req.user.organization_id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true, message: 'Organization updated' });
    }
  );
});

export default router;
