# ShinkaDynamics Dashboard

A modern, production-ready retail management dashboard designed for real-time multi-camera monitoring, advanced employee behavior analytics, and streamlined shop floor operations.

## Features

- **Dynamic Multi-Camera Monitoring:**
  - Interactive grid to visualize live video feeds.
  - Supports adding and managing various camera sources, including local USB webcams and remote IP/CCTV streams.
  - Granular stream controls and configuration directly from the dashboard.
- **Comprehensive Employee Analytics:**
  - Detailed employee profiles featuring in-depth performance statistics and behavioral data.
  - Interactive data visualizations powered by `recharts`.
  - Comprehensive team spotlight and overview statistics.
- **Sleek & Responsive User Interface:**
  - Collapsible, GPU-accelerated sidebar for smooth navigation with zero-reflow animations.
  - Modern, premium aesthetics built with Tailwind CSS, featuring glassmorphism elements and dynamic micro-animations.
  - Modal interfaces for adding cameras and employees dynamically.
- **Robust Full-Stack Architecture:**
  - **Frontend:** Built with React (Vite), React Router for navigation, and Context API for global state management.
  - **Backend:** Powered by Node.js and Express, with a SQLite database for persistent storage of configurations, employee details, and telemetry data.

## Technology Stack

- **Frontend Environment:** React 19, Vite
- **Styling:** Tailwind CSS v4, Lucide React (Icons)
- **Data Visualization:** Recharts
- **State Management:** React Context API
- **Routing:** React Router v7
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Development Tooling:** ESLint, Concurrently

## Project Structure

```text
ShinkaDynamics_Dashboard/
├── server/                     # Backend API & Database
│   ├── database.sqlite         # SQLite Database (generated)
│   ├── db.js                   # Database configuration
│   ├── index.js                # Express server entry point
│   └── seed.js                 # Database seeding script
├── src/                        # Frontend application code
│   ├── assets/                 # Static assets (images, etc.)
│   ├── components/             # Reusable UI components
│   │   ├── dashboard/          # Dashboard specific components (CameraFeed, Modals, Panels)
│   │   └── layout/             # Application layout structure (Header, Sidebar)
│   ├── context/                # React Context for global state
│   ├── data/                   # Mock data or data utilities
│   ├── lib/                    # Shared utilities and helpers
│   ├── pages/                  # Route level components (Overview, Live Monitoring, Employees)
│   ├── styles/                 # Global CSS and Tailwind configurations
│   ├── App.jsx                 # Main React Application component
│   └── main.jsx                # Application mounting point
├── package.json                # Project dependencies and scripts
└── vite.config.js              # Vite configuration
```

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+ recommended) and npm installed on your machine.

### Installation

1. **Clone the repository:**
   *(Assuming you have already pulled the code to your local machine)*

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Seed the database:**
   To populate the SQLite database with initial configuration and mock data, run:
   ```bash
   npm run seed
   ```

### Running the Application

You can launch both the frontend development server and the backend Express server concurrently with a single command:

```bash
npm run start
```

Alternatively, you can run them individually:
- **Backend only:** `npm run server`
- **Frontend only:** `npm run dev`

The application will typically be available at `http://localhost:5173` (or another port specified by Vite).

## Development Notes

- **Animations:** The sidebar and UI components have been heavily optimized to reduce layout thrashing and maintain 60fps by utilizing CSS transforms (`translate`) rather than margin or width adjustments.
- **Video Feeds:** The `LiveMonitoringPage` supports both mock and real device streams based on configuration.
- **Styling Details:** Check `src/styles` and inline Tailwind classes for the extensive custom color palette and aesthetic design choices matching the ShinkaDynamics brand guidelines.

## Scripts

- `npm run start`: Runs backend and frontend concurrently.
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Locally preview the production build.
- `npm run server`: Starts the backend Node.js server.
- `npm run seed`: Seeds the local SQLite database.
- `npm run lint`: Runs ESLint to check code quality.
