import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to add auth token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: async (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    try {
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Store the token
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      
      // Get user details
      const user = await auth.me();
      return user;
    } catch (error) {
      console.error('Login error:', error.response?.data);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    }
  },

  me: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Auth check failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// Reports API
export const reports = {
  create: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },

  list: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/reports', {
      params: { 
        skip: (page - 1) * limit, 
        limit,
        search 
      }
    });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/reports/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  uploadInlineImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/reports/upload-inline', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadAttachment: async (reportId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/reports/${reportId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAttachment: async (reportId, attachmentId) => {
    const response = await api.delete(`/reports/${reportId}/attachments/${attachmentId}`);
    return response.data;
  }
};

export default api;
