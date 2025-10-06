import React from 'react';

/**
 * Componente Card reutilizable
 * Contenedor base para contenido con sombra y bordes
 */
const Card = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  padding = 'normal',
  shadow = 'normal',
  border = true,
  hover = false,
  className = '',
  ...props
}) => {
  // Clases base de la tarjeta
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';

  // Variantes de padding
  const paddings = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8'
  };

  // Variantes de sombra
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    normal: 'shadow-card',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  // Clases de hover
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

  // Clases de borde
  const borderClasses = border ? 'border border-gray-200' : '';

  const cardClasses = `
    ${baseClasses}
    ${shadows[shadow]}
    ${borderClasses}
    ${hoverClasses}
    ${className}
  `;

  const contentClasses = paddings[padding];

  return (
    <div className={cardClasses} {...props}>
      {/* Header de la tarjeta */}
      {(title || subtitle || headerActions) && (
        <div className={`flex items-start justify-between border-b border-gray-200 ${padding === 'none' ? 'p-6 pb-4' : 'pb-4 mb-4'}`}>
          <div>
            {title && (
              <h3 className="text-title font-semibold text-text-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-body text-text-secondary mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <div className={contentClasses}>
        {children}
      </div>

      {/* Footer de la tarjeta */}
      {footer && (
        <div className={`border-t border-gray-200 ${padding === 'none' ? 'p-6 pt-4' : 'pt-4 mt-4'}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Componente CardGrid para layouts de múltiples tarjetas
 */
export const CardGrid = ({ 
  children, 
  cols = 'auto',
  gap = 'normal',
  className = '' 
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    'auto': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-4',
    normal: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;