import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const ModernLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('username'); // 'username' or 'email'
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const { login, error } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Roles disponibles con colores y descripciones
  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      color: 'from-red-500 to-red-600',
      icon: '👨‍💼'
    },
    {
      id: 'docente',
      name: 'Docente',
      description: 'Gestión académica y educativa',
      color: 'from-blue-500 to-blue-600',
      icon: '👨‍🏫'
    },
    {
      id: 'rrhh',
      name: 'Recursos Humanos',
      description: 'Gestión de personal',
      color: 'from-green-500 to-green-600',
      icon: '👥'
    },
    {
      id: 'contabilidad',
      name: 'Contabilidad',
      description: 'Gestión financiera',
      color: 'from-yellow-500 to-yellow-600',
      icon: '💰'
    },
    {
      id: 'ti',
      name: 'Tecnología',
      description: 'Soporte técnico y sistemas',
      color: 'from-purple-500 to-purple-600',
      icon: '💻'
    }
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const loginData = {
        [loginType]: data.identifier,
        password: data.password,
        role: selectedRole
      };
      
      await login(loginData);
    } catch (err) {
      console.error('Error en login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedRoleInfo = () => {
    return roles.find(role => role.id === selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Patrones de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
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
            className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl mb-4"
          >
            <span className="text-white font-bold text-2xl">ELP</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema ELP Pontificia
          </h1>
          <p className="text-gray-600">
            Ingresa con tu cuenta institucional
          </p>
        </div>

        {/* Tarjeta de Login */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          {/* Selector tipo de login */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('username')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                loginType === 'username'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserIcon className="w-4 h-4 inline mr-2" />
              Usuario
            </button>
            <button
              type="button"
              onClick={() => setLoginType('email')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                loginType === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
              Email
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo de usuario/email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === 'email' ? 'Correo Institucional' : 'Nombre de Usuario'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginType === 'email' ? (
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-gray-400" />
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.identifier ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={loginType === 'email' ? 'correo@pontificia.edu' : 'Ingresa tu usuario'}
                />
              </div>
              {errors.identifier && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.identifier.message}
                </motion.p>
              )}
            </div>

            {/* Campo de contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
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
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Selector de rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Acceso
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between"
                >
                  {selectedRole ? (
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getSelectedRoleInfo()?.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{getSelectedRoleInfo()?.name}</div>
                        <div className="text-sm text-gray-500">{getSelectedRoleInfo()?.description}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Selecciona tu rol</span>
                  )}
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showRoleDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
                    >
                      {roles.map((role) => (
                        <button
                          key={role.id}
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
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón de login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !selectedRole}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all ${
                isLoading || !selectedRole
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </form>

          {/* Usuarios de prueba */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Usuarios de prueba:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    reset({
                      identifier: role.id,
                      password: role.id
                    });
                    setSelectedRole(role.id);
                  }}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium text-gray-900">{role.name}</div>
                  <div className="text-gray-500">{role.id}/{role.id}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm text-gray-600"
        >
          <p>© 2025 Sistema ELP Pontificia. Todos los derechos reservados.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ModernLogin;