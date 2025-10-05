import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente Button reutilizable
 * Variantes: primary, secondary, danger, success
 * Tamaños: sm, md, lg
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Clases base
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-button transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variantes de color
  const variants = {
    primary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 focus:ring-secondary-500 shadow-button',
    secondary: 'bg-white text-secondary-500 border border-secondary-500 hover:bg-secondary-50 active:bg-secondary-100 focus:ring-secondary-500 shadow-button',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500 shadow-button',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-500 shadow-button',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-secondary-600 focus:ring-gray-300',
    link: 'text-secondary-500 hover:text-secondary-600 underline-offset-4 hover:underline focus:ring-secondary-500'
  };

  // Tamaños
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-body',
    lg: 'px-6 py-3 text-lg'
  };

  // Tamaños de iconos
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  const iconClasses = iconSizes[size];

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Icono izquierdo */}
      {loading ? (
        <Loader2 className={`${iconClasses} animate-spin ${children ? 'mr-2' : ''}`} />
      ) : (
        Icon && iconPosition === 'left' && (
          <Icon className={`${iconClasses} ${children ? 'mr-2' : ''}`} />
        )
      )}

      {/* Contenido del botón */}
      {children}

      {/* Icono derecho */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={`${iconClasses} ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  );
};

export default Button;