# 🎮 GameZone BD

A full-stack booking & management platform for a physical gaming lounge that rents out gaming stations (PS5, PC, VR, Pool, Snooker) by the hour.

It has two parts:

- **Public website** — customers browse stations & packages, book time slots, pay, register for tournaments, and manage their bookings.
- **Admin panel** — the owner manages stations, bookings, pricing, packages, tournaments, customers, staff, payments, and site content, all without touching code.

---

## Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React (Vite), Tailwind CSS, Zustand, React Router      |
| Charts     | Recharts                                               |
| Backend    | Node.js, Express                                       |
| Database   | MongoDB + Mongoose                                      |
| Auth       | JWT + bcrypt, role-based (customer / staff / admin)    |
| Uploads    | Local storage (MVP) — Cloudinary-ready                 |
| Payments   | Mocked mark-as-paid flow — SSLCommerz / bKash-ready    |

---

## Project Structure

```
game-zone/
├── client/                     # React frontend (Vite + Tailwind)
│   └── src/
│       ├── api/                # Axios instance + typed API modules
│       ├── components/         # Shared UI (Navbar, Modal, ProtectedRoute…)
│       ├── store/              # Zustand stores (auth, settings)
│       ├── pages/              # Public pages
│       │   ├── Home, Stations, Booking, Packages, Tournaments
│       │   └── Gallery, Contact, Login, Signup, MyBookings
│       └── admin/              # Protected admin panel pages
│           ├── AdminLayout, Dashboard
│           ├── AdminStations, AdminBookings, AdminPackages
│           ├── AdminTournaments, AdminCustomers, AdminPayments
│           └── AdminContent, AdminStaff, AdminSettings
└── server/                     # Express backend
    ├── models/                 # User, Station, Booking, Package, Tournament, Settings
    ├── controllers/            # Route handlers
    ├── routes/                 # Express routers
    ├── middleware/             # auth.js, roleCheck.js, error.js, upload.js
    ├── utils/                  # generateToken.js, timeSlots.js
    ├── config/db.js            # Mongo connection
    ├── app.js / server.js      # App wiring & bootstrap
    └── seed.js                 # Seeds admin user + sample data
```

---

## Prerequisites

- **Node.js** 18+ (tested on 22)
- **MongoDB** running locally, or a MongoDB Atlas connection string

---

## Getting Started

### 1. Backend

```bash
cd server
npm install
cp .env.example .env        # then edit values (see below)
npm run seed                # creates admin user + sample data
npm run dev                 # starts API on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # starts app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend on port 5000, so no extra config is needed in development.

---

## Environment Variables (`server/.env`)

| Variable            | Description                                            | Example                                    |
| ------------------- | ------------------------------------------------------ | ------------------------------------------ |
| `PORT`              | API port                                               | `5000`                                     |
| `NODE_ENV`          | `development` / `production`                           | `development`                              |
| `MONGO_URI`         | MongoDB connection string                              | `mongodb://127.0.0.1:27017/gamezone_bd`    |
| `JWT_SECRET`        | Secret for signing JWTs (use a long random string)     | `a_very_long_random_secret`                |
| `JWT_EXPIRES_IN`    | Token lifetime                                         | `7d`                                       |
| `ADMIN_NAME`        | Seed admin display name                                | `Super Admin`                              |
| `ADMIN_EMAIL`       | Seed admin login email                                 | `admin@gamezone.bd`                        |
| `ADMIN_PHONE`       | Seed admin phone                                       | `017000000000`                             |
| `ADMIN_PASSWORD`    | Seed admin password                                    | `admin1234`                                |
| `CLIENT_URL`        | Allowed CORS origin(s), comma-separated                | `http://localhost:5173`                    |
| `UPLOAD_PROVIDER`   | `local` (MVP) or `cloudinary`                          | `local`                                    |
| `PAYMENT_PROVIDER`  | `mock` (MVP), or `sslcommerz` / `bkash`                | `mock`                                     |

See `.env.example` for the full list, including Cloudinary and payment-gateway keys used by the real integrations.

---

## Seeding the Admin User

```bash
cd server
npm run seed
```

This creates:

- An **admin** account from the `ADMIN_*` env vars (default `admin@gamezone.bd` / `admin1234`).
- Sample stations, packages, tournaments, and default site settings — only if those collections are empty (safe to re-run).

Log in at `/login` with the admin credentials; you'll be redirected to `/admin`.

---

## Roles & Permissions

| Capability                         | Customer | Staff | Admin |
| ---------------------------------- | :------: | :---: | :---: |
| Browse site, book & pay            |    ✅    |  ✅   |  ✅   |
| Manage own bookings                |    ✅    |  ✅   |  ✅   |
| Manage bookings / stations / etc.  |    —     |  ✅   |  ✅   |
| Block customers                    |    —     |  —    |  ✅   |
| Refund payments                    |    —     |  —    |  ✅   |
| Manage staff & roles               |    —     |  —    |  ✅   |
| Edit site settings                 |    —     |  —    |  ✅   |

All admin API routes are protected by JWT + role middleware (`server/middleware/auth.js`, `roleCheck.js`), and all admin frontend routes are wrapped in `<ProtectedRoute roles={[...]}>`.

---

## Key Features

- **Booking engine** with hourly slot availability and **double-booking prevention** — the same station cannot be booked for overlapping times (enforced server-side in `bookingController.js` using `utils/timeSlots.js`).
- **Walk-in bookings** created by staff/admin for on-site customers.
- **Mocked payment flow** (`initiate` → `confirm`) that marks bookings paid; swap `PAYMENT_PROVIDER` to wire in SSLCommerz/bKash sandbox.
- **Admin dashboard** with today's bookings, revenue, occupancy rate, and a 7-day revenue chart (Recharts).
- **CMS** — admin edits the home hero, offers, testimonials, and gallery, reflected live on the public site via the `Settings` singleton.
- Loading states, error handling, and confirmation dialogs on all admin CRUD screens.
- Fully responsive, mobile-first Tailwind UI.

---

## API Overview

| Resource     | Base route          | Notes                                    |
| ------------ | ------------------- | ---------------------------------------- |
| Auth         | `/api/auth`         | signup, login, me                        |
| Stations     | `/api/stations`     | CRUD + status toggle                     |
| Packages     | `/api/packages`     | CRUD + active toggle                     |
| Tournaments  | `/api/tournaments`  | CRUD + register                          |
| Bookings     | `/api/bookings`     | availability, create, walk-in, cancel…   |
| Payments     | `/api/payments`     | initiate, confirm, mark-paid, refund     |
| Settings     | `/api/settings`     | public read, admin write (CMS)           |
| Users        | `/api/users`        | customers, staff, block/unblock          |
| Dashboard    | `/api/dashboard`    | stats, 7-day revenue                     |
| Upload       | `/api/upload`       | local image upload                       |

Health check: `GET /api/health`.

---

## Production Build

```bash
cd client && npm run build      # outputs to client/dist
```

Serve `client/dist` from any static host and point it at the deployed API (set `CLIENT_URL` on the server for CORS).

---

## Notes

- UI copy is in English; it can be localized to Bengali as needed.
- Slot generation currently uses a fixed 10:00–23:00 window (see `bookingController.js`); adjust there if opening hours change.
- The mock payment flow is intentionally simple so the booking experience is complete end-to-end before real gateway keys are added.
