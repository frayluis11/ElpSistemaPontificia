import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  UsersIcon,
  BanknotesIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, getUserRole, ROLES } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Configuración de navegación por rol
  const getNavigationItems = (role) => {
    const baseItems = [
      { name: 'Dashboard', href: `/${role.toLowerCase()}/dashboard`, icon: HomeIcon },
      { name: 'Perfil', href: `/${role.toLowerCase()}/profile`, icon: UserIcon },
    ];

    const roleSpecificItems = {
      [ROLES.ADMIN]: [
        { name: 'Usuarios', href: '/admin/users', icon: UsersIcon },
        { name: 'Documentos', href: '/admin/documentos', icon: DocumentTextIcon },
        { name: 'Horas', href: '/admin/hours', icon: ClockIcon },
        { name: 'Reportes', href: '/admin/reports', icon: ChartBarIcon },
        { name: 'Configuración', href: '/admin/settings', icon: CogIcon },
      ],
      [ROLES.DOCENTE]: [
        { name: 'Mis Documentos', href: '/docente/documentos', icon: DocumentTextIcon },
        { name: 'Registro de Horas', href: '/docente/hours', icon: ClockIcon },
        { name: 'Mis Reportes', href: '/docente/reports', icon: ChartBarIcon },
      ],
      [ROLES.RRHH]: [
        { name: 'Empleados', href: '/rrhh/employees', icon: UsersIcon },
        { name: 'Documentos RRHH', href: '/rrhh/documentos', icon: DocumentTextIcon },
        { name: 'Horas Laborales', href: '/rrhh/hours', icon: ClockIcon },
        { name: 'Reportes RRHH', href: '/rrhh/reports', icon: ChartBarIcon },
      ],
      [ROLES.CONTABILIDAD]: [
        { name: 'Finanzas', href: '/contabilidad/finances', icon: BanknotesIcon },
        { name: 'Documentos', href: '/contabilidad/documentos', icon: DocumentTextIcon },
        { name: 'Reportes', href: '/contabilidad/reports', icon: ChartBarIcon },
      ],
      [ROLES.TI]: [
        { name: 'Sistema', href: '/ti/system', icon: ComputerDesktopIcon },
        { name: 'Usuarios', href: '/ti/users', icon: UsersIcon },
        { name: 'Configuración', href: '/ti/settings', icon: CogIcon },
        { name: 'Reportes', href: '/ti/reports', icon: ChartBarIcon },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[role] || [])];
  };

  const currentRole = getUserRole();
  const navigationItems = getNavigationItems(currentRole);

  // Colores por rol
  const getRoleColors = (role) => {
    const colors = {
      [ROLES.ADMIN]: 'from-red-600 to-pink-600',
      [ROLES.DOCENTE]: 'from-blue-600 to-indigo-600',
      [ROLES.RRHH]: 'from-green-600 to-emerald-600',
      [ROLES.CONTABILIDAD]: 'from-yellow-600 to-orange-600',
      [ROLES.TI]: 'from-purple-600 to-violet-600',
    };
    return colors[role] || 'from-gray-600 to-gray-700';
  };

  const roleGradient = getRoleColors(currentRole);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent 
              navigationItems={navigationItems} 
              roleGradient={roleGradient}
              currentRole={currentRole}
              user={user}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent 
            navigationItems={navigationItems} 
            roleGradient={roleGradient}
            currentRole={currentRole}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-2xl font-semibold text-gray-900">
                Sistema ELP Pontificia
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  {user?.nombre_completo || user?.email}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${roleGradient}`}>
                  {currentRole}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Área de contenido */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Componente Sidebar reutilizable
const SidebarContent = ({ navigationItems, roleGradient, currentRole, user, onLogout }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo y título */}
      <div className={`flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r ${roleGradient}`}>
        <AcademicCapIcon className="h-8 w-8 text-white" />
        <span className="ml-2 text-white font-bold text-lg">ELP Sistema</span>
      </div>

      {/* Información del usuario */}
      <div className="flex-shrink-0 px-4 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${roleGradient} flex items-center justify-center`}>
              <span className="text-white font-medium text-sm">
                {user?.nombre_completo?.charAt(0) || user?.email?.charAt(0) || '?'}
              </span>
            </div>
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nombre_completo || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 truncate">{currentRole}</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-4 bg-white space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
          >
            <item.icon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />
            {item.name}
          </a>
        ))}
      </nav>

      {/* Botón logout */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <button
          onClick={onLogout}
          className="w-full text-left text-gray-600 hover:bg-red-50 hover:text-red-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon className="text-gray-400 group-hover:text-red-500 mr-3 flex-shrink-0 h-6 w-6" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;