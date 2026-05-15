import 'dotenv/config'
import { db } from './db.js'
import bcrypt from 'bcrypt'

// ── Safety guard: never allow seed to run in production ──────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('FATAL: seed.js cannot run in production. This would destroy all data.');
  process.exit(1);
}

async function seed() {
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);

  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS alerts')
    db.run('DROP TABLE IF EXISTS cameras')
    db.run('DROP TABLE IF EXISTS employees')
    db.run('DROP TABLE IF EXISTS users')
    db.run('DROP TABLE IF EXISTS organizations')
    db.run('DROP TABLE IF EXISTS shops')
    
    // ── Schema ──────────────────────────────────────────────────────────
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
    `)

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

    console.log('Creating database schema...')
    
    // ── Default admin organization & user ────────────────────────────────
    const orgId = 'org-1'
    const stmtOrg = db.prepare('INSERT INTO organizations (id, name, plan) VALUES (?, ?, ?)')
    stmtOrg.run(orgId, 'Shinka Dynamics', 'enterprise')
    stmtOrg.finalize()

    const userId = 'user-1'
    const stmtUser = db.prepare('INSERT INTO users (id, organization_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)')
    stmtUser.run(userId, orgId, 'Admin', 'admin@shinkadynamics.com', adminPassword, 'admin')
    stmtUser.finalize(() => {
      console.log('Database ready.')
      console.log('Login: admin@shinkadynamics.com / admin123')
      db.close()
    })
  })
}

seed().catch(console.error);
