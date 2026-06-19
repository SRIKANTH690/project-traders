-- ============================================================
--  Sriram Traders – PostgreSQL Schema
--  Run once:  psql -U postgres -d sriram_traders -f schema.sql
-- ============================================================

-- Enable pgcrypto extension (optional, useful for uuid)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Customers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          SERIAL PRIMARY KEY,
  fname       VARCHAR(80)  NOT NULL,
  lname       VARCHAR(80)  NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  phone       VARCHAR(20)  NOT NULL,
  password    VARCHAR(255) NOT NULL,   -- bcrypt hash
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  customer_id   INT          NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  grade         VARCHAR(10)  NOT NULL,
  qty           INT          NOT NULL CHECK (qty > 0),
  phone         VARCHAR(20)  NOT NULL,
  address       TEXT         NOT NULL,
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100) NOT NULL,
  pincode       CHAR(6)      NOT NULL,
  notes         TEXT,
  status        VARCHAR(20)  NOT NULL DEFAULT 'Pending'
                             CHECK (status IN ('Pending','Processing','Delivered','Cancelled')),
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- ── Quotation Requests ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(160) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  email        VARCHAR(150) NOT NULL,
  grade        VARCHAR(10)  NOT NULL,
  qty          INT          NOT NULL CHECK (qty > 0),
  required_by  DATE,
  notes        TEXT,
  created_at   TIMESTAMP    DEFAULT NOW()
);

-- ── Admin Table (single row) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,   -- bcrypt hash
  created_at TIMESTAMP    DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
CREATE INDEX IF NOT EXISTS idx_quotes_email    ON quotes(email);
