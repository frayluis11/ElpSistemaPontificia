import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Componente InputField moderno para el login
 * Input con animaciones, focus states y soporte para contraseña
 */
const InputField = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  icon: Icon,
  error,
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`relative animate-slide-up ${className}`}>
      {/* Icono izquierdo */}
      {Icon && (
        <Icon 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-600 transition-colors duration-200" 
        />
      )}
      
      {/* Input principal */}
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-4 py-3 text-input text-text-primary
          border border-border-light rounded-lg
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-border-focus
          hover:border-primary-400
          ${Icon ? 'pl-11' : ''}
          ${type === 'password' ? 'pr-11' : ''}
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${isFocused ? 'shadow-lg shadow-primary-600/10' : 'shadow-sm'}
        `}
        {...props}
      />
      
      {/* Botón mostrar/ocultar contraseña */}
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary-600 transition-colors duration-200"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;