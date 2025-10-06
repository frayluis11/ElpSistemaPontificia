/**
 * Hook personalizado para manejo de autenticación
 * Sistema ELP Pontificia - React Hook para Auth
 */

import { useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
};

/**
 * Hook para el formulario de login con validación y manejo de estados
 */
export const useLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validación en tiempo real
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) {
          return 'El email es requerido';
        }
        if (!authService.isValidEmail(value)) {
          return 'Por favor ingresa un email válido';
        }
        return '';
      
      case 'password':
        if (!value) {
          return 'La contraseña es requerida';
        }
        if (!authService.isValidPassword(value)) {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
        return '';
      
      default:
        return '';
    }
  };

  // Actualizar campo del formulario
  const updateField = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar solo si ya se intentó enviar el formulario
    if (isSubmitted) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'rememberMe') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (onSuccess, onError) => {
    setIsSubmitted(true);
    setIsLoading(true);

    try {
      if (!validateForm()) {
        setIsLoading(false);
        return false;
      }

      const result = await authService.login(formData.email, formData.password);

      if (result.success) {
        // Login exitoso
        if (onSuccess) {
          onSuccess(result);
        }
        return true;
      } else {
        // Error en login
        setErrors({
          submit: result.error || 'Error al iniciar sesión'
        });
        if (onError) {
          onError(result.error);
        }
        return false;
      }
    } catch (error) {
      const errorMessage = 'Error de conexión. Por favor intenta de nuevo.';
      setErrors({
        submit: errorMessage
      });
      if (onError) {
        onError(errorMessage);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar errores
  const clearErrors = () => {
    setErrors({});
    setIsSubmitted(false);
  };

  return {
    formData,
    errors,
    isLoading,
    isSubmitted,
    updateField,
    handleSubmit,
    clearErrors,
    validateField,
  };
};

/**
 * Hook para validación de inputs en tiempo real
 */
export const useInputValidation = (initialValue = '', validator) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const validate = (val) => {
    if (validator && touched) {
      const validationError = validator(val);
      setError(validationError);
      return !validationError;
    }
    return true;
  };

  const handleChange = (newValue) => {
    setValue(newValue);
    validate(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    setFocused(false);
    validate(value);
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const reset = () => {
    setValue(initialValue);
    setError('');
    setTouched(false);
    setFocused(false);
  };

  return {
    value,
    error,
    touched,
    focused,
    isValid: !error && touched,
    handleChange,
    handleBlur,
    handleFocus,
    reset,
  };
};

export { useAuth as default };