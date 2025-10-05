import React, { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon,
  TagIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const SearchFilter = ({ 
  onSearch, 
  onFilter, 
  initialFilters = {}, 
  placeholder = "Buscar documentos, horas o reportes...",
  showAdvancedFilters = true 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    documentType: '',
    status: '',
    area: '',
    user: '',
    ...initialFilters
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Opciones de filtro según el rol del usuario
  const getDocumentTypes = () => {
    const baseTypes = [
      { value: '', label: 'Todos los tipos' },
      { value: 'planificacion', label: 'Planificación Académica' },
      { value: 'evaluacion', label: 'Evaluación y Notas' },
      { value: 'recursos', label: 'Gestión de Recursos' }
    ];

    // Agregar tipos específicos según el rol
    switch (user?.role) {
      case 'rrhh':
        return [...baseTypes, { value: 'personal', label: 'Recursos Humanos' }];
      case 'administracion':
      case 'contabilidad':
        return [...baseTypes, 
          { value: 'personal', label: 'Recursos Humanos' },
          { value: 'financiero', label: 'Gestión Financiera' }
        ];
      case 'ti':
        return [...baseTypes, 
          { value: 'personal', label: 'Recursos Humanos' },
          { value: 'financiero', label: 'Gestión Financiera' },
          { value: 'sistema', label: 'Sistema y Seguridad' }
        ];
      default:
        return baseTypes;
    }
  };

  const getStatusOptions = () => [
    { value: '', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'in-review', label: 'En Revisión' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'completed', label: 'Completado' },
    { value: 'rejected', label: 'Rechazado' }
  ];

  const getAreaOptions = () => {
    const baseAreas = [
      { value: '', label: 'Todas las áreas' },
      { value: 'academica', label: 'Área Académica' },
      { value: 'administrativa', label: 'Área Administrativa' }
    ];

    // Agregar áreas específicas según el rol
    switch (user?.role) {
      case 'rrhh':
        return [...baseAreas, { value: 'rrhh', label: 'Recursos Humanos' }];
      case 'administracion':
      case 'contabilidad':
        return [...baseAreas, 
          { value: 'rrhh', label: 'Recursos Humanos' },
          { value: 'financiera', label: 'Área Financiera' }
        ];
      case 'ti':
        return [...baseAreas, 
          { value: 'rrhh', label: 'Recursos Humanos' },
          { value: 'financiera', label: 'Área Financiera' },
          { value: 'sistemas', label: 'Sistemas y TI' }
        ];
      default:
        return baseAreas;
    }
  };

  const getUserOptions = () => {
    // Para docentes, solo pueden buscar sus propios documentos
    if (user?.role === 'docente') {
      return [{ value: user.id, label: 'Mis documentos' }];
    }

    // Para otros roles, mostrar opciones de usuarios según permisos
    const baseUsers = [
      { value: '', label: 'Todos los usuarios' },
      { value: 'me', label: 'Mis documentos' }
    ];

    if (['rrhh', 'administracion', 'contabilidad', 'ti'].includes(user?.role)) {
      return [...baseUsers,
        { value: 'docentes', label: 'Todos los docentes' },
        { value: 'staff', label: 'Personal administrativo' }
      ];
    }

    return baseUsers;
  };

  // Búsqueda en tiempo real con debounce
  const debouncedSearch = useCallback(
    debounce((term, currentFilters) => {
      setIsSearching(true);
      onSearch(term, currentFilters);
      setTimeout(() => setIsSearching(false), 500);
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm, filters);
  }, [searchTerm, filters, debouncedSearch]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter && onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateFrom: '',
      dateTo: '',
      documentType: '',
      status: '',
      area: '',
      user: ''
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    onFilter && onFilter(clearedFilters);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '') || searchTerm !== '';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Barra de búsqueda principal */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {showAdvancedFilters && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters()
                ? 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters() && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Activos
              </span>
            )}
          </button>
        )}

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showFilters && showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Filtro de fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Desde
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro de fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Hasta
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro de tipo de documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                Tipo
              </label>
              <select
                value={filters.documentType}
                onChange={(e) => handleFilterChange('documentType', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {getDocumentTypes().map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TagIcon className="w-4 h-4 inline mr-1" />
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {getStatusOptions().map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de área */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-1" />
                Área
              </label>
              <select
                value={filters.area}
                onChange={(e) => handleFilterChange('area', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {getAreaOptions().map(area => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                Usuario
              </label>
              <select
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {getUserOptions().map(userOption => (
                  <option key={userOption.value} value={userOption.value}>
                    {userOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Información de permisos según rol */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Permisos de búsqueda:</strong>{' '}
              {user?.role === 'docente' && 'Puedes buscar en tus documentos y horas registradas.'}
              {user?.role === 'rrhh' && 'Acceso a documentos del personal y recursos humanos.'}
              {(user?.role === 'administracion' || user?.role === 'contabilidad') && 'Acceso completo a todos los documentos y reportes consolidados.'}
              {user?.role === 'ti' && 'Acceso de auditoría completa a todos los documentos y accesos del sistema.'}
            </p>
          </div>
        </div>
      )}

      {/* Indicadores de filtros activos */}
      {hasActiveFilters() && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Búsqueda: "{searchTerm}"
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Desde: {new Date(filters.dateFrom).toLocaleDateString()}
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Hasta: {new Date(filters.dateTo).toLocaleDateString()}
            </span>
          )}
          {filters.documentType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Tipo: {getDocumentTypes().find(t => t.value === filters.documentType)?.label}
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Estado: {getStatusOptions().find(s => s.value === filters.status)?.label}
            </span>
          )}
          {filters.area && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Área: {getAreaOptions().find(a => a.value === filters.area)?.label}
            </span>
          )}
          {filters.user && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
              Usuario: {getUserOptions().find(u => u.value === filters.user)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Función helper para debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchFilter;