import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { documentsService } from './documentsService';
import { useAuth } from '../../context/AuthContext';

const DocumentDetail = ({ document, onBack, onDocumentUpdate, canManage }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [observations, setObservations] = useState([]);
  const [newObservation, setNewObservation] = useState('');
  const [isAddingObservation, setIsAddingObservation] = useState(false);
  const [documentStatus, setDocumentStatus] = useState(document?.status || 'pending');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (document?.id) {
      loadObservations();
      markAsRead();
    }
  }, [document?.id]);

  const loadObservations = async () => {
    try {
      const result = await documentsService.getObservations(document.id);
      if (result.success) {
        setObservations(result.data || []);
      }
    } catch (error) {
      console.error('Error loading observations:', error);
    }
  };

  const markAsRead = async () => {
    if (!document.read_by_user) {
      try {
        await documentsService.markAsRead(document.id);
        onDocumentUpdate && onDocumentUpdate();
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await documentsService.downloadDocument(document.id);
      
      if (result.success) {
        // Crear blob y descargar
        const blob = new Blob([result.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = document.filename || `documento_${document.id}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error al descargar el documento: ' + result.error);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error al descargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleAddObservation = async () => {
    if (!newObservation.trim()) return;

    setIsAddingObservation(true);
    try {
      const result = await documentsService.addObservation(document.id, newObservation.trim());
      
      if (result.success) {
        setObservations(prev => [result.data, ...prev]);
        setNewObservation('');
      } else {
        alert('Error al agregar observación: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding observation:', error);
      alert('Error al agregar observación');
    } finally {
      setIsAddingObservation(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const result = await documentsService.updateDocumentStatus(document.id, newStatus);
      
      if (result.success) {
        setDocumentStatus(newStatus);
        onDocumentUpdate && onDocumentUpdate();
      } else {
        alert('Error al actualizar estado: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await documentsService.deleteDocument(document.id);
      
      if (result.success) {
        alert('Documento eliminado correctamente');
        onBack && onBack();
      } else {
        alert('Error al eliminar documento: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error al eliminar documento');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'reviewed':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return CheckCircleIcon;
      case 'pending':
        return ClockIcon;
      case 'rejected':
        return ExclamationCircleIcon;
      case 'reviewed':
        return EyeIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      case 'reviewed':
        return 'Revisado';
      default:
        return 'Sin estado';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const StatusIcon = getStatusIcon(documentStatus);

  if (!document) {
    return (
      <div className="p-8 text-center">
        <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Documento no encontrado
        </h3>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {document.title || document.filename}
            </h1>
            <p className="text-gray-600">Detalles del documento</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(documentStatus)}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{getStatusText(documentStatus)}</span>
          </div>
          
          {!document.read_by_user && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Nuevo
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del documento */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Documento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Título</label>
                <p className="text-gray-900">{document.title || 'Sin título'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo</label>
                <p className="text-gray-900">
                  {document.type?.name || document.type || 'Sin clasificar'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Archivo</label>
                <p className="text-gray-900 flex items-center space-x-2">
                  <PaperClipIcon className="h-4 w-4 text-gray-400" />
                  <span>{document.filename}</span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Tamaño</label>
                <p className="text-gray-900">{formatFileSize(document.file_size)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Subido por</label>
                <p className="text-gray-900 flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span>{document.uploaded_by?.nombre_completo || document.uploaded_by || 'Desconocido'}</span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de subida</label>
                <p className="text-gray-900 flex items-center space-x-2">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(document.created_at || document.upload_date)}</span>
                </p>
              </div>
              
              {document.department && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Departamento</label>
                  <p className="text-gray-900">{document.department}</p>
                </div>
              )}
              
              {document.priority && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Prioridad</label>
                  <p className="text-gray-900 capitalize">{document.priority}</p>
                </div>
              )}
              
              {document.expiration_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de vencimiento</label>
                  <p className="text-gray-900">{formatDate(document.expiration_date)}</p>
                </div>
              )}
            </div>
            
            {document.description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="text-gray-900">{document.description}</p>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Observaciones ({observations.length})</span>
              </h2>
            </div>

            {/* Agregar nueva observación */}
            <div className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newObservation}
                    onChange={(e) => setNewObservation(e.target.value)}
                    placeholder="Agregar una observación..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddObservation}
                      disabled={isAddingObservation || !newObservation.trim()}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isAddingObservation || !newObservation.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isAddingObservation ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de observaciones */}
            <div className="space-y-4">
              {observations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay observaciones para este documento
                </p>
              ) : (
                observations.map((observation) => (
                  <div key={observation.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {observation.created_by?.nombre_completo || observation.created_by || 'Usuario'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(observation.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700">{observation.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Acciones */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>{loading ? 'Descargando...' : 'Descargar'}</span>
              </button>
              
              {canManage && (
                <>
                  <button
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Eliminar</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cambiar estado */}
          {canManage && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Documento</h3>
              
              <div className="space-y-2">
                {['pending', 'reviewed', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isUpdatingStatus || documentStatus === status}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      documentStatus === status
                        ? getStatusColor(status) + ' border'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                    } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadatos</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">ID del documento:</span>
                <span className="ml-2 text-gray-900">{document.id}</span>
              </div>
              
              {document.mime_type && (
                <div>
                  <span className="text-gray-500">Tipo MIME:</span>
                  <span className="ml-2 text-gray-900">{document.mime_type}</span>
                </div>
              )}
              
              {document.hash && (
                <div>
                  <span className="text-gray-500">Hash:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">
                    {document.hash.substring(0, 16)}...
                  </span>
                </div>
              )}
              
              {document.version && (
                <div>
                  <span className="text-gray-500">Versión:</span>
                  <span className="ml-2 text-gray-900">{document.version}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar eliminación
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetail;