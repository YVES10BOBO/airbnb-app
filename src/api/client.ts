import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const TOKEN_KEY = 'liston_token';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  // Do not set Content-Type globally: it breaks multipart uploads (photos).
  // JSON requests still get application/json from axios when the body is a plain object.
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Must omit Content-Type so the browser adds multipart/form-data + boundary for FormData.
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
