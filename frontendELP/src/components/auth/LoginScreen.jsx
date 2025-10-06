import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('username'); // 'username' or 'email'
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

  // Roles disponibles con colores y descripciones
  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      color: 'from-red-500 to-red-600',
      icon: '👨‍💼',
      dashboard: '/admin/dashboard'
    },
    {
      id: 'docente',
      name: 'Docente',
      description: 'Gestión académica y educativa',
      color: 'from-blue-500 to-blue-600',
      icon: '👨‍🏫',
      dashboard: '/docente/dashboard'
    },
    {
      id: 'rrhh',
      name: 'Recursos Humanos',
      description: 'Gestión de personal',
      color: 'from-green-500 to-green-600',
      icon: '👥',
      dashboard: '/rrhh/dashboard'
    },
    {
      id: 'contabilidad',
      name: 'Contabilidad',
      description: 'Gestión financiera',
      color: 'from-yellow-500 to-yellow-600',
      icon: '💰',
      dashboard: '/contabilidad/dashboard'
    },
    {
      id: 'ti',
      name: 'Tecnología',
      description: 'Soporte técnico y sistemas',
      color: 'from-purple-500 to-purple-600',
      icon: '💻',
      dashboard: '/ti/dashboard'
    }
  ];

  // Limpiar errores al cambiar campos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Cargar datos recordados al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem('rememberedLogin');
    if (savedData) {
      try {
        const { username, email, role, type } = JSON.parse(savedData);
        if (type === 'email' && email) {
          setLoginType('email');
          setValue('identifier', email);
        } else if (username) {
          setLoginType('username');
          setValue('identifier', username);
        }
        if (role) {
          setSelectedRole(role);
        }
        setRememberMe(true);
      } catch (err) {
        console.error('Error cargando datos guardados:', err);
      }
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    clearError();
    
    try {
      const loginData = {
        [loginType]: data.identifier,
        password: data.password,
        role: selectedRole
      };
      
      // Guardar datos si "Recordar usuario" está marcado
      if (rememberMe) {
        const dataToSave = {
          [loginType]: data.identifier,
          role: selectedRole,
          type: loginType
        };
        localStorage.setItem('rememberedLogin', JSON.stringify(dataToSave));
      } else {
        localStorage.removeItem('rememberedLogin');
      }
      
      const success = await login(loginData);
      
      if (success) {
        // Redirigir al dashboard correspondiente
        const selectedRoleInfo = roles.find(r => r.id === selectedRole);
        navigate(selectedRoleInfo?.dashboard || '/dashboard');
      }
    } catch (err) {
      console.error('Error en login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedRoleInfo = () => {
    return roles.find(role => role.id === selectedRole);
  };

  const handleQuickLogin = (role) => {
    setValue('identifier', role.id);
    setValue('password', role.id);
    setSelectedRole(role.id);
    setLoginType('username');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Patrones de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 100, 0],
            rotate: [0, -180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl mb-6 relative"
          >
            <span className="text-white font-bold text-2xl">ELP</span>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25"></div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Sistema ELP Pontificia
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600"
          >
            Ingresa con tu cuenta institucional
          </motion.p>
        </div>

        {/* Tarjeta de Login */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative"
        >
          {/* Selector tipo de login */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setLoginType('username')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                loginType === 'username'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Usuario
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setLoginType('email')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                loginType === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Email
            </motion.button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo de usuario/email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === 'email' ? 'Correo Institucional' : 'Nombre de Usuario'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {loginType === 'email' ? (
                    <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <input
                  type={loginType === 'email' ? 'email' : 'text'}
                  {...register('identifier', { 
                    required: `${loginType === 'email' ? 'Email' : 'Usuario'} es requerido`,
                    ...(loginType === 'email' && {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })
                  })}
                  className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 ${
                    errors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder={loginType === 'email' ? 'correo@pontificia.edu' : 'Ingresa tu usuario'}
                />
              </div>
              <AnimatePresence>
                {errors.identifier && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center mt-2 text-red-600"
                  >
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    <span className="text-sm">{errors.identifier.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Contraseña es requerida',
                    minLength: {
                      value: 3,
                      message: 'Contraseña debe tener al menos 3 caracteres'
                    }
                  })}
                  className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Ingresa tu contraseña"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center mt-2 text-red-600"
                  >
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    <span className="text-sm">{errors.password.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selector de rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Acceso
              </label>
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between"
                >
                  {selectedRole ? (
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getSelectedRoleInfo()?.color} flex items-center justify-center mr-3`}>
                        <span className="text-white text-lg">{getSelectedRoleInfo()?.icon}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{getSelectedRoleInfo()?.name}</div>
                        <div className="text-sm text-gray-500">{getSelectedRoleInfo()?.description}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Selecciona tu rol</span>
                  )}
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showRoleDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto"
                    >
                      {roles.map((role) => (
                        <motion.button
                          key={role.id}
                          whileHover={{ backgroundColor: '#F9FAFB' }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.id);
                            setShowRoleDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0"
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center mr-3`}>
                            <span className="text-white text-lg">{role.icon}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700">Recordar usuario</span>
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </motion.button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón de login */}
            <motion.button
              whileHover={{ scale: isLoading || !selectedRole ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || !selectedRole ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading || !selectedRole}
              className={`w-full py-4 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center ${
                isLoading || !selectedRole
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center">
                  Iniciar Sesión
                  <ArrowRightIcon className="w-6 h-6 ml-2" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Usuarios de prueba */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Acceso rápido - Usuarios de prueba</h3>
            <div className="grid grid-cols-2 gap-2">
              {roles.slice(0, 4).map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleQuickLogin(role)}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors border border-gray-200"
                >
                  <div className="flex items-center">
                    <span className="text-sm mr-2">{role.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-xs">{role.name}</div>
                      <div className="text-gray-500 text-xs">{role.id}/{role.id}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            {roles.length > 4 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleQuickLogin(roles[4])}
                className="w-full mt-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors border border-gray-200"
              >
                <div className="flex items-center justify-center">
                  <span className="text-sm mr-2">{roles[4].icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 text-xs">{roles[4].name}</div>
                    <div className="text-gray-500 text-xs">{roles[4].id}/{roles[4].id}</div>
                  </div>
                </div>
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-8 text-sm text-gray-600"
        >
          <p>© 2025 Sistema ELP Pontificia. Todos los derechos reservados.</p>
          <div className="flex justify-center items-center mt-2 space-x-4">
            <Link to="/terms" className="hover:text-blue-600 transition-colors">
              Términos de Uso
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">
              Privacidad
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-blue-600 transition-colors">
              Soporte
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Click fuera para cerrar dropdown */}
      {showRoleDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowRoleDropdown(false)}
        />
      )}

      {/* Modal de recuperación de contraseña */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default LoginScreen;