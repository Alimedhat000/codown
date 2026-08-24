import axios from 'axios';

import { env } from '@/config/env';
import { getAccessToken } from '@/utils/token';

/**
 * Shared axios instance for all API calls.
 * Attaches the stored access token to every request.
 */
export const api = axios.create({
  baseURL: `${env.API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
