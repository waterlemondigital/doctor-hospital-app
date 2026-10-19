import { apiFetch } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'hospital' | 'laboratory' | 'wellness' | 'admin';
  phone?: string;
  country_code?: string;
  avatar?: string;
  speciality?: string;
  experience?: string;
  whatsapp_number?: string;
  clinic_address?: string;
  medical_reg_no?: string;
  city?: string;
  address?: string;
  pincode?: string;
  authorized_person_name?: string;
  authorized_person_phone?: string;
  registration_cert_url?: string;
  address_proof_url?: string;
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
  role: 'patient' | 'doctor' | 'hospital' | 'laboratory' | 'wellness';
  phone?: string;
  country_code?: string;
  avatar?: string;
  speciality?: string;
  experience?: string;
  whatsapp_number?: string;
  clinic_address?: string;
  medical_reg_no?: string;
  city?: string;
  address?: string;
  pincode?: string;
  authorized_person_name?: string;
  authorized_person_phone?: string;
  registration_cert_url?: string;
  address_proof_url?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Upload PDF document directly to Cloudflare R2 via secure backend endpoint.
 * Enforces PDF only and < 5MB limit.
 */
export async function uploadDocument(
  file: File,
  entityType: 'hospital' | 'laboratory' | 'wellness' | 'doctor',
  docType: string,
  entityName: string
): Promise<{ status: string; url: string; key: string; fileName: string; fileSize: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('docType', docType);
  formData.append('entityName', entityName);

  const res = await fetch('/api/v1/upload/document', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || 'Failed to upload document');
  }

  return res.json();
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
