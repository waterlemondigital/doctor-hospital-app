import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db/postgres.js';
import { env } from '../config/env.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  authenticateUser,
  AuthenticatedRequest,
} from '../middleware/auth.js';
import { User } from '../types/index.js';

export const authRouter = Router();

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const accessMaxAge = env.ACCESS_TOKEN_EXPIRE_MINUTES * 60 * 1000;
  const refreshMaxAge = env.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000;

  res.cookie('access_token', accessToken, {
    maxAge: accessMaxAge,
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: env.AUTH_COOKIE_SAMESITE,
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    maxAge: refreshMaxAge,
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: env.AUTH_COOKIE_SAMESITE,
    path: '/api/v1/auth',
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/v1/auth' });
}

async function handleRegisterOrSignup(req: Request, res: Response) {
  const { email, password, name, phone, country_code, role } = req.body || {};

  if (!email || !password || !name) {
    res.status(400).json({ status: 'error', detail: 'Email, password, and name are required' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    res.status(400).json({ status: 'error', detail: 'User with this email already exists' });
    return;
  }

  // Country code validation (defaults to +91 India)
  const rawCountryCode = (country_code || '+91').toString().trim();
  const countryCodeRegex = /^\+[1-9]\d{0,3}$/;
  if (!countryCodeRegex.test(rawCountryCode)) {
    res.status(400).json({
      status: 'error',
      detail: 'Invalid country code format. Must start with + followed by 1 to 4 digits (e.g. +91, +1, +44).',
    });
    return;
  }

  // Mobile number validation
  let cleanPhone: string | null = null;
  if (phone) {
    const formatted = phone.toString().replace(/[\s\-\(\)]/g, '').trim();

    if (rawCountryCode === '+91') {
      // Indian 10-digit mobile number starting with 6, 7, 8, or 9
      const indiaMobileRegex = /^[6-9]\d{9}$/;
      if (!indiaMobileRegex.test(formatted)) {
        res.status(400).json({
          status: 'error',
          detail: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
        });
        return;
      }
    } else {
      // International phone format: 7 to 15 digits
      const intlMobileRegex = /^\d{7,15}$/;
      if (!intlMobileRegex.test(formatted)) {
        res.status(400).json({
          status: 'error',
          detail: 'Please enter a valid mobile number (between 7 and 15 digits).',
        });
        return;
      }
    }
    cleanPhone = formatted;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  const assignedRole = ['patient', 'doctor', 'admin'].includes(role) ? role : 'patient';

  const insertRes = await query<User>(
    `INSERT INTO users (id, email, hashed_password, name, phone, country_code, role, is_active, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, false)
     RETURNING id, email, name, role, phone, country_code, avatar, is_active, is_verified, created_at, updated_at`,
    [userId, normalizedEmail, hashedPassword, name.trim(), cleanPhone, rawCountryCode, assignedRole]
  );

  const newUser = insertRes.rows[0];
  const accessToken = signAccessToken(newUser);
  const refreshToken = signRefreshToken(newUser);

  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    user: newUser,
    access_token: accessToken,
    token_type: 'bearer',
  });
}

// Support both /auth/signup and /auth/register
authRouter.post('/auth/signup', handleRegisterOrSignup);
authRouter.post('/auth/register', handleRegisterOrSignup);

authRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { email, username, phone, password } = req.body || {};
  const userIdentifier = (email || username || phone || '').toLowerCase().trim();

  if (!userIdentifier || !password) {
    res.status(400).json({ status: 'error', detail: 'Email/username/mobile and password are required' });
    return;
  }

  // Allow login by email or phone number
  const userRes = await query<User>(
    'SELECT * FROM users WHERE email = $1 OR phone = $1',
    [userIdentifier]
  );
  const user = userRes.rows[0];

  if (!user) {
    res.status(401).json({ status: 'error', detail: 'Incorrect email or password' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
  if (!isPasswordValid) {
    res.status(401).json({ status: 'error', detail: 'Incorrect email or password' });
    return;
  }

  if (!user.is_active) {
    res.status(403).json({ status: 'error', detail: 'Account is inactive' });
    return;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  setAuthCookies(res, accessToken, refreshToken);

  const { hashed_password, hashed_refresh_token, ...safeUser } = user;
  res.json({
    status: 'success',
    message: 'Logged in successfully',
    user: safeUser,
    access_token: accessToken,
    token_type: 'bearer',
  });
});

authRouter.get('/auth/me', authenticateUser, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ status: 'error', detail: 'Not authenticated' });
    return;
  }
  const { hashed_password, hashed_refresh_token, ...safeUser } = req.user;
  res.json(safeUser);
});

authRouter.post('/auth/logout', (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({ status: 'success', message: 'Logged out successfully' });
});

authRouter.post('/auth/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token || req.body?.refresh_token;

  if (!refreshToken) {
    res.status(401).json({ status: 'error', detail: 'No refresh token provided' });
    return;
  }

  const payload = verifyToken(refreshToken);
  if (!payload || !payload.sub || payload.type !== 'refresh') {
    res.status(401).json({ status: 'error', detail: 'Invalid refresh token' });
    return;
  }

  const userRes = await query<User>('SELECT * FROM users WHERE id = $1', [payload.sub]);
  const user = userRes.rows[0];

  if (!user || !user.is_active) {
    res.status(401).json({ status: 'error', detail: 'User inactive or non-existent' });
    return;
  }

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  setAuthCookies(res, newAccessToken, newRefreshToken);
  const { hashed_password, hashed_refresh_token, ...safeUser } = user;
  res.json({
    status: 'success',
    message: 'Session refreshed successfully',
    user: safeUser,
    access_token: newAccessToken,
    token_type: 'bearer',
  });
});
