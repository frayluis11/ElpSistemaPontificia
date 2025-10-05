import React from 'react';
import {
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  TagIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { documentsService } from './documentsService';

const DocumentList = ({ documents, loading, onDocumentSelect, onRefresh, canManage }) => {
  
  const handleDownload = async (document, event) => {
    event.stopPropagation();
    
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
    }
  };

  const getStatusColor = (status, isSigned = false) => {
    if (isSigned) {
      return 'text-emerald-600 bg-emerald-100';
    }
    
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'reviewed':
        return 'text-blue-600 bg-blue-100';
      case 'signed':
        return 'text-emerald-600 bg-emerald-100';
      case 'pending_signature':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status, isSigned = false) => {
    if (isSigned) {
      return ClipboardDocumentCheckIcon;
    }
    
    switch (status) {
      case 'approved':
        return CheckCircleIcon;
      case 'pending':
        return ClockIcon;
      case 'rejected':
        return ExclamationCircleIcon;
      case 'reviewed':
        return EyeIcon;
      case 'signed':
        return ClipboardDocumentCheckIcon;
      case 'pending_signature':
        return PencilSquareIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getStatusText = (status, isSigned = false) => {
    if (isSigned) {
      return 'Firmado';
    }
    
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      case 'reviewed':
        return 'Revisado';
      case 'signed':
        return 'Firmado';
      case 'pending_signature':
        return 'Esperando Firma';
      default:
        return 'Sin estado';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando documentos...</span>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center">
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay documentos
        </h3>
        <p className="text-gray-500 mb-4">
          No se encontraron documentos con los filtros aplicados.
        </p>
        <button
          onClick={onRefresh}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Actualizar lista
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header de la lista */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Lista de Documentos
          </h2>
          <p className="text-sm text-gray-500">
            {documents.length} documento{documents.length !== 1 ? 's' : ''} encontrado{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Actualizar
        </button>
      </div>

      {/* Lista de documentos */}
      <div className="space-y-4">
        {documents.map((document) => {
          const isSigned = document.signed || document.signature_info;
          const StatusIcon = getStatusIcon(document.status, isSigned);
          
          return (
            <div
              key={document.id}
              onClick={() => onDocumentSelect(document)}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white ${
                isSigned ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Icono del documento */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Información del documento */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.title || document.filename}
                      </h3>
                      {!document.read_by_user && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Nuevo
                        </span>
                      )}
                      {isSigned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          ✓ Firmado
                        </span>
                      )}
                      {document.status === 'pending_signature' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          ✍️ Pendiente de Firma
                        </span>
                      )}
                    </div>

                    {document.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {document.description}
                      </p>
                    )}

                    {/* Metadatos */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      {document.type && (
                        <div className="flex items-center space-x-1">
                          <TagIcon className="h-3 w-3" />
                          <span>{document.type.name || document.type}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="h-3 w-3" />
                        <span>{formatDate(document.created_at || document.upload_date)}</span>
                      </div>
                      
                      {document.file_size && (
                        <span>{formatFileSize(document.file_size)}</span>
                      )}
                      
                      {document.uploaded_by && (
                        <span>Por: {document.uploaded_by.nombre_completo || document.uploaded_by}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estado y acciones */}
                <div className="flex items-center space-x-3">
                  {/* Estado */}
                  <div className="flex items-center space-x-1">
                    <StatusIcon className="h-4 w-4" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status, isSigned)}`}>
                      {getStatusText(document.status, isSigned)}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDocumentSelect(document);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={(e) => handleDownload(document, e)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Descargar"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Observaciones recientes */}
              {document.recent_observations && document.recent_observations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Última observación:</div>
                  <div className="text-sm text-gray-700 line-clamp-1">
                    {document.recent_observations[0].content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentList;