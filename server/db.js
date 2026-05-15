import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'database.sqlite')

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message)
  } else {
    console.log('Connected to the SQLite database.')
  }
})

db.serialize(() => {
  // ── Enable foreign key enforcement (OFF by default in SQLite) ────────
  db.run('PRAGMA foreign_keys = ON')

  db.run(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT,
      plan TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
    )
  `, (err) => {
    if (!err) {
      // Safely attempt to add the column to existing tables (will error silently if it exists)
      db.run("ALTER TABLE users ADD COLUMN name TEXT", (alterErr) => {
        // Ignore error: "duplicate column name"
      });
    }
  })

  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      name TEXT,
      score INTEGER,
      data TEXT,
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS cameras (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      name TEXT,
      type TEXT,
      status TEXT,
      data TEXT,
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
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
    )
  `)

  // ── Performance indexes for tenant-scoped queries ─────────────────────
  db.run('CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_employees_org ON employees(organization_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_cameras_org ON cameras(organization_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(organization_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_alerts_org_status ON alerts(organization_id, status)')
})
