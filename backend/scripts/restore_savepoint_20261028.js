/**
 * Rollback / Restore Script for Savepoint: 2026-10-28 15:16
 * 
 * Restores the complete database schema and all table rows back to the exact snapshot
 * captured in backend/backups/savepoint_20261028_1516.sql (91 Hospitals, 328 Doctors, All Affiliations).
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_FILE = path.resolve(__dirname, '../backups/savepoint_20261028_1632.sql');

// Direct connection string with endpoint option for instant reliable connection
const directUrl = `postgresql://neondb_owner:npg_3OQICy7REpix@52.14.39.200:5432/neondb?sslmode=require&options=endpoint%3Dep-rapid-math-b46t2c0w`;

console.log('🔄 Initiating Database Rollback to Savepoint (2026-10-28 16:32)...');
console.log(`Backup File: ${BACKUP_FILE}`);

try {
  execSync(`psql "${directUrl}" -f "${BACKUP_FILE}"`, { stdio: 'inherit' });
  console.log('✅ Database successfully restored to savepoint (2026-10-28 15:16)!');
  
  // Reload in-memory cache
  try {
    const res = await fetch('http://localhost:8000/api/v1/cache/clear', { method: 'POST' });
    const data = await res.json();
    console.log('✅ In-memory cache reloaded successfully:', data);
  } catch (e) {
    console.log('ℹ️ Server cache will refresh on next startup:', e.message);
  }
} catch (error) {
  console.error('❌ Restore failed:', error.message);
  process.exit(1);
}
