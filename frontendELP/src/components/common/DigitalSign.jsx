import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const DigitalSign = ({ 
  documentId, 
  documentTitle, 
  onSignSuccess, 
  onCancel, 
  isOpen = false,
  requiredRoles = []
}) => {
  const signatureRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData(null);
      setShowConfirmation(false);
    }
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const signatureDataURL = signatureRef.current.getTrimmedCanvas().toDataURL('image/png');
      setSignatureData(signatureDataURL);
      setShowConfirmation(true);
    }
  };

  const handleSignDocument = async () => {
    if (!signatureData) {
      toast.error('Por favor, firme el documento antes de continuar');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/documents/${documentId}/sign`,
        {
          signature: signatureData,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Documento firmado exitosamente');
        onSignSuccess && onSignSuccess({
          documentId,
          signature: signatureData,
          signedAt: new Date().toISOString(),
          signedBy: response.data.signedBy
        });
      } else {
        throw new Error(response.data.message || 'Error al firmar documento');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      
      if (error.response?.status === 403) {
        toast.error('No tienes permisos para firmar este documento');
      } else if (error.response?.status === 404) {
        toast.error('Documento no encontrado');
      } else {
        toast.error(error.response?.data?.message || 'Error al firmar el documento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DocumentCheckIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Firma Digital
              </h2>
              <p className="text-sm text-gray-600">
                {documentTitle || `Documento #${documentId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showConfirmation ? (
            <>
              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Instrucciones para firmar
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Utilice el área de firma a continuación</li>
                  <li>• Puede usar mouse, trackpad o pantalla táctil</li>
                  <li>• La firma será vinculada a su cuenta de usuario</li>
                  <li>• Una vez firmado, el documento no podrá ser modificado</li>
                </ul>
              </div>

              {/* Signature Canvas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área de Firma
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <SignatureCanvas
                    ref={signatureRef}
                    penColor="black"
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: 'signature-canvas w-full',
                      style: { border: '1px solid #e5e7eb', borderRadius: '0.375rem' }
                    }}
                    onEnd={handleSignatureEnd}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Firme en el área de arriba. Use el botón "Limpiar" para reiniciar.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={clearSignature}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Limpiar</span>
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowConfirmation(true)}
                    disabled={!signatureData}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      signatureData
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Continuar</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation View */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Confirmar Firma Digital
                </h3>
                
                {/* Signature Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vista previa de la firma:
                  </label>
                  <div className="bg-white border rounded-lg p-4 flex justify-center">
                    <img 
                      src={signatureData} 
                      alt="Firma digital" 
                      className="max-h-32 border rounded"
                    />
                  </div>
                </div>

                {/* Confirmation Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <DocumentCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Declaración de Firma Digital
                      </h4>
                      <p className="text-sm text-blue-800">
                        Al firmar digitalmente este documento, confirmo que:
                      </p>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• He leído y entendido el contenido del documento</li>
                        <li>• Acepto los términos y condiciones establecidos</li>
                        <li>• Esta firma tiene la misma validez que una firma manuscrita</li>
                        <li>• La firma está vinculada a mi identidad de usuario</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Volver</span>
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSignDocument}
                    disabled={isLoading}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                      isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>{isLoading ? 'Firmando...' : 'Firmar Documento'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalSign;