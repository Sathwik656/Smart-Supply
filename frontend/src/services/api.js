import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';

const normalizeApiBaseUrl = (rawUrl) => {
  const url = (rawUrl || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, '');
  return url.endsWith('/api') ? url : `${url}/api`;
};

export const getApiBaseUrl = () => normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export const getSocketBaseUrl = () => getApiBaseUrl().replace(/\/api$/, '');

const baseURL = getApiBaseUrl();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // App now runs without frontend login, so never force a /login redirect.
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export default api;
