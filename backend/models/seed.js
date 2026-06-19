/**
 * Seed script – creates the DB tables and inserts the default admin.
 * Run once:  node backend/models/seed.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const pool   = require('../db');
const fs     = require('fs');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱  Running seed...');

    // 1 – Create tables from schema.sql
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(sql);
    console.log('✅  Tables created (if not existed)');

    // 2 – Insert default admin (skip if already present)
    const adminEmail = process.env.ADMIN_EMAIL    || 'admin@sriram.com';
    const adminPass  = process.env.ADMIN_PASSWORD || 'sriram@2025';

    const existing = await client.query(
      'SELECT id FROM admins WHERE email = $1', [adminEmail]
    );

    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(adminPass, 12);
      await client.query(
        'INSERT INTO admins (email, password) VALUES ($1, $2)',
        [adminEmail, hash]
      );
      console.log('✅  Default admin created:', adminEmail);
    } else {
      console.log('ℹ️   Admin already exists – skipped');
    }

    console.log('🎉  Seed complete!');
  } catch (err) {
    console.error('❌  Seed error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
