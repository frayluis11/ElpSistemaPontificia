import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ComputerDesktopIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import SearchableDataView from '../../components/common/SearchableDataView';
import DocumentManager from '../../components/common/DocumentManager';
import { AuditLogger, AuditLogViewer } from '../../components/common/AuditLogger';

const TIDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const auditLogger = AuditLogger();
  const [stats, setStats] = useState({
    systemUptime: 0,
    activeUsers: 0,
    criticalAlerts: 0,
    completedTasks: 0
  });

  const [systemStatus, setSystemStatus] = useState({
    database: 'online',
    api: 'online',
    storage: 'warning',
    backup: 'online'
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        systemUptime: 99.8,
        activeUsers: 142,
        criticalAlerts: 2,
        completedTasks: 28
      });
    }, 1000);
  }, []);

  const quickActions = [
    {
      name: 'Monitoreo del Sistema',
      description: 'Ver estado de servidores y servicios',
      href: '/ti/system/monitoring',
      icon: ServerIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Gestión de Usuarios',
      description: 'Administrar cuentas y permisos',
      href: '/ti/users',
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Configuración',
      description: 'Ajustes del sistema',
      href: '/ti/settings',
      icon: CogIcon,
      color: 'bg-gray-500',
    },
    {
      name: 'Reportes TI',
      description: 'Informes técnicos y estadísticas',
      href: '/ti/reports',
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'offline': return ExclamationTriangleIcon;
      default: return CheckCircleIcon;
    }
  };

  const systemServices = [
    { name: 'Base de Datos', status: systemStatus.database, description: 'PostgreSQL Principal' },
    { name: 'API Backend', status: systemStatus.api, description: 'FastAPI Server' },
    { name: 'Almacenamiento', status: systemStatus.storage, description: 'Espacio: 78% usado' },
    { name: 'Respaldo', status: systemStatus.backup, description: 'Último: 2 horas' },
  ];

  const recentTasks = [
    { id: 1, task: 'Actualización de seguridad aplicada', status: 'completed', time: '1 hora', priority: 'high' },
    { id: 2, task: 'Backup automático ejecutado', status: 'completed', time: '2 horas', priority: 'medium' },
    { id: 3, task: 'Mantenimiento servidor web', status: 'in-progress', time: '3 horas', priority: 'high' },
    { id: 4, task: 'Revisión de logs del sistema', status: 'pending', time: '4 horas', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.nombre_completo || 'TI'}!
            </h1>
            <p className="text-purple-100 text-lg">
              Panel de Tecnología - Sistema ELP Pontificia
            </p>
          </div>
          <div className="text-right">
            <div className="bg-purple-500 bg-opacity-50 rounded-lg p-3">
              <ShieldCheckIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">Uptime del Sistema</p>
              <p className="font-bold">{stats.systemUptime}%</p>
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
                <ServerIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Uptime del Sistema
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.systemUptime}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-6 py-3">
            <div className="text-sm text-purple-700">
              Últimos 30 días
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuarios Activos
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.activeUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-6 py-3">
            <div className="text-sm text-blue-700">
              Conectados ahora
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
                    Alertas Críticas
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.criticalAlerts}
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

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tareas Completadas
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.completedTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-6 py-3">
            <div className="text-sm text-green-700">
              Esta semana
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de navegación - Panel TI */}
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
              Monitor Sistema
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="w-5 h-5 inline mr-2" />
              Usuarios Activos
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ServerIcon className="w-5 h-5 inline mr-2" />
              Logs del Sistema
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
              Auditoría de Acceso
            </button>
            <button
              onClick={() => setActiveTab('signatures')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'signatures'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PencilSquareIcon className="w-5 h-5 inline mr-2" />
              Firmas del Sistema
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShieldCheckIcon className="w-5 h-5 inline mr-2" />
              Log Completo
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Monitor del Sistema en Tiempo Real</h3>
              <p className="text-gray-600">Estado de servicios, alertas críticas y rendimiento del sistema.</p>
              
              {/* Estado de servicios */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(systemStatus).map(([service, status]) => (
                  <div key={service} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{service}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        status === 'online' ? 'bg-green-100 text-green-800' :
                        status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <SearchableDataView
              dataType="users"
              title="Usuarios Activos del Sistema"
              onView={(item) => console.log('Ver usuario:', item)}
              showActions={false}
            />
          )}

          {activeTab === 'logs' && (
            <SearchableDataView
              dataType="logs"
              title="Logs y Eventos del Sistema"
              onView={(item) => console.log('Ver log:', item)}
              showActions={false}
            />
          )}

          {activeTab === 'search' && (
            <SearchableDataView
              dataType="documents"
              title="Auditoría de Acceso - Historial Completo"
              onView={(item) => console.log('Ver elemento:', item)}
            />
          )}

          {activeTab === 'signatures' && (
            <DocumentManager />
          )}

          {activeTab === 'audit' && (
            <AuditLogViewer
              logs={auditLogger.auditLogs}
              filters={auditLogger.filters}
              onFiltersChange={auditLogger.setFilters}
              uniqueUsers={auditLogger.uniqueUsers}
              utilities={{
                getActionIcon: auditLogger.getActionIcon,
                getActionColor: auditLogger.getActionColor,
                getActionLabel: auditLogger.getActionLabel,
                getRoleColor: auditLogger.getRoleColor
              }}
            />
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <span className={`${action.color} rounded-lg inline-flex p-3 text-white ring-4 ring-white`}>
                  <action.icon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de servicios */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Estado de Servicios</h2>
          <div className="space-y-4">
            {systemServices.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-6 w-6 ${service.status === 'online' ? 'text-green-600' : service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                      <p className="text-xs text-gray-500">{service.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                    {service.status === 'online' ? 'En línea' : service.status === 'warning' ? 'Advertencia' : 'Fuera de línea'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tareas recientes */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tareas Recientes</h2>
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{task.task}</h3>
                  <p className="text-xs text-gray-500">Hace {task.time}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'completed' ? 'text-green-600 bg-green-100' :
                    task.status === 'in-progress' ? 'text-blue-600 bg-blue-100' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {task.status === 'completed' ? 'Completada' :
                     task.status === 'in-progress' ? 'En progreso' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TIDashboard;