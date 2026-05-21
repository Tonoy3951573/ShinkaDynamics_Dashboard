# Shinka Dynamics AI Surveillance System Architecture Context

This document provides a highly detailed full-stack architecture specification of the Shinka Dynamics React + Vite + Node/Express AI Surveillance Dashboard. It is designed to serve as a comprehensive contextual document for Gemini or any other LLM assistant to understand the complete codebase state.

---

## 1. Core Architecture Overview
The platform is built as a highly responsive, multi-tenant AI behavior surveillance and camera monitoring platform using a robust **React + Vite** frontend, a performance-optimized **Express backend**, **SQLite** database, **Socket.IO** for 60 FPS real-time coordinate streaming, and **HLS.js** for video feeds.

### Global Stream Constraints
* **Supported Stream Types**: 
  1. **Webcam** (`webcam`): Captures local USB or integrated system camera inputs.
  2. **HLS** (`hls`): Handles high-reliability `.m3u8` video streams.
* **Purged Formats**: All broken or legacy formats (**MJPEG**, **ESP32**, **CCTV raw IP fallbacks**) have been **completely removed** from frontend modal triggers and backend verification layers to eliminate stream failures and system instability.

---

## 2. Database Schema (SQLite)
The database structure (`server/db.js`) is optimized with indexes to handle multi-tenant isolation (`organization_id` scopes):

```sql
-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT,
  plan TEXT DEFAULT 'free',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users & Roles
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'staff',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- Employees & Behavior Metrics
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT,
  score INTEGER,
  data TEXT, -- JSON block detailing greeting indices, polite tone, facial expressions
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- Surveillance Camera Nodes
CREATE TABLE IF NOT EXISTS cameras (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT,
  type TEXT, -- 'webcam' or 'hls'
  status TEXT, -- 'online' or 'offline'
  data TEXT, -- JSON block (contains HLS url, station name, etc.)
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- Active Security Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  title TEXT,
  detail TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  category TEXT DEFAULT 'behavior',
  source TEXT,
  employee_name TEXT,
  station TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- Legal Compliance Configurations
CREATE TABLE IF NOT EXISTS compliance_settings (
  organization_id TEXT PRIMARY KEY,
  consent_active INTEGER DEFAULT 1, -- Consent signature policy gate
  supervisor_gate INTEGER DEFAULT 1, -- Review gate before scoring publishing
  audio_recording INTEGER DEFAULT 0, -- Active local audio capturing
  smile_sensitivity INTEGER DEFAULT 70,
  pitch_threshold INTEGER DEFAULT 65,
  retention_days INTEGER DEFAULT 30,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

-- supervisor Compliance Audits
CREATE TABLE IF NOT EXISTS compliance_audits (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  actor TEXT,
  action TEXT,
  target TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'Success',
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);
```

---

## 3. High-Reliability Surveillance Streaming Pipeline

The dashboard encapsulates low-latency HLS playing and telemetry inside dedicated React custom hooks under `src/hooks/` to eliminate memory leaks and garbage collection blocks:

### A. Dynamic HLS Connection Player (`useHLSPlayer.js`)
* Fully manages native `<video>` bindings and custom `Hls.js` instances.
* **Leak Prevention**: Safely tears down player events, detaches media feeds, and unmounts DOM buffers upon component recycling to prevent browser crashes.
* **Exponential Backoff Reconnections**: Automatically retries offline HLS URLs starting at 1s, doubling up to a maximum 16s timeout.
* **Native iOS Fallback**: Automatically bypasses JS rendering when detecting native `.m3u8` Safari capabilities, utilizing hardware acceleration.

### B. Webcam Status & Telemetry (`useCameraStatus.js`)
* **Client Heartbeats**: Emits a `camera:heartbeat` WebSocket signal every 5 seconds to notify the server that the local USB feed is streaming.
* **Socket Integrations**: Listens to real-time `camera:online` and `camera:offline` event broadcasts to toggle the visual feed cards instantly.
* **HUD Diagnostic Updates**: Simulates network telemetry data (jitter, simulated ping latencies, and FPS readouts) every 10 seconds.

### C. Jitter-Free Coordinate Interpolation (`useSocketDetections.js`)
* Listens to real-time AI bounding box updates (`x`, `y`, `width`, `height`, `label`, `trackingId`).
* **Smoothing**: Utilizes a `requestAnimationFrame` render loop to smoothly glide overlays across coordinates without jumping or visual stutter.
* **Fade Grace Period**: Implements a 1000ms visual grace period. Bounding boxes do not instantly snap out of view upon missing frames, but smoothly fade away.

---

## 4. Background Active Health & Telemetry Systems (`server/`)
* **In-Memory Heartbeat Map**: Client webcam status updates are stored in a fast, thread-safe memory map (`webcamHeartbeats`), bypassing constant SQLite disk write operations.
* **Active Health Checker (`startCameraHealthCheck`)**: Operates on a background 15s interval:
  1. Checks HLS streaming URLs using dynamic `fetch` HEAD requests (4s timeout).
  2. Evaluates if the last webcam heartbeat is older than 12 seconds.
  3. If a camera status changes, it updates SQLite states and broadcasts the update to the organization-scoped room (`org:${orgId}`) using `io.to(...)`.

---

## 5. Security & Authentication Layers
* **JWT token Authentication**: Custom `authenticateToken` middleware verifies authorization tokens on Express endpoints and WebSocket handshake states.
* **Multi-Tenant Scoping**: All database queries are securely locked to `req.user.organization_id`.
* **Socket Rooms**: Users join room `org:${orgId}` on connection, preventing leaks of diagnostic alerts, heartbeats, or bounding box details to other accounts.

---

## 6. Surveillance Page & UI Capabilities (`src/components/dashboard/`)
* **Lazy Stream Sleeping**: Feed cards wrap their active videos inside an `IntersectionObserver`. Whenever a card is scrolled off-screen, HLS buffers are instantly paused and put to sleep, enabling the dashboard to scale to **100+ simultaneous cameras** without thermal throttling.
* **Fullscreen API Integration**: Adds toggles in the camera feed overlay HUD allowing feeds to occupy the entire screen natively.
* **Canvas Frame Capturing**: Creates a high-fidelity image capture by reading directly from the underlying active `<video>` element on request, automatically launching an image download.
* **Premium Glassmorphic Design**: Curved edges (`rounded-[24px]`), Harmony HSL color structures, high-contrast HUD diagnostic meters, and glowing red recording dots.

---

## 7. Policy & Legal Auditing Integration
* **Persistent Compliance API**: Toggling safeguards or adjusting sliders on `PolicyAuditPage.jsx` updates parameters on SQLite tables and automatically logs actions directly to the persistent supervisor audit trails.
* **Alert Data Retention Filter**: An Express deletion pipeline dynamically purges historical alerts and bounding boxes older than the configured compliance retention period, logging audit logs when manually triggered.
* **Zero-Flicker Layout**: Standard React mounts prevent race conditions between local async config fetches and UI animation frameworks, ensuring immediate and beautiful visual loads.
