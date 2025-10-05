import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DocumentSign from './DocumentSign';
import { AuditLogger } from './AuditLogger';
import { format } from 'date-fns';
import {
  DocumentTextIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

const DocumentManager = () => {
  const { user } = useAuth();
  const { addAuditLog } = AuditLogger();
  
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = () => {
    // Simular datos de documentos basados en el rol del usuario
    const mockDocuments = [
      {
        id: 'doc-001',
        title: 'Contrato de Trabajo - Juan Pérez',
        type: 'contract',
        status: 'pending',
        createdBy: 'María García',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        content: 'CONTRATO DE TRABAJO\n\nEntre la Universidad Pontificia y el empleado Juan Pérez, se establece el presente contrato de trabajo bajo las siguientes condiciones...',
        signatures: [],
        observations: [],
        permissions: {
          canView: ['rrhh', 'admin', 'ti'],
          canSign: ['rrhh', 'admin'],
          canObserve: ['rrhh', 'admin', 'ti']
        }
      },
      {
        id: 'doc-002',
        title: 'Evaluación Docente - Semestre I',
        type: 'evaluation',
        status: 'signed',
        createdBy: 'Sistema',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        content: 'EVALUACIÓN DOCENTE\n\nPeríodo: Semestre I 2025\nDocente: Carlos López\n\nResultados de la evaluación:\n1. Metodología de enseñanza: Excelente\n2. Puntualidad: Muy bueno\n3. Relación con estudiantes: Excelente',
        signatures: [
          {
            id: 'sig-001',
            user: 'Carlos López',
            role: 'docente',
            timestamp: new Date(Date.now() - 86400000),
            signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            verified: true
          }
        ],
        observations: [
          {
            id: 'obs-001',
            user: 'Ana Martínez',
            role: 'admin',
            timestamp: new Date(Date.now() - 43200000),
            content: 'Excelente desempeño. Considerar para promoción.',
            type: 'positive'
          }
        ],
        permissions: {
          canView: ['docente', 'admin', 'rrhh'],
          canSign: ['docente'],
          canObserve: ['admin', 'rrhh']
        }
      },
      {
        id: 'doc-003',
        title: 'Informe Financiero Q4 2024',
        type: 'financial',
        status: 'pending',
        createdBy: 'Patricia Silva',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        content: 'INFORME FINANCIERO - CUARTO TRIMESTRE 2024\n\nResumen ejecutivo:\n- Ingresos totales: $2,450,000\n- Gastos operativos: $1,890,000\n- Utilidad neta: $560,000\n\nAnálisis detallado por departamentos...',
        signatures: [],
        observations: [],
        permissions: {
          canView: ['contabilidad', 'admin'],
          canSign: ['contabilidad', 'admin'],
          canObserve: ['contabilidad', 'admin']
        }
      },
      {
        id: 'doc-004',
        title: 'Registro de Acceso al Sistema',
        type: 'system',
        status: 'auto-generated',
        createdBy: 'Sistema TI',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        content: 'REGISTRO AUTOMÁTICO DE ACCESOS\n\nFecha: ' + format(new Date(), 'dd/MM/yyyy') + '\n\nUsuarios activos: 45\nIntentos de acceso fallidos: 2\nSistemas monitoreados: 12\n\nDetalles técnicos...',
        signatures: [],
        observations: [],
        permissions: {
          canView: ['ti', 'admin'],
          canSign: ['ti'],
          canObserve: ['ti', 'admin']
        }
      }
    ];

    // Filtrar documentos según permisos del usuario
    const filteredDocs = mockDocuments.filter(doc => 
      doc.permissions.canView.includes(user?.rol) || user?.rol === 'admin'
    );

    setDocuments(filteredDocs);
  };

  // Filtrar documentos por búsqueda y estado
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowSignModal(true);
    
    // Registrar visualización en auditoría
    addAuditLog({
      action: 'view',
      documentId: document.id,
      documentTitle: document.title,
      user: user?.nombre || 'Usuario',
      userRole: user?.rol || 'usuario',
      details: `Documento ${document.title} visualizado`
    });
  };

  const handleSignDocument = (updatedDocument, signature) => {
    // Actualizar el documento en el estado
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    );

    // Registrar firma en auditoría
    addAuditLog({
      action: 'sign',
      documentId: updatedDocument.id,
      documentTitle: updatedDocument.title,
      user: user?.nombre || 'Usuario',
      userRole: user?.rol || 'usuario',
      details: `Documento firmado digitalmente`,
      signatureId: signature.id
    });
  };

  const handleAddObservation = (updatedDocument, observation) => {
    // Actualizar el documento en el estado
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    );

    // Registrar observación en auditoría
    addAuditLog({
      action: 'observe',
      documentId: updatedDocument.id,
      documentTitle: updatedDocument.title,
      user: user?.nombre || 'Usuario',
      userRole: user?.rol || 'usuario',
      details: `Observación agregada: "${observation.content.substring(0, 50)}..."`,
      observationId: observation.id
    });
  };

  const canInteractWithDocument = (document, action) => {
    if (!document.permissions) return false;
    
    switch (action) {
      case 'view':
        return document.permissions.canView.includes(user?.rol) || user?.rol === 'admin';
      case 'sign':
        return document.permissions.canSign.includes(user?.rol) || user?.rol === 'admin';
      case 'observe':
        return document.permissions.canObserve.includes(user?.rol) || user?.rol === 'admin';
      default:
        return false;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'signed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'auto-generated':
        return <DocumentCheckIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'auto-generated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'signed': return 'Firmado';
      case 'pending': return 'Pendiente';
      case 'auto-generated': return 'Auto-generado';
      default: return 'Estado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Documentos</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <DocumentTextIcon className="w-4 h-4" />
            <span>{filteredDocuments.length} documentos disponibles</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="signed">Firmados</option>
            <option value="auto-generated">Auto-generados</option>
          </select>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredDocuments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin documentos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay documentos que coincidan con los criterios de búsqueda.
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <div key={document.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(document.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {document.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                          {getStatusLabel(document.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span>Creado por: {document.createdBy}</span>
                        <span>•</span>
                        <span>{format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                        <span>•</span>
                        <span>Tipo: {document.type}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {document.content.substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm">
                        {document.signatures.length > 0 && (
                          <div className="flex items-center text-green-600">
                            <PencilIcon className="w-4 h-4 mr-1" />
                            <span>{document.signatures.length} firma(s)</span>
                          </div>
                        )}
                        {document.observations.length > 0 && (
                          <div className="flex items-center text-blue-600">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            <span>{document.observations.length} observación(es)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {canInteractWithDocument(document, 'view') && (
                      <button
                        onClick={() => handleViewDocument(document)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Ver
                      </button>
                    )}
                    
                    {canInteractWithDocument(document, 'sign') && 
                     !document.signatures.some(s => s.user === user?.nombre) && (
                      <button
                        onClick={() => handleViewDocument(document)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Firmar
                      </button>
                    )}
                    
                    {document.signatures.some(s => s.user === user?.nombre) && (
                      <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600">
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Firmado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de firma de documento */}
      {showSignModal && selectedDocument && (
        <DocumentSign
          document={selectedDocument}
          onSign={handleSignDocument}
          onAddObservation={handleAddObservation}
          onClose={() => {
            setShowSignModal(false);
            setSelectedDocument(null);
          }}
          onAuditLog={addAuditLog}
        />
      )}
    </div>
  );
};

export default DocumentManager;