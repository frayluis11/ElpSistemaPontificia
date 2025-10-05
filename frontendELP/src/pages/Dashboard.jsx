import React from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Bell,
  Activity,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { Card, CardGrid, Button } from '../components/ui';

/**
 * Página Dashboard base del Sistema ELP Pontificia
 * Dashboard genérico que se adapta según el rol del usuario
 */
const Dashboard = ({ userRole = 'Admin', userName = 'Usuario' }) => {
  // Datos de ejemplo para KPIs
  const kpis = {
    Admin: [
      { title: 'Usuarios Activos', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-600' },
      { title: 'Documentos', value: '8,456', change: '+5%', icon: FileText, color: 'text-green-600' },
      { title: 'Horas Registradas', value: '12,345', change: '+8%', icon: Clock, color: 'text-orange-600' },
      { title: 'Performance', value: '94%', change: '+2%', icon: TrendingUp, color: 'text-purple-600' }
    ],
    Docente: [
      { title: 'Mis Documentos', value: '45', change: '+3', icon: FileText, color: 'text-green-600' },
      { title: 'Horas Este Mes', value: '156', change: '+12h', icon: Clock, color: 'text-orange-600' },
      { title: 'Clases Programadas', value: '24', change: '+2', icon: Calendar, color: 'text-blue-600' },
      { title: 'Evaluación', value: '4.8', change: '+0.2', icon: Star, color: 'text-yellow-600' }
    ],
    RRHH: [
      { title: 'Personal Activo', value: '345', change: '+8', icon: Users, color: 'text-blue-600' },
      { title: 'Contratos', value: '78', change: '+5', icon: FileText, color: 'text-green-600' },
      { title: 'Asistencias Hoy', value: '298', change: '+12', icon: CheckCircle, color: 'text-green-600' },
      { title: 'Pendientes', value: '12', change: '-3', icon: AlertTriangle, color: 'text-red-600' }
    ]
  };

  // Actividades recientes
  const recentActivities = [
    { 
      title: 'Nuevo documento subido',
      description: 'Evaluación Q3 2024 por Juan Pérez',
      time: 'Hace 2 horas',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'Horas registradas',
      description: 'María García registró 8 horas',
      time: 'Hace 4 horas',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Usuario nuevo',
      description: 'Carlos López se unió al sistema',
      time: 'Hace 1 día',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Reporte generado',
      description: 'Reporte mensual de productividad',
      time: 'Hace 2 días',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const currentKpis = kpis[userRole] || kpis.Admin;

  return (
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            ¡Bienvenido, {userName}!
          </h1>
          <p className="text-text-secondary mt-1">
            Aquí tienes un resumen de tu actividad en el sistema
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={Bell} size="sm">
            Notificaciones
          </Button>
          <Button icon={Activity} size="sm">
            Ver Reportes
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <CardGrid cols={4} gap="lg">
        {currentKpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index} hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {kpi.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.change}
                    </span>
                    <span className="text-text-secondary text-sm ml-1">
                      vs mes anterior
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center ${kpi.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </CardGrid>

      {/* Contenido Principal - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Principal */}
        <div className="lg:col-span-2">
          <Card title="Actividad del Sistema" subtitle="Últimos 30 días">
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-text-secondary">
                  Gráfico de actividad aquí
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  Se integrará con bibliotecas de gráficos como Chart.js
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actividades Recientes */}
        <div>
          <Card title="Actividad Reciente" subtitle="Últimas actualizaciones">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">
                        {activity.title}
                      </p>
                      <p className="text-sm text-text-secondary truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <Button variant="ghost" fullWidth>
                Ver todas las actividades
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <Card title="Acciones Rápidas" subtitle="Tareas frecuentes">
        <CardGrid cols={4} gap="normal">
          <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 cursor-pointer">
            <FileText className="w-8 h-8 text-secondary-600 mx-auto mb-3" />
            <h3 className="font-medium text-text-primary mb-1">Subir Documento</h3>
            <p className="text-sm text-text-secondary">Agregar nuevos archivos</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 cursor-pointer">
            <Clock className="w-8 h-8 text-secondary-600 mx-auto mb-3" />
            <h3 className="font-medium text-text-primary mb-1">Registrar Horas</h3>
            <p className="text-sm text-text-secondary">Marcar tiempo trabajado</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 cursor-pointer">
            <TrendingUp className="w-8 h-8 text-secondary-600 mx-auto mb-3" />
            <h3 className="font-medium text-text-primary mb-1">Ver Reportes</h3>
            <p className="text-sm text-text-secondary">Analizar métricas</p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 cursor-pointer">
            <Users className="w-8 h-8 text-secondary-600 mx-auto mb-3" />
            <h3 className="font-medium text-text-primary mb-1">Gestionar Usuarios</h3>
            <p className="text-sm text-text-secondary">Administrar personal</p>
          </div>
        </CardGrid>
      </Card>
    </div>
  );
};

export default Dashboard;