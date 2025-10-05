import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import InteractiveCharts from '../../components/common/InteractiveCharts';
import ExportReports from '../../components/common/ExportReports';
import SearchableDataView from '../../components/common/SearchableDataView';
import DocumentManager from '../../components/common/DocumentManager';

const DocenteDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    hoursThisWeek: 0,
    studentsAssigned: 0,
    completedTasks: 0
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'documents', 'hours'

  useEffect(() => {
    setTimeout(() => {
      setStats({
        documentsUploaded: 24,
        hoursThisWeek: 32,
        studentsAssigned: 45,
        completedTasks: 18
      });
      // Datos específicos para docente
      setDashboardData({
        documentsByType: {
          completed: [8, 12, 5, 6, 4],
          pending: [2, 3, 1, 1, 2]
        },
        hoursProgress: {
          planned: [40, 38, 42, 40, 35, 38],
          executed: [38, 36, 40, 39, 33, 36]
        },
        documentsByArea: [35, 25, 20, 15, 5], // Más enfocado en planificación y evaluación
        totals: {
          documents: 24,
          signatures: 20,
          hours: 245
        }
      });
    }, 1000);
  }, []);

  const quickActions = [
    {
      name: 'Subir Documento',
      description: 'Cargar nuevo documento académico',
      href: '/docente/documents/upload',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Registrar Horas',
      description: 'Registrar horas de trabajo',
      href: '/docente/hours/register',
      icon: ClockIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Ver Mis Reportes',
      description: 'Consultar reportes personales',
      href: '/docente/reports',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Mis Clases',
      description: 'Gestionar materias asignadas',
      href: '/docente/classes',
      icon: BookOpenIcon,
      color: 'bg-indigo-500',
    },
  ];

  const upcomingTasks = [
    { id: 1, task: 'Calificar exámenes de Matemáticas', due: '2025-10-06', priority: 'high' },
    { id: 2, task: 'Preparar clase de Historia', due: '2025-10-07', priority: 'medium' },
    { id: 3, task: 'Reunión de departamento', due: '2025-10-08', priority: 'low' },
    { id: 4, task: 'Entrega de notas parciales', due: '2025-10-10', priority: 'high' },
  ];

  const recentDocuments = [
    { id: 1, name: 'Plan de estudios 2025', type: 'PDF', date: '2025-10-04' },
    { id: 2, name: 'Evaluación primer periodo', type: 'DOCX', date: '2025-10-03' },
    { id: 3, name: 'Recursos multimedia', type: 'ZIP', date: '2025-10-02' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.nombre_completo || 'Docente'}!
            </h1>
            <p className="text-blue-100 text-lg">
              Panel Docente - Sistema ELP Pontificia
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Mis Reportes</span>
            </button>
            <div className="text-right">
              <div className="bg-blue-500 bg-opacity-50 rounded-lg p-3">
                <CalendarDaysIcon className="h-8 w-8 mb-2" />
                <p className="text-sm">Hoy</p>
                <p className="font-bold">{new Date().toLocaleDateString('es-ES')}</p>
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
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documentos Subidos
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.documentsUploaded}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-6 py-3">
            <div className="text-sm text-blue-700">
              Este semestre
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Horas Esta Semana
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.hoursThisWeek}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-6 py-3">
            <div className="text-sm text-green-700">
              De 40 planificadas
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Estudiantes
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.studentsAssigned}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-6 py-3">
            <div className="text-sm text-purple-700">
              En 3 materias
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PresentationChartLineIcon className="h-8 w-8 text-indigo-600" />
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
          <div className="bg-indigo-50 px-6 py-3">
            <div className="text-sm text-indigo-700">
              Este mes
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" />
              Mis Documentos
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hours'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="w-5 h-5 inline mr-2" />
              Mis Horas
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
              Búsqueda Avanzada
            </button>
            <button
              onClick={() => setActiveTab('signatures')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'signatures'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PencilSquareIcon className="w-5 h-5 inline mr-2" />
              Mis Firmas
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Vista General</h3>
              <p className="text-gray-600">Resumen de tu actividad académica y documentos recientes.</p>
              
              {/* Documentos recientes */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Documentos Recientes</h4>
                <div className="space-y-3">
                  {/* Aquí irían los documentos recientes */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Plan de Estudios 2024</p>
                        <p className="text-xs text-gray-500">Planificación • Hace 2 días</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aprobado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <SearchableDataView
              dataType="documents"
              title="Mis Documentos"
              onView={(item) => console.log('Ver documento:', item)}
              onEdit={(item) => console.log('Editar documento:', item)}
            />
          )}

          {activeTab === 'hours' && (
            <SearchableDataView
              dataType="hours"
              title="Mis Horas Registradas"
              onView={(item) => console.log('Ver horas:', item)}
              onEdit={(item) => console.log('Editar horas:', item)}
            />
          )}

          {activeTab === 'search' && (
            <SearchableDataView
              dataType="documents"
              title="Búsqueda Avanzada - Todos mis Datos"
              onView={(item) => console.log('Ver elemento:', item)}
              onEdit={(item) => console.log('Editar elemento:', item)}
            />
          )}

          {activeTab === 'signatures' && (
            <DocumentManager />
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
              className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <span className={`${action.color} rounded-lg inline-flex p-3 text-white ring-4 ring-white`}>
                  <action.icon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
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
        {/* Tareas pendientes */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tareas Pendientes</h2>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{task.task}</h3>
                  <p className="text-xs text-gray-500">Vence: {task.due}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos recientes */}
        {/* Gráficos para Docente */}
        {dashboardData && (
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mi Progreso Académico</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ChartBarIcon className="w-4 h-4" />
                <span>Mis estadísticas personales</span>
              </div>
            </div>
            <InteractiveCharts 
              dashboardData={dashboardData} 
              userRole="docente" 
            />
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Documentos Recientes</h2>
          <div className="space-y-4">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                    <p className="text-xs text-gray-500">{doc.type} • {doc.date}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Ver
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Exportación */}
      {showExportModal && (
        <ExportReports onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default DocenteDashboard;