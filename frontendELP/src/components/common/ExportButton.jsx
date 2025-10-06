import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon, 
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const ExportButton = ({ data, role, filename }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const formatRoleTitle = (role) => {
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

  const exportToPDF = async () => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatRoleTitle(role), pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Reporte generado el ${new Date().toLocaleDateString('es-ES')}`, 
               pageWidth / 2, currentY, { align: 'center' });

      currentY += 20;

      // KPIs Section
      if (data.kpis && Object.keys(data.kpis).length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Indicadores Clave (KPIs)', 20, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        Object.entries(data.kpis).forEach(([key, kpi]) => {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          const value = typeof kpi.value === 'number' ? 
            new Intl.NumberFormat('es-PE').format(kpi.value) : 
            kpi.value;
          
          pdf.text(`${formattedKey}: ${value} ${kpi.change || ''}`, 20, currentY);
          currentY += 6;
        });

        currentY += 10;
      }

      // Statistics Section
      if (data.statistics && Object.keys(data.statistics).length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Estadísticas Generales', 20, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        Object.entries(data.statistics).forEach(([key, value]) => {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          const formattedValue = typeof value === 'number' ? 
            new Intl.NumberFormat('es-PE').format(value) : 
            value;
          
          pdf.text(`${formattedKey}: ${formattedValue}`, 20, currentY);
          currentY += 6;
        });

        currentY += 10;
      }

      // Table Data Section
      if (data.tableData && data.tableData.length > 0) {
        if (currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Datos Detallados', 20, currentY);
        currentY += 10;

        // Table headers and data
        const tableData = data.tableData.slice(0, 20); // Limit to first 20 rows
        if (tableData.length > 0) {
          const headers = Object.keys(tableData[0]).filter(key => 
            !['id', 'category', 'status'].includes(key)
          );

          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');

          // Headers
          let startX = 20;
          const columnWidth = (pageWidth - 40) / headers.length;
          headers.forEach((header, index) => {
            pdf.text(
              header.charAt(0).toUpperCase() + header.slice(1), 
              startX + (index * columnWidth), 
              currentY
            );
          });

          currentY += 8;
          pdf.setFont('helvetica', 'normal');

          // Data rows
          tableData.forEach((row, rowIndex) => {
            if (currentY > pageHeight - 20) {
              pdf.addPage();
              currentY = 20;
            }

            headers.forEach((header, colIndex) => {
              const value = row[header] ? row[header].toString() : '';
              const truncatedValue = value.length > 15 ? value.substring(0, 15) + '...' : value;
              pdf.text(
                truncatedValue, 
                startX + (colIndex * columnWidth), 
                currentY
              );
            });

            currentY += 6;
          });
        }
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Página ${i} de ${totalPages} - Sistema ELP Pontificia`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      const workbook = XLSX.utils.book_new();

      // KPIs Worksheet
      if (data.kpis && Object.keys(data.kpis).length > 0) {
        const kpiData = Object.entries(data.kpis).map(([key, kpi]) => ({
          'Indicador': key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          'Valor': kpi.value,
          'Cambio': kpi.change || 'N/A'
        }));

        const kpiWorksheet = XLSX.utils.json_to_sheet(kpiData);
        XLSX.utils.book_append_sheet(workbook, kpiWorksheet, 'KPIs');
      }

      // Table Data Worksheet
      if (data.tableData && data.tableData.length > 0) {
        const cleanedData = data.tableData.map(row => {
          const cleanRow = { ...row };
          delete cleanRow.id;
          delete cleanRow.category;
          return cleanRow;
        });

        const tableWorksheet = XLSX.utils.json_to_sheet(cleanedData);
        XLSX.utils.book_append_sheet(workbook, tableWorksheet, 'Datos Detallados');
      }

      // Chart Data Worksheets
      if (data.chartData) {
        Object.entries(data.chartData).forEach(([chartName, chartData]) => {
          if (Array.isArray(chartData) && chartData.length > 0) {
            const chartWorksheet = XLSX.utils.json_to_sheet(chartData);
            const sheetName = chartName.charAt(0).toUpperCase() + chartName.slice(1);
            XLSX.utils.book_append_sheet(workbook, chartWorksheet, sheetName);
          }
        });
      }

      // Statistics Worksheet
      if (data.statistics && Object.keys(data.statistics).length > 0) {
        const statsData = Object.entries(data.statistics).map(([key, value]) => ({
          'Estadística': key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          'Valor': value
        }));

        const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estadísticas');
      }

      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportChartAsPDF = async () => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      const charts = document.querySelectorAll('.recharts-wrapper');
      if (charts.length === 0) {
        alert('No se encontraron gráficos para exportar.');
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let currentY = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Gráficos - ${formatRoleTitle(role)}`, pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Reporte generado el ${new Date().toLocaleDateString('es-ES')}`, 
               pageWidth / 2, currentY, { align: 'center' });

      currentY += 20;

      for (let i = 0; i < charts.length; i++) {
        if (i > 0) {
          pdf.addPage();
          currentY = 20;
        }

        try {
          const canvas = await html2canvas(charts[i], {
            backgroundColor: 'white',
            scale: 2
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
        } catch (error) {
          console.error(`Error capturing chart ${i + 1}:`, error);
        }
      }

      pdf.save(`${filename}-graficos.pdf`);
    } catch (error) {
      console.error('Error generating chart PDF:', error);
      alert('Error al generar el PDF de gráficos. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exportando...
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Exportar
          </>
        )}
      </button>

      {showDropdown && !isExporting && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            <button
              onClick={exportToPDF}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <DocumentTextIcon className="h-4 w-4 mr-3" />
              Exportar a PDF
            </button>
            
            <button
              onClick={exportToExcel}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <TableCellsIcon className="h-4 w-4 mr-3" />
              Exportar a Excel
            </button>
            
            <button
              onClick={exportChartAsPDF}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <ChartBarIcon className="h-4 w-4 mr-3" />
              Exportar Gráficos (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;