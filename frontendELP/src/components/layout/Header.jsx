import React from 'react';
import { User, Bell, Settings, LogOut, Menu } from 'lucide-react';

/**
 * Componente Header del Sistema ELP Pontificia
 * Contiene logo, navegación y área de usuario
 */
const Header = ({ onToggleSidebar, isCollapsed, user = { name: 'Usuario', role: 'Rol' } }) => {
  return (
    <header className="layout-header fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6">
      {/* Lado izquierdo - Logo y toggle */}
      <div className="flex items-center space-x-4">
        {/* Botón para colapsar sidebar */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Logo y nombre del sistema */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">ELP</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-title text-primary-800 font-bold">
              Sistema ELP
            </h1>
            <p className="text-caption text-text-secondary">
              Pontificia Universidad
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Área de usuario */}
      <div className="flex items-center space-x-4">
        {/* Notificaciones */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {/* Badge de notificaciones */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* Configuraciones */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Configuraciones"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        {/* Separador */}
        <div className="w-px h-8 bg-gray-200"></div>

        {/* Información del usuario */}
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-8 h-8 bg-accent-400 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          
          {/* Datos del usuario - oculto en móvil */}
          <div className="hidden md:block text-right">
            <p className="text-body font-medium text-text-primary">
              {user.name}
            </p>
            <p className="text-caption text-text-secondary">
              {user.role}
            </p>
          </div>

          {/* Botón logout */}
          <button
            className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;