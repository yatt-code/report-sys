import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', {
        username: credentials.email,  // Use email as username
        password: credentials.password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (userData) => {
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
  create: async ({ title, content, files }) => {
    // Send report data as JSON
    const response = await api.post('/api/reports', {
      title,
      content,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If there are files, upload them separately
    if (files?.length) {
      await Promise.all(
        files.map(file => reports.uploadAttachment(response.data.id, file))
      );
    }

    return response.data;
  },

  list: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/api/reports', {
      params: { 
        skip: (page - 1) * limit,
        limit,
        search 
      }
    });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/api/reports/${id}`);
    return response.data;
  },

  update: async (id, { title, content, files }) => {
    // Send report data as JSON
    const response = await api.put(`/api/reports/${id}`, {
      title,
      content,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle file uploads separately if needed
    if (files?.length) {
      await Promise.all(
        files.map(file => reports.uploadAttachment(id, file))
      );
    }

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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadAttachment: async (reportId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/api/reports/${reportId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAttachment: async (reportId, attachmentId) => {
    const response = await api.delete(`/api/reports/${reportId}/attachments/${attachmentId}`);
    return response.data;
  },
};

