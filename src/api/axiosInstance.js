import axios from 'axios';

const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getBaseUrl = () => {
  let url = ENV_BASE_URL || 'https://new-job-portal-be-dh8v.onrender.com';
  url = url.replace(/\/+$/, '');
  if (url.endsWith('/api')) {
    url = url.slice(0, -4);
  }
  return url;
};

const BASE_URL = getBaseUrl();

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 25000,
});

// A small hack to hold the store reference without top-level imports
let store;
export const injectStore = (_store) => {
  store = _store;
};

axiosInstance.interceptors.request.use(
  (config) => {
    let token = store?.getState()?.auth?.token || localStorage.getItem('token');

    if (token && typeof token === 'string') {
      token = token.replace(/^Bearer\s+/i, '').trim();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Only auto-logout if it's a true 401 on core employer/auth session endpoints,
    // and NOT an authorization failure on admin or optional sub-features.
    if (status === 401) {
      const currentPath = window.location.pathname;
      const isPublicRoute =
        currentPath === '/login' ||
        currentPath === '/signup' ||
        currentPath.startsWith('/onboarding');

      // Do NOT log out the user if the 401 is from admin or staffing/vacancies endpoints
      const isAdminOrFeatureEndpoint =
        requestUrl.includes('/admin/') ||
        requestUrl.includes('/staffing') ||
        requestUrl.includes('/vacancies');

      if (!isPublicRoute && !isAdminOrFeatureEndpoint) {
        console.warn('401 Unauthorized encountered on session route:', requestUrl);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('employer');
        window.location.href = '/login';
      } else if (isAdminOrFeatureEndpoint) {
        console.warn('Access denied for endpoint (user lacks admin permission):', requestUrl);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
