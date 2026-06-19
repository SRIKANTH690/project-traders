/**
 * start.js – Production startup script for Render.
 * Runs DB seed (creates tables + default admin if not exists),
 * then starts the Express server.
 */
const path    = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { execSync } = require('child_process');

async function start() {
  console.log('🌱  Running database seed…');
  try {
    execSync('node backend/models/seed.js', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..'),
    });
  } catch (e) {
    console.error('⚠️  Seed error (continuing anyway):', e.message);
  }

  console.log('🚀  Starting server…');
  require('../server');
}

start();
