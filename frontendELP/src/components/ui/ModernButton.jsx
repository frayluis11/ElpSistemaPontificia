/**
 * Botón Moderno - Sistema ELP Pontificia
 * Componente de botón con diseño moderno y múltiples variantes
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

const ModernButton = ({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Clases base del botón
  const baseClasses = `
    inline-flex items-center justify-center gap-2.5
    font-semibold rounded-xl transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-offset-0
    disabled:cursor-not-allowed transform active:scale-[0.98]
    ${fullWidth ? 'w-full' : ''}
  `;

  // Variantes de color
  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600
      hover:from-primary-600 hover:to-primary-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-primary-500/30
      disabled:from-gray-300 disabled:to-gray-400
      disabled:text-gray-500 disabled:shadow-none
      hover:scale-[1.02] active:scale-[0.98]
    `,
    secondary: `
      bg-gradient-to-r from-secondary-500 to-secondary-600
      hover:from-secondary-600 hover:to-secondary-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-secondary-500/30
      disabled:from-gray-300 disabled:to-gray-400
      disabled:text-gray-500 disabled:shadow-none
      hover:scale-[1.02] active:scale-[0.98]
    `,
    outline: `
      bg-white border-2 border-primary-500 text-primary-600
      hover:bg-primary-50 hover:border-primary-600
      focus:ring-primary-500/30 shadow-sm hover:shadow-md
      disabled:bg-gray-50 disabled:border-gray-300 
      disabled:text-gray-400 disabled:shadow-none
    `,
    ghost: `
      bg-transparent text-primary-600 hover:bg-primary-50
      focus:ring-primary-500/20
      disabled:text-gray-400 disabled:hover:bg-transparent
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-600 hover:to-red-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-red-500/30
      disabled:from-gray-300 disabled:to-gray-400
      disabled:text-gray-500 disabled:shadow-none
      hover:scale-[1.02] active:scale-[0.98]
    `,
  };

  // Tamaños
  const sizes = {
    sm: 'px-4 py-2.5 text-sm',
    default: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  };

  // Combinar todas las clases
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  // Determinar si el botón debe estar deshabilitado
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {/* Ícono a la izquierda */}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 24 : 18} />
      )}

      {/* Spinner de carga */}
      {loading && (
        <Loader2 
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 24 : 18} 
          className="animate-spin" 
        />
      )}

      {/* Contenido del botón */}
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>

      {/* Ícono a la derecha */}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 24 : 18} />
      )}
    </button>
  );
};

export default ModernButton;