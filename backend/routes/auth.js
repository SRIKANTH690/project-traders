const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', ctrl.register);

// POST /api/auth/login
router.post('/login', ctrl.login);

// POST /api/auth/admin-login
router.post('/admin-login', ctrl.adminLogin);

// POST /api/auth/firebase-login  (Google OAuth via Firebase)
router.post('/firebase-login', ctrl.firebaseLogin);

// GET  /api/auth/me  (requires token)
router.get('/me', verifyToken, ctrl.me);

module.exports = router;
