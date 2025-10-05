import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChartBarIcon, DocumentTextIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import KPIPanel from './KPIPanel';
import ChartContainer from './ChartContainer';
import DashboardDataTable from './DashboardDataTable';
import ExportButton from './ExportButton';
import SearchFilters from './SearchFilters';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpis: {},
    chartData: {},
    tableData: [],
    statistics: {}
  });
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    status: '',
    category: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Simulated data loading based on user role
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API call based on user role
        const data = await generateRoleBasedData(user.role);
        setDashboardData(data);
        setFilteredData(data.tableData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role) {
      loadDashboardData();
    }
  }, [user]);

  // Apply filters and search
  useEffect(() => {
    let filtered = dashboardData.tableData;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(filters.dateRange.start) && 
               itemDate <= new Date(filters.dateRange.end);
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, filters, dashboardData.tableData]);

  const generateRoleBasedData = async (role) => {
    const baseDate = new Date();
    const monthsData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      return {
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        value: Math.floor(Math.random() * 100) + 20
      };
    }).reverse();

    switch (role) {
      case 'Docente':
        return {
          kpis: {
            horasDictadas: { value: 156, change: '+12%', icon: ClockIcon },
            documentosPendientes: { value: 8, change: '-3%', icon: DocumentTextIcon },
            clasesImpartidas: { value: 42, change: '+8%', icon: ChartBarIcon },
            estudiantesAtendidos: { value: 234, change: '+15%', icon: UserGroupIcon }
          },
          chartData: {
            horasSemanales: monthsData.map(m => ({ ...m, horas: m.value })),
            documentosEstado: [
              { name: 'Firmados', value: 45, color: '#10B981' },
              { name: 'Pendientes', value: 8, color: '#F59E0B' },
              { name: 'Observados', value: 3, color: '#EF4444' }
            ]
          },
          tableData: generateDocenteTableData(),
          statistics: {
            totalHoras: 156,
            promedioSemanal: 26,
            documentosTotal: 56
          }
        };

      case 'RRHH':
        return {
          kpis: {
            documentosEmitidos: { value: 342, change: '+18%', icon: DocumentTextIcon },
            accesosUsuarios: { value: 1567, change: '+5%', icon: UserGroupIcon },
            firmasRealizadas: { value: 298, change: '+22%', icon: ChartBarIcon },
            observacionesActivas: { value: 12, change: '-8%', icon: ClockIcon }
          },
          chartData: {
            documentosMensuales: monthsData.map(m => ({ ...m, documentos: m.value * 3 })),
            tiposDocumentos: [
              { name: 'Contratos', value: 85, color: '#3B82F6' },
              { name: 'Certificados', value: 120, color: '#10B981' },
              { name: 'Evaluaciones', value: 95, color: '#F59E0B' },
              { name: 'Otros', value: 42, color: '#8B5CF6' }
            ]
          },
          tableData: generateRRHHTableData(),
          statistics: {
            totalDocumentos: 342,
            promedioMensual: 57,
            usuariosActivos: 89
          }
        };

      case 'Admin':
      case 'Administracion':
        return {
          kpis: {
            reportesGenerados: { value: 156, change: '+25%', icon: ChartBarIcon },
            boletasEmitidas: { value: 234, change: '+12%', icon: DocumentTextIcon },
            ingresosMensuales: { value: 45600, change: '+8%', icon: CurrencyDollarIcon },
            usuariosActivos: { value: 89, change: '+3%', icon: UserGroupIcon }
          },
          chartData: {
            ingresosMensuales: monthsData.map(m => ({ ...m, ingresos: m.value * 1000 })),
            gastosPorCategoria: [
              { name: 'Salarios', value: 35000, color: '#3B82F6' },
              { name: 'Servicios', value: 8500, color: '#10B981' },
              { name: 'Materiales', value: 2100, color: '#F59E0B' },
              { name: 'Otros', value: 1200, color: '#EF4444' }
            ]
          },
          tableData: generateAdminTableData(),
          statistics: {
            totalIngresos: 273600,
            totalGastos: 198400,
            margenBeneficio: 27.5
          }
        };

      case 'Contabilidad':
        return {
          kpis: {
            boletasGeneradas: { value: 234, change: '+15%', icon: DocumentTextIcon },
            montoTotalPagos: { value: 89750, change: '+7%', icon: CurrencyDollarIcon },
            transaccionesProcesadas: { value: 456, change: '+20%', icon: ChartBarIcon },
            reportesContables: { value: 28, change: '+4%', icon: ClockIcon }
          },
          chartData: {
            pagosMensuales: monthsData.map(m => ({ ...m, pagos: m.value * 800 })),
            tiposPagos: [
              { name: 'Sueldos', value: 65000, color: '#3B82F6' },
              { name: 'Honorarios', value: 18500, color: '#10B981' },
              { name: 'Servicios', value: 4250, color: '#F59E0B' },
              { name: 'Otros', value: 2000, color: '#8B5CF6' }
            ]
          },
          tableData: generateContabilidadTableData(),
          statistics: {
            totalPagos: 89750,
            promedioMensual: 14958,
            boletasPendientes: 12
          }
        };

      case 'TI':
        return {
          kpis: {
            accesosTotal: { value: 2341, change: '+12%', icon: UserGroupIcon },
            actividadSistema: { value: 98.5, change: '+2%', icon: ComputerDesktopIcon },
            alertasSeguridad: { value: 3, change: '-50%', icon: ChartBarIcon },
            backupsRealizados: { value: 28, change: '0%', icon: DocumentTextIcon }
          },
          chartData: {
            accesosDiarios: monthsData.map(m => ({ ...m, accesos: m.value * 15 })),
            tiposActividad: [
              { name: 'Login', value: 1200, color: '#3B82F6' },
              { name: 'Documentos', value: 850, color: '#10B981' },
              { name: 'Firmas', value: 291, color: '#F59E0B' },
              { name: 'Exportaciones', value: 156, color: '#8B5CF6' }
            ]
          },
          tableData: generateTITableData(),
          statistics: {
            tiempoActividad: 98.5,
            usuariosConectados: 45,
            almacenamientoUsado: 67.3
          }
        };

      default:
        return {
          kpis: {},
          chartData: {},
          tableData: [],
          statistics: {}
        };
    }
  };

  const generateDocenteTableData = () => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      documento: `DOC-${1000 + i}`,
      tipo: ['Planificación', 'Evaluación', 'Registro', 'Certificado'][i % 4],
      fecha: new Date(2024, 9, Math.floor(Math.random() * 30) + 1).toLocaleDateString(),
      estado: ['Firmado', 'Pendiente', 'Observado'][i % 3],
      horas: Math.floor(Math.random() * 8) + 1,
      materia: ['Matemáticas', 'Ciencias', 'Historia', 'Literatura'][i % 4],
      category: 'docente',
      status: ['Firmado', 'Pendiente', 'Observado'][i % 3]
    }));
  };

  const generateRRHHTableData = () => {
    return Array.from({ length: 35 }, (_, i) => ({
      id: i + 1,
      empleado: `Empleado ${i + 1}`,
      documento: `RH-${2000 + i}`,
      tipo: ['Contrato', 'Certificado', 'Evaluación', 'Permiso'][i % 4],
      fecha: new Date(2024, 9, Math.floor(Math.random() * 30) + 1).toLocaleDateString(),
      estado: ['Procesado', 'Pendiente', 'Revisión'][i % 3],
      area: ['Docencia', 'Administración', 'Servicios', 'Mantenimiento'][i % 4],
      category: 'rrhh',
      status: ['Procesado', 'Pendiente', 'Revisión'][i % 3]
    }));
  };

  const generateAdminTableData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      reporte: `REP-${3000 + i}`,
      tipo: ['Financiero', 'Operativo', 'Académico', 'Estratégico'][i % 4],
      fecha: new Date(2024, 9, Math.floor(Math.random() * 30) + 1).toLocaleDateString(),
      estado: ['Completado', 'En Proceso', 'Pendiente'][i % 3],
      responsable: `Usuario ${i + 1}`,
      monto: (Math.random() * 50000).toFixed(2),
      category: 'admin',
      status: ['Completado', 'En Proceso', 'Pendiente'][i % 3]
    }));
  };

  const generateContabilidadTableData = () => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      boleta: `BOL-${4000 + i}`,
      empleado: `Empleado ${i + 1}`,
      periodo: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`,
      monto: (Math.random() * 5000 + 1500).toFixed(2),
      estado: ['Pagado', 'Pendiente', 'Procesando'][i % 3],
      tipo: ['Sueldo', 'Honorario', 'Extra', 'Aguinaldo'][i % 4],
      fecha: new Date(2024, 9, Math.floor(Math.random() * 30) + 1).toLocaleDateString(),
      category: 'contabilidad',
      status: ['Pagado', 'Pendiente', 'Procesando'][i % 3]
    }));
  };

  const generateTITableData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      usuario: `Usuario ${i + 1}`,
      accion: ['Login', 'Logout', 'Descarga', 'Firma', 'Exportación'][i % 5],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString(),
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      dispositivo: ['Desktop', 'Mobile', 'Tablet'][i % 3],
      estado: ['Exitoso', 'Fallido', 'Suspendido'][i % 3],
      fecha: new Date(2024, 9, Math.floor(Math.random() * 30) + 1).toLocaleDateString(),
      category: 'ti',
      status: ['Exitoso', 'Fallido', 'Suspendido'][i % 3]
    }));
  };

  const getRoleTitle = (role) => {
    const titles = {
      'Docente': 'Dashboard del Docente',
      'RRHH': 'Dashboard de Recursos Humanos',
      'Admin': 'Dashboard de Administración',
      'Administracion': 'Dashboard de Administración',
      'Contabilidad': 'Dashboard de Contabilidad',
      'TI': 'Dashboard de Tecnología'
    };
    return titles[role] || 'Dashboard';
  };

  const getTableColumns = (role) => {
    const columns = {
      'Docente': [
        { key: 'documento', label: 'Documento' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'materia', label: 'Materia' },
        { key: 'horas', label: 'Horas' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'estado', label: 'Estado' }
      ],
      'RRHH': [
        { key: 'empleado', label: 'Empleado' },
        { key: 'documento', label: 'Documento' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'area', label: 'Área' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'estado', label: 'Estado' }
      ],
      'Admin': [
        { key: 'reporte', label: 'Reporte' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'responsable', label: 'Responsable' },
        { key: 'monto', label: 'Monto' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'estado', label: 'Estado' }
      ],
      'Administracion': [
        { key: 'reporte', label: 'Reporte' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'responsable', label: 'Responsable' },
        { key: 'monto', label: 'Monto' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'estado', label: 'Estado' }
      ],
      'Contabilidad': [
        { key: 'boleta', label: 'Boleta' },
        { key: 'empleado', label: 'Empleado' },
        { key: 'periodo', label: 'Período' },
        { key: 'monto', label: 'Monto' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'estado', label: 'Estado' }
      ],
      'TI': [
        { key: 'usuario', label: 'Usuario' },
        { key: 'accion', label: 'Acción' },
        { key: 'timestamp', label: 'Fecha/Hora' },
        { key: 'ip', label: 'IP' },
        { key: 'dispositivo', label: 'Dispositivo' },
        { key: 'estado', label: 'Estado' }
      ]
    };
    return columns[role] || [];
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getRoleTitle(user.role)}
          </h1>
          <p className="mt-2 text-gray-600">
            Resumen de actividades y estadísticas
          </p>
        </div>
        <ExportButton 
          data={dashboardData} 
          role={user.role}
          filename={`dashboard-${user.role.toLowerCase()}-${new Date().toISOString().split('T')[0]}`}
        />
      </div>

      {/* KPI Panel */}
      <KPIPanel kpis={dashboardData.kpis} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer 
          data={dashboardData.chartData} 
          role={user.role} 
          type="line"
        />
        <ChartContainer 
          data={dashboardData.chartData} 
          role={user.role} 
          type="pie"
        />
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Datos Detallados
          </h2>
          
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            role={user.role}
          />
        </div>

        <DashboardDataTable
          data={paginatedData}
          columns={getTableColumns(user.role)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

export default Dashboard;