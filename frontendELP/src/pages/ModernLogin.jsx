import React from 'react';
import LoginCard from '../components/ui/LoginCard';

/**
 * Página Login moderna del Sistema ELP Pontificia
 * Fondo con degradado azul-púrpura, card centrado, completamente responsive
 */
const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center p-4 sm:p-6">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Contenedor principal */}
      <div className="relative w-full max-w-md mx-auto">
        <LoginCard />
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-white/70 text-sm text-center animate-fade-in">
          © 2024 Pontificia Universidad - Sistema ELP
        </p>
      </div>
    </div>
  );
};

export default Login;