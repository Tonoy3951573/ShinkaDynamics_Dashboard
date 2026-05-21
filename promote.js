import 'dotenv/config'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcrypt'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'server', 'database.sqlite')

console.log(`Connecting to SQLite database at: ${dbPath}`)

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message)
    process.exit(1)
  }

  const email = 'superadmin@shinkadynamics.com'
  const password = 'admin123'
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  db.serialize(() => {
    // 1. Ensure organizations exists and has org-1
    db.run(
      "INSERT OR IGNORE INTO organizations (id, name, plan) VALUES ('org-1', 'Shinka Dynamics', 'enterprise')",
      [],
      (err) => {
        if (err) console.error('Failed to insert default organization:', err.message)
      }
    )

    // 2. Insert or update the Super User account
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('Error querying users table:', err.message)
        process.exit(1)
      }

      if (row) {
        // User exists, update their role to super_user
        db.run(
          "UPDATE users SET role = 'super_user', password_hash = ? WHERE email = ?",
          [passwordHash, email],
          (updateErr) => {
            if (updateErr) {
              console.error('Failed to promote user:', updateErr.message)
            } else {
              console.log(`\nSUCCESS: Existing user ${email} promoted to super_user role with password ${password}!`)
            }
            db.close()
          }
        )
      } else {
        // User doesn't exist, create them
        const superUserId = 'super-user-1'
        db.run(
          "INSERT INTO users (id, organization_id, name, email, password_hash, role) VALUES (?, 'org-1', 'Super Admin', ?, ?, 'super_user')",
          [superUserId, email, passwordHash],
          (insertErr) => {
            if (insertErr) {
              console.error('Failed to insert super user:', insertErr.message)
            } else {
              console.log(`\nSUCCESS: Created Super User account!`)
              console.log(`Email: ${email}`)
              console.log(`Password: ${password}`)
            }
            db.close()
          }
        )
      }
    })
  })
})
