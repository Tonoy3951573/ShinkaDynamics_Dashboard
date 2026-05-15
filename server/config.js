// ── Centralized Environment Configuration ───────────────────────────────────
// This module is the single source of truth for all environment variables.
// It MUST be imported before any other server module that needs config values.
// Importing this module triggers dotenv to load `.env` as a side effect.

import 'dotenv/config';

/**
 * Reads an environment variable or crashes the process if it's missing.
 * This guarantees the server never runs in an insecure state (e.g. with a
 * hardcoded fallback JWT secret).
 */
function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`\n  FATAL: Missing required environment variable: ${key}`);
    console.error(`  Copy .env.example to .env and fill in the values.\n`);
    process.exit(1);
  }
  return value;
}

export const config = {
  // ── Required (no fallback — crash if missing) ──────────────────────────
  JWT_SECRET: requireEnv('JWT_SECRET'),

  // ── Optional (safe development defaults) ───────────────────────────────
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),
};
