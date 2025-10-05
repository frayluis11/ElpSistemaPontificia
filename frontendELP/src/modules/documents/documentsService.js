import { api } from '../../services/api';

// Servicios para el módulo de documentos
export const documentsService = {
  // Obtener lista de documentos
  getDocuments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/documents?${params.toString()}`);
      return {
        success: true,
        data: response.data,
        documents: response.data.items || response.data,
        total: response.data.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener documentos',
        status: error.response?.status
      };
    }
  },

  // Obtener documento específico
  getDocument: async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      return {
        success: true,
        data: response.data,
        document: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener documento',
        status: error.response?.status
      };
    }
  },

  // Subir nuevo documento
  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data,
        document: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al subir documento',
        status: error.response?.status
      };
    }
  },

  // Descargar documento
  downloadDocument: async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al descargar documento',
        status: error.response?.status
      };
    }
  },

  // Marcar documento como leído
  markAsRead: async (documentId) => {
    try {
      const response = await api.put(`/documents/${documentId}/mark-read`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al marcar como leído',
        status: error.response?.status
      };
    }
  },

  // Agregar observación a documento
  addObservation: async (documentId, observation) => {
    try {
      const response = await api.post(`/documents/${documentId}/observations`, {
        content: observation,
        date: new Date().toISOString()
      });
      return {
        success: true,
        data: response.data,
        observation: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al agregar observación',
        status: error.response?.status
      };
    }
  },

  // Obtener observaciones de documento
  getObservations: async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}/observations`);
      return {
        success: true,
        data: response.data,
        observations: response.data.items || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener observaciones',
        status: error.response?.status
      };
    }
  },

  // Actualizar estado de documento (solo para RRHH/Admin)
  updateDocumentStatus: async (documentId, status, notes = '') => {
    try {
      const response = await api.put(`/documents/${documentId}/status`, {
        status,
        notes
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al actualizar estado',
        status: error.response?.status
      };
    }
  },

  // Eliminar documento (solo Admin)
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al eliminar documento',
        status: error.response?.status
      };
    }
  },

  // Obtener tipos de documentos disponibles
  getDocumentTypes: async () => {
    try {
      const response = await api.get('/documents/types');
      return {
        success: true,
        data: response.data,
        types: response.data.items || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener tipos',
        status: error.response?.status
      };
    }
  },

  // Estadísticas de documentos
  getDocumentStats: async () => {
    try {
      const response = await api.get('/documents/stats');
      return {
        success: true,
        data: response.data,
        stats: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener estadísticas',
        status: error.response?.status
      };
    }
  }
};

export default documentsService;