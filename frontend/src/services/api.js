import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const { data } = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return data;
  },

  signup: async (userData) => {
    const { data } = await api.post('/auth/signup', userData);
    return data;
  },

  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Reports API
export const reports = {
  list: async (page = 1, limit = 10, search = '') => {
    const { data } = await api.get('/reports', {
      params: { skip: (page - 1) * limit, limit, search },
    });
    return data;
  },

  get: async (id) => {
    const { data } = await api.get(`/reports/${id}`);
    return data;
  },

  create: async ({ title, content, files }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (files?.length) {
      files.forEach((file) => formData.append('files', file));
    }
    const { data } = await api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id, { title, content, files }) => {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);
    if (files?.length) {
      files.forEach((file) => formData.append('files', file));
    }
    const { data } = await api.put(`/reports/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/reports/${id}`);
    return data;
  },

  uploadInlineImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/reports/upload-inline', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  uploadAttachment: async (reportId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/reports/${reportId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteAttachment: async (reportId, attachmentId) => {
    const { data } = await api.delete(`/reports/${reportId}/attachments/${attachmentId}`);
    return data;
  },
};

// Comments API
export const comments = {
  getReportComments: async (reportId, params = {}) => {
    const { data } = await api.get(`/comments/report/${reportId}`, { params });
    return data;
  },

  create: async (commentData) => {
    const { data } = await api.post('/comments', commentData);
    return data;
  },

  update: async (commentId, commentData) => {
    const { data } = await api.put(`/comments/${commentId}`, commentData);
    return data;
  },

  delete: async (commentId) => {
    const { data } = await api.delete(`/comments/${commentId}`);
    return data;
  }
};

export const users = {
  search: async (query) => {
    const { data } = await api.get('/users/search', { params: { q: query } });
    return data;
  }
};

export default api;
