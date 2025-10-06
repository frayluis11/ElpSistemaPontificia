import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useAuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { login, user, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // Manejar errores del contexto de autenticación
  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
        clearError && clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleLogin = async (loginData, redirectPath) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await login(loginData);
      
      if (result) {
        setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
        
        // Pequeño delay para mostrar el mensaje de éxito
        setTimeout(() => {
          navigate(redirectPath || '/dashboard');
        }, 1000);
        
        return true;
      }
    } catch (err) {
      console.error('Error en login:', err);
      
      // El error ya se maneja en el contexto de autenticación
      // pero podemos agregar lógica adicional aquí si es necesario
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Aquí iría la llamada a la API para recuperación de contraseña
      // Por ahora simulamos la funcionalidad
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      return true;
    } catch (err) {
      setError('Error al enviar el correo de recuperación. Inténtalo de nuevo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    clearError && clearError();
  };

  return {
    isLoading,
    error,
    success,
    user,
    handleLogin,
    handleForgotPassword,
    clearMessages,
    setIsLoading,
    setError,
    setSuccess
  };
};

export default useAuthForm;