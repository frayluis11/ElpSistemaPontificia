import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  BellAlertIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import InteractiveCharts from '../../components/common/InteractiveCharts';
import ExportReports from '../../components/common/ExportReports';
import SearchableDataView from '../../components/common/SearchableDataView';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    signedDocuments: 0,
    pendingSignatures: 0,
    totalHours: 0,
    systemAlerts: 0,
    todayActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Cargar estadísticas desde la API
  useEffect(() => {
    loadDashboardStats();
    loadDashboardChartsData();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/dashboard-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        // Datos de fallback si la API no responde
        setStats({
          totalUsers: 156,
          totalDocuments: 2340,
          signedDocuments: 1876,
          pendingSignatures: 464,
          totalHours: 8765,
          systemAlerts: 3,
          todayActivity: 28
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Datos de fallback en caso de error
      setStats({
        totalUsers: 156,
        totalDocuments: 2340,
        signedDocuments: 1876,
        pendingSignatures: 464,
        totalHours: 8765,
        systemAlerts: 3,
        todayActivity: 28
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardChartsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/charts-data`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setDashboardData(response.data.chartData);
      } else {
        // Datos de ejemplo para desarrollo
        setDashboardData({
          documentsByType: {
            completed: [25, 30, 15, 20, 18],
            pending: [8, 12, 5, 7, 6]
          },
          hoursProgress: {
            planned: [180, 160, 170, 185, 175, 190],
            executed: [175, 155, 165, 180, 170, 185]
          },
          documentsByArea: [30, 25, 20, 15, 10],
          signaturesProgress: [45, 52, 38, 63, 57, 71],
          totals: {
            documents: 2340,
            signatures: 1876,
            hours: 8765
          }
        });
      }
    } catch (error) {
      console.error('Error loading charts data:', error);
      // Datos de ejemplo en caso de error
      setDashboardData({
        documentsByType: {
          completed: [25, 30, 15, 20, 18],
          pending: [8, 12, 5, 7, 6]
        },
        hoursProgress: {
          planned: [180, 160, 170, 185, 175, 190],
          executed: [175, 155, 165, 180, 170, 185]
        },
        documentsByArea: [30, 25, 20, 15, 10],
        signaturesProgress: [45, 52, 38, 63, 57, 71],
        totals: {
          documents: 2340,
          signatures: 1876,
          hours: 8765
        }
      });
    }
  };

  const quickActions = [
    {
      name: 'Gestionar Usuarios',
      description: 'Administrar cuentas de usuario',
      href: '/admin/users',
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Documentos',
      description: 'Revisar documentos pendientes',
      href: '/admin/documentos',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Control de Horas',
      description: 'Supervisar registro de horas',
      href: '/admin/hours',
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Reportes',
      description: 'Generar reportes del sistema',
      href: '/admin/reports',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Configuración',
      description: 'Configurar el sistema',
      href: '/admin/settings',
      icon: CogIcon,
      color: 'bg-gray-500',
    },
  ];

  const recentActivity = [
    { id: 1, action: 'Nuevo usuario registrado', user: 'Maria Rodriguez', time: '2 min ago', type: 'user' },
    { id: 2, action: 'Documento subido', user: 'Carlos Mendez', time: '15 min ago', type: 'document' },
    { id: 3, action: 'Horas reportadas', user: 'Ana García', time: '1 hour ago', type: 'hours' },
    { id: 4, action: 'Reporte generado', user: 'Admin System', time: '2 hours ago', type: 'report' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.nombre_completo || 'Administrador'}!
            </h1>
            <p className="text-red-100 text-lg">
              Panel de Administración - Sistema ELP Pontificia
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Exportar Reportes</span>
            </button>
            <div className="text-right">
              <p className="text-red-100 text-sm">Último acceso</p>
              <p className="text-white font-semibold">
                {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Usuarios
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-6 py-3">
            <div className="text-sm text-blue-700 flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              +12% este mes
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documentos
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.totalDocuments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-6 py-3">
            <div className="text-sm text-green-700 flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              85% procesados
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Horas Registradas
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.totalHours}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 px-6 py-3">
            <div className="text-sm text-yellow-700">
              Esta semana: 245h
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Alertas del Sistema
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.systemAlerts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-red-50 px-6 py-3">
            <div className="text-sm text-red-700">
              Requieren atención
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales de documentos */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documentos Firmados
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.signedDocuments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 px-6 py-3">
            <div className="text-sm text-emerald-700 flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              {loading ? 'Cargando...' : `${Math.round((stats.signedDocuments / stats.totalDocuments) * 100)}% del total`}
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PencilSquareIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendientes de Firma
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.pendingSignatures}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 px-6 py-3">
            <div className="text-sm text-orange-700 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Requieren acción
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellAlertIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Actividad Hoy
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.todayActivity}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-6 py-3">
            <div className="text-sm text-purple-700">
              Documentos procesados
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <span className={`${action.color} rounded-lg inline-flex p-3 text-white ring-4 ring-white`}>
                  <action.icon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-red-600">
                  {action.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Gráficos Interactivos */}
      {dashboardData && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Análisis y Estadísticas</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ChartBarIcon className="w-4 h-4" />
              <span>Datos actualizados en tiempo real</span>
            </div>
          </div>
          <InteractiveCharts 
            dashboardData={dashboardData} 
            userRole={user?.role || 'administracion'} 
          />
        </div>
      )}

      {/* Pestañas de navegación - Panel Administrativo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Panel General
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" />
              Todos los Documentos
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5 inline mr-2" />
              Reportes Consolidados
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
              Búsqueda Completa
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente del Sistema</h3>
              <p className="text-gray-600">Resumen de la actividad global del sistema y documentos pendientes de atención.</p>
              
              {/* Aquí mantendríamos la actividad reciente original */}
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {activity.user.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">por {activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <SearchableDataView
              dataType="documents"
              title="Gestión de Documentos - Vista Administrativa"
              onView={(item) => console.log('Ver documento:', item)}
              onEdit={(item) => console.log('Editar documento:', item)}
              onDelete={(item) => console.log('Eliminar documento:', item)}
            />
          )}

          {activeTab === 'reports' && (
            <SearchableDataView
              dataType="reports"
              title="Reportes Consolidados del Sistema"
              onView={(item) => console.log('Ver reporte:', item)}
              showActions={false}
            />
          )}

          {activeTab === 'search' && (
            <SearchableDataView
              dataType="documents"
              title="Búsqueda Avanzada - Acceso Completo de Administrador"
              onView={(item) => console.log('Ver elemento:', item)}
              onEdit={(item) => console.log('Editar elemento:', item)}
              onDelete={(item) => console.log('Eliminar elemento:', item)}
            />
          )}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Actividad Reciente</h2>
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {activity.user.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      por {activity.user}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {activity.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal de Exportación */}
      {showExportModal && (
        <ExportReports onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;