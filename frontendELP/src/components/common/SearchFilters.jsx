import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFiltersChange, 
  role 
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onSearchChange('');
    onFiltersChange({
      dateRange: { start: '', end: '' },
      status: '',
      category: ''
    });
  };

  const getStatusOptions = (role) => {
    const statusOptions = {
      'Docente': ['Firmado', 'Pendiente', 'Observado'],
      'RRHH': ['Procesado', 'Pendiente', 'Revisión'],
      'Admin': ['Completado', 'En Proceso', 'Pendiente'],
      'Administracion': ['Completado', 'En Proceso', 'Pendiente'],
      'Contabilidad': ['Pagado', 'Pendiente', 'Procesando'],
      'TI': ['Exitoso', 'Fallido', 'Suspendido']
    };
    
    return statusOptions[role] || [];
  };

  const getCategoryOptions = (role) => {
    const categoryOptions = {
      'Docente': ['Planificación', 'Evaluación', 'Registro', 'Certificado'],
      'RRHH': ['Contrato', 'Certificado', 'Evaluación', 'Permiso'],
      'Admin': ['Financiero', 'Operativo', 'Académico', 'Estratégico'],
      'Administracion': ['Financiero', 'Operativo', 'Académico', 'Estratégico'],
      'Contabilidad': ['Sueldo', 'Honorario', 'Extra', 'Aguinaldo'],
      'TI': ['Login', 'Logout', 'Descarga', 'Firma', 'Exportación']
    };
    
    return categoryOptions[role] || [];
  };

  const hasActiveFilters = searchTerm || 
    filters.status || 
    filters.category || 
    filters.dateRange.start || 
    filters.dateRange.end;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Buscar en todos los campos..."
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha desde
          </label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleFilterChange('dateRange', { 
              ...filters.dateRange, 
              start: e.target.value 
            })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha hasta
          </label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleFilterChange('dateRange', { 
              ...filters.dateRange, 
              end: e.target.value 
            })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            {getStatusOptions(role).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Categoría
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Todas las categorías</option>
            {getCategoryOptions(role).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Actions */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between bg-blue-50 rounded-md p-3">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm text-blue-700 font-medium">
              Filtros activos
            </span>
          </div>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Búsqueda: "{searchTerm}"
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Estado: {filters.status}
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Categoría: {filters.category}
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Fecha: {filters.dateRange.start || 'Inicio'} - {filters.dateRange.end || 'Fin'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;