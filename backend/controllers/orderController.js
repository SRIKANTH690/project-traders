const pool = require('../db');

const VALID_GRADES   = ['W180','W240','W320','W450','JH','BB'];
const VALID_STATUSES = ['Pending','Processing','Delivered','Cancelled'];

/* ─── PLACE ORDER (customer) ────────────────────────────── */
async function placeOrder(req, res) {
  const { grade, qty, phone, address, city, state, pincode, notes } = req.body;

  if (!grade || !qty || !phone || !address || !city || !state || !pincode) {
    return res.status(400).json({ error: 'Please fill all required fields.' });
  }
  if (!VALID_GRADES.includes(grade)) {
    return res.status(400).json({ error: 'Invalid cashew grade.' });
  }
  if (parseInt(qty) < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1 kg.' });
  }
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'Pincode must be exactly 6 digits.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO orders
         (customer_id, grade, qty, phone, address, city, state, pincode, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [req.user.id, grade, parseInt(qty), phone.trim(),
       address.trim(), city.trim(), state.trim(), pincode.trim(),
       notes ? notes.trim() : null]
    );
    return res.status(201).json({
      message: "Order placed! We'll call you to confirm.",
      order: result.rows[0],
    });
  } catch (err) {
    console.error('placeOrder error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

/* ─── MY ORDERS (customer) ──────────────────────────────── */
async function myOrders(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, grade, qty, phone, address, city, state, pincode,
              notes, status, created_at
       FROM   orders
       WHERE  customer_id = $1
       ORDER  BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ orders: result.rows });
  } catch (err) {
    console.error('myOrders error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

/* ─── ALL ORDERS (admin) ────────────────────────────────── */
async function allOrders(req, res) {
  try {
    const result = await pool.query(
      `SELECT o.id, o.grade, o.qty, o.phone, o.address,
              o.city, o.state, o.pincode, o.notes, o.status, o.created_at,
              c.fname, c.lname, c.email AS customer_email
       FROM   orders o
       JOIN   customers c ON c.id = o.customer_id
       ORDER  BY o.created_at DESC`
    );
    return res.json({ orders: result.rows });
  } catch (err) {
    console.error('allOrders error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

/* ─── UPDATE ORDER STATUS (admin) ──────────────────────── */
async function updateStatus(req, res) {
  const { id }     = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, parseInt(id)]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json({ message: 'Status updated.', order: result.rows[0] });
  } catch (err) {
    console.error('updateStatus error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

/* ─── ADMIN STATS ───────────────────────────────────────── */
async function stats(req, res) {
  try {
    const [totalOrders, pendingOrders, totalQuotes, totalCustomers] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query("SELECT COUNT(*) FROM orders WHERE status = 'Pending'"),
      pool.query('SELECT COUNT(*) FROM quotes'),
      pool.query('SELECT COUNT(*) FROM customers'),
    ]);
    return res.json({
      totalOrders:    parseInt(totalOrders.rows[0].count),
      pendingOrders:  parseInt(pendingOrders.rows[0].count),
      totalQuotes:    parseInt(totalQuotes.rows[0].count),
      totalCustomers: parseInt(totalCustomers.rows[0].count),
    });
  } catch (err) {
    console.error('stats error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { placeOrder, myOrders, allOrders, updateStatus, stats };
