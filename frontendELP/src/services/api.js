import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no válido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
  },
};

// Servicios de usuarios
export const usersAPI = {
  getAll: () => api.get('/users/'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users/', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
};

// Servicios de roles
export const rolesAPI = {
  getAll: () => api.get('/roles/'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (roleData) => api.post('/roles/', roleData),
  update: (id, roleData) => api.put(`/roles/${id}`, roleData),
  delete: (id) => api.delete(`/roles/${id}`),
};

// Servicios de documentos
export const documentsAPI = {
  getAll: () => api.get('/documents/'),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, documentData) => api.put(`/documents/${id}`, documentData),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => api.get(`/documents/${id}/download`, {
    responseType: 'blob',
  }),
};

// Servicios de horas trabajadas
export const hoursAPI = {
  getMyHours: (params) => api.get('/hours/my-hours', { params }),
  getAll: (params) => api.get('/hours/all', { params }),
  getById: (id) => api.get(`/hours/${id}`),
  create: (hoursData) => api.post('/hours/', hoursData),
  update: (id, hoursData) => api.put(`/hours/${id}`, hoursData),
  delete: (id) => api.delete(`/hours/${id}`),
  exportExcel: () => api.get('/hours/export/excel', {
    responseType: 'blob',
  }),
};

// Servicios de reportes y estadísticas
export const reportsAPI = {
  getUsersStats: () => api.get('/reports-stats/users'),
  getDocumentsStats: () => api.get('/reports-stats/documents'),
  getHoursStats: () => api.get('/reports-stats/hours'),
  getCompleteStats: () => api.get('/reports-stats/complete'),
  exportUsersExcel: () => api.get('/reports-stats/export/users/excel', {
    responseType: 'blob',
  }),
  exportUsersPDF: () => api.get('/reports-stats/export/users/pdf', {
    responseType: 'blob',
  }),
  exportDocumentsExcel: () => api.get('/reports-stats/export/documents/excel', {
    responseType: 'blob',
  }),
  exportDocumentsPDF: () => api.get('/reports-stats/export/documents/pdf', {
    responseType: 'blob',
  }),
  exportHoursExcel: () => api.get('/reports-stats/export/hours/excel', {
    responseType: 'blob',
  }),
  getMonthlySummary: (params) => api.get('/reports-stats/monthly-summary', { params }),
  getYearlyComparison: () => api.get('/reports-stats/yearly-comparison'),
  getDashboardSummary: () => api.get('/reports-stats/dashboard-summary'),
};

// Servicios del sistema
export const systemAPI = {
  getHealth: () => api.get('/health'),
  getStatus: () => api.get('/status'),
  getInfo: () => api.get('/info'),
  testDB: () => api.get('/db-test'),
};

// Utilidades para manejo de archivos
export const fileUtils = {
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

export default api;