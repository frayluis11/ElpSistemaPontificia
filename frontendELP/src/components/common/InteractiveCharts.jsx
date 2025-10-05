import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const InteractiveCharts = ({ dashboardData, userRole }) => {
  // Configuración base para todos los gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  // Datos para gráfico de barras: Documentos Pendientes vs Completados
  const documentsBarData = {
    labels: ['Planificación', 'Evaluación', 'Recursos', 'Personal', 'Financiero'],
    datasets: [
      {
        label: 'Completados',
        data: dashboardData?.documentsByType?.completed || [25, 30, 15, 20, 18],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pendientes',
        data: dashboardData?.documentsByType?.pending || [8, 12, 5, 7, 6],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Documentos'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tipo de Documento'
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Documentos por Estado y Tipo',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  // Datos para gráfico de líneas: Progreso de horas docentes por mes
  const hoursLineData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Horas Planificadas',
        data: dashboardData?.hoursProgress?.planned || [180, 160, 170, 185, 175, 190],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Horas Ejecutadas',
        data: dashboardData?.hoursProgress?.executed || [175, 155, 165, 180, 170, 185],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Horas'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mes'
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Progreso de Horas Docentes',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  // Datos para gráfico de torta: Tipos de documentos por área
  const documentsPieData = {
    labels: ['Planificación Académica', 'Evaluación y Notas', 'Gestión de Recursos', 'Recursos Humanos', 'Gestión Financiera'],
    datasets: [
      {
        data: dashboardData?.documentsByArea || [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Distribución de Documentos por Área',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Gráfico adicional para roles administrativos: Firmas por mes
  const signaturesLineData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Firmas Digitales',
        data: dashboardData?.signaturesProgress || [45, 52, 38, 63, 57, 71],
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const signaturesLineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Firmas'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mes'
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Evolución de Firmas Digitales',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  // Determinar qué gráficos mostrar según el rol
  const shouldShowAllCharts = ['administracion', 'contabilidad', 'ti'].includes(userRole);
  const shouldShowHoursChart = ['docente', 'rrhh', 'administracion'].includes(userRole);
  const shouldShowSignaturesChart = ['rrhh', 'administracion', 'contabilidad', 'ti'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Gráfico de barras - Documentos por estado (todos los roles) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="h-80">
          <Bar data={documentsBarData} options={barOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de líneas - Horas docentes (docentes, RRHH, admin) */}
        {shouldShowHoursChart && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-80">
              <Line data={hoursLineData} options={lineOptions} />
            </div>
          </div>
        )}

        {/* Gráfico de torta - Distribución por área */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-80">
            <Doughnut data={documentsPieData} options={pieOptions} />
          </div>
        </div>

        {/* Gráfico de firmas - Solo para roles administrativos */}
        {shouldShowSignaturesChart && (
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <div className="h-80">
              <Line data={signaturesLineData} options={signaturesLineOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Métricas adicionales para administradores */}
      {shouldShowAllCharts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Documentos Totales</p>
                <p className="text-3xl font-bold">{dashboardData?.totals?.documents || 248}</p>
              </div>
              <div className="text-blue-200">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Firmas Completadas</p>
                <p className="text-3xl font-bold">{dashboardData?.totals?.signatures || 186}</p>
              </div>
              <div className="text-green-200">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Horas Registradas</p>
                <p className="text-3xl font-bold">{dashboardData?.totals?.hours || 1425}</p>
              </div>
              <div className="text-purple-200">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCharts;