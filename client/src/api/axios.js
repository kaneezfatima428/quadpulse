import axios from 'axios';

// In Vite, env vars must be prefixed with VITE_ to be exposed in the client bundle.
// Keep both names supported to avoid production breakage from older env files.
const PROD_API = 'https://quadpulse-mu.vercel.app/api';
const DEV_API = 'http://localhost:5000/api';
const resolvedBaseURL =
  import.meta.env.API_URL ||
  import.meta.env.API_URL ||
  (import.meta.env.PROD ? PROD_API : DEV_API);

const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request Interceptor: Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle connection refused, timeout, and 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unreachable (ERR_CONNECTION_REFUSED or Network Error)
    if (!error.response) {
      const isProd = import.meta.env.PROD;
      const customError = new Error(
        isProd
          ? 'Unable to reach the server. Please try again later.'
          : 'Backend server is not reachable on port 5000. Please start your backend with: cd server && npm start'
      );
      customError.isNetworkError = true;
      return Promise.reject(customError);
    }

    if (error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
