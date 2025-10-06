import React from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const DashboardAdministracion = () => {
  const { user, logout } = useAuth();

  const stats = [
    {
      name: 'Usuarios del Sistema',
      value: '342',
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+15 este mes'
    },
    {
      name: 'Procesos Activos',
      value: '18',
      icon: CogIcon,
      color: 'bg-green-500',
      change: '12 en progreso'
    },
    {
      name: 'Reportes Generados',
      value: '45',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: 'Esta semana: 12'
    },
    {
      name: 'Incidentes Resueltos',
      value: '28',
      icon: ShieldCheckIcon,
      color: 'bg-yellow-500',
      change: '95% satisfacción'
    }
  ];

  const recentActivities = [
    'Revisión de políticas - 09:00 AM',
    'Junta directiva - 11:30 AM',
    'Supervisión de procesos - 02:00 PM',
    'Evaluación de sistemas - 04:30 PM'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Administración</h1>
                <p className="text-gray-600">Bienvenido, {user?.nombre} {user?.apellido}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                Actividades de Hoy
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <span className="font-medium text-blue-900">Gestión de Usuarios</span>
              </button>
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <span className="font-medium text-green-900">Supervisar Procesos</span>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <span className="font-medium text-purple-900">Generar Reportes</span>
              </button>
              <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <span className="font-medium text-yellow-900">Configuración</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdministracion;