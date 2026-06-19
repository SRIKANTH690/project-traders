const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db');

/* ─── helpers ─────────────────────────────────────────── */
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/* ─── CUSTOMER REGISTER ────────────────────────────────── */
async function register(req, res) {
  const { fname, lname, email, phone, password } = req.body;

  // Basic validation
  if (!fname || !lname || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check duplicate email
    const exists = await pool.query(
      'SELECT id FROM customers WHERE email = $1', [email.toLowerCase()]
    );
    if (exists.rows.length) {
      return res.status(409).json({ error: 'This email is already registered. Please log in.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO customers (fname, lname, email, phone, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, fname, lname, email, phone, created_at`,
      [fname.trim(), lname.trim(), email.toLowerCase().trim(), phone.trim(), hash]
    );

    const user  = result.rows[0];
    const token = signToken({ id: user.id, email: user.email, isAdmin: false });

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, fname: user.fname, lname: user.lname, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('register error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

/* ─── CUSTOMER LOGIN ────────────────────────────────────── */
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM customers WHERE email = $1', [email.toLowerCase()]
    );
    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user  = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ id: user.id, email: user.email, isAdmin: false });
    return res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, fname: user.fname, lname: user.lname, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('login error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

/* ─── ADMIN LOGIN ───────────────────────────────────────── */
async function adminLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Admin credentials are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1', [email.toLowerCase()]
    );
    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = signToken({ id: admin.id, email: admin.email, isAdmin: true });
    return res.json({
      message: 'Admin login successful!',
      token,
      user: { id: admin.id, email: admin.email, isAdmin: true, fname: 'Admin' },
    });
  } catch (err) {
    console.error('adminLogin error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

/* ─── FIREBASE GOOGLE LOGIN ─────────────────────────────── */
async function firebaseLogin(req, res) {
  const { firebaseIdToken } = req.body;
  if (!firebaseIdToken) {
    return res.status(400).json({ error: 'Firebase ID token is required.' });
  }

  let decoded;
  try {
    const admin = require('../middleware/firebaseAdmin');
    decoded = await admin.auth().verifyIdToken(firebaseIdToken);
  } catch (err) {
    console.error('Firebase token verify error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired Google token.' });
  }

  const { uid, email, name, picture } = decoded;
  if (!email) {
    return res.status(400).json({ error: 'Google account has no email address.' });
  }

  // Split display name into fname / lname
  const parts = (name || email.split('@')[0]).split(' ');
  const fname = parts[0] || 'User';
  const lname = parts.slice(1).join(' ') || '';

  try {
    // Upsert: find existing customer or create one (no password for OAuth users)
    let result = await pool.query(
      'SELECT id, fname, lname, email, phone FROM customers WHERE email = $1',
      [email.toLowerCase()]
    );

    let user;
    if (result.rows.length) {
      user = result.rows[0];
    } else {
      // Insert with a random un-usable password hash for OAuth accounts
      const bcrypt = require('bcryptjs');
      const randomHash = await bcrypt.hash(uid + Date.now(), 10);
      const ins = await pool.query(
        `INSERT INTO customers (fname, lname, email, phone, password)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, fname, lname, email, phone`,
        [fname, lname, email.toLowerCase(), '', randomHash]
      );
      user = ins.rows[0];
    }

    const token = signToken({ id: user.id, email: user.email, isAdmin: false });
    return res.json({
      message: 'Google login successful!',
      token,
      user: { id: user.id, fname: user.fname, lname: user.lname, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('firebaseLogin DB error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

/* ─── GET CURRENT USER (token verify) ──────────────────── */
async function me(req, res) {
  try {
    if (req.user.isAdmin) {
      const result = await pool.query(
        'SELECT id, email FROM admins WHERE id = $1', [req.user.id]
      );
      if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
      const admin = result.rows[0];
      return res.json({ user: { ...admin, fname: 'Admin', isAdmin: true } });
    }

    const result = await pool.query(
      'SELECT id, fname, lname, email, phone FROM customers WHERE id = $1', [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('me error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { register, login, adminLogin, firebaseLogin, me };
