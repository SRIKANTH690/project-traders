const pool = require('../db');

/* ─── ALL CUSTOMERS (admin) ─────────────────────────────── */
async function allCustomers(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.fname, c.lname, c.email, c.phone, c.created_at,
              COUNT(o.id)::int AS order_count
       FROM   customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );
    return res.json({ customers: result.rows });
  } catch (err) {
    console.error('allCustomers error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { allCustomers };
