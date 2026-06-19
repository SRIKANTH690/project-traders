const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');

const app = express();

/* ─── Middleware ───────────────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── Serve static frontend ────────────────────────────── */
app.use(express.static(path.join(__dirname, '../frontend')));

/* ─── API Routes ────────────────────────────────────────── */
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/quotes',    require('./routes/quotes'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/export',    require('./routes/export'));

/* ─── Health check ──────────────────────────────────────── */
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Sriram Traders' }));

/* ─── SPA fallback – serve index.html for all non-API ──── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/* ─── Global error handler ──────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

/* ─── Start ──────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀  Sriram Traders server running at http://localhost:${PORT}`);
  console.log(`📦  API base: http://localhost:${PORT}/api`);
  console.log(`🌐  Frontend: http://localhost:${PORT}\n`);
});
