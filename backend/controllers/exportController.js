const pool = require('../db');

/* ── helper: convert array of objects → CSV string ── */
function toCSV(rows, columns) {
  if (!rows.length) return columns.join(',') + '\n';

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return /[,"\n\r]/.test(str) ? `"${str}"` : str;
  };

  const header = columns.join(',');
  const body   = rows.map(row =>
    columns.map(col => escape(row[col])).join(',')
  ).join('\n');

  return header + '\n' + body;
}

/* ── helper: send CSV as file download ── */
function sendCSV(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  // UTF-8 BOM so Excel opens it correctly with special chars
  res.send('\uFEFF' + csv);
}

/* ── EXPORT ORDERS ── */
async function exportOrders(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         o.id            AS "Order ID",
         c.fname || ' ' || c.lname AS "Customer Name",
         c.email         AS "Email",
         o.phone         AS "Phone",
         o.grade         AS "Grade",
         o.qty           AS "Qty (kg)",
         o.address       AS "Address",
         o.city          AS "City",
         o.state         AS "State",
         o.pincode       AS "Pincode",
         o.notes         AS "Notes",
         o.status        AS "Status",
         TO_CHAR(o.created_at, 'DD Mon YYYY HH24:MI') AS "Ordered On"
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC`
    );

    const cols = [
      'Order ID','Customer Name','Email','Phone','Grade',
      'Qty (kg)','Address','City','State','Pincode',
      'Notes','Status','Ordered On'
    ];

    const today = new Date().toISOString().slice(0,10);
    sendCSV(res, `orders_${today}.csv`, toCSV(result.rows, cols));
  } catch (err) {
    console.error('exportOrders error:', err.message);
    res.status(500).json({ error: 'Export failed.' });
  }
}

/* ── EXPORT QUOTES ── */
async function exportQuotes(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         id              AS "Quote ID",
         name            AS "Name",
         phone           AS "Phone",
         email           AS "Email",
         grade           AS "Grade",
         qty             AS "Qty (kg)",
         TO_CHAR(required_by, 'DD Mon YYYY') AS "Required By",
         notes           AS "Notes",
         TO_CHAR(created_at, 'DD Mon YYYY HH24:MI') AS "Submitted On"
       FROM quotes
       ORDER BY created_at DESC`
    );

    const cols = [
      'Quote ID','Name','Phone','Email','Grade',
      'Qty (kg)','Required By','Notes','Submitted On'
    ];

    const today = new Date().toISOString().slice(0,10);
    sendCSV(res, `quotes_${today}.csv`, toCSV(result.rows, cols));
  } catch (err) {
    console.error('exportQuotes error:', err.message);
    res.status(500).json({ error: 'Export failed.' });
  }
}

/* ── EXPORT CUSTOMERS ── */
async function exportCustomers(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         c.id            AS "Customer ID",
         c.fname         AS "First Name",
         c.lname         AS "Last Name",
         c.email         AS "Email",
         c.phone         AS "Phone",
         COUNT(o.id)     AS "Total Orders",
         TO_CHAR(c.created_at, 'DD Mon YYYY HH24:MI') AS "Registered On"
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );

    const cols = [
      'Customer ID','First Name','Last Name','Email',
      'Phone','Total Orders','Registered On'
    ];

    const today = new Date().toISOString().slice(0,10);
    sendCSV(res, `customers_${today}.csv`, toCSV(result.rows, cols));
  } catch (err) {
    console.error('exportCustomers error:', err.message);
    res.status(500).json({ error: 'Export failed.' });
  }
}

module.exports = { exportOrders, exportQuotes, exportCustomers };
