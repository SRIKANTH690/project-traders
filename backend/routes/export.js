const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/exportController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All export routes are admin-only
router.get('/orders',    verifyToken, requireAdmin, ctrl.exportOrders);
router.get('/quotes',    verifyToken, requireAdmin, ctrl.exportQuotes);
router.get('/customers', verifyToken, requireAdmin, ctrl.exportCustomers);

module.exports = router;
