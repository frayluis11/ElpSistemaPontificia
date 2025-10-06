import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { systemAPI } from '../services/api';

const SystemOverview = () => {
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

  const userRoles = [
    {
      role: 'admin',
      title: 'Administrador',
      description: 'Control total del sistema',
      color: 'bg-red-500',
      icon: '👨‍💼'
    },
    {
      role: 'docente',
      title: 'Docente',
      description: 'Gestión académica',
      color: 'bg-blue-500',
      icon: '👨‍🏫'
    },
    {
      role: 'rrhh',
      title: 'RRHH',
      description: 'Recursos Humanos',
      color: 'bg-green-500',
      icon: '👥'
    },
    {
      role: 'contabilidad',
      title: 'Contabilidad',
      description: 'Gestión financiera',
      color: 'bg-yellow-500',
      icon: '💰'
    },
    {
      role: 'ti',
      title: 'TI',
      description: 'Tecnología e Información',
      color: 'bg-purple-500',
      icon: '💻'
    }
  ];

  const testUsers = [
    { username: 'admin', password: 'admin', role: 'admin' },
    { username: 'docente', password: 'docente', role: 'docente' },
    { username: 'rrhh', password: 'rrhh', role: 'rrhh' },
    { username: 'contabilidad', password: 'contabilidad', role: 'contabilidad' },
    { username: 'ti', password: 'ti', role: 'ti' }
  ];

  const features = [
    {
      title: 'Sistema de Autenticación JWT',
      description: 'Seguridad basada en tokens con roles específicos',
      icon: '🔐'
    },
    {
      title: 'Dashboards Interactivos',
      description: 'Paneles personalizados según el rol del usuario',
      icon: '📊'
    },
    {
      title: 'API RESTful Completa',
      description: 'Backend con FastAPI y base de datos SQLite',
      icon: '🚀'
    },
    {
      title: 'Interfaz Responsive',
      description: 'Diseño adaptable con Tailwind CSS',
      icon: '📱'
    },
    {
      title: 'Gestión de Documentos',
      description: 'Sistema completo de manejo de archivos',
      icon: '📄'
    },
    {
      title: 'Reportes y Análisis',
      description: 'Visualización de datos con gráficos interactivos',
      icon: '📈'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">ELP</span>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  Sistema ELP Pontificia
                </h1>
                <p className="text-lg text-gray-600">
                  Sistema Integral de Gestión Educativa
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Sistema Activo</span>
              </div>
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Backend API</h3>
                <p className="text-sm text-gray-600">FastAPI Server</p>
              </div>
              <div className="text-2xl">🚀</div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Ejecutándose en puerto 8000</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Frontend React</h3>
                <p className="text-sm text-gray-600">Vite + Tailwind CSS</p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Ejecutándose en puerto 5173</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Base de Datos</h3>
                <p className="text-sm text-gray-600">SQLite</p>
              </div>
              <div className="text-2xl">🗄️</div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Conectada y activa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Características del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Roles de Usuario Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {userRoles.map((role, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center text-white text-lg mx-auto mb-4`}>
                  {role.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                <Link 
                  to="/login"
                  className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Acceder como {role.role}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Test Users Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Usuarios de Prueba</h2>
          <p className="text-gray-600 mb-6">
            Puedes usar cualquiera de estos usuarios para probar el sistema:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {testUsers.map((user, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 mb-2">{user.role.toUpperCase()}</div>
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Usuario:</strong> {user.username}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>Contraseña:</strong> {user.password}
                  </div>
                  <Link 
                    to="/login"
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm block text-center"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Information */}
        {systemInfo && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Backend</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Estado:</strong> {systemInfo.status}</li>
                  <li><strong>Servicio:</strong> {systemInfo.service}</li>
                  <li><strong>Versión:</strong> {systemInfo.version}</li>
                  <li><strong>Base de datos:</strong> {systemInfo.database?.type || 'SQLite'}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Frontend</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Framework:</strong> React 18</li>
                  <li><strong>Build Tool:</strong> Vite</li>
                  <li><strong>Styling:</strong> Tailwind CSS</li>
                  <li><strong>Estado:</strong> Ejecutándose</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg inline-block"
            >
              Iniciar Sesión
            </Link>
            <a 
              href="http://127.0.0.1:8000/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg inline-block"
            >
              Ver API Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;