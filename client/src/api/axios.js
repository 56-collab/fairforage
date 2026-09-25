import axios from 'axios';

// Determine the API base URL depending on environment
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  
  // If running on Vercel or any non-localhost host without custom env
  if (
    import.meta.env.PROD ||
    (typeof window !== 'undefined' &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1'))
  ) {
    return 'https://fairforage.onrender.com/api';
  }

  // Local development fallback to Vite proxy
  return '/api';
};

// Create base Axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds to handle Render cold-starts
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
      const url = error.config?.url || '';
      const isAuthEndpoint =
        url.includes('/auth/login') || url.includes('/auth/register');

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
