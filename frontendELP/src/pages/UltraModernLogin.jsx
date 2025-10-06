/**
 * Página de Login Ultra Moderna - Sistema ELP Pontificia
 * Login con diseño SaaS moderno, gradientes, animaciones y conexión FastAPI
 */

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield, CheckCircle } from 'lucide-react';

// Componentes modernos
import ModernInputField from '../components/ui/ModernInputField';
import ModernButton from '../components/ui/ModernButton';
import ModernCheckbox from '../components/ui/ModernCheckbox';
import Logo from '../components/ui/Logo';

// Context
import AuthContext from '../context/AuthContext';

// Servicio de autenticación
import { authService } from '../services/authService';

const UltraModernLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Estados adicionales para la UI
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animación de montaje
  useEffect(() => {
    setMounted(true);
  }, []);

  // Actualizar campo del formulario
  const updateField = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!authService.isValidEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!authService.isValidPassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const onSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await authService.login(formData.email, formData.password);

      if (result.success) {
        setShowSuccess(true);
        login(result.user, result.token);
        
        // Redirigir después de mostrar éxito
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setErrors({
          submit: result.error || 'Error al iniciar sesión'
        });
      }
    } catch (error) {
      setErrors({
        submit: 'Error de conexión. Por favor intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600">
        {/* Elementos decorativos animados */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className={`
          w-full max-w-md transition-all duration-700 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          
          {/* Tarjeta de Login */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
            
            {/* Header con Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-6 shadow-lg animate-float">
                <Logo size={40} className="text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-gray-600 text-lg">
                Sistema ELP Pontificia
              </p>
            </div>

            {/* Mostrar mensaje de éxito */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-down">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">
                    ¡Login exitoso! Redirigiendo...
                  </p>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={onSubmitForm} className="space-y-6">
              
              {/* Campo Email */}
              <ModernInputField
                type="email"
                label="Correo electrónico"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(value) => updateField('email', value)}
                error={errors.email}
                required
                autoComplete="email"
                icon={Mail}
                className="animate-slide-up"
              />

              {/* Campo Contraseña */}
              <ModernInputField
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={formData.password}
                onChange={(value) => updateField('password', value)}
                error={errors.password}
                required
                autoComplete="current-password"
                icon={Lock}
                className="animate-slide-up"
                style={{ animationDelay: '0.1s' }}
              />

              {/* Opciones adicionales */}
              <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <ModernCheckbox
                  checked={formData.rememberMe}
                  onChange={(e) => updateField('rememberMe', e.target.checked)}
                  label="Recordarme"
                />
                
                <button
                  type="button"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                  onClick={() => navigate('/forgot-password')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Error general del formulario */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-down">
                  <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Botón de Login */}
              <ModernButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={showSuccess}
                icon={ArrowRight}
                iconPosition="right"
                className="animate-slide-up"
                style={{ animationDelay: '0.3s' }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </ModernButton>

            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600 text-sm">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>

            {/* Badge de seguridad */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Conexión segura con encriptación SSL</span>
            </div>

          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              Sistema de gestión académica
            </p>
            <p className="text-white/60 text-xs mt-1">
              Universidad Pontificia Bolivariana
            </p>
          </div>

        </div>
      </div>

      {/* Panel lateral decorativo - solo en pantallas grandes */}
      <div className="hidden lg:flex lg:w-1/3 relative items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="w-24 h-24 bg-white/20 rounded-2xl mx-auto mb-8 flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Sistema Académico Moderno
          </h2>
          <p className="text-white/80 leading-relaxed">
            Accede a tu portal académico con la máxima seguridad y una experiencia de usuario excepcional.
          </p>
          
          {/* Features */}
          <div className="mt-8 space-y-4">
            {[
              'Interfaz moderna y intuitiva',
              'Seguridad de nivel empresarial',
              'Acceso multiplataforma',
              'Soporte 24/7'
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default UltraModernLogin;