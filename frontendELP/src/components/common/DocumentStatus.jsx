import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  EyeIcon as EyeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  PencilSquareIcon as PencilSquareIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';
import axios from 'axios';

const DocumentStatus = ({ documentId, currentStatus, onStatusUpdate }) => {
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Definir los estados posibles y su orden
  const statusFlow = [
    {
      key: 'created',
      label: 'Documento Creado',
      description: 'El documento ha sido subido al sistema',
      icon: DocumentTextIcon,
      iconSolid: DocumentTextIconSolid,
      color: 'blue'
    },
    {
      key: 'published',
      label: 'Publicado',
      description: 'El documento está disponible para revisión',
      icon: EyeIcon,
      iconSolid: EyeIconSolid,
      color: 'indigo'
    },
    {
      key: 'reviewed',
      label: 'Revisado',
      description: 'El documento ha sido revisado por el responsable',
      icon: InformationCircleIcon,
      iconSolid: InformationCircleIcon,
      color: 'purple'
    },
    {
      key: 'signed',
      label: 'Firmado',
      description: 'El documento ha sido firmado digitalmente',
      icon: PencilSquareIcon,
      iconSolid: PencilSquareIconSolid,
      color: 'green'
    },
    {
      key: 'completed',
      label: 'Completado',
      description: 'El proceso del documento ha finalizado',
      icon: CheckCircleIcon,
      iconSolid: CheckCircleIconSolid,
      color: 'emerald'
    }
  ];

  // Estados que pueden ocurrir en paralelo o como alternativas
  const alternativeStates = [
    {
      key: 'rejected',
      label: 'Rechazado',
      description: 'El documento ha sido rechazado',
      icon: XCircleIcon,
      iconSolid: XCircleIconSolid,
      color: 'red'
    },
    {
      key: 'pending',
      label: 'Pendiente',
      description: 'Esperando acción del usuario',
      icon: ClockIcon,
      iconSolid: ClockIconSolid,
      color: 'yellow'
    }
  ];

  useEffect(() => {
    if (documentId) {
      fetchDocumentStatus();
    }
  }, [documentId]);

  const fetchDocumentStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/documents/${documentId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStatusHistory(response.data.statusHistory || []);
      } else {
        setError(response.data.message || 'Error al cargar el estado del documento');
      }
    } catch (error) {
      console.error('Error fetching document status:', error);
      setError('Error de conexión al cargar el estado del documento');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!statusHistory.length) return 0;
    
    const currentStatusKey = currentStatus || 'created';
    const currentIndex = statusFlow.findIndex(status => status.key === currentStatusKey);
    
    if (currentIndex === -1) return 0;
    
    // Si está rechazado, el progreso se detiene
    if (currentStatusKey === 'rejected') {
      const lastValidIndex = statusHistory
        .filter(h => statusFlow.some(s => s.key === h.status))
        .length - 1;
      return Math.max(0, (lastValidIndex / (statusFlow.length - 1)) * 100);
    }
    
    return ((currentIndex + 1) / statusFlow.length) * 100;
  };

  const getStatusInfo = (statusKey) => {
    return statusFlow.find(s => s.key === statusKey) || 
           alternativeStates.find(s => s.key === statusKey);
  };

  const isStatusCompleted = (statusKey) => {
    if (!statusHistory.length) return false;
    return statusHistory.some(h => h.status === statusKey);
  };

  const isStatusCurrent = (statusKey) => {
    return currentStatus === statusKey;
  };

  const getStatusDate = (statusKey) => {
    const statusEntry = statusHistory.find(h => h.status === statusKey);
    return statusEntry ? new Date(statusEntry.timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={fetchDocumentStatus}
          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="p-6">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Estado del Documento
          </h3>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(progress)}% Completado
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              currentStatus === 'rejected' ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Timeline */}
      <div className="space-y-4">
        {statusFlow.map((status, index) => {
          const Icon = isStatusCompleted(status.key) ? status.iconSolid : status.icon;
          const isCompleted = isStatusCompleted(status.key);
          const isCurrent = isStatusCurrent(status.key);
          const statusDate = getStatusDate(status.key);
          
          return (
            <div
              key={status.key}
              className={`flex items-start space-x-4 pb-4 ${
                index < statusFlow.length - 1 ? 'border-l-2 border-gray-200 ml-4' : ''
              }`}
            >
              <div className={`relative ${index < statusFlow.length - 1 ? '-ml-6' : ''}`}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isCompleted
                      ? `bg-${status.color}-500 border-${status.color}-500 text-white`
                      : isCurrent
                      ? `border-${status.color}-500 bg-white text-${status.color}-500`
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {status.label}
                  </p>
                  {statusDate && (
                    <p className="text-xs text-gray-500">
                      {statusDate}
                    </p>
                  )}
                </div>
                <p className={`text-sm ${
                  isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {status.description}
                </p>
                
                {isCurrent && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
                      Estado actual
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Alternative States (if applicable) */}
        {(currentStatus === 'rejected' || currentStatus === 'pending') && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            {alternativeStates
              .filter(state => state.key === currentStatus)
              .map(status => {
                const Icon = status.iconSolid;
                const statusDate = getStatusDate(status.key);
                
                return (
                  <div key={status.key} className="flex items-start space-x-4">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 bg-${status.color}-500 border-${status.color}-500 text-white`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {status.label}
                        </p>
                        {statusDate && (
                          <p className="text-xs text-gray-500">
                            {statusDate}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {status.description}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* History Details */}
      {statusHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Historial de Cambios
          </h4>
          <div className="space-y-2">
            {statusHistory
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((entry, index) => {
                const statusInfo = getStatusInfo(entry.status);
                return (
                  <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      {statusInfo?.label || entry.status} 
                      {entry.user && ` por ${entry.user}`}
                    </span>
                    <span>{formatDate(entry.timestamp)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentStatus;