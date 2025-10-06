import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ModernDashboardLayout from '../../components/layout/ModernDashboardLayout';
import { KPICard, StatCard, QuickActionCard, AlertCard } from '../../components/ui/KPIComponents';
import { ModernLineChart, ModernAreaChart, ModernPieChart } from '../../components/ui/ChartComponents';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // Datos de ejemplo para KPIs
  const kpiData = [
    {
      title: 'Usuarios Activos',
      value: 1247,
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Documentos Procesados',
      value: 8945,
      change: '+8%',
      changeType: 'positive',
      icon: DocumentTextIcon,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Transacciones Hoy',
      value: 156789,
      change: '-2%',
      changeType: 'negative',
      icon: CurrencyDollarIcon,
      gradient: 'from-yellow-500 to-yellow-600',
      format: 'currency'
    },
    {
      title: 'Tiempo Promedio',
      value: 94.8,
      change: '+5%',
      changeType: 'positive',
      icon: ClockIcon,
      gradient: 'from-purple-500 to-purple-600',
      format: 'percentage'
    }
  ];

  // Datos para gráficos
  const chartData = [
    { mes: 'Ene', usuarios: 1100, documentos: 8200, transacciones: 145000 },
    { mes: 'Feb', usuarios: 1180, documentos: 8400, transacciones: 152000 },
    { mes: 'Mar', usuarios: 1220, documentos: 8750, transacciones: 148000 },
    { mes: 'Abr', usuarios: 1247, documentos: 8945, transacciones: 156789 }
  ];

  const pieData = [
    { name: 'Docentes', value: 450, color: '#3B82F6' },
    { name: 'RRHH', value: 125, color: '#10B981' },
    { name: 'Contabilidad', value: 89, color: '#F59E0B' },
    { name: 'TI', value: 67, color: '#8B5CF6' },
    { name: 'Admin', value: 15, color: '#EF4444' }
  ];

  // Items del sidebar
  const sidebarItems = [
    {
      label: 'Dashboard',
      icon: HomeIcon,
      active: activeSection === 'overview',
      onClick: () => setActiveSection('overview')
    },
    {
      label: 'Usuarios',
      icon: UsersIcon,
      active: activeSection === 'users',
      onClick: () => setActiveSection('users'),
      badge: 3
    },
    {
      label: 'Documentos',
      icon: DocumentTextIcon,
      active: activeSection === 'documents',
      onClick: () => setActiveSection('documents')
    },
    {
      label: 'Reportes',
      icon: ChartBarIcon,
      active: activeSection === 'reports',
      onClick: () => setActiveSection('reports')
    },
    {
      label: 'Seguridad',
      icon: ShieldCheckIcon,
      active: activeSection === 'security',
      onClick: () => setActiveSection('security')
    },
    {
      label: 'Sistema',
      icon: ServerIcon,
      active: activeSection === 'system',
      onClick: () => setActiveSection('system')
    },
    {
      label: 'Configuración',
      icon: CogIcon,
      active: activeSection === 'settings',
      onClick: () => setActiveSection('settings')
    }
  ];

  const quickActions = [
    {
      title: 'Crear Usuario',
      description: 'Agregar nuevo usuario al sistema',
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600',
      onClick: () => console.log('Crear usuario')
    },
    {
      title: 'Backup Sistema',
      description: 'Realizar respaldo completo',
      icon: ServerIcon,
      gradient: 'from-green-500 to-green-600',
      onClick: () => console.log('Backup')
    },
    {
      title: 'Generar Reporte',
      description: 'Crear reporte mensual',
      icon: ChartBarIcon,
      gradient: 'from-purple-500 to-purple-600',
      onClick: () => console.log('Reporte')
    },
    {
      title: 'Configurar Sistema',
      description: 'Ajustar configuraciones',
      icon: CogIcon,
      gradient: 'from-orange-500 to-orange-600',
      onClick: () => console.log('Configurar')
    }
  ];

  const alerts = [
    {
      type: 'warning',
      title: 'Mantenimiento Programado',
      message: 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM.'
    },
    {
      type: 'success',
      title: 'Backup Completado',
      message: 'El respaldo automático se completó exitosamente a las 3:00 AM.'
    }
  ];

  return (
    <ModernDashboardLayout
      sidebarItems={sidebarItems}
      title="Panel de Administración"
      subtitle="Vista general del sistema ELP Pontificia"
    >
      <div className="space-y-8">
        {/* Alertas */}
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <AlertCard
              key={index}
              type={alert.type}
              title={alert.title}
              message={alert.message}
            />
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              changeType={kpi.changeType}
              icon={kpi.icon}
              gradient={kpi.gradient}
              format={kpi.format}
            />
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernLineChart
            data={chartData}
            xKey="mes"
            yKey="usuarios"
            title="Usuarios Activos por Mes"
            color="#3B82F6"
          />
          
          <ModernPieChart
            data={pieData}
            dataKey="value"
            nameKey="name"
            title="Distribución de Usuarios por Rol"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ModernAreaChart
            data={chartData}
            xKey="mes"
            yKey="transacciones"
            title="Transacciones Mensuales"
            color="#10B981"
          />
        </div>

        {/* Acciones Rápidas */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                gradient={action.gradient}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>

        {/* Estadísticas Adicionales */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Estado del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Tiempo de Actividad"
              value="99.9%"
              subtitle="Últimos 30 días"
              icon={CheckCircleIcon}
              color="green"
              trend={{ direction: 'up', value: '0.1%', label: 'vs mes anterior' }}
            />
            
            <StatCard
              title="Uso de CPU"
              value="23%"
              subtitle="Promedio actual"
              icon={ServerIcon}
              color="blue"
              trend={{ direction: 'down', value: '5%', label: 'desde ayer' }}
            />
            
            <StatCard
              title="Errores del Sistema"
              value="0"
              subtitle="Últimas 24 horas"
              icon={ExclamationTriangleIcon}
              color="red"
              trend={{ direction: 'down', value: '100%', label: 'desde ayer' }}
            />
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

export default AdminDashboard;