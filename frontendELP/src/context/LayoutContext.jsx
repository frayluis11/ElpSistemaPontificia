import React, { createContext, useContext, useReducer, useEffect } from 'react';

/**
 * Context del Layout del Sistema ELP Pontificia
 * Gestiona el estado del sidebar, tema, configuraciones de UI
 */

// Estados iniciales
const initialState = {
  sidebarCollapsed: false,
  theme: 'light',
  notifications: [],
  breadcrumb: [],
  pageTitle: '',
  loading: false
};

// Tipos de acciones
const LAYOUT_ACTIONS = {
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_BREADCRUMB: 'SET_BREADCRUMB',
  SET_PAGE_TITLE: 'SET_PAGE_TITLE',
  SET_LOADING: 'SET_LOADING'
};

// Reducer para manejar el estado del layout
const layoutReducer = (state, action) => {
  switch (action.type) {
    case LAYOUT_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };
      
    case LAYOUT_ACTIONS.SET_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: action.payload
      };
      
    case LAYOUT_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
      
    case LAYOUT_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
      
    case LAYOUT_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case LAYOUT_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
      
    case LAYOUT_ACTIONS.SET_BREADCRUMB:
      return {
        ...state,
        breadcrumb: action.payload
      };
      
    case LAYOUT_ACTIONS.SET_PAGE_TITLE:
      return {
        ...state,
        pageTitle: action.payload
      };
      
    case LAYOUT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    default:
      return state;
  }
};

// Crear el contexto
const LayoutContext = createContext();

// Hook personalizado para usar el contexto
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout debe ser usado dentro de LayoutProvider');
  }
  return context;
};

// Provider del contexto
export const LayoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  // Cargar configuraciones del localStorage al iniciar
  useEffect(() => {
    loadLayoutPreferences();
  }, []);

  // Guardar preferencias en localStorage cuando cambien
  useEffect(() => {
    saveLayoutPreferences();
  }, [state.sidebarCollapsed, state.theme]);

  // Funciones del layout
  const toggleSidebar = () => {
    dispatch({ type: LAYOUT_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setSidebarCollapsed = (collapsed) => {
    dispatch({ 
      type: LAYOUT_ACTIONS.SET_SIDEBAR_COLLAPSED, 
      payload: collapsed 
    });
  };

  const setTheme = (theme) => {
    dispatch({ 
      type: LAYOUT_ACTIONS.SET_THEME, 
      payload: theme 
    });
    
    // Aplicar tema al documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const notificationWithId = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };
    
    dispatch({ 
      type: LAYOUT_ACTIONS.ADD_NOTIFICATION, 
      payload: notificationWithId 
    });

    // Auto-remover notificación después del tiempo especificado
    if (notificationWithId.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notificationWithId.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    dispatch({ 
      type: LAYOUT_ACTIONS.REMOVE_NOTIFICATION, 
      payload: id 
    });
  };

  const clearNotifications = () => {
    dispatch({ type: LAYOUT_ACTIONS.CLEAR_NOTIFICATIONS });
  };

  const setBreadcrumb = (breadcrumb) => {
    dispatch({ 
      type: LAYOUT_ACTIONS.SET_BREADCRUMB, 
      payload: breadcrumb 
    });
  };

  const setPageTitle = (title) => {
    dispatch({ 
      type: LAYOUT_ACTIONS.SET_PAGE_TITLE, 
      payload: title 
    });
    
    // Actualizar título del documento
    document.title = title ? `${title} - Sistema ELP` : 'Sistema ELP - Pontificia Universidad';
  };

  const setLoading = (loading) => {
    dispatch({ 
      type: LAYOUT_ACTIONS.SET_LOADING, 
      payload: loading 
    });
  };

  // Funciones auxiliares
  const loadLayoutPreferences = () => {
    try {
      const savedPreferences = localStorage.getItem('elp_layout_preferences');
      
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        
        if (preferences.sidebarCollapsed !== undefined) {
          setSidebarCollapsed(preferences.sidebarCollapsed);
        }
        
        if (preferences.theme) {
          setTheme(preferences.theme);
        }
      }
    } catch (error) {
      console.error('Error loading layout preferences:', error);
    }
  };

  const saveLayoutPreferences = () => {
    try {
      const preferences = {
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme
      };
      
      localStorage.setItem('elp_layout_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving layout preferences:', error);
    }
  };

  // Funciones de utilidad para notificaciones
  const showSuccess = (title, message) => {
    return addNotification({
      type: 'success',
      title,
      message
    });
  };

  const showError = (title, message) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 7000 // Los errores duran más tiempo
    });
  };

  const showWarning = (title, message) => {
    return addNotification({
      type: 'warning',
      title,
      message
    });
  };

  const showInfo = (title, message) => {
    return addNotification({
      type: 'info',
      title,
      message
    });
  };

  // Valor del contexto
  const value = {
    ...state,
    toggleSidebar,
    setSidebarCollapsed,
    setTheme,
    addNotification,
    removeNotification,
    clearNotifications,
    setBreadcrumb,
    setPageTitle,
    setLoading,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;