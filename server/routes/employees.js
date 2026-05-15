import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { parsePagination, paginatedQuery } from '../utils/pagination.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'employees');
fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer for photo storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const employeeId = req.body.employeeId || `unknown-${Date.now()}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${employeeId}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

const router = express.Router();

// GET all employees for the user's organization (paginated)
router.get('/', authenticateToken, (req, res) => {
  const orgId = req.user.organization_id;
  const { page, limit } = parsePagination(req);

  paginatedQuery(db, {
    countSql: 'SELECT COUNT(*) as total FROM employees WHERE organization_id = ?',
    dataSql: 'SELECT data FROM employees WHERE organization_id = ?',
    params: [orgId],
    page,
    limit,
  })
    .then(result => {
      // Parse JSON data column for each row
      result.data = result.data.map(row => JSON.parse(row.data));
      res.json(result);
    })
    .catch(err => {
      console.error('[db] GET /employees:', err.message);
      res.status(500).json({ error: 'Database error' });
    });
});

// POST upload employee photo
router.post('/upload-photo', authenticateToken, requireAdmin, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo file provided' });
  }

  const photoUrl = `/api/employees/photos/${req.file.filename}`;
  res.json({ photoUrl, filename: req.file.filename });
});

// GET serve employee photos (authenticated + path traversal protection)
router.get('/photos/:filename', authenticateToken, (req, res) => {
  // Sanitize: path.basename strips directory traversal sequences
  // e.g. '../../etc/passwd' → 'passwd'
  const sanitized = path.basename(req.params.filename);
  const filePath = path.resolve(uploadsDir, sanitized);

  // Defense in depth: verify resolved path stays within uploads directory
  if (!filePath.startsWith(path.resolve(uploadsDir))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  
  res.sendFile(filePath);
});

// POST a new employee (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const orgId = req.user.organization_id;
  const newEmployee = req.body;
  
  if (!newEmployee.profile || !newEmployee.profile.employeeId) {
    return res.status(400).json({ error: 'Missing employeeId' });
  }
  
  // Server generates the primary key — client-supplied employeeId is kept
  // in the JSON data blob as a display/reference ID only.
  const id = `emp_${crypto.randomUUID()}`;
  const name = newEmployee.name;
  const score = newEmployee.score;

  // Stamp the server-generated ID into the data so the frontend can reference it
  newEmployee.profile.employeeId = id;
  const data = JSON.stringify(newEmployee);

  const stmt = db.prepare('INSERT INTO employees (id, organization_id, name, score, data) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, orgId, name, score, data, function(err) {
    if (err) {
      console.error('[db] POST /employees:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Employee ID already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json(newEmployee);
  });
});

// DELETE an employee (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const orgId = req.user.organization_id;
  const employeeId = req.params.id;

  // Clean up any uploaded photo
  const photoExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  for (const ext of photoExtensions) {
    const photoPath = path.join(uploadsDir, `${employeeId}${ext}`);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
  }

  db.run(
    'DELETE FROM employees WHERE id = ? AND organization_id = ?',
    [employeeId, orgId],
    function (err) {
      if (err) {
        console.error('[db] DELETE /employees:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json({ success: true, id: employeeId });
    }
  );
});

export default router;
