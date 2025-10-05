import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializar el contexto al cargar la aplicación
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      try {
        const decodedToken = jwtDecode(savedToken);
        
        // Verificar si el token no ha expirado
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(savedToken);
          setUser({
            id: decodedToken.sub,
            email: decodedToken.email,
            nombre_completo: decodedToken.nombre_completo,
            rol: decodedToken.rol,
            activo: decodedToken.activo
          });
        } else {
          // Token expirado, limpiar localStorage
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error decodificando el token:', error);
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (authToken, userData) => {
    try {
      const decodedToken = jwtDecode(authToken);
      
      // Guardar token en localStorage
      localStorage.setItem('authToken', authToken);
      
      // Actualizar estado
      setToken(authToken);
      setUser({
        id: decodedToken.sub,
        email: decodedToken.email,
        nombre_completo: decodedToken.nombre_completo,
        rol: decodedToken.rol,
        activo: decodedToken.activo,
        ...userData // Permitir datos adicionales del usuario
      });

      return true;
    } catch (error) {
      console.error('Error en el login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    if (!token) return false;
    
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  const getUserRole = () => {
    return user?.rol || null;
  };

  const hasRole = (requiredRole) => {
    return user?.rol === requiredRole;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.rol);
  };

  // Roles del sistema
  const ROLES = {
    ADMIN: 'Administrador',
    DOCENTE: 'Docente',
    RRHH: 'RRHH',
    CONTABILIDAD: 'Contabilidad',
    TI: 'TI'
  };

  // Mapeo de roles a rutas de dashboard
  const getRoleDashboardPath = (role) => {
    const rolePaths = {
      [ROLES.ADMIN]: '/admin/dashboard',
      [ROLES.DOCENTE]: '/docente/dashboard',
      [ROLES.RRHH]: '/rrhh/dashboard',
      [ROLES.CONTABILIDAD]: '/contabilidad/dashboard',
      [ROLES.TI]: '/ti/dashboard'
    };
    return rolePaths[role] || '/';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    getUserRole,
    hasRole,
    hasAnyRole,
    getRoleDashboardPath,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;