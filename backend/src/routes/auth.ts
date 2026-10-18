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
  const { email, password, name, phone, role } = req.body || {};

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

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  const assignedRole = ['patient', 'doctor', 'admin'].includes(role) ? role : 'patient';

  const insertRes = await query<User>(
    `INSERT INTO users (id, email, hashed_password, name, phone, role, is_active, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, true, false)
     RETURNING id, email, name, role, phone, avatar, is_active, is_verified, created_at, updated_at`,
    [userId, normalizedEmail, hashedPassword, name.trim(), phone || null, assignedRole]
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
  const { email, username, password } = req.body || {};
  const userIdentifier = (email || username || '').toLowerCase().trim();

  if (!userIdentifier || !password) {
    res.status(400).json({ status: 'error', detail: 'Email/username and password are required' });
    return;
  }

  const userRes = await query<User>('SELECT * FROM users WHERE email = $1', [userIdentifier]);
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
