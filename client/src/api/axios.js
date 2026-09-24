import axios from 'axios';

// Create base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fairforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle unauthenticated or global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and auth state on unauthorized response (if not on login/register endpoints)
      const isAuthEndpoint =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('fairforge_token');
        localStorage.removeItem('fairforge_user');
        window.dispatchEvent(new Event('fairforge_logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
