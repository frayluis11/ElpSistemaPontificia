import React, { useState, useEffect } from 'react';
import { systemAPI } from '../services/api';

const Home = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await systemAPI.getInfo();
        setSystemInfo(response.data);
      } catch (err) {
        console.log('Backend no disponible, mostrando información estática');
        setError('Backend no disponible');
      } finally {
        setLoading(false);
      }
    };

    fetchSystemInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ELP</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema ELP Pontificia
                </h1>
                <p className="text-sm text-gray-500">
                  Frontend React + Vite + Tailwind CSS
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Frontend Iniciado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema ELP Pontificia - Frontend Iniciado
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Frontend desarrollado con React, Vite y Tailwind CSS, preparado para conectarse 
            al backend FastAPI del Sistema de Evaluación de Labor Pontificia.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">React + Vite</p>
                <p className="text-2xl font-semibold text-gray-900">Activo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7H9.5a2.5 2.5 0 000 5h1.672a2.5 2.5 0 010 5H9.5a2.5 2.5 0 01-1.5-.67"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tailwind CSS</p>
                <p className="text-2xl font-semibold text-gray-900">Configurado</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">React Router</p>
                <p className="text-2xl font-semibold text-gray-900">Instalado</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${error ? 'bg-yellow-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${error ? 'text-yellow-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Backend API</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {error ? 'Pendiente' : 'Conectado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Connection Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Sistema
          </h3>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : systemInfo ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Nombre de la aplicación:</span>
                <span className="font-medium text-gray-900">{systemInfo.app_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Versión del backend:</span>
                <span className="font-medium text-gray-900">{systemInfo.version}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Framework:</span>
                <span className="font-medium text-gray-900">{systemInfo.framework}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Base de datos:</span>
                <span className="font-medium text-gray-900">{systemInfo.database}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Entorno:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  systemInfo.environment === 'production' 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {systemInfo.environment}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Backend no disponible</h4>
              <p className="text-gray-600 mb-4">
                El backend FastAPI no está ejecutándose. Para conectar completamente el sistema:
              </p>
              <div className="text-left max-w-md mx-auto">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Navega al directorio backendELP</li>
                  <li>Ejecuta: <code className="bg-gray-100 px-1 rounded">docker-compose up -d</code></li>
                  <li>O ejecuta: <code className="bg-gray-100 px-1 rounded">uvicorn app.main:app --reload</code></li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Próximos Pasos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Desarrollo Frontend</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Implementar sistema de autenticación</li>
                <li>• Crear páginas de usuarios y roles</li>
                <li>• Desarrollar gestión de documentos</li>
                <li>• Implementar registro de horas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Integración Backend</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Conectar servicios de API</li>
                <li>• Implementar manejo de errores</li>
                <li>• Configurar interceptors</li>
                <li>• Integrar reportes y dashboards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;