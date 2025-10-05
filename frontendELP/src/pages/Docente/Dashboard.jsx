import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

const DocenteDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    hoursThisWeek: 0,
    studentsAssigned: 0,
    completedTasks: 0
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        documentsUploaded: 24,
        hoursThisWeek: 32,
        studentsAssigned: 45,
        completedTasks: 18
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
          <div className="text-right">
            <div className="bg-blue-500 bg-opacity-50 rounded-lg p-3">
              <CalendarDaysIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">Hoy</p>
              <p className="font-bold">{new Date().toLocaleDateString('es-ES')}</p>
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
    </div>
  );
};

export default DocenteDashboard;