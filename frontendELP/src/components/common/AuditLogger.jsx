import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import {
  ClockIcon,
  UserIcon,
  DocumentIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const AuditLogger = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: 'all',
    user: 'all',
    dateRange: 'today'
  });

  useEffect(() => {
    // Simular datos de auditoría existentes
    const mockAuditLogs = [
      {
        id: 1,
        action: 'view',
        documentId: 'doc-001',
        documentTitle: 'Contrato de Trabajo - Juan Pérez',
        user: 'María García',
        userRole: 'rrhh',
        timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
        details: 'Documento visualizado desde dashboard RRHH',
        ipAddress: '192.168.1.105',
        sessionId: 'sess-789',
        metadata: { browser: 'Chrome', device: 'Desktop' }
      },
      {
        id: 2,
        action: 'sign',
        documentId: 'doc-002',
        documentTitle: 'Evaluación Docente - Semestre I',
        user: 'Carlos López',
        userRole: 'docente',
        timestamp: new Date(Date.now() - 7200000), // 2 horas atrás
        details: 'Documento firmado digitalmente',
        ipAddress: '192.168.1.102',
        sessionId: 'sess-456',
        signatureId: 'sig-123',
        metadata: { browser: 'Firefox', device: 'Mobile' }
      },
      {
        id: 3,
        action: 'observe',
        documentId: 'doc-001',
        documentTitle: 'Contrato de Trabajo - Juan Pérez',
        user: 'Ana Martínez',
        userRole: 'admin',
        timestamp: new Date(Date.now() - 10800000), // 3 horas atrás
        details: 'Observación agregada: Revisar cláusula de beneficios',
        ipAddress: '192.168.1.100',
        sessionId: 'sess-123',
        observationId: 'obs-456',
        metadata: { browser: 'Edge', device: 'Desktop' }
      },
      {
        id: 4,
        action: 'download',
        documentId: 'doc-003',
        documentTitle: 'Informe Financiero Q4',
        user: 'Patricia Silva',
        userRole: 'contabilidad',
        timestamp: new Date(Date.now() - 14400000), // 4 horas atrás
        details: 'Documento descargado como PDF',
        ipAddress: '192.168.1.108',
        sessionId: 'sess-321',
        metadata: { browser: 'Chrome', device: 'Desktop' }
      },
      {
        id: 5,
        action: 'access_denied',
        documentId: 'doc-004',
        documentTitle: 'Documento Confidencial Admin',
        user: 'Juan Estudiante',
        userRole: 'docente',
        timestamp: new Date(Date.now() - 18000000), // 5 horas atrás
        details: 'Intento de acceso denegado por permisos insuficientes',
        ipAddress: '192.168.1.110',
        sessionId: 'sess-999',
        metadata: { browser: 'Safari', device: 'Mobile' },
        severity: 'warning'
      }
    ];

    setAuditLogs(mockAuditLogs);
  }, []);

  // Función para agregar nueva entrada de auditoría
  const addAuditLog = (logEntry) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date(),
      ipAddress: '192.168.1.1', // En producción se obtendría del cliente
      sessionId: `sess-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Unknown',
        device: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
      },
      ...logEntry
    };

    setAuditLogs(prev => [newLog, ...prev]);
    
    // En producción, aquí se enviaría al backend
    console.log('Nueva entrada de auditoría:', newLog);
    
    return newLog;
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'view': return EyeIcon;
      case 'sign': return PencilIcon;
      case 'observe': return InformationCircleIcon;
      case 'download': return ArrowDownTrayIcon;
      case 'access_denied': return ExclamationTriangleIcon;
      default: return DocumentIcon;
    }
  };

  const getActionColor = (action, severity) => {
    if (severity === 'warning') return 'text-orange-600 bg-orange-50';
    if (severity === 'error') return 'text-red-600 bg-red-50';
    
    switch (action) {
      case 'view': return 'text-blue-600 bg-blue-50';
      case 'sign': return 'text-green-600 bg-green-50';
      case 'observe': return 'text-purple-600 bg-purple-50';
      case 'download': return 'text-indigo-600 bg-indigo-50';
      case 'access_denied': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'view': return 'Visualización';
      case 'sign': return 'Firma Digital';
      case 'observe': return 'Observación';
      case 'download': return 'Descarga';
      case 'access_denied': return 'Acceso Denegado';
      default: return 'Acción';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'rrhh': return 'bg-blue-100 text-blue-800';
      case 'contabilidad': return 'bg-green-100 text-green-800';
      case 'docente': return 'bg-orange-100 text-orange-800';
      case 'ti': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filters.action !== 'all' && log.action !== filters.action) return false;
    if (filters.user !== 'all' && log.user !== filters.user) return false;
    
    // Filtro de fecha
    const now = new Date();
    const logDate = new Date(log.timestamp);
    
    switch (filters.dateRange) {
      case 'today':
        return logDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return logDate >= monthAgo;
      default:
        return true;
    }
  });

  const uniqueUsers = [...new Set(auditLogs.map(log => log.user))];

  return {
    auditLogs: filteredLogs,
    addAuditLog,
    filters,
    setFilters,
    uniqueUsers,
    getActionIcon,
    getActionColor,
    getActionLabel,
    getRoleColor
  };
};

// Componente de visualización de auditoría
const AuditLogViewer = ({ logs, filters, onFiltersChange, uniqueUsers, utilities }) => {
  const { user } = useAuth();
  const {
    getActionIcon,
    getActionColor,
    getActionLabel,
    getRoleColor
  } = utilities;

  // Solo usuarios TI y Admin pueden ver todos los logs
  const canViewAllLogs = ['ti', 'admin'].includes(user?.rol);
  
  const displayLogs = canViewAllLogs ? logs : logs.filter(log => log.user === user?.nombre);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      {canViewAllLogs && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Auditoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Acción</label>
              <select
                value={filters.action}
                onChange={(e) => onFiltersChange({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todas las acciones</option>
                <option value="view">Visualizaciones</option>
                <option value="sign">Firmas</option>
                <option value="observe">Observaciones</option>
                <option value="download">Descargas</option>
                <option value="access_denied">Accesos denegados</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <select
                value={filters.user}
                onChange={(e) => onFiltersChange({ ...filters, user: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todos los usuarios</option>
                {uniqueUsers.map(userName => (
                  <option key={userName} value={userName}>{userName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="all">Todo el período</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <EyeIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Visualizaciones</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayLogs.filter(log => log.action === 'view').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <PencilIcon className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Firmas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayLogs.filter(log => log.action === 'sign').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <InformationCircleIcon className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Observaciones</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayLogs.filter(log => log.action === 'observe').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Alertas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayLogs.filter(log => log.severity === 'warning' || log.action === 'access_denied').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registro de Auditoría</h3>
          <p className="text-sm text-gray-500 mt-1">
            {canViewAllLogs 
              ? `Mostrando ${displayLogs.length} entradas de auditoría`
              : `Mostrando ${displayLogs.length} de tus acciones`
            }
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {displayLogs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin registros</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay registros de auditoría para los filtros seleccionados.
              </p>
            </div>
          ) : (
            displayLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              return (
                <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${getActionColor(log.action, log.severity)}`}>
                      <ActionIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {getActionLabel(log.action)} - {log.documentTitle}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </p>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{log.user}</span>
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(log.userRole)}`}>
                            {log.userRole}
                          </span>
                        </div>
                        
                        <span className="text-sm text-gray-500">IP: {log.ipAddress}</span>
                        {log.metadata && (
                          <span className="text-sm text-gray-500">
                            {log.metadata.browser} - {log.metadata.device}
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600">{log.details}</p>
                      
                      {(log.signatureId || log.observationId) && (
                        <div className="mt-2 text-xs text-gray-500">
                          {log.signatureId && <span>ID Firma: {log.signatureId}</span>}
                          {log.observationId && <span>ID Observación: {log.observationId}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export { AuditLogger, AuditLogViewer };