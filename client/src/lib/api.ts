import axios from 'axios';

import { env } from '@/config/env';
import { type User } from '@/types/api';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/utils/token';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    /** Access token attached when the request was originally sent. */
    _tokenUsed?: string;
    /** Marks a request already replayed after a refresh. */
    _retry?: boolean;
  }
}

/**
 * Shared axios instance for all API calls.
 * Attaches the stored access token to every request and transparently
 * refreshes an expired session once on 401 before replaying the request.
 */
export const api = axios.create({
  baseURL: `${env.API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config._tokenUsed = token;
  }
  return config;
});

/**
 * Callback invoked when the session cannot be recovered (refresh failed).
 */
type SessionExpiredListener = () => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();

/**
 * Registers a callback invoked when the session expires and cannot be
 * refreshed; returns a function that unsubscribes the callback.
 */
export const onSessionExpired = (
  listener: SessionExpiredListener,
): (() => void) => {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
};

// Auth endpoints manage their own credentials; refreshing from their own 401s
// would loop.
const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];

let refreshPromise: Promise<RefreshPayload> | null = null;

/**
 * Payload returned by the refresh endpoint.
 */
interface RefreshPayload {
  accessToken: string;
  user: User;
}

/**
 * Requests a fresh access token via the httpOnly refresh cookie; concurrent
 * callers share the in-flight request so only one round-trip happens. Stores
 * the new token before resolving with the full payload.
 */
export const refreshAccessToken = (): Promise<RefreshPayload> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshPayload>(`${env.API_URL}/api/auth/refresh`, null, {
        withCredentials: true,
      })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || !error.config) throw error;
  const original = error.config;
  const isAuthCall = AUTH_PATHS.some((path) => original.url?.includes(path));

  if (
    error.response?.status !== 401 ||
    original._retry ||
    isAuthCall ||
    !original._tokenUsed
  ) {
    throw error;
  }

  original._retry = true;
  try {
    // A concurrent request may have refreshed the token while this one was in
    // flight; reuse it instead of refreshing again.
    const token =
      getAccessToken() !== original._tokenUsed
        ? getAccessToken()!
        : (await refreshAccessToken()).accessToken;
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  } catch {
    clearAccessToken();
    sessionExpiredListeners.forEach((listener) => listener());
    throw error;
  }
});
