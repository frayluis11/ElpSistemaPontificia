import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Logo from './Logo';
import InputField from './InputField';
import ModernButton from './ModernButton';
import ModernCheckbox from './ModernCheckbox';

/**
 * Componente LoginCard moderno
 * Card principal de login con todos los elementos y animaciones
 */
const LoginCard = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!formData.email.includes('@pontificia.edu')) {
      newErrors.email = 'Debe usar un correo institucional (@pontificia.edu)';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Login attempt:', formData);
      alert('¡Bienvenido! Login exitoso');
      
    } catch (error) {
      setErrors({ submit: 'Error en el servidor. Intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-8 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size={100} />
        </div>

        {/* Título y subtítulo */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-login-title text-text-primary mb-2">
            Bienvenido al Sistema ELP
          </h1>
          <p className="text-login-subtitle text-text-secondary">
            Inicia sesión con tu cuenta institucional
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <InputField
            type="email"
            name="email"
            placeholder="usuario@pontificia.edu"
            value={formData.email}
            onChange={handleInputChange}
            icon={Mail}
            error={errors.email}
          />

          {/* Contraseña */}
          <InputField
            type="password"
            name="password"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={handleInputChange}
            icon={Lock}
            error={errors.password}
          />

          {/* Recordarme */}
          <ModernCheckbox
            name="remember"
            checked={formData.remember}
            onChange={handleInputChange}
            label="Recordarme"
          />

          {/* Error de envío */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botón de login */}
          <ModernButton
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </ModernButton>

          {/* Link olvidé contraseña */}
          <div className="text-center animate-slide-up">
            <a 
              href="#" 
              className="text-link text-primary-600 hover:text-primary-700 hover:underline transition-all duration-200"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginCard;