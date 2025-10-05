import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import InteractiveCharts from '../../components/common/InteractiveCharts';
import ExportReports from '../../components/common/ExportReports';

const RRHHDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHires: 0,
    hoursThisMonth: 0,
    pendingRequests: 0
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalEmployees: 156,
        newHires: 8,
        hoursThisMonth: 5420,
        pendingRequests: 12
      });
      // Datos específicos para RRHH
      setDashboardData({
        documentsByType: {
          completed: [30, 25, 20, 18, 15],
          pending: [8, 5, 4, 3, 2]
        },
        hoursProgress: {
          planned: [5500, 5200, 5400, 5300, 5600, 5400],
          executed: [5420, 5180, 5350, 5280, 5580, 5350]
        },
        documentsByArea: [25, 30, 20, 15, 10], // Más enfocado en recursos humanos
        signaturesProgress: [65, 72, 58, 83, 77, 91],
        totals: {
          documents: 156,
          signatures: 142,
          hours: 5420
        }
      });
    }, 1000);
  }, []);

  const quickActions = [
    {
      name: 'Gestionar Empleados',
      description: 'Ver y administrar empleados',
      href: '/rrhh/employees',
      icon: UsersIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Documentos RRHH',
      description: 'Contratos y documentación',
      href: '/rrhh/documents',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Control de Horas',
      description: 'Supervisar horas laborales',
      href: '/rrhh/hours',
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Reportes RRHH',
      description: 'Informes de recursos humanos',
      href: '/rrhh/reports',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.nombre_completo || 'RRHH'}!
            </h1>
            <p className="text-green-100 text-lg">
              Panel de Recursos Humanos - Sistema ELP Pontificia
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
              <div className="bg-green-500 bg-opacity-50 rounded-lg p-3">
                <BriefcaseIcon className="h-8 w-8 mb-2" />
                <p className="text-sm">Empleados Activos</p>
                <p className="font-bold">{stats.totalEmployees}</p>
              </div>
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
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Empleados
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.totalEmployees}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-6 py-3">
            <div className="text-sm text-green-700">
              Activos en nómina
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Nuevas Contrataciones
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.newHires}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-6 py-3">
            <div className="text-sm text-blue-700">
              Este mes
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
                    Horas Este Mes
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.hoursThisMonth}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 px-6 py-3">
            <div className="text-sm text-yellow-700">
              Todas las áreas
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Solicitudes Pendientes
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.pendingRequests}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-6 py-3">
            <div className="text-sm text-purple-700">
              Requieren revisión
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Interactivos para RRHH */}
      {dashboardData && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Análisis de Recursos Humanos</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ChartBarIcon className="w-4 h-4" />
              <span>Datos del personal y gestión</span>
            </div>
          </div>
          <InteractiveCharts 
            dashboardData={dashboardData} 
            userRole="rrhh" 
          />
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <span className={`${action.color} rounded-lg inline-flex p-3 text-white ring-4 ring-white`}>
                  <action.icon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
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

      {/* Modal de Exportación */}
      {showExportModal && (
        <ExportReports onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default RRHHDashboard;