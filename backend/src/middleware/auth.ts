import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/postgres.js';
import { User } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
}

export function signAccessToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, type: 'access' },
    env.JWT_SECRET_KEY,
    { expiresIn: `${env.ACCESS_TOKEN_EXPIRE_MINUTES}m` }
  );
}

export function signRefreshToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, type: 'refresh' },
    env.JWT_SECRET_KEY,
    { expiresIn: `${env.REFRESH_TOKEN_EXPIRE_DAYS}d` }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET_KEY) as TokenPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token =
    req.cookies?.access_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    res.status(401).json({ detail: 'Not authenticated' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    res.status(401).json({ detail: 'Invalid or expired token' });
    return;
  }

  try {
    const userRes = await query<User>('SELECT * FROM users WHERE id = $1', [payload.sub]);
    const user = userRes.rows[0];

    if (!user || !user.is_active) {
      res.status(401).json({ detail: 'Inactive or non-existent user' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(500).json({ detail: 'Internal authentication error' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ detail: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ detail: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
