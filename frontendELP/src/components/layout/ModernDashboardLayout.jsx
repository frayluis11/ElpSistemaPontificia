import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const ModernDashboardLayout = ({ children, sidebarItems = [], title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useAuth();

  const userRoleConfig = {
    'Administrador': {
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      icon: '👨‍💼'
    },
    'Docente': {
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      icon: '👨‍🏫'
    },
    'RRHH': {
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      icon: '👥'
    },
    'Contabilidad': {
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      icon: '💰'
    },
    'TI': {
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      icon: '💻'
    }
  };

  const currentConfig = userRoleConfig[user?.rol] || userRoleConfig['Docente'];

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200"
          >
            {/* Logo Header */}
            <div className={`bg-gradient-to-r ${currentConfig.gradient} p-6`}>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">ELP</span>
                </div>
                <div className="ml-3">
                  <h2 className="text-white font-semibold text-lg">ELP Pontificia</h2>
                  <p className="text-white/80 text-sm">{user?.rol}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-4">
              <div className="space-y-2">
                {sidebarItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.onClick}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                      item.active 
                        ? `bg-gradient-to-r ${currentConfig.gradient} text-white shadow-lg`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-6 h-6 mr-3" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </nav>

            {/* User Profile Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentConfig.gradient} flex items-center justify-center text-white text-lg`}>
                  {currentConfig.icon}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.nombre_completo}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
              
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-gray-600">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <BellIcon className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentConfig.gradient} flex items-center justify-center text-white text-sm`}>
                    {currentConfig.icon}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.nombre_completo}</span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors">
                        <UserCircleIcon className="w-5 h-5 mr-3" />
                        Mi Perfil
                      </button>
                      <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors">
                        <Cog6ToothIcon className="w-5 h-5 mr-3" />
                        Configuración
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ModernDashboardLayout;