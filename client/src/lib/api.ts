import axios from 'axios';

import { env } from '@/config/env';
import { getAccessToken } from '@/utils/token';

export const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
});

// a refresh API instance to handle token refresh
// to avoid circular dependency issues

// const refreshApi = axios.create({
//   baseURL: env.API_URL,
//   withCredentials: true,
// });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const res = await refreshApi.get('/auth/refresh');
//         const newAccessToken = res.data.accessToken;
//         setAccessToken(newAccessToken);

//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (err) {
//         // TODO: clear token, redirect to login, etc.
//         console.error('Token refresh failed:', err);
//         const searchParams = new URLSearchParams();
//         const redirectTo =
//           searchParams.get('redirectTo') || window.location.pathname;
//         window.location.href = paths.auth.login.getHref(redirectTo);

//         return Promise.reject(err);
//       }
//     }

//     return Promise.reject(error);
//   },
// );
