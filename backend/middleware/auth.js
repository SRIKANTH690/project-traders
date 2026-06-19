const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT sent in the Authorization header.
 * Sets req.user = { id, email, isAdmin } on success.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorised – no token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorised – invalid or expired token' });
  }
}

/**
 * Requires verifyToken first, then checks isAdmin flag.
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden – admin access required' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
