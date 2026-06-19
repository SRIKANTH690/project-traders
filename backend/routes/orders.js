const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// POST /api/orders          – customer places order (auth required)
router.post('/', verifyToken, ctrl.placeOrder);

// GET  /api/orders/my       – customer views own orders (auth required)
router.get('/my', verifyToken, ctrl.myOrders);

// GET  /api/orders           – admin views all orders
router.get('/', verifyToken, requireAdmin, ctrl.allOrders);

// PATCH /api/orders/:id/status – admin updates status
router.patch('/:id/status', verifyToken, requireAdmin, ctrl.updateStatus);

// GET  /api/orders/stats     – admin dashboard counters
router.get('/stats', verifyToken, requireAdmin, ctrl.stats);

module.exports = router;
