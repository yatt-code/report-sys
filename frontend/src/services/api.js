import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: async (email, password) => {
    try {
      const payload = new URLSearchParams({
        username: email,
        password: password,
      });

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      const response = await api.post('/api/auth/login', payload, { headers });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  me: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Auth check failed:', error);
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
  },
};

// Reports API
export const reports = {
  list: async ({ page = 1, limit = 10, search = '' }) => {
    const response = await api.get('/api/reports', {
      params: { skip: (page - 1) * limit, limit, search },
    });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/api/reports/${id}`);
    return response.data;
  },

  create: async ({ title, content, files }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (files?.length) {
      files.forEach((file) => formData.append('files', file));
    }
    const response = await api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, { title, content, files }) => {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);
    if (files?.length) {
      files.forEach((file) => formData.append('files', file));
    }
    const response = await api.put(`/api/reports/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/reports/${id}`);
    return response.data;
  },

  uploadInlineImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/reports/upload-inline', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadAttachment: async (reportId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/reports/${reportId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAttachment: async (reportId, attachmentId) => {
    const response = await api.delete(`/api/reports/${reportId}/attachments/${attachmentId}`);
    return response.data;
  },
};

// Comments API
export const comments = {
  getReportComments: async (reportId, params = {}) => {
    const response = await api.get(`/api/comments/report/${reportId}`, { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/comments', data);
    return response.data;
  },

  update: async (commentId, data) => {
    const response = await api.put(`/api/comments/${commentId}`, data);
    return response.data;
  },

  delete: async (commentId) => {
    const response = await api.delete(`/api/comments/${commentId}`);
    return response.data;
  }
};

export const users = {
  search: async (query) => {
    const response = await api.get('/api/users/search', { params: { q: query } });
    return response.data;
  }
};

export default api;
