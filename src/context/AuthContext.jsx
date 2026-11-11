import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      cache: 'no-store',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    const error = new Error('API_UNAVAILABLE');
    error.code = 'API_UNAVAILABLE';
    throw error;
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.detail?.code || body?.error?.code || 'API_ERROR');
    error.code = body?.detail?.code || body?.error?.code || 'API_ERROR';
    error.status = response.status;
    throw error;
  }
  return body;
}

function csrfToken() {
  return document.cookie.split('; ').find((cookie) => cookie.startsWith('amal_csrf='))?.split('=').slice(1).join('=') || '';
}

function csrfHeaders() {
  return { 'X-CSRF-Token': csrfToken() };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const body = await request('/api/v1/auth/me', { headers: {} });
      setUser(body.user);
      return body.user;
    } catch (error) {
      if (error.status !== 401) throw error;
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh().catch(() => setLoading(false)); }, [refresh]);

  const authenticate = useCallback(async (path, values) => {
    const body = await request(path, { method: 'POST', body: JSON.stringify(values) });
    setUser(body.user);
    return body.user;
  }, []);

  const login = useCallback((email, password) => authenticate('/api/v1/auth/login', { email, password }), [authenticate]);
  const register = useCallback((name, email, password, otp_code) => authenticate('/api/v1/auth/register', { name, email, password, otp_code }), [authenticate]);
  const sendOtp = useCallback((email, name = '') => request('/api/v1/auth/send-otp', { method: 'POST', body: JSON.stringify({ email, name }) }), []);
  const verifyOtp = useCallback((email, code) => request('/api/v1/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, code }) }), []);

  const updateProfile = useCallback(async (name) => {
    const body = await request('/api/v1/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
      headers: csrfHeaders(),
    });
    setUser(body.user);
    return body.user;
  }, []);

  const changePassword = useCallback((currentPassword, newPassword) => request('/api/v1/auth/password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    headers: csrfHeaders(),
  }), []);

  const logout = useCallback(async () => {
    await request('/api/v1/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken() } });
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, sendOtp, verifyOtp, updateProfile, changePassword, logout, refresh }), [user, loading, login, register, sendOtp, verifyOtp, updateProfile, changePassword, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}

export function getCsrfHeader() {
  return { 'X-CSRF-Token': csrfToken() };
}
