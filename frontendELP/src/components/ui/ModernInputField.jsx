/**
 * Input Field Moderno - Sistema ELP Pontificia
 * Componente de campo de entrada con diseño moderno y validación
 */

import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

const ModernInputField = ({ 
  type = 'text',
  label,
  placeholder,
  value = '',
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  icon: Icon,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef(null);

  // Actualizar hasValue cuando cambie el value
  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  // Manejar focus
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  // Manejar blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Manejar cambio de valor
  const handleChange = (e) => {
    const newValue = e.target.value;
    setHasValue(!!newValue);
    if (onChange) onChange(newValue);
  };

  // Toggle visibility de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Clases dinámicas para el container
  const containerClasses = `
    relative w-full transition-all duration-200 ease-in-out
    ${className}
  `;

  // Clases dinámicas para el input
  const inputClasses = `
    w-full px-4 py-3.5 text-sm font-medium
    bg-white border-2 rounded-xl
    transition-all duration-200 ease-in-out
    placeholder-transparent
    focus:outline-none focus:ring-0
    ${Icon ? 'pl-12' : 'pl-4'}
    ${type === 'password' ? 'pr-12' : 'pr-4'}
    ${error ? 
      'border-red-300 focus:border-red-500 bg-red-50/30' : 
      success ? 
        'border-green-300 focus:border-green-500 bg-green-50/30' :
        isFocused ? 
          'border-primary-500 bg-blue-50/30 shadow-glow' : 
          'border-gray-200 hover:border-gray-300'
    }
    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'text-gray-900'}
  `;

  // Clases dinámicas para el label
  const labelClasses = `
    absolute left-4 transition-all duration-200 ease-in-out
    pointer-events-none font-medium
    ${Icon ? 'left-12' : 'left-4'}
    ${isFocused || hasValue ? 
      'top-2 text-xs text-primary-600' : 
      'top-1/2 -translate-y-1/2 text-sm text-gray-500'
    }
    ${error ? 'text-red-500' : success ? 'text-green-600' : ''}
  `;

  // Clases para el ícono principal
  const iconClasses = `
    absolute left-4 top-1/2 -translate-y-1/2
    w-5 h-5 transition-colors duration-200
    ${error ? 'text-red-400' : 
      success ? 'text-green-500' :
      isFocused ? 'text-primary-500' : 'text-gray-400'}
  `;

  return (
    <div className={containerClasses}>
      {/* Input Container */}
      <div className="relative">
        {/* Ícono principal */}
        {Icon && (
          <Icon className={iconClasses} />
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          className={inputClasses}
          placeholder={placeholder || label}
          {...props}
        />

        {/* Label Flotante */}
        {label && (
          <label className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Ícono de contraseña */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2
                     w-5 h-5 text-gray-400 hover:text-gray-600
                     transition-colors duration-200 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Ícono de estado */}
        {(error || success) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : success ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Mensaje de Error o Éxito */}
      {(error || success) && (
        <div className="mt-2 px-1">
          {error && (
            <p className="text-sm text-red-600 font-medium flex items-center gap-1.5 animate-slide-down">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600 font-medium flex items-center gap-1.5 animate-slide-down">
              <Check size={14} />
              {success}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ModernInputField;