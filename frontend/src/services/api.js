import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
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

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const reports = {
  create: async ({ title, content, files }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (files) {
      files.forEach((file) => formData.append('files', file));
    }
    const response = await api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  list: async ({ page = 1, limit = 10, search }) => {
    const params = new URLSearchParams({
      skip: (page - 1) * limit,
      limit,
      ...(search && { search }),
    });
    const response = await api.get(`/reports?${params}`);
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  update: async (id, { title, content, files }) => {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);
    if (files) {
      files.forEach((file) => formData.append('files', file));
    }
    const response = await api.put(`/reports/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  deleteAttachment: async (reportId, attachmentId) => {
    const response = await api.delete(`/reports/${reportId}/attachments/${attachmentId}`);
    return response.data;
  },
};

export default api;
