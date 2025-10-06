import React, { forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Componente Input reutilizable con validación
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  success,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  showPasswordToggle = false,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [inputType, setInputType] = React.useState(type);

  React.useEffect(() => {
    if (type === 'password' && showPasswordToggle) {
      setInputType(showPassword ? 'text' : 'password');
    }
  }, [showPassword, type, showPasswordToggle]);

  // Clases base del input
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';

  // Estados de validación
  const validationClasses = {
    normal: 'border-gray-300 focus:border-secondary-500 focus:ring-secondary-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  };

  // Determinar estado actual
  const currentState = error ? 'error' : success ? 'success' : 'normal';

  // Clases para iconos en el input
  const iconClasses = 'absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400';

  const inputClasses = `
    ${baseClasses}
    ${validationClasses[currentState]}
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
    ${LeftIcon ? 'pl-10' : ''}
    ${RightIcon || showPasswordToggle || error || success ? 'pr-10' : ''}
    ${className}
  `;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="block text-body font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Icono izquierdo */}
        {LeftIcon && (
          <LeftIcon className={`${iconClasses} left-3`} />
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />

        {/* Iconos derechos */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Icono de estado */}
          {error && <AlertCircle className="w-5 h-5 text-red-500" />}
          {success && <CheckCircle className="w-5 h-5 text-green-500" />}
          
          {/* Toggle password visibility */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Icono personalizado derecho */}
          {RightIcon && !showPasswordToggle && !error && !success && (
            <RightIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Helper text o mensaje de error */}
      {(error || success || helperText) && (
        <p className={`text-caption ${
          error ? 'text-red-600' : 
          success ? 'text-green-600' : 
          'text-text-secondary'
        }`}>
          {error || success || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Componente Textarea reutilizable
 */
export const Textarea = forwardRef(({
  label,
  placeholder,
  error,
  success,
  helperText,
  rows = 4,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  // Clases base del textarea
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-vertical';

  // Estados de validación
  const validationClasses = {
    normal: 'border-gray-300 focus:border-secondary-500 focus:ring-secondary-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  };

  const currentState = error ? 'error' : success ? 'success' : 'normal';

  const textareaClasses = `
    ${baseClasses}
    ${validationClasses[currentState]}
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="block text-body font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={textareaClasses}
        {...props}
      />

      {/* Helper text o mensaje de error */}
      {(error || success || helperText) && (
        <p className={`text-caption ${
          error ? 'text-red-600' : 
          success ? 'text-green-600' : 
          'text-text-secondary'
        }`}>
          {error || success || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;