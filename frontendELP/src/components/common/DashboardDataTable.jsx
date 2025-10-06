import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DashboardDataTable = ({ 
  data, 
  columns, 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      // Common status
      'Completado': 'bg-green-100 text-green-800',
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'En Proceso': 'bg-blue-100 text-blue-800',
      'Procesando': 'bg-blue-100 text-blue-800',
      'Revisión': 'bg-orange-100 text-orange-800',
      'Observado': 'bg-red-100 text-red-800',
      
      // Docente specific
      'Firmado': 'bg-green-100 text-green-800',
      
      // RRHH specific
      'Procesado': 'bg-green-100 text-green-800',
      
      // Contabilidad specific
      'Pagado': 'bg-green-100 text-green-800',
      
      // TI specific
      'Exitoso': 'bg-green-100 text-green-800',
      'Fallido': 'bg-red-100 text-red-800',
      'Suspendido': 'bg-gray-100 text-gray-800'
    };
    
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCellValue = (value, column) => {
    // Format monetary values
    if (column.key === 'monto' && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN'
        }).format(numValue);
      }
    }
    
    // Format status as badge
    if (column.key === 'estado') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(value)}`}>
          {value}
        </span>
      );
    }
    
    // Format hours
    if (column.key === 'horas' && typeof value === 'number') {
      return `${value} hrs`;
    }
    
    return value;
  };

  const renderPaginationButton = (page, isActive = false, isDisabled = false, label = null) => {
    const baseClasses = "px-3 py-2 text-sm font-medium border transition-colors duration-200";
    const activeClasses = isActive 
      ? "bg-blue-50 border-blue-500 text-blue-600" 
      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50";
    const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
    
    return (
      <button
        key={page}
        onClick={() => !isDisabled && onPageChange(page)}
        className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
        disabled={isDisabled}
      >
        {label || page}
      </button>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    // Previous button
    pages.push(
      renderPaginationButton(
        currentPage - 1, 
        false, 
        currentPage === 1, 
        <ChevronLeftIcon className="w-4 h-4" />
      )
    );

    // Page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(renderPaginationButton(1));
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
    }

    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPaginationButton(i, i === currentPage));
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
      pages.push(renderPaginationButton(totalPages));
    }

    // Next button
    pages.push(
      renderPaginationButton(
        currentPage + 1, 
        false, 
        currentPage === totalPages, 
        <ChevronRightIcon className="w-4 h-4" />
      )
    );

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
        
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startItem}</span> a{' '}
              <span className="font-medium">{endItem}</span> de{' '}
              <span className="font-medium">{totalItems}</span> resultados
            </p>
          </div>
          
          <div className="flex items-center space-x-1">
            {pages}
          </div>
        </div>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 text-center text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr 
                key={row.id || index} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatCellValue(row[column.key], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default DashboardDataTable;