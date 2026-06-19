const pool = require('../db');

const VALID_GRADES = ['W180','W240','W320','W450','JH','BB'];

/* ─── SUBMIT QUOTE (public) ─────────────────────────────── */
async function submitQuote(req, res) {
  const { name, phone, email, grade, qty, required_by, notes } = req.body;

  if (!name || !phone || !email || !grade || !qty) {
    return res.status(400).json({ error: 'Please fill all required fields.' });
  }
  if (!VALID_GRADES.includes(grade)) {
    return res.status(400).json({ error: 'Invalid cashew grade selected.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (parseInt(qty) < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO quotes (name, phone, email, grade, qty, required_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, grade, qty, created_at`,
      [name.trim(), phone.trim(), email.toLowerCase().trim(),
       grade, parseInt(qty),
       required_by || null,
       notes ? notes.trim() : null]
    );
    return res.status(201).json({
      message: 'Quotation request submitted! We will reply within 24 hours.',
      quote: result.rows[0],
    });
  } catch (err) {
    console.error('submitQuote error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

/* ─── ALL QUOTES (admin) ────────────────────────────────── */
async function allQuotes(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, email, grade, qty,
              required_by, notes, created_at
       FROM   quotes
       ORDER  BY created_at DESC`
    );
    return res.json({ quotes: result.rows });
  } catch (err) {
    console.error('allQuotes error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { submitQuote, allQuotes };
