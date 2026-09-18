# Financial Analytics Dashboard

A full-stack financial analytics web application built with React, Node.js/Express, TypeScript, and MongoDB. Includes interactive data visualizations, multi-field filtering, server-side sorting and pagination, and a customizable CSV export tool.

## Quickstart

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB (optional — falls back to an embedded in-memory database automatically if `MONGODB_URI` is not set)

### Running Locally

```bash
# Install dependencies for root, server, and client
npm run install:all

# Start both backend and frontend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## Demo Accounts

The database is automatically seeded on first launch with sample financial records and two test accounts:

| Role | Email | Password |
| Admin | `admin@gmail.com` | `Pass@123` |

## Key Features

- **Executive KPI Dashboard**: Summary cards for revenue, expenses, net cash flow, and pending volume.
- **Charts & Visualizations**: Revenue vs expense monthly trends, category donut breakdown, analyst performance comparisons, and milestone stepper.
- **Transaction Table**: Multi-field search, filter pills (Category, Status, User), date & amount range modals, and server-side sorting.
- **CSV Export Studio**: Configurable export allowing column selection, reordering, custom header names, date/currency formatting, live preview, and CSV download.
- **Authentication**: JWT access tokens with rotating httpOnly refresh cookies and automatic silent session refresh.

## API Overview

Base URL: `http://localhost:5001/api`

- `POST /api/auth/login` — Login with email and password
- `POST /api/auth/refresh` — Refresh expired access token via httpOnly cookie
- `POST /api/auth/logout` — Revoke session and clear cookies
- `GET  /api/auth/me` — Current authenticated user profile
- `PUT  /api/auth/profile` — Update user profile details
- `GET  /api/transactions` — Paginated, filtered, and sorted transactions
- `GET  /api/transactions/:id` — Single transaction lookup
- `GET  /api/analytics/summary` — Aggregated metrics, trend buckets, and category breakdowns
- `POST /api/export/csv` — Stream formatted CSV file
- `POST /api/export/preview` — Preview formatted rows before downloading

## Testing

```bash
# Run server integration tests
cd server && npm test

# Run client tests
cd client && npm test

# Production build check
npm run build
```

## Project Structure

```
├── package.json        # Concurrently script for dev
├── server/             # Express + MongoDB API backend
│   ├── src/
│   │   ├── config/     # DB connection and env schema
│   │   ├── controllers/# Route controllers
│   │   ├── middlewares/# Auth & error handling
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # Express route definitions
│   │   └── seeds/      # Seed scripts & data
│   └── tests/          # API tests (Vitest + Supertest)
└── client/             # React + Vite + Tailwind frontend
    ├── src/
    │   ├── components/ # UI components (auth, dashboard, export, transactions)
    │   ├── context/    # Auth & toast state
    │   ├── hooks/      # Custom React hooks
    │   ├── services/   # Fetch API client & token handling
    │   └── utils/      # Helper functions & formatters
    └── tests/          # Component tests (Vitest + RTL)
```

## License

MIT
