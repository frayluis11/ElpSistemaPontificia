/**
 * Guía de Tamaños de Iconos - Sistema ELP Pontificia
 * 
 * Tamaños estándar para mantener consistencia visual:
 * - Iconos principales/botones: w-6 h-6 (24px)
 * - Iconos de dashboards/paneles: w-8 h-8 (32px) 
 * - Iconos secundarios/menores: w-5 h-5 (20px)
 * - Iconos pequeños/indicadores: w-4 h-4 (16px)
 * - Iconos muy pequeños/inline: w-3 h-3 (12px)
 */

export const ICON_SIZES = {
  // Iconos principales - Botones primarios, acciones importantes
  PRIMARY: 'w-6 h-6', // 24px
  
  // Iconos de dashboard - Paneles, tarjetas principales, navegación
  DASHBOARD: 'w-8 h-8', // 32px
  
  // Iconos secundarios - Acciones menores, controles
  SECONDARY: 'w-5 h-5', // 20px
  
  // Iconos pequeños - Campos de formulario, indicadores
  SMALL: 'w-4 h-4', // 16px
  
  // Iconos muy pequeños - Inline, badges, alertas
  TINY: 'w-3 h-3', // 12px
};

// Función helper para obtener tamaños según el contexto
export const getIconSize = (context) => {
  switch (context) {
    case 'button-primary':
    case 'action-primary':
      return ICON_SIZES.PRIMARY;
      
    case 'dashboard':
    case 'navigation':
    case 'panel':
      return ICON_SIZES.DASHBOARD;
      
    case 'button-secondary':
    case 'action-secondary':
      return ICON_SIZES.SECONDARY;
      
    case 'form':
    case 'input':
    case 'indicator':
      return ICON_SIZES.SMALL;
      
    case 'inline':
    case 'badge':
    case 'alert':
      return ICON_SIZES.TINY;
      
    default:
      return ICON_SIZES.SECONDARY;
  }
};