import React, { useState, useMemo } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const DataTable = ({ 
  data = [], 
  columns = [], 
  itemsPerPage = 10, 
  searchTerm = '', 
  filters = {},
  onEdit,
  onDelete,
  onView,
  showActions = true,
  emptyMessage = "No se encontraron resultados"
}) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Función para filtrar datos según permisos de rol
  const getFilteredDataByRole = (data) => {
    if (!user) return data;

    switch (user.role) {
      case 'docente':
        // Solo sus propios documentos
        return data.filter(item => 
          item.createdBy === user.name || 
          item.userId === user.id ||
          item.assignedTo === user.id
        );
      
      case 'rrhh':
        // Documentos del personal y recursos humanos
        return data.filter(item => 
          item.area === 'rrhh' || 
          item.type === 'personal' ||
          item.category === 'human-resources' ||
          ['docente', 'rrhh'].includes(item.userRole)
        );
      
      case 'administracion':
      case 'contabilidad':
        // Acceso completo excepto documentos confidenciales de TI
        return data.filter(item => 
          item.confidentiality !== 'ti-only'
        );
      
      case 'ti':
        // Acceso completo a todos los documentos
        return data;
      
      default:
        return data.filter(item => 
          item.createdBy === user.name || 
          item.userId === user.id
        );
    }
  };

  // Función para aplicar filtros de búsqueda
  const applySearchAndFilters = (data) => {
    let filteredData = [...data];

    // Aplicar filtro de búsqueda por término
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        Object.values(item).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Aplicar filtros específicos
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        filteredData = filteredData.filter(item => {
          switch (key) {
            case 'dateFrom':
              return new Date(item.createdAt || item.date) >= new Date(value);
            case 'dateTo':
              return new Date(item.createdAt || item.date) <= new Date(value);
            case 'documentType':
              return item.type === value || item.documentType === value;
            case 'status':
              return item.status === value;
            case 'area':
              return item.area === value;
            case 'user':
              if (value === 'me') {
                return item.createdBy === user.name || item.userId === user.id;
              }
              return item.createdBy === value || item.userId === value;
            default:
              return item[key] === value;
          }
        });
      }
    });

    return filteredData;
  };

  // Datos procesados con filtros y permisos
  const processedData = useMemo(() => {
    const roleFilteredData = getFilteredDataByRole(data);
    return applySearchAndFilters(roleFilteredData);
  }, [data, searchTerm, filters, user]);

  // Función para ordenar datos
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return processedData;

    return [...processedData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [processedData, sortConfig]);

  // Función para manejar ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Calcular paginación
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Función para cambiar página
  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Función para obtener icono de estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'in-review':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // Función para formatear valores de celda
  const formatCellValue = (value, column) => {
    if (!value) return '-';

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'status':
        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(value)}
            <span className="capitalize">{value}</span>
          </div>
        );
      case 'currency':
        return new Intl.NumberFormat('es-ES', { 
          style: 'currency', 
          currency: 'EUR' 
        }).format(value);
      case 'number':
        return new Intl.NumberFormat('es-ES').format(value);
      default:
        return value;
    }
  };

  // Función para verificar permisos de acción
  const canPerformAction = (item, action) => {
    if (!user) return false;

    switch (user.role) {
      case 'docente':
        // Solo puede editar/eliminar sus propios elementos
        return item.createdBy === user.name || item.userId === user.id;
      
      case 'rrhh':
        // Puede gestionar documentos de personal
        return ['view', 'edit'].includes(action) && 
               (['rrhh', 'docente'].includes(item.userRole) || item.area === 'rrhh');
      
      case 'administracion':
      case 'contabilidad':
        // Puede ver y editar la mayoría de documentos
        return ['view', 'edit'].includes(action) || 
               (action === 'delete' && item.status !== 'approved');
      
      case 'ti':
        // Acceso completo
        return true;
      
      default:
        return action === 'view';
    }
  };

  if (currentData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
        <p className="text-gray-500">{emptyMessage}</p>
        {(searchTerm || Object.values(filters).some(f => f !== '')) && (
          <p className="text-sm text-gray-400 mt-2">
            Intenta ajustar los filtros de búsqueda o los criterios seleccionados.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Información de resultados */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
              <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
              <span className="font-medium">{totalItems}</span> resultados
            </p>
            {(searchTerm || Object.values(filters).some(f => f !== '')) && (
              <p className="text-xs text-gray-500 mt-1">
                Filtrado de {data.length} elementos totales
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUpIcon 
                          className={`w-3 h-3 ${
                            sortConfig.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-blue-500'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDownIcon 
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-blue-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCellValue(item[column.key], column)}
                  </td>
                ))}
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canPerformAction(item, 'view') && (
                      <button
                        onClick={() => onView && onView(item)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    )}
                    {canPerformAction(item, 'edit') && (
                      <button
                        onClick={() => onEdit && onEdit(item)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {canPerformAction(item, 'delete') && (
                      <button
                        onClick={() => onDelete && onDelete(item)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Anterior
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Mostrar páginas cercanas a la actual
                    return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                  })
                  .map((page, index, pages) => {
                    // Agregar puntos suspensivos si hay salto
                    const prevPage = pages[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-3 py-2 text-sm text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => changePage(page)}
                          className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                            page === currentPage
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })
                }
              </div>

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {itemsPerPage} elementos por página
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;