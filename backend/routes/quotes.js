const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/quoteController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// POST /api/quotes         – public, no auth required
router.post('/', ctrl.submitQuote);

// GET  /api/quotes         – admin only
router.get('/', verifyToken, requireAdmin, ctrl.allQuotes);

module.exports = router;
