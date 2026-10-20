/**
 * Rollback / Restore Script for Savepoint: "putting the bulk data 62"
 * 
 * Restores the database schema and rows back to the exact snapshot
 * captured in backend/backups/putting_the_bulk_data_62.sql
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_FILE = path.resolve(__dirname, '../backups/putting_the_bulk_data_62.sql');

// Use direct unpooled connection for restore
const directUrl = (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '')
  .replace('-pooler', '');

console.log('🔄 Initiating Database Rollback to Savepoint "putting the bulk data 62"...');
console.log(`Backup File: ${BACKUP_FILE}`);

try {
  execSync(`psql "${directUrl}" -f "${BACKUP_FILE}"`, { stdio: 'inherit' });
  console.log('✅ Database successfully restored to savepoint!');
  
  // Reload in-memory cache
  try {
    const res = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
    console.log('✅ In-memory cache reloaded.');
  } catch (e) {
    console.log('ℹ️ Server cache will refresh on next startup.');
  }
} catch (error) {
  console.error('❌ Restore failed:', error.message);
  process.exit(1);
}
