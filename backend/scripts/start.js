/**
 * start.js – Production startup for Render.
 * Seeds the DB (tables + admin), then starts Express.
 */
process.chdir(require('path').join(__dirname, '../..'));
require('dotenv').config();

async function main() {
  // ── 1. Seed database ──────────────────────────────────
  console.log('🌱  Running database seed…');
  try {
    const bcrypt = require('bcryptjs');
    const pool   = require('../db');
    const fs     = require('fs');
    const path   = require('path');

    const client = await pool.connect();
    try {
      // Create tables
      const sql = fs.readFileSync(
        path.join(__dirname, '../models/schema.sql'), 'utf8'
      );
      await client.query(sql);
      console.log('✅  Tables ready');

      // Insert default admin if missing
      const adminEmail = process.env.ADMIN_EMAIL    || 'admin@sriram.com';
      const adminPass  = process.env.ADMIN_PASSWORD || 'sriram@2025';
      const existing   = await client.query(
        'SELECT id FROM admins WHERE email = $1', [adminEmail]
      );
      if (!existing.rows.length) {
        const hash = await bcrypt.hash(adminPass, 12);
        await client.query(
          'INSERT INTO admins (email, password) VALUES ($1, $2)',
          [adminEmail, hash]
        );
        console.log('✅  Default admin created:', adminEmail);
      } else {
        console.log('ℹ️   Admin already exists');
      }
    } finally {
      client.release();
    }
  } catch (err) {
    // Don't crash – log and continue so server still starts
    console.error('⚠️  Seed error (server will still start):', err.message);
  }

  // ── 2. Start Express server ───────────────────────────
  console.log('🚀  Starting Express server…');
  require('../server');
}

main().catch(err => {
  console.error('💥  Fatal startup error:', err);
  process.exit(1);
});
