import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Interceptor to attach Bearer Token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('manpower_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expiry / unauth
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('manpower_token');
      localStorage.removeItem('manpower_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
