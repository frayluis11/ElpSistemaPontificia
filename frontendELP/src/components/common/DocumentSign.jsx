import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import {
  DocumentIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

const DocumentSign = ({ 
  document, 
  onSign, 
  onAddObservation, 
  onClose,
  onAuditLog,
  mode = 'view' // 'view', 'sign', 'observe'
}) => {
  const { user } = useAuth();
  const signatureRef = useRef(null);
  const documentRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('document');
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [observation, setObservation] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado del documento simulado
  const [documentState, setDocumentState] = useState({
    id: document?.id || 'doc-001',
    title: document?.title || 'Documento de Ejemplo',
    content: document?.content || 'Contenido del documento para revisión y firma.',
    status: document?.status || 'pending',
    signatures: document?.signatures || [],
    observations: document?.observations || [],
    createdBy: document?.createdBy || 'Sistema',
    createdAt: document?.createdAt || new Date().toISOString(),
    type: document?.type || 'general'
  });

  useEffect(() => {
    // Simular carga del historial del documento
    setDocumentHistory([
      {
        id: 1,
        action: 'created',
        user: 'Juan Pérez',
        timestamp: new Date(Date.now() - 86400000),
        details: 'Documento creado'
      },
      {
        id: 2,
        action: 'viewed',
        user: user?.nombre || 'Usuario Actual',
        timestamp: new Date(),
        details: 'Documento visualizado'
      }
    ]);

    // Registrar visualización del documento
    if (onAuditLog) {
      onAuditLog({
        action: 'view',
        documentId: documentState.id,
        user: user?.nombre || 'Usuario',
        timestamp: new Date(),
        details: `Documento ${documentState.title} visualizado`
      });
    }
  }, [document, user, onAuditLog, documentState.id, documentState.title]);

  // Verificar permisos según el rol
  const canSign = () => {
    switch (user?.rol) {
      case 'docente':
        return documentState.createdBy === user.nombre || documentState.type === 'personal';
      case 'rrhh':
        return ['personal', 'staff', 'hours'].includes(documentState.type);
      case 'admin':
      case 'contabilidad':
        return true;
      case 'ti':
        return documentState.type === 'system' || documentState.type === 'audit';
      default:
        return false;
    }
  };

  const canObserve = () => {
    return canSign(); // Mismos permisos para observar que para firmar
  };

  const handleSignature = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert('Por favor, agregue su firma antes de continuar.');
      return;
    }

    setLoading(true);
    try {
      const signatureDataURL = signatureRef.current.toDataURL();
      setSignatureData(signatureDataURL);

      const newSignature = {
        id: Date.now(),
        user: user?.nombre || 'Usuario',
        role: user?.rol || 'usuario',
        timestamp: new Date(),
        signatureData: signatureDataURL,
        ipAddress: '192.168.1.1', // En producción se obtendría del backend
        verified: true
      };

      const updatedDocument = {
        ...documentState,
        signatures: [...documentState.signatures, newSignature],
        status: 'signed'
      };

      setDocumentState(updatedDocument);
      setIsSignatureMode(false);

      // Registrar la firma en el historial
      const historyEntry = {
        id: Date.now(),
        action: 'signed',
        user: user?.nombre || 'Usuario',
        timestamp: new Date(),
        details: `Documento firmado digitalmente por ${user?.nombre}`
      };

      setDocumentHistory(prev => [...prev, historyEntry]);

      // Callback para el componente padre
      if (onSign) {
        onSign(updatedDocument, newSignature);
      }

      // Registrar en auditoría
      if (onAuditLog) {
        onAuditLog({
          action: 'sign',
          documentId: documentState.id,
          user: user?.nombre || 'Usuario',
          timestamp: new Date(),
          details: `Documento firmado digitalmente`,
          signatureId: newSignature.id
        });
      }

      alert('Documento firmado exitosamente.');
    } catch (error) {
      console.error('Error al firmar documento:', error);
      alert('Error al procesar la firma. Inténtelo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddObservation = () => {
    if (!observation.trim()) {
      alert('Por favor, ingrese una observación.');
      return;
    }

    const newObservation = {
      id: Date.now(),
      user: user?.nombre || 'Usuario',
      role: user?.rol || 'usuario',
      timestamp: new Date(),
      content: observation.trim(),
      type: 'general'
    };

    const updatedDocument = {
      ...documentState,
      observations: [...documentState.observations, newObservation]
    };

    setDocumentState(updatedDocument);
    setObservation('');

    // Registrar en el historial
    const historyEntry = {
      id: Date.now(),
      action: 'observation',
      user: user?.nombre || 'Usuario',
      timestamp: new Date(),
      details: `Observación agregada: "${observation.substring(0, 50)}..."`
    };

    setDocumentHistory(prev => [...prev, historyEntry]);

    // Callback para el componente padre
    if (onAddObservation) {
      onAddObservation(updatedDocument, newObservation);
    }

    // Registrar en auditoría
    if (onAuditLog) {
      onAuditLog({
        action: 'observe',
        documentId: documentState.id,
        user: user?.nombre || 'Usuario',
        timestamp: new Date(),
        details: `Observación agregada al documento`,
        observationId: newObservation.id
      });
    }

    alert('Observación agregada correctamente.');
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${documentState.title}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      // Registrar descarga
      if (onAuditLog) {
        onAuditLog({
          action: 'download',
          documentId: documentState.id,
          user: user?.nombre || 'Usuario',
          timestamp: new Date(),
          details: `Documento descargado como PDF`
        });
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Inténtelo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'signed': return 'text-green-600';
      case 'created': return 'text-blue-600';
      case 'observation': return 'text-orange-600';
      case 'viewed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentCheckIcon className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{documentState.title}</h3>
                <p className="text-sm text-gray-500">
                  Estado: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(documentState.status)}`}>
                    {documentState.status === 'signed' ? 'Firmado' : 
                     documentState.status === 'pending' ? 'Pendiente' : 'Estado'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadPDF}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                {loading ? 'Generando...' : 'Descargar PDF'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('document')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'document'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <DocumentIcon className="w-5 h-5 inline mr-2" />
              Documento
            </button>
            <button
              onClick={() => setActiveTab('signatures')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'signatures'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <PencilIcon className="w-5 h-5 inline mr-2" />
              Firmas ({documentState.signatures.length})
            </button>
            <button
              onClick={() => setActiveTab('observations')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'observations'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <EyeIcon className="w-5 h-5 inline mr-2" />
              Observaciones ({documentState.observations.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClockIcon className="w-5 h-5 inline mr-2" />
              Historial
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Document Tab */}
          {activeTab === 'document' && (
            <div className="space-y-6">
              <div ref={documentRef} className="bg-white border border-gray-300 rounded-lg p-8 min-h-96">
                <div className="prose max-w-none">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">{documentState.title}</h1>
                  <div className="text-gray-700 leading-relaxed">
                    {documentState.content}
                  </div>
                  
                  {/* Firmas en el documento */}
                  {documentState.signatures.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Firmas Digitales</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documentState.signatures.map((signature, index) => (
                          <div key={signature.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{signature.user}</span>
                              <span className="text-xs text-gray-500">{signature.role}</span>
                            </div>
                            <img 
                              src={signature.signatureData} 
                              alt={`Firma de ${signature.user}`}
                              className="h-16 w-full object-contain border border-gray-100 rounded"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              {format(new Date(signature.timestamp), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones del documento */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {canSign() && !documentState.signatures.some(s => s.user === user?.nombre) && (
                    <button
                      onClick={() => setIsSignatureMode(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Firmar Documento
                    </button>
                  )}
                  {canObserve() && (
                    <button
                      onClick={() => setActiveTab('observations')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Agregar Observación
                    </button>
                  )}
                </div>
                {documentState.signatures.some(s => s.user === user?.nombre) && (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Ya firmaste este documento</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signatures Tab */}
          {activeTab === 'signatures' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Firmas Digitales</h3>
                {canSign() && !documentState.signatures.some(s => s.user === user?.nombre) && (
                  <button
                    onClick={() => setIsSignatureMode(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Firmar Documento
                  </button>
                )}
              </div>

              {documentState.signatures.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin firmas</h3>
                  <p className="mt-1 text-sm text-gray-500">Este documento aún no ha sido firmado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {documentState.signatures.map((signature, index) => (
                    <div key={signature.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <h4 className="font-medium text-gray-900">{signature.user}</h4>
                            <p className="text-sm text-gray-500">{signature.role}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Verificada
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <img 
                          src={signature.signatureData} 
                          alt={`Firma de ${signature.user}`}
                          className="h-20 w-full object-contain border border-gray-100 rounded bg-gray-50"
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><strong>Fecha:</strong> {format(new Date(signature.timestamp), 'dd/MM/yyyy HH:mm:ss')}</p>
                        <p><strong>IP:</strong> {signature.ipAddress}</p>
                        <p><strong>ID:</strong> {signature.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Observations Tab */}
          {activeTab === 'observations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Observaciones del Documento</h3>
              </div>

              {/* Agregar nueva observación */}
              {canObserve() && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Agregar Observación</h4>
                  <div className="space-y-3">
                    <textarea
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      placeholder="Escriba su observación aquí..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      onClick={handleAddObservation}
                      disabled={!observation.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Agregar Observación
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de observaciones */}
              {documentState.observations.length === 0 ? (
                <div className="text-center py-12">
                  <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin observaciones</h3>
                  <p className="mt-1 text-sm text-gray-500">No hay observaciones para este documento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documentState.observations.map((obs, index) => (
                    <div key={obs.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{obs.user}</span>
                          <span className="ml-2 text-sm text-gray-500">({obs.role})</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(obs.timestamp), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-700">{obs.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Historial del Documento</h3>
              
              <div className="space-y-4">
                {documentHistory.map((entry, index) => (
                  <div key={entry.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getActionColor(entry.action)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{entry.details}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">por {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Signature Modal */}
        {isSignatureMode && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Firmar Documento</h3>
                <p className="text-sm text-gray-500">Dibuje su firma en el área designada</p>
              </div>
              
              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: 'signature-canvas w-full',
                      style: { border: '1px solid #e5e7eb', borderRadius: '0.5rem' }
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={clearSignature}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Limpiar
                  </button>
                  
                  <div className="space-x-3">
                    <button
                      onClick={() => setIsSignatureMode(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSignature}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Procesando...' : 'Confirmar Firma'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSign;