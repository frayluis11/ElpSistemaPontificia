import React, { useState, useEffect } from 'react';
import SearchFilter from './SearchFilter';
import DataTable from './DataTable';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const SearchableDataView = ({ 
  dataType = 'documents', // 'documents', 'hours', 'reports'
  initialData = [],
  columns = [],
  title = 'Búsqueda y Filtros',
  showActions = true,
  onEdit,
  onDelete,
  onView,
  customEndpoint = null
}) => {
  const { user } = useAuth();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

  // Función para obtener datos desde la API
  const fetchData = async (term = '', filterParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = customEndpoint;
      
      if (!endpoint) {
        // Determinar endpoint basado en el tipo de datos
        switch (dataType) {
          case 'documents':
            endpoint = '/search/documents';
            break;
          case 'hours':
            endpoint = '/search/hours';
            break;
          case 'reports':
            endpoint = '/search/reports';
            break;
          default:
            endpoint = '/search/documents';
        }
      }

      const params = {
        q: term,
        ...filterParams,
        role: user?.role,
        userId: user?.id
      };

      const response = await api.get(endpoint, { params });
      
      if (response.data.success) {
        setData(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Error al obtener datos');
      }
    } catch (error) {
      console.error('Error fetching search data:', error);
      setError('Error al cargar los datos. Usando datos de ejemplo.');
      
      // Datos de ejemplo para desarrollo
      const exampleData = generateExampleData(dataType, user?.role);
      setData(exampleData);
    } finally {
      setLoading(false);
    }
  };

  // Generar datos de ejemplo para desarrollo
  const generateExampleData = (type, userRole) => {
    const baseData = [];
    
    switch (type) {
      case 'documents':
        return [
          {
            id: 1,
            title: 'Plan de Estudios 2024-2025',
            type: 'planificacion',
            status: 'approved',
            createdBy: userRole === 'docente' ? user?.name : 'Prof. García',
            createdAt: '2024-01-15',
            area: 'academica',
            userRole: 'docente'
          },
          {
            id: 2,
            title: 'Evaluación Semestral Matemáticas',
            type: 'evaluacion',
            status: 'pending',
            createdBy: userRole === 'docente' ? user?.name : 'Prof. Martínez',
            createdAt: '2024-02-01',
            area: 'academica',
            userRole: 'docente'
          },
          {
            id: 3,
            title: 'Contrato Docente - María López',
            type: 'personal',
            status: 'completed',
            createdBy: 'RRHH Admin',
            createdAt: '2024-01-20',
            area: 'rrhh',
            userRole: 'rrhh'
          },
          {
            id: 4,
            title: 'Solicitud de Recursos Laboratorio',
            type: 'recursos',
            status: 'in-review',
            createdBy: userRole === 'docente' ? user?.name : 'Prof. Silva',
            createdAt: '2024-02-10',
            area: 'academica',
            userRole: 'docente'
          },
          {
            id: 5,
            title: 'Informe Financiero Mensual',
            type: 'financiero',
            status: 'approved',
            createdBy: 'Contabilidad',
            createdAt: '2024-02-05',
            area: 'financiera',
            userRole: 'contabilidad'
          }
        ];
        
      case 'hours':
        return [
          {
            id: 1,
            date: '2024-02-15',
            hours: 8,
            activity: 'Clases de Matemáticas',
            type: 'docencia',
            status: 'approved',
            createdBy: userRole === 'docente' ? user?.name : 'Prof. García',
            area: 'academica'
          },
          {
            id: 2,
            date: '2024-02-16',
            hours: 4,
            activity: 'Preparación de Material',
            type: 'preparacion',
            status: 'pending',
            createdBy: userRole === 'docente' ? user?.name : 'Prof. Martínez',
            area: 'academica'
          },
          {
            id: 3,
            date: '2024-02-17',
            hours: 6,
            activity: 'Reunión Departamental',
            type: 'administrativa',
            status: 'approved',
            createdBy: 'Prof. Silva',
            area: 'academica'
          }
        ];
        
      case 'reports':
        return [
          {
            id: 1,
            title: 'Reporte Académico Mensual',
            type: 'academico',
            generatedBy: userRole === 'docente' ? user?.name : 'Sistema',
            generatedAt: '2024-02-01',
            status: 'completed',
            area: 'academica'
          },
          {
            id: 2,
            title: 'Análisis de Horas Docentes',
            type: 'horas',
            generatedBy: 'RRHH',
            generatedAt: '2024-02-10',
            status: 'approved',
            area: 'rrhh'
          }
        ];
        
      default:
        return [];
    }
  };

  // Definir columnas por defecto según el tipo de datos
  const getDefaultColumns = (type) => {
    switch (type) {
      case 'documents':
        return [
          { key: 'title', label: 'Título', sortable: true },
          { key: 'type', label: 'Tipo', sortable: true },
          { key: 'status', label: 'Estado', sortable: true, type: 'status' },
          { key: 'createdBy', label: 'Creado por', sortable: true },
          { key: 'createdAt', label: 'Fecha', sortable: true, type: 'date' },
          { key: 'area', label: 'Área', sortable: true }
        ];
        
      case 'hours':
        return [
          { key: 'date', label: 'Fecha', sortable: true, type: 'date' },
          { key: 'hours', label: 'Horas', sortable: true, type: 'number' },
          { key: 'activity', label: 'Actividad', sortable: true },
          { key: 'type', label: 'Tipo', sortable: true },
          { key: 'status', label: 'Estado', sortable: true, type: 'status' },
          { key: 'createdBy', label: 'Registrado por', sortable: true }
        ];
        
      case 'reports':
        return [
          { key: 'title', label: 'Título', sortable: true },
          { key: 'type', label: 'Tipo', sortable: true },
          { key: 'generatedBy', label: 'Generado por', sortable: true },
          { key: 'generatedAt', label: 'Fecha', sortable: true, type: 'date' },
          { key: 'status', label: 'Estado', sortable: true, type: 'status' },
          { key: 'area', label: 'Área', sortable: true }
        ];
        
      default:
        return [];
    }
  };

  const finalColumns = columns.length > 0 ? columns : getDefaultColumns(dataType);

  // Función para manejar búsqueda
  const handleSearch = (term, filterParams) => {
    setSearchTerm(term);
    setFilters(filterParams);
    fetchData(term, filterParams);
  };

  // Función para manejar filtros
  const handleFilter = (filterParams) => {
    setFilters(filterParams);
    fetchData(searchTerm, filterParams);
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData.length === 0) {
      fetchData();
    } else {
      setData(initialData);
    }
  }, []);

  const getPlaceholderText = () => {
    switch (dataType) {
      case 'documents':
        return 'Buscar documentos por título, tipo, área...';
      case 'hours':
        return 'Buscar horas por actividad, fecha, tipo...';
      case 'reports':
        return 'Buscar reportes por título, tipo, área...';
      default:
        return 'Buscar...';
    }
  };

  const getEmptyMessage = () => {
    switch (dataType) {
      case 'documents':
        return 'No se encontraron documentos que coincidan con tu búsqueda.';
      case 'hours':
        return 'No se encontraron registros de horas que coincidan con tu búsqueda.';
      case 'reports':
        return 'No se encontraron reportes que coincidan con tu búsqueda.';
      default:
        return 'No se encontraron resultados.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">
          Utiliza los filtros y la búsqueda para encontrar información específica.{' '}
          {user?.role === 'docente' && 'Solo puedes ver tus propios datos.'}
          {user?.role === 'rrhh' && 'Tienes acceso a información del personal.'}
          {(user?.role === 'administracion' || user?.role === 'contabilidad') && 'Tienes acceso a información consolidada.'}
          {user?.role === 'ti' && 'Tienes acceso completo de auditoría.'}
        </p>
      </div>

      {/* Componente de búsqueda y filtros */}
      <SearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        placeholder={getPlaceholderText()}
        showAdvancedFilters={true}
      />

      {/* Mensaje de error si existe */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando resultados...</p>
        </div>
      )}

      {/* Tabla de datos */}
      {!loading && (
        <DataTable
          data={data}
          columns={finalColumns}
          searchTerm={searchTerm}
          filters={filters}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          emptyMessage={getEmptyMessage()}
        />
      )}
    </div>
  );
};

export default SearchableDataView;