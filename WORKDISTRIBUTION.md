# Shinka Dynamics Dashboard — Work Distribution

> **Customer Interaction Intelligence Dashboard**
> AI-powered employee behavior rating platform for retail environments.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Recharts, Lucide Icons |
| **Styling** | Tailwind CSS 4, Vanilla CSS (custom properties) |
| **Build Tool** | Vite 8 |
| **Backend** | Express 5 (Node.js) |
| **Database** | SQLite 3 |
| **Auth** | JWT (jsonwebtoken), bcrypt |
| **Validation** | Zod |

---

## Project File Structure

```
Dashboard/
├── index.html                    # Entry HTML (Vite root)
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite + Tailwind + API proxy config
├── eslint.config.js              # Linting rules
│
├── server/                       # ── BACKEND ──
│   ├── index.js                  # Express server entry point
│   ├── db.js                     # SQLite connection & schema creation
│   ├── seed.js                   # Database seeding script
│   ├── database.sqlite           # SQLite database file
│   ├── middleware/
│   │   └── auth.js               # JWT authentication & admin guard
│   └── routes/
│       ├── auth.js               # Signup, Login, Profile, Org management
│       ├── employees.js          # Employee CRUD
│       ├── cameras.js            # Camera CRUD
│       ├── alerts.js             # Alert CRUD & status management
│       └── analytics.js          # Dashboard analytics computation
│
└── src/                          # ── FRONTEND ──
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Root component, routing, layout shell
    │
    ├── context/                  # State Management
    │   ├── AuthContext.jsx        # Auth state (login, token, user)
    │   ├── DashboardContext.jsx   # App-wide state (data, filters, theme)
    │   └── useDashboard.js       # Custom hook for dashboard context
    │
    ├── lib/                      # Utilities
    │   ├── api.js                # Fetch wrapper with auth headers
    │   └── ui.js                 # Shared CSS class recipes (cn, panelCard, etc.)
    │
    ├── data/
    │   └── dashboardData.js      # Static/fallback dashboard data
    │
    ├── styles/
    │   └── global.css            # CSS variables, theme tokens, animations
    │
    ├── pages/                    # Route-level Pages
    │   ├── OverviewPage.jsx      # Dashboard overview (/)
    │   ├── LiveMonitoringPage.jsx # Camera feeds (/monitoring)
    │   ├── EmployeesPage.jsx     # Employee directory (/employees)
    │   ├── EmployeeProfileRoutePage.jsx  # Employee detail (/employees/:id)
    │   ├── AlertsPage.jsx        # Alert center (/alerts)
    │   └── auth/
    │       ├── LoginPage.jsx     # Login form (/login)
    │       └── SignupPage.jsx    # Registration form (/signup)
    │
    └── components/               # Reusable UI Components
        ├── AccountSettingsModal.jsx   # User & org settings modal
        │
        ├── layout/               # App Shell
        │   ├── Header.jsx        # Top bar (theme, bell, profile)
        │   ├── Sidebar.jsx       # Navigation sidebar
        │   └── ProtectedRoute.jsx # Auth guard wrapper
        │
        └── dashboard/            # Feature Components
            ├── HeroPanel.jsx         # Site summary hero card
            ├── StatsGrid.jsx         # Key metrics grid
            ├── OverviewStatsPanel.jsx # Operational metrics + highlights
            ├── CriteriaPanel.jsx     # Scoring criteria breakdown
            ├── ScoreTrendCard.jsx    # Weekly score chart
            ├── LiveFeedPanel.jsx     # Real-time interaction feed
            ├── TeamSpotlight.jsx     # Top employees spotlight
            ├── InsightPanel.jsx      # Compliance & recommendations
            ├── EmployeeDirectory.jsx # Searchable employee list
            ├── EmployeeProfilePage.jsx # Full employee profile
            ├── AddEmployeeModal.jsx  # New employee form modal
            ├── CameraFeed.jsx        # Individual camera stream
            ├── AddCameraModal.jsx    # New camera form modal
            ├── AlertCard.jsx         # Individual alert card
            ├── OperationsToolbar.jsx # Search & filter controls
            └── ScorePill.jsx         # Score badge component
```

---

## Backend Work

### Server Entry (`server/index.js`)
- Express app setup with CORS and JSON body parsing
- Mounts all API routers under `/api/*`
- Global error handling middleware

### Database (`server/db.js`)
- SQLite connection with auto-create
- Schema initialization for 5 tables:

| Table | Purpose |
|-------|---------|
| `organizations` | Multi-tenant org with plan tier |
| `users` | Auth credentials, role, org linkage |
| `employees` | Employee records with JSON data blob |
| `cameras` | Camera configurations per org |
| `alerts` | Risk & compliance alerts with severity/status tracking |

