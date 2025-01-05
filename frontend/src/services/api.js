import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    try {
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
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

  logout: async () => {
    localStorage.removeItem('token');
    return { success: true };
  },
};

// Reports API
export const reports = {
  list: async ({ page = 1, limit = 10, search = '' }) => {
    const response = await api.get('/reports', {
      params: { skip: (page - 1) * limit, limit, search },
    });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  create: async ({ title, content, files }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (files?.length) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    const response = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, { title, content, files }) => {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);
    if (files?.length) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    const response = await api.put(`/reports/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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

// Comments API
export const comments = {
  // Fetch comments for a specific report
  list: async (reportId, { skip = 0, limit = 50 } = {}) => {
    const response = await api.get(`/comments/report/${reportId}`, {
      params: { skip, limit },
    });
    return response.data;
  },

  // Add a new comment to a report
  create: async ({ content, reportId, parentId = null }) => {
    const response = await api.post('/comments', {
      content,
      report_id: reportId,
      parent_id: parentId,
    });
    return response.data;
  },

  // Update an existing comment
  update: async (commentId, { content }) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  // Delete a comment
  delete: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};



export default api;
