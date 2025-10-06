import React from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Clock, 
  Settings, 
  BarChart3, 
  Calendar,
  Database,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/**
 * Componente Sidebar del Sistema ELP Pontificia
 * Navegación principal lateral con menús por rol
 */
const Sidebar = ({ isCollapsed, onToggleCollapse, userRole = 'Admin' }) => {
  // Configuración de menús por rol
  const menuItems = {
    Admin: [
      { icon: Home, label: 'Dashboard', path: '/dashboard', active: true },
      { icon: Users, label: 'Usuarios', path: '/usuarios' },
      { icon: BarChart3, label: 'Reportes', path: '/reportes' },
      { icon: Database, label: 'Base de Datos', path: '/database' },
      { icon: Shield, label: 'Seguridad', path: '/seguridad' },
      { icon: Settings, label: 'Configuración', path: '/configuracion' },
    ],
    Docente: [
      { icon: Home, label: 'Dashboard', path: '/dashboard', active: true },
      { icon: FileText, label: 'Documentos', path: '/documentos' },
      { icon: Clock, label: 'Horas', path: '/horas' },
      { icon: Calendar, label: 'Cronograma', path: '/cronograma' },
      { icon: BarChart3, label: 'Mis Reportes', path: '/reportes' },
    ],
    RRHH: [
      { icon: Home, label: 'Dashboard', path: '/dashboard', active: true },
      { icon: Users, label: 'Personal', path: '/personal' },
      { icon: FileText, label: 'Contratos', path: '/contratos' },
      { icon: Clock, label: 'Asistencias', path: '/asistencias' },
      { icon: BarChart3, label: 'Reportes RH', path: '/reportes' },
    ],
    Contabilidad: [
      { icon: Home, label: 'Dashboard', path: '/dashboard', active: true },
      { icon: FileText, label: 'Facturas', path: '/facturas' },
      { icon: BarChart3, label: 'Estados', path: '/estados' },
      { icon: Database, label: 'Contabilidad', path: '/contabilidad' },
    ],
    TI: [
      { icon: Home, label: 'Dashboard', path: '/dashboard', active: true },
      { icon: Database, label: 'Sistemas', path: '/sistemas' },
      { icon: Shield, label: 'Seguridad', path: '/seguridad' },
      { icon: Settings, label: 'Configuración', path: '/configuracion' },
      { icon: BarChart3, label: 'Monitoreo', path: '/monitoreo' },
    ]
  };

  const currentMenuItems = menuItems[userRole] || menuItems.Admin;

  const bottomMenuItems = [
    { icon: HelpCircle, label: 'Ayuda', path: '/ayuda' },
    { icon: Settings, label: 'Preferencias', path: '/preferencias' },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        layout-sidebar fixed left-0 top-16 bottom-0 z-50 
        transform transition-transform duration-300 ease-in-out
        lg:transform-none lg:static lg:z-auto
        ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        ${isCollapsed ? 'layout-sidebar-collapsed' : ''}
        custom-scrollbar overflow-y-auto
      `}>
        <div className="h-full flex flex-col">
          {/* Botón de colapso - solo desktop */}
          <div className="hidden lg:flex justify-end p-4 border-b border-gray-200">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navegación principal */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {currentMenuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={index}
                    href={item.path}
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-all duration-200
                      ${item.active 
                        ? 'bg-secondary-500 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-secondary-600'
                      }
                      ${isCollapsed ? 'justify-center' : 'space-x-3'}
                    `}
                  >
                    <IconComponent className={`
                      ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
                      flex-shrink-0
                    `} />
                    {!isCollapsed && (
                      <span className="font-medium text-body">
                        {item.label}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </nav>

          {/* Menú inferior */}
          <div className="px-4 py-6 border-t border-gray-200">
            <div className="space-y-2">
              {bottomMenuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={index}
                    href={item.path}
                    className={`
                      flex items-center px-3 py-2 rounded-lg transition-all duration-200
                      text-gray-600 hover:bg-gray-100 hover:text-secondary-600
                      ${isCollapsed ? 'justify-center' : 'space-x-3'}
                    `}
                  >
                    <IconComponent className={`
                      ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}
                      flex-shrink-0
                    `} />
                    {!isCollapsed && (
                      <span className="text-body">
                        {item.label}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Información de versión - solo cuando expandido */}
          {!isCollapsed && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-caption text-gray-500 text-center">
                Sistema ELP v1.0.0
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;