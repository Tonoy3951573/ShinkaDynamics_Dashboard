import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ── Only run server-side integration tests ─────────────────────────────
    include: ['server/__tests__/**/*.test.js'],
    
    // Node environment — no jsdom, we're testing Express routes
    environment: 'node',
    
    // Make describe/it/expect available without imports
    globals: true,
    
    // Each test file gets its own in-memory SQLite DB, so parallel is safe
    fileParallelism: true,
    
    // 30s timeout — SQLite setup + HTTP round-trips need headroom
    testTimeout: 30_000,

    // Ensure JWT_SECRET is always available for test token generation
    env: {
      JWT_SECRET: 'test-secret-do-not-use-in-production',
      DATABASE_PATH: ':memory:',
      NODE_ENV: 'test',
    },
  },
});
