# Sriram Traders – Full-Stack Web Application

Premium Panruti Cashews e-commerce platform built with **Node.js + Express + PostgreSQL**.

---

## Project Structure

```
!!sriram/
├── frontend/
│   ├── index.html          ← Main HTML (refactored from single-file)
│   ├── css/
│   │   └── style.css       ← All styles
│   ├── js/
│   │   ├── api.js          ← Fetch-based API client (JWT-aware)
│   │   └── app.js          ← All UI logic & event handlers
│   └── images/             ← Product images (W180–BB, farm photos)
│
├── backend/
│   ├── server.js           ← Express app entry point
│   ├── db.js               ← PostgreSQL pool (pg)
│   ├── routes/
│   │   ├── auth.js         ← /api/auth/*
│   │   ├── orders.js       ← /api/orders/*
│   │   ├── quotes.js       ← /api/quotes/*
│   │   └── customers.js    ← /api/customers/*
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── quoteController.js
│   │   └── customerController.js
│   ├── middleware/
│   │   └── auth.js         ← JWT verifyToken + requireAdmin
│   └── models/
│       ├── schema.sql      ← PostgreSQL table definitions
│       └── seed.js         ← Creates tables + default admin
│
├── .env                    ← Environment variables (edit before running)
├── package.json
└── README.md
```

---

## Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14

### 2. Create PostgreSQL Database
```sql
CREATE DATABASE sriram_traders;
```

### 3. Configure Environment
Edit `.env` and set your PostgreSQL password:
```
DB_PASSWORD=your_postgres_password
```

### 4. Install Dependencies
```bash
cd "d:\!!sriram"
npm install
```

### 5. Seed Database (creates tables + default admin)
```bash
node backend/models/seed.js
```

### 6. Start the Server
```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

### 7. Open in Browser
```
http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Customer registration |
| POST | `/api/auth/login` | — | Customer login |
| POST | `/api/auth/admin-login` | — | Admin login |
| GET  | `/api/auth/me` | Customer/Admin | Get current user |
| POST | `/api/orders` | Customer | Place an order |
| GET  | `/api/orders/my` | Customer | View own orders |
| GET  | `/api/orders` | Admin | View all orders |
| PATCH| `/api/orders/:id/status` | Admin | Update order status |
| GET  | `/api/orders/stats` | Admin | Dashboard stats |
| POST | `/api/quotes` | — | Submit quotation request |
| GET  | `/api/quotes` | Admin | View all quotations |
| GET  | `/api/customers` | Admin | View all customers |

---

## Default Admin Credentials
```
Email:    admin@sriram.com
Password: sriram@2025
```
> Change these in `.env` and re-run `node backend/models/seed.js` after setup.

---

## Key Features
- JWT-based authentication (customers + admin, separate flows)
- Passwords hashed with bcrypt (cost 12)
- Admin panel: live stats, order status updates, customer & quote management
- Quotation form — no login required (public endpoint)
- WhatsApp quick-order integration preserved
- Fully responsive, same visual design as original
