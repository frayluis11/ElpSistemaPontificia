import React from 'react';
import { Check } from 'lucide-react';

/**
 * Componente Checkbox moderno personalizado
 * Checkbox con animaciones y colores del tema
 */
const ModernCheckbox = ({ 
  checked, 
  onChange, 
  label, 
  className = '',
  ...props 
}) => {
  return (
    <label className={`flex items-center space-x-3 cursor-pointer animate-slide-up ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div className={`
          w-5 h-5 rounded border-2 transition-all duration-200
          flex items-center justify-center
          ${checked 
            ? 'bg-primary-600 border-primary-600' 
            : 'bg-white border-border-light hover:border-primary-400'
          }
        `}>
          {checked && (
            <Check className="w-3 h-3 text-white animate-fade-in" />
          )}
        </div>
      </div>
      <span className="text-input text-text-secondary select-none">
        {label}
      </span>
    </label>
  );
};

export default ModernCheckbox;