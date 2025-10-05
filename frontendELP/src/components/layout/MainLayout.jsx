import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Layout principal del Sistema ELP Pontificia
 * Combina Header, Sidebar, Footer y área de contenido
 */
const MainLayout = ({ 
  children, 
  user = { name: 'Usuario Demo', role: 'Administrador' },
  userRole = 'Admin' 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout-main">
      {/* Header fijo */}
      <Header 
        onToggleSidebar={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        user={user}
      />

      {/* Contenedor principal con sidebar y contenido */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          userRole={userRole}
        />

        {/* Área de contenido principal */}
        <main className={`
          flex-1 min-h-screen flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed 
            ? 'lg:ml-16' 
            : 'lg:ml-64'
          }
        `}>
          {/* Contenido */}
          <div className="flex-1 p-6">
            {children}
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;