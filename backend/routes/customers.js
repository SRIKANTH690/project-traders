const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/customerController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/customers  – admin only
router.get('/', verifyToken, requireAdmin, ctrl.allCustomers);

module.exports = router;
