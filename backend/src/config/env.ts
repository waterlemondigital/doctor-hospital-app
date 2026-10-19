import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseCorsOrigins(raw?: string): string[] {
  if (!raw) return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Fallback to comma separated
    }
  }
  return trimmed.split(',').map((o) => o.trim()).filter(Boolean);
}

export const env = {
  PROJECT_NAME: process.env.PROJECT_NAME || 'HealthDiscover API',
  ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  DEBUG: process.env.DEBUG === 'True' || process.env.DEBUG === 'true',
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT || '8000', 10),
  CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGINS),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/healthdiscover_db',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'replace-this-with-a-secure-random-secret-key',
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440', 10),
  REFRESH_TOKEN_EXPIRE_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7', 10),
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin@medvexa.health',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'MedVexa@Admin2026',
  AUTH_COOKIE_SECURE: process.env.ENVIRONMENT === 'production',
  AUTH_COOKIE_SAMESITE: (process.env.AUTH_COOKIE_SAMESITE || 'lax') as 'lax' | 'strict' | 'none',
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'medvexa',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || 'https://pub-151166afd0294cb99a7c59679d424908.r2.dev/',
};
