import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Public API paths that should never trigger a redirect on 401.
// These endpoints are permitAll on the backend and may return 401 when
// called without a token on some Spring Security configurations.
const PUBLIC_API_PATHS = [
  '/products',
  '/categories',
  '/brands',
  '/reviews',
];

const isPublicPath = (url = '') =>
  PUBLIC_API_PATHS.some((path) => url.startsWith(path));

// Response Interceptor: Handle Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const onLoginPage = window.location.pathname.includes('/login');
      const isAuthEndpoint = requestUrl === '/auth/login';
      const isPublic = isPublicPath(requestUrl);

      // Only force-logout and redirect when:
      // - the failing request is NOT a public endpoint
      // - the failing request is NOT the login call itself
      // - the user is NOT already on the login page
      if (!isAuthEndpoint && !isPublic && !onLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
