import React from 'react';

/**
 * Componente Logo moderno para el login
 * Logo Pontificia con animación suave y efecto flotante
 */
const Logo = ({ size = 100, className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center animate-fade-in ${className}`}>
      <div 
        className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-lg animate-logo-float flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="text-white font-bold" style={{ fontSize: `${size * 0.25}px` }}>
          ELP
        </span>
      </div>
    </div>
  );
};

export default Logo;