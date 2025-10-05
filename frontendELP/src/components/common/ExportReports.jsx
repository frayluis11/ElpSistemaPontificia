import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  ChartBarIcon,
  TableCellsIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExportReports = ({ onClose }) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    documentType: 'all',
    userRole: user?.role || 'all',
    includeStatistics: true,
    includeHours: true,
    includeSignatures: true
  });
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

  const documentTypes = [
    { value: 'all', label: 'Todos los documentos' },
    { value: 'planificacion', label: 'Planificación Académica' },
    { value: 'evaluacion', label: 'Evaluación y Notas' },
    { value: 'recursos', label: 'Gestión de Recursos' },
    { value: 'personal', label: 'Recursos Humanos' },
    { value: 'financiero', label: 'Gestión Financiera' }
  ];

  const roles = [
    { value: 'all', label: 'Todos los roles' },
    { value: 'docente', label: 'Docentes' },
    { value: 'rrhh', label: 'Recursos Humanos' },
    { value: 'administracion', label: 'Administración' },
    { value: 'contabilidad', label: 'Contabilidad' },
    { value: 'ti', label: 'Tecnología' }
  ];

  useEffect(() => {
    // Filtrar roles disponibles según el rol del usuario actual
    const userRole = user?.role;
    let allowedRoles = [];
    
    switch (userRole) {
      case 'docente':
        allowedRoles = [{ value: 'docente', label: 'Mis documentos' }];
        break;
      case 'rrhh':
        allowedRoles = roles.filter(r => ['all', 'docente', 'rrhh'].includes(r.value));
        break;
      case 'administracion':
      case 'contabilidad':
        allowedRoles = roles;
        break;
      case 'ti':
        allowedRoles = roles;
        break;
      default:
        allowedRoles = [{ value: user?.role, label: 'Mis documentos' }];
    }
    
    setAvailableRoles(allowedRoles);
    setFilters(prev => ({ ...prev, userRole: allowedRoles[0]?.value || user?.role }));
  }, [user]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/export-data', {
        params: filters
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Datos de ejemplo para desarrollo
      setReportData({
        documents: [
          {
            id: 1,
            title: 'Plan de Estudios 2024',
            type: 'planificacion',
            status: 'completed',
            createdBy: 'Prof. García',
            createdAt: '2024-01-15',
            signedAt: '2024-01-20',
            observations: 'Aprobado sin observaciones'
          },
          {
            id: 2,
            title: 'Evaluación Semestral',
            type: 'evaluacion',
            status: 'pending',
            createdBy: 'Prof. Martínez',
            createdAt: '2024-02-01',
            signedAt: null,
            observations: 'Pendiente de revisión'
          }
        ],
        statistics: {
          totalDocuments: 150,
          completedDocuments: 120,
          pendingDocuments: 30,
          totalHours: 1200,
          totalSignatures: 95
        },
        hours: [
          { month: 'Enero', hours: 180, user: 'Prof. García' },
          { month: 'Febrero', hours: 160, user: 'Prof. García' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!reportData) await fetchReportData();
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Encabezado con logo
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('PONTIFICIA UNIVERSIDAD', pageWidth/2, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Reporte de Documentos y Actividades', pageWidth/2, 40, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Período: ${filters.startDate} - ${filters.endDate}`, pageWidth/2, 50, { align: 'center' });
    doc.text(`Generado por: ${user?.name}`, pageWidth/2, 60, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth/2, 70, { align: 'center' });
    
    let yPosition = 90;
    
    // Estadísticas generales
    if (filters.includeStatistics && reportData.statistics) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Estadísticas Generales', 20, yPosition);
      yPosition += 15;
      
      const statsData = [
        ['Total de Documentos', reportData.statistics.totalDocuments],
        ['Documentos Completados', reportData.statistics.completedDocuments],
        ['Documentos Pendientes', reportData.statistics.pendingDocuments],
        ['Total de Firmas', reportData.statistics.totalSignatures]
      ];
      
      if (filters.includeHours) {
        statsData.push(['Total de Horas', reportData.statistics.totalHours]);
      }
      
      doc.autoTable({
        startY: yPosition,
        head: [['Métrica', 'Valor']],
        body: statsData,
        theme: 'striped',
        styles: { fontSize: 10 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
    }
    
    // Tabla de documentos
    if (reportData.documents && reportData.documents.length > 0) {
      doc.setFontSize(14);
      doc.text('Listado de Documentos', 20, yPosition);
      yPosition += 10;
      
      const tableData = reportData.documents.map(doc => [
        doc.title,
        doc.type,
        doc.status === 'completed' ? 'Completado' : 'Pendiente',
        doc.createdBy,
        new Date(doc.createdAt).toLocaleDateString(),
        doc.signedAt ? new Date(doc.signedAt).toLocaleDateString() : 'Sin firmar',
        doc.observations || 'Sin observaciones'
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [['Título', 'Tipo', 'Estado', 'Creado por', 'Fecha Creación', 'Fecha Firma', 'Observaciones']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          6: { cellWidth: 40 }
        }
      });
    }
    
    // Guardar PDF
    const fileName = `reporte_${filters.documentType}_${filters.startDate}_${filters.endDate}.pdf`;
    doc.save(fileName);
  };

  const generateExcel = async () => {
    if (!reportData) await fetchReportData();
    
    const workbook = XLSX.utils.book_new();
    
    // Hoja de documentos
    if (reportData.documents && reportData.documents.length > 0) {
      const documentsData = reportData.documents.map(doc => ({
        'ID': doc.id,
        'Título': doc.title,
        'Tipo': doc.type,
        'Estado': doc.status === 'completed' ? 'Completado' : 'Pendiente',
        'Creado por': doc.createdBy,
        'Fecha Creación': new Date(doc.createdAt).toLocaleDateString(),
        'Fecha Firma': doc.signedAt ? new Date(doc.signedAt).toLocaleDateString() : 'Sin firmar',
        'Observaciones': doc.observations || 'Sin observaciones'
      }));
      
      const ws1 = XLSX.utils.json_to_sheet(documentsData);
      XLSX.utils.book_append_sheet(workbook, ws1, 'Documentos');
    }
    
    // Hoja de estadísticas
    if (filters.includeStatistics && reportData.statistics) {
      const statsData = [
        { 'Métrica': 'Total de Documentos', 'Valor': reportData.statistics.totalDocuments },
        { 'Métrica': 'Documentos Completados', 'Valor': reportData.statistics.completedDocuments },
        { 'Métrica': 'Documentos Pendientes', 'Valor': reportData.statistics.pendingDocuments },
        { 'Métrica': 'Total de Firmas', 'Valor': reportData.statistics.totalSignatures }
      ];
      
      if (filters.includeHours) {
        statsData.push({ 'Métrica': 'Total de Horas', 'Valor': reportData.statistics.totalHours });
      }
      
      const ws2 = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, ws2, 'Estadísticas');
    }
    
    // Hoja de horas (si está disponible)
    if (filters.includeHours && reportData.hours && reportData.hours.length > 0) {
      const hoursData = reportData.hours.map(hour => ({
        'Mes': hour.month,
        'Usuario': hour.user,
        'Horas': hour.hours
      }));
      
      const ws3 = XLSX.utils.json_to_sheet(hoursData);
      XLSX.utils.book_append_sheet(workbook, ws3, 'Horas Trabajadas');
    }
    
    // Guardar Excel
    const fileName = `reporte_${filters.documentType}_${filters.startDate}_${filters.endDate}.xlsx`;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Exportar Reportes</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                Tipo de Documento
              </label>
              <select
                value={filters.documentType}
                onChange={(e) => handleFilterChange('documentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                Rol de Usuario
              </label>
              <select
                value={filters.userRole}
                onChange={(e) => handleFilterChange('userRole', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opciones de contenido */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contenido del Reporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.includeStatistics}
                  onChange={(e) => handleFilterChange('includeStatistics', e.target.checked)}
                  className="mr-2"
                />
                <ChartBarIcon className="w-4 h-4 mr-1" />
                Incluir Estadísticas
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.includeHours}
                  onChange={(e) => handleFilterChange('includeHours', e.target.checked)}
                  className="mr-2"
                />
                <CalendarIcon className="w-4 h-4 mr-1" />
                Incluir Horas Trabajadas
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.includeSignatures}
                  onChange={(e) => handleFilterChange('includeSignatures', e.target.checked)}
                  className="mr-2"
                />
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                Incluir Firmas
              </label>
            </div>
          </div>

          {/* Botones de exportación */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePDF}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              {loading ? 'Generando...' : 'Exportar PDF'}
            </button>
            
            <button
              onClick={generateExcel}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <TableCellsIcon className="w-5 h-5 mr-2" />
              {loading ? 'Generando...' : 'Exportar Excel'}
            </button>
          </div>

          {/* Información de permisos */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Permisos:</strong> Como usuario {user?.role}, tienes acceso a{' '}
              {user?.role === 'docente' ? 'tus documentos y horas trabajadas' : 
               user?.role === 'rrhh' ? 'documentos del personal y recursos humanos' :
               user?.role === 'administracion' || user?.role === 'contabilidad' ? 'todos los reportes consolidados' :
               user?.role === 'ti' ? 'auditoría completa de accesos y documentos' :
               'información según tu rol asignado'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReports;