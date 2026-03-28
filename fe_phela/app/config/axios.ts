import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://phela-backend-dyl7.onrender.com';

// Tạo một instance của Axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Tăng timeout lên 60s cho payment/order operations
  headers: {
    // Axios will automatically set Content-Type based on request data
  },
  withCredentials: true, // Enable sending cookies and credentials
});

// Interceptor để gắn token vào mỗi request
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

// Interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    if (error.response?.status === 401) {
      const storedUserRaw = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

      // Skip hard redirects for unauthenticated flows (e.g. invalid login attempts)
      if (!storedUser && !storedToken) {
        return Promise.reject(error);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const redirectRole = storedUser?.type ?? import.meta.env.VITE_ROLE;
      if (redirectRole === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/login-register';
      }
    }

    if (error.response?.status === 403) {
      // Handle forbidden access
      console.warn('Access forbidden. User may not have required role.');
      // Could show a toast notification here
    }

    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi (tuỳ chọn)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error);
//     return Promise.reject(error);
//   }
// );

export default api;