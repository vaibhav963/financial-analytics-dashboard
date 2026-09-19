# 📊 Financial Analytics Dashboard

[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-00C7B7?logo=vercel&logoColor=white)](https://financial-analytics-dashboard-qxlq7fuh0.vercel.app)

A modern, full-stack financial analytics web application designed for real-time monitoring, transaction management, interactive data visualization, and custom CSV data exports. Built with a sleek dark-mode glassmorphic design and engineered to be 100% responsive across all device form factors.

🔗 **Live Deployment**: [financial-analytics-dashboard-qxlq7fuh0.vercel.app](https://financial-analytics-dashboard-qxlq7fuh0.vercel.app)

---

## 🚀 Key Features

### 1. 📈 Executive KPI Dashboard & Real-Time Metrics
- **Executive Stat Cards**: Real-time calculations for Total Revenue, Total Volume, Net Profit Margin, and Pending Settlements with trend indicators.
- **Dual-Mode Revenue vs. Expense Chart**: Seamlessly toggle between smooth Gradient Area and Grouped Bar chart views with interactive tooltips and responsive X-axis labeling.
- **Cumulative Cashflow Chart**: Area-line visualization illustrating capital trajectories over time.
- **Distribution Donut Charts**: Interactive breakdowns by Transaction Category and Settlement Status with dynamic center-metric calculations.
- **Analyst Performance Volume Chart**: Monthly volume breakdowns per user with analyst badge summaries.
- **Dynamic Milestone Timeline**: Interactive 8-stage stepper highlighting financial milestones with real-time target vs. actual variance cards.

### 2. 🔍 Advanced Transaction Table & Filtering
- **Multi-Field Instant Search**: Filter across descriptions, categories, references, and transaction IDs.
- **Quick Period Filters**: One-tap pills for 30 Days, 90 Days, Year-to-Date (YTD), and All Time.
- **Date & Amount Range Modal**: Custom range picker for precise temporal and fiscal filtering.
- **Server-Side Sorting & Pagination**: Sort by Date, Amount, or Status with customizable page size (10, 25, 50 rows per page).
- **Row Selection & Actions**: Individual row checkboxes and bulk select-all support.

### 3. 📤 CSV Export Studio
- **Custom Column Builder**: Drag and reorder columns, toggle visibility, and rename headers.
- **Formatters**: Built-in support for multiple date formats (ISO, US, EU) and currency standards.
- **Live Preview & Download**: Instant table preview before streaming formatted CSV data.

### 4. 📱 100% Responsive Design Across All Devices
Tested and verified across 5 major device profiles:
- **Mobile Small (375px+)**: iPhone SE, Galaxy A series (optimized compact cards, 3-letter month ticks, touch-scrolling data table).
- **Mobile Medium/Large (390px - 430px)**: iPhone 14/15/16 Pro, Galaxy S23 (smooth horizontal filter scrolling, full-bleed modals).
- **Tablet Portrait (768px)**: iPad Mini / Air (balanced 2-column KPI grid, wrapped filters, adaptive pagination).
- **Tablet Landscape / Laptop (1024px)**: iPad Pro, 13" Laptops (side-by-side charts, auto-centered backdrop blur modals).
- **Desktop Full HD (1440px+)**: Standard monitors & wide screens (luxury wide-screen data density).

### 5. 🔐 Enterprise Authentication & Security
- **JWT Authentication**: Short-lived access tokens paired with rotating `httpOnly` refresh tokens.
- **Automatic Silent Refresh**: Proactive background token renewal prevents unexpected session timeouts.
- **Role-Based Profiles**: View roles, permissions, and active device sessions from the User Profile Modal.
- **Pre-Seeded Demo Credentials**: Instant access with ready-to-use demo accounts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, TypeScript, Mongoose |
| **Database** | MongoDB Atlas (Cloud) / In-Memory Mongo fallback for local dev |
| **Deployment** | Vercel Serverless Monorepo Architecture |
| **Testing** | Vitest, Supertest, React Testing Library, Browser Subagent Automation |

---

## ⚡ Quickstart

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas URI or local MongoDB instance (falls back to in-memory database automatically if not provided)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/vaibhav963/financial-analytics-dashboard.git
cd financial-analytics-dashboard

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Environment Configuration

#### Backend (`server/.env`)
Create `server/.env` or copy from `server/.env.example`:

```env
PORT=5001
NODE_ENV=development

# MongoDB Connection String (MongoDB Atlas or local)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.fimik5r.mongodb.net/financial_dashboard?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_access_key
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
JWT_EXPIRES_IN=120m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Run Locally

```bash
# Start both backend and frontend concurrently
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5001`
- **Health Check**: `http://localhost:5001/api/health`

---

## 🔑 Demo Credentials

The database is automatically seeded on first launch with sample transactions, analytics, and a pre-configured demo account (accessible via the **1-click Fill Demo** button on the login screen):

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gmail.com` | `Pass@123` |

---

## 📡 API Reference & Postman Collection

A pre-configured **Postman Collection** is included in the root of this repository: [`postman_collection.json`](./postman_collection.json).

- **Import into Postman**: Import the file directly into Postman to test all endpoints.
- **Auto-Token Capture**: Running the `POST /api/auth/login` request automatically extracts and sets the JWT bearer token for all protected requests.
- **Environment Switcher**: Easily switch between Live Vercel (`https://financial-analytics-dashboard-qxlq7fuh0.vercel.app/api`) and Localhost (`http://localhost:5001/api`) via the `{{baseUrl}}` collection variable.

Base URL: `/api`

### Authentication
- `POST /api/auth/login` — Authenticate user and issue tokens
- `POST /api/auth/refresh` — Issue a new access token via `httpOnly` cookie
- `POST /api/auth/logout` — Invalidate current session and clear cookies
- `GET  /api/auth/me` — Retrieve current authenticated user profile
- `PUT  /api/auth/profile` — Update user profile details

### Transactions
- `GET  /api/transactions` — Query paginated, sorted, and filtered transactions
  - **Query Params**: `page`, `limit`, `search`, `category`, `status`, `userId`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy`, `sortOrder`
- `GET  /api/transactions/:id` — Retrieve single transaction details

### Analytics & Visualizations
- `GET  /api/analytics/summary` — Key KPI metrics, revenue/expense trends, and category distribution

### Export
- `POST /api/export/csv` — Stream formatted CSV download
- `POST /api/export/preview` — Live preview of first 5 formatted rows

---

## ☁️ Deployment on Vercel

This repository is pre-configured as a **Vercel Serverless Monorepo**:

- **Frontend**: Built via Vite and served from `client/dist`.
- **Backend API**: Handled via serverless functions in `api/index.js` routed through `vercel.json`.

### Steps to Deploy:
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Keep the **Root Directory** as `./` (default).
3. Set the following **Environment Variables** in Vercel Project Settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Random 64-character secret key.
   - `JWT_REFRESH_SECRET`: Random 64-character refresh secret key.
   - `JWT_EXPIRES_IN`: `120m`
   - `JWT_REFRESH_EXPIRES_IN`: `7d`
   - `NODE_ENV`: `production`
4. Click **Deploy**. Vercel will automatically build the client and deploy the serverless API routes.

---

## 🧪 Testing & Verification

```bash
# Run server integration tests
cd server && npm test

# Run frontend unit tests
cd client && npm test

# Validate production build
npm run build
```

---

## 📂 Project Structure

```
financial-analytics-dashboard/
├── api/                    # Vercel Serverless function entry point
│   └── index.js
├── client/                 # React + Vite + TailwindCSS Frontend
│   ├── src/
│   │   ├── components/     # UI components (auth, dashboard, export, layout, transactions)
│   │   ├── context/        # Auth & Toast context providers
│   │   ├── hooks/          # Custom hooks (e.g. useTransactions, useDebounce)
│   │   ├── services/       # API client & token refresh interceptors
│   │   ├── types/          # TypeScript interface definitions
│   │   └── utils/          # Formatters, helpers, and calculation utilities
│   ├── tailwind.config.js  # Tailwind theme & responsive breakpoint config
│   └── vite.config.ts      # Vite configuration & dev proxy
├── server/                 # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/         # Database connection & env validation
│   │   ├── controllers/    # Request controllers (auth, transactions, analytics, export)
│   │   ├── middlewares/    # Authentication, rate limiting, and error handling
│   │   ├── models/         # Mongoose schemas (User, Transaction)
│   │   ├── routes/         # Express API route modules
│   │   └── seeds/          # Database seeding scripts
│   └── tests/              # Vitest & Supertest API integration tests
├── vercel.json             # Vercel Monorepo routing and build configuration
└── package.json            # Root workspace scripts
```

---

## 📄 License

This project is licensed under the MIT License.
