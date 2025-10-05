import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ChevronDown } from 'lucide-react';
import { Button, Input } from '../components/ui';

/**
 * Página de Login del Sistema ELP Pontificia
 * Formulario de autenticación con validación y diseño responsive
 */
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Roles disponibles
  const roles = [
    { value: 'Admin', label: 'Administrador' },
    { value: 'Docente', label: 'Docente' },
    { value: 'RRHH', label: 'Recursos Humanos' },
    { value: 'Contabilidad', label: 'Contabilidad' },
    { value: 'TI', label: 'Tecnologías de la Información' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      newErrors.email = 'Debe usar un correo institucional @pontificia.edu';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.role) {
      newErrors.role = 'Debe seleccionar un rol';
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
      
      // Aquí iría la lógica de autenticación real
      console.log('Login attempt:', formData);
      
      // Redirigir al dashboard correspondiente
      alert(`¡Bienvenido! Redirigiendo al dashboard de ${formData.role}`);
      
    } catch (error) {
      setErrors({ submit: 'Error en el servidor. Intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-800 flex items-center justify-center p-6">
      {/* Contenedor principal */}
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-400 rounded-2xl mb-6">
            <span className="text-2xl font-bold text-primary-800">ELP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sistema ELP
          </h1>
          <p className="text-gray-200">
            Pontificia Universidad
          </p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-text-secondary">
              Ingresa tus credenciales institucionales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de email */}
            <Input
              name="email"
              type="email"
              label="Correo Electrónico"
              placeholder="usuario@pontificia.edu"
              value={formData.email}
              onChange={handleInputChange}
              leftIcon={Mail}
              error={errors.email}
              required
            />

            {/* Campo de contraseña */}
            <Input
              name="password"
              type="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleInputChange}
              leftIcon={Lock}
              showPasswordToggle
              error={errors.password}
              required
            />

            {/* Selector de rol */}
            <div className="space-y-1">
              <label className="block text-body font-medium text-text-primary">
                Rol <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pl-10 pr-10 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none ${
                    errors.role 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-secondary-500 focus:ring-secondary-500'
                  }`}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.role && (
                <p className="text-caption text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Botón de envío */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <a 
                href="#" 
                className="text-sm text-secondary-600 hover:text-secondary-700 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-center text-sm text-text-secondary">
                ¿Necesitas ayuda? 
                <a 
                  href="#" 
                  className="text-secondary-600 hover:text-secondary-700 ml-1 transition-colors"
                >
                  Contactar Soporte
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-300 text-sm">
          <p>© 2024 Pontificia Universidad - Sistema ELP</p>
          <p className="mt-1">Versión 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;