### Authentication (`server/middleware/auth.js`)
- `authenticateToken` — Verifies JWT from `Authorization: Bearer` header, attaches `req.user`
- `requireAdmin` — Guards admin-only endpoints

### API Routes

| Route File | Endpoints | Purpose |
|-----------|-----------|---------|
| `auth.js` | `POST /signup`, `POST /login`, `GET /me`, `PUT /profile`, `PUT /organization` | User registration, authentication, profile & org management |
| `employees.js` | `GET /`, `POST /` | List org employees, add new employee (admin) |
| `cameras.js` | `GET /`, `POST /`, `DELETE /:id` | Camera CRUD with plan-based limits |
| `alerts.js` | `GET /`, `PATCH /:id/acknowledge`, `PATCH /:id/resolve`, `PATCH /:id/dismiss`, `DELETE /:id` | Alert listing (with filters), status management, deletion |
| `analytics.js` | `GET /` | Computes live dashboard stats from employee data |

### Seed Script (`server/seed.js`)
- Drops and recreates all tables
- Seeds: 1 organization, 1 admin user, 3 employees, 10 alerts
- Default login: `admin@shinkadynamics.com` / `admin123`

---

## Frontend Work

### App Shell & Routing (`App.jsx`)
- `AuthProvider` → `DashboardProvider` → `Routes` hierarchy
- Protected routes via `ProtectedRoute` component
- `AppShell` renders sidebar + header + routed content

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/login` | `LoginPage` | Authentication form |
| `/signup` | `SignupPage` | Registration with org creation |
| `/` | `OverviewPage` | Dashboard home with all summary panels |
| `/monitoring` | `LiveMonitoringPage` | Multi-camera live feeds |
| `/employees` | `EmployeesPage` | Employee directory with search/filter |
| `/employees/:id` | `EmployeeProfileRoutePage` | Individual employee detail |
| `/alerts` | `AlertsPage` | Alert center with filtering & actions |

### State Management

#### `AuthContext.jsx`
- Token persistence in `localStorage`
- Login / Signup / Logout flows
- Auto-fetches `/api/auth/me` on mount for session restoration
- Listens for `auth-unauthorized` events for token expiry

#### `DashboardContext.jsx`
- Fetches employees + analytics on user login
- Manages: theme, sidebar state, search/filters, employee sorting
- Alerts state with `fetchAlerts`, `acknowledgeAlert`, `resolveAlert`, `dismissAlert`
- Camera management with `addCamera`, `removeCamera`
- Exposes all state via React context

### Design System

#### CSS Variables (`global.css`)
- Full light and dark theme token sets (30+ variables)
- Radial gradient backgrounds for both themes
- Theme transition animations (320ms ease)
- Scroll-reveal animations for panel entrance
- Custom scrollbar styling

#### UI Utilities (`lib/ui.js`)
- `cn()` — Class name joiner
- Shared recipes: `surfaceCard`, `panelCard`, `panelHeading`, `eyebrow`, `panelTitle`, `panelChip`, `ghostButton`, `emptyState`, `metricBlock`

### Component Responsibilities

| Component | Role |
|-----------|------|
| **Header** | Theme switcher, export button, notification bell (active alert count badge), profile dropdown with settings |
| **Sidebar** | Collapsible navigation with icons, mobile drawer, brand logo toggle |
| **HeroPanel** | Organization name, overall score ring, score distribution bars |
| **StatsGrid** | 4-column key metrics (employees scored, avg score, compliance, risks) |
| **OverviewStatsPanel** | Branch health metrics + actionable highlights |
| **CriteriaPanel** | Facial, verbal, greeting scoring breakdown with weights |
| **ScoreTrendCard** | Weekly line chart (Recharts) + day selector |
| **LiveFeedPanel** | Real-time employee interaction feed with selection detail view |
| **TeamSpotlight** | Top 3 employees with scores and deltas |
| **InsightPanel** | Compliance notices + AI recommendations |
| **EmployeeDirectory** | Filterable, sortable employee grid with score pills |
| **EmployeeProfilePage** | Full profile: metrics, weekly chart, recent sessions, certifications |
| **CameraFeed** | Live webcam/IP stream with AI overlay simulation |
| **AlertCard** | Severity-driven card with pulsing dots, category icons, timestamp, action buttons |
| **AlertsPage** | Summary counts, filter bar (search/severity/category/status), alert grid |
| **AccountSettingsModal** | Profile editing, organization settings, tabbed modal |

---

## NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm start` | `concurrently "npm run server" "npm run dev"` | Run backend + frontend together |
| `npm run dev` | `vite` | Frontend dev server (port 5173) |
| `npm run server` | `node server/index.js` | Backend API server (port 3000) |
| `npm run seed` | `node server/seed.js` | Reset & seed the database |
| `npm run build` | `vite build` | Production build |
| `npm run lint` | `eslint .` | Code linting |
