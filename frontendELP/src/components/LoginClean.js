import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) {
          return 'El DNI o correo es requerido';
        }
        if (value.includes('@')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Ingresa un correo válido';
          }
        } else {
          const dniRegex = /^[0-9]{8}$/;
          if (!dniRegex.test(value)) {
            return 'El DNI debe tener 8 dígitos';
          }
        }
        return '';
      case 'password':
        if (!value) {
          return 'La contraseña es requerida';
        }
        if (value.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres';
        }
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await authService.login(formData.username, formData.password);

      if (result.success) {
        login(result.user);
        
        const userRole = result.user.rol;
        switch(userRole) {
          case 'Docente':
            navigate('/dashboard/docente');
            break;
          case 'RRHH':
            navigate('/dashboard/rrhh');
            break;
          case 'Contabilidad':
            navigate('/dashboard/contabilidad');
            break;
          case 'Administración':
            navigate('/dashboard/administracion');
            break;
          case 'Área TI':
            navigate('/dashboard/ti');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setErrors({ submit: result.error || 'Error al iniciar sesión' });
      }
    } catch (error) {
      setErrors({ submit: 'Error de conexión. Verifica tu internet.' });
    } finally {
      setIsLoading(false);
    }
  };

  const cardClasses = `w-full max-w-md bg-white rounded-xl shadow-md p-6 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-50 p-4">
      <div className={cardClasses}>
        
        {/* Logo centrado */}
        <div className="text-center mb-6">
          <div className="w-25 h-25 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-indigo-100">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-inter">
            Sistema ELP Pontificia
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Inicia sesión con tu cuenta institucional
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo DNI/Correo */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              DNI o Correo Institucional
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-3 py-3 border rounded-lg text-base font-inter focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 ${errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="12345678 o usuario@upb.edu.co"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.username}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-3 border rounded-lg text-base font-inter focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium" role="alert">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Botón Login */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-base font-inter hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'bg-indigo-400 text-white' : 'bg-indigo-600 text-white'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

        </form>

        {/* Enlaces adicionales */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline transition-colors duration-200"
            onClick={() => navigate('/forgot-password')}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Universidad Pontificia Bolivariana
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;