// ── config.js MUST be imported first — it loads dotenv and validates env vars ─
import { config } from './config.js'

import express from 'express'
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import employeeRoutes from './routes/employees.js'
import cameraRoutes from './routes/cameras.js'
import analyticsRoutes from './routes/analytics.js'
import alertRoutes from './routes/alerts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

// ── Security Headers ─────────────────────────────────────────────────────────
// Helmet sets strict HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
// contentSecurityPolicy is disabled because it conflicts with Socket.IO WebSocket
// upgrades and inline styles used by the React frontend.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

// ── CORS ─────────────────────────────────────────────────────────────────────
// In production, restrict to the actual deployed origin.
// In development, allow the Vite dev server origin.
app.use(cors({
  origin: config.NODE_ENV === 'production'
    ? config.CORS_ORIGIN
    : [config.CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

// ── Body Parsing with Size Limit ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))

// ── Rate Limiting ────────────────────────────────────────────────────────────
// General API limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
})

// Auth limiter: 5 requests per 15 minutes per IP (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
})

app.use('/api', generalLimiter)

// ── HTTP Server + Socket.IO ──────────────────────────────────────────────────
const httpServer = createServer(app)

const io = new SocketIO(httpServer, {
  cors: {
    origin: config.NODE_ENV === 'production'
      ? config.CORS_ORIGIN
      : [config.CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

// Authenticate WebSocket connections using the same JWT as the REST API
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Access token missing'))

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET)
    socket.user = decoded
    next()
  } catch (err) {
    next(new Error('Invalid or expired token'))
  }
})

io.on('connection', (socket) => {
  const orgId = socket.user.organization_id
  console.log(`[ws] client connected — user: ${socket.user.id}, org: ${orgId}`)

  // Join an organization-scoped room for multi-tenant broadcasting
  socket.join(`org:${orgId}`)

  socket.on('disconnect', (reason) => {
    console.log(`[ws] client disconnected — reason: ${reason}`)
  })
})

// Make `io` accessible to route handlers so they can broadcast events
app.set('io', io)

// ── Health Check (no auth, no rate limit) ────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Modular API Routes ───────────────────────────────────────────────────────
// Auth routes get the stricter rate limiter
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/cameras', cameraRoutes)
app.use('/api/alerts', alertRoutes)

// ── Production Static File Serving ───────────────────────────────────────────
// In production, serve the Vite-built frontend from dist/.
// The catch-all must come AFTER all API routes so /api/* requests aren't swallowed.
if (config.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ── Error Handling Middleware ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.path}:`, err.stack || err.message)
  res.status(500).json({ error: 'Internal server error' })
})

httpServer.listen(config.PORT, () => {
  console.log(`[server] running on http://localhost:${config.PORT} (${config.NODE_ENV})`)
  console.log(`[server] WebSocket listening on the same port`)
  if (config.NODE_ENV === 'production') {
    console.log(`[server] Serving static files from dist/`)
  }
})

export { io }
