import { apiFetch } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  country_code?: string;
  avatar?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  user: User;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  phone?: string;
  country_code?: string;
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Register a new user (patient or doctor)
 * Automatically sets HttpOnly access & refresh token cookies.
 */
export async function signupUser(payload: SignupPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipCache: true,
  });
}

/**
 * Authenticate with email and password
 * Automatically sets HttpOnly access & refresh token cookies.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipCache: true,
  });
}

/**
 * Refresh access token using 7-day refresh token stored in HttpOnly cookie.
 */
export async function refreshSession(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
    skipCache: true,
  });
}

/**
 * Get currently authenticated user profile from HttpOnly cookie session.
 */
export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>('/auth/me', {
    method: 'GET',
    skipCache: true,
  });
}

/**
 * Log out and clear cookies both on server and browser.
 */
export async function logoutUser(): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>('/auth/logout', {
    method: 'POST',
    skipCache: true,
  });
}
