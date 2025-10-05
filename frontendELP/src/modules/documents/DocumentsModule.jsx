import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DocumentList from './DocumentList';
import DocumentUpload from './DocumentUpload';
import DocumentDetail from './DocumentDetail';
import { documentsService } from './documentsService';
import {
  DocumentTextIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const DocumentsModule = () => {
  const { user, hasAnyRole, ROLES } = useAuth();
  const [currentView, setCurrentView] = useState('list');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Permisos por rol
  const canUpload = hasAnyRole([ROLES.ADMIN, ROLES.RRHH]);
  const canManage = hasAnyRole([ROLES.ADMIN, ROLES.RRHH]);
  const canViewAll = hasAnyRole([ROLES.ADMIN, ROLES.RRHH, ROLES.CONTABILIDAD]);

  useEffect(() => {
    loadDocuments();
    loadDocumentTypes();
  }, [filters]);

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await documentsService.getDocuments(filters);
      
      if (result.success) {
        setDocuments(result.documents || []);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error de conexión al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const result = await documentsService.getDocumentTypes();
      if (result.success) {
        setDocumentTypes(result.types || []);
      }
    } catch (error) {
      console.error('Error al cargar tipos de documento:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setCurrentView('detail');
  };

  const handleUploadSuccess = (uploadResults) => {
    // Recargar documentos después de subir archivos exitosamente
    loadDocuments();
    setCurrentView('list');
  };

  const handleDocumentUpdate = () => {
    // Recargar documentos después de cualquier actualización
    loadDocuments();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return (
          <DocumentUpload
            onUploadSuccess={handleUploadSuccess}
            onBack={() => setCurrentView('list')}
            documentTypes={documentTypes}
          />
        );
      case 'detail':
        return (
          <DocumentDetail
            document={selectedDocument}
            onBack={() => setCurrentView('list')}
            onDocumentUpdate={handleDocumentUpdate}
            canManage={canManage}
          />
        );
      default:
        return (
          <DocumentList
            documents={documents}
            loading={loading}
            onDocumentSelect={handleDocumentSelect}
            onRefresh={loadDocuments}
            canManage={canManage}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Documentos Laborales
            </h1>
            <p className="text-sm text-gray-500">
              Gestión y consulta de documentos del sistema
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {canUpload && currentView === 'list' && (
            <button
              onClick={() => setCurrentView('upload')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Subir Documento
            </button>
          )}
          
          {currentView === 'list' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filtros
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && currentView === 'list' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre o descripción..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tipo de documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                {documentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="reviewed">Revisado</option>
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones de filtro */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Limpiar
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default DocumentsModule;