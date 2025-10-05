import React, { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { documentsService } from './documentsService';

const DocumentUpload = ({ onBack, onUploadSuccess, documentTypes = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type_id: '',
    department: '',
    priority: 'normal',
    expiration_date: ''
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  
  const fileInputRef = useRef(null);

  // Tipos de archivo permitidos
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    const validFiles = [];
    const newErrors = {};

    newFiles.forEach((file, index) => {
      // Validar tipo de archivo
      if (!allowedTypes.includes(file.type)) {
        newErrors[`file_${index}`] = 'Tipo de archivo no permitido';
        return;
      }

      // Validar tamaño
      if (file.size > maxFileSize) {
        newErrors[`file_${index}`] = 'El archivo es demasiado grande (máximo 10MB)';
        return;
      }

      validFiles.push({
        file,
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      });
    });

    setFiles(prev => [...prev, ...validFiles]);
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file && file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!uploadData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!uploadData.type_id) {
      newErrors.type_id = 'Debe seleccionar un tipo de documento';
    }
    
    if (files.length === 0) {
      newErrors.files = 'Debe seleccionar al menos un archivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setUploading(true);
    const results = [];
    
    try {
      // Subir cada archivo
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: 0
        }));
        
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('title', uploadData.title);
        formData.append('description', uploadData.description);
        formData.append('type_id', uploadData.type_id);
        formData.append('department', uploadData.department);
        formData.append('priority', uploadData.priority);
        
        if (uploadData.expiration_date) {
          formData.append('expiration_date', uploadData.expiration_date);
        }
        
        try {
          const result = await documentsService.uploadDocument(formData, (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileData.id]: progress
            }));
          });
          
          if (result.success) {
            results.push({ success: true, file: fileData.name, data: result.data });
            setUploadProgress(prev => ({
              ...prev,
              [fileData.id]: 100
            }));
          } else {
            results.push({ success: false, file: fileData.name, error: result.error });
          }
        } catch (error) {
          results.push({ success: false, file: fileData.name, error: error.message });
        }
      }
      
      // Mostrar resultados
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        onUploadSuccess && onUploadSuccess(results);
      }
      
      if (errorCount > 0) {
        const errorMessages = results
          .filter(r => !r.success)
          .map(r => `${r.file}: ${r.error}`)
          .join('\n');
        
        setErrors({ upload: `Errores en ${errorCount} archivo(s):\n${errorMessages}` });
      }
      
      if (successCount === files.length) {
        // Todos los archivos se subieron correctamente
        setTimeout(() => {
          onBack && onBack();
        }, 2000);
      }
      
    } catch (error) {
      setErrors({ upload: 'Error general al subir archivos: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📁';
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Subir Documentos</h1>
            <p className="text-gray-600">Cargar nuevos documentos al sistema</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del documento */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Documento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={uploadData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el título del documento"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento *
              </label>
              <select
                name="type_id"
                value={uploadData.type_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.type_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione un tipo</option>
                {documentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.type_id && (
                <p className="text-red-500 text-sm mt-1">{errors.type_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                name="department"
                value={uploadData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione departamento</option>
                <option value="rrhh">Recursos Humanos</option>
                <option value="contabilidad">Contabilidad</option>
                <option value="ti">Tecnología</option>
                <option value="academico">Académico</option>
                <option value="administracion">Administración</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                name="priority"
                value={uploadData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={uploadData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción opcional del documento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="expiration_date"
                value={uploadData.expiration_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Zona de carga de archivos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Archivos
          </h2>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : errors.files
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arrastra los archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Tipos permitidos: PDF, Word, Excel, Imágenes, Texto. Máximo 10MB por archivo.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Seleccionar Archivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              accept={allowedTypes.join(',')}
              className="hidden"
            />
          </div>

          {errors.files && (
            <p className="text-red-500 text-sm mt-2">{errors.files}</p>
          )}

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Archivos seleccionados ({files.length})
              </h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Progreso de subida */}
                      {uploadProgress[file.id] !== undefined && (
                        <div className="w-20">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress[file.id]}%` }}
                            />
                          </div>
                          <p className="text-xs text-center text-gray-500 mt-1">
                            {uploadProgress[file.id]}%
                          </p>
                        </div>
                      )}
                      
                      {!uploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Errores de subida */}
        {errors.upload && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error en la subida
                </h3>
                <pre className="text-sm text-red-700 mt-1 whitespace-pre-wrap">
                  {errors.upload}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={uploading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className={`px-6 py-2 rounded-lg transition-colors ${
              uploading || files.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Subiendo...</span>
              </div>
            ) : (
              `Subir ${files.length} archivo${files.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;