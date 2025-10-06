import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ChartContainer = ({ data, role, type }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500 py-8">
          No hay datos disponibles para mostrar gráficos
        </div>
      </div>
    );
  }

  const getChartTitle = (role, type) => {
    const titles = {
      'Docente': {
        line: 'Horas Semanales Dictadas',
        pie: 'Estado de Documentos'
      },
      'RRHH': {
        line: 'Documentos Emitidos por Mes',
        pie: 'Tipos de Documentos'
      },
      'Admin': {
        line: 'Ingresos Mensuales',
        pie: 'Gastos por Categoría'
      },
      'Administracion': {
        line: 'Ingresos Mensuales',
        pie: 'Gastos por Categoría'
      },
      'Contabilidad': {
        line: 'Pagos Mensuales',
        pie: 'Distribución de Pagos'
      },
      'TI': {
        line: 'Accesos Diarios',
        pie: 'Tipos de Actividad'
      }
    };
    
    return titles[role]?.[type] || 'Gráfico';
  };

  const getLineChartData = (role) => {
    switch (role) {
      case 'Docente':
        return data.horasSemanales || [];
      case 'RRHH':
        return data.documentosMensuales || [];
      case 'Admin':
      case 'Administracion':
        return data.ingresosMensuales || [];
      case 'Contabilidad':
        return data.pagosMensuales || [];
      case 'TI':
        return data.accesosDiarios || [];
      default:
        return [];
    }
  };

  const getPieChartData = (role) => {
    switch (role) {
      case 'Docente':
        return data.documentosEstado || [];
      case 'RRHH':
        return data.tiposDocumentos || [];
      case 'Admin':
      case 'Administracion':
        return data.gastosPorCategoria || [];
      case 'Contabilidad':
        return data.tiposPagos || [];
      case 'TI':
        return data.tiposActividad || [];
      default:
        return [];
    }
  };

  const formatValue = (value, role, type) => {
    if (type === 'line') {
      switch (role) {
        case 'Docente':
          return `${value} hrs`;
        case 'RRHH':
          return `${value} docs`;
        case 'Admin':
        case 'Administracion':
        case 'Contabilidad':
          return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0
          }).format(value);
        case 'TI':
          return `${value} accesos`;
        default:
          return value;
      }
    }
    return value;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-gray-900 font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatValue(entry.value, role, type)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-gray-900 font-semibold">{data.name}</p>
          <p style={{ color: data.color }}>
            {`Valor: ${formatValue(data.value, role, 'pie')}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLineChart = () => {
    const chartData = getLineChartData(role);
    const dataKey = Object.keys(chartData[0] || {}).find(key => key !== 'month') || 'value';
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => formatValue(value, role, type)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    const chartData = getPieChartData(role);
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    const chartData = getLineChartData(role);
    const dataKey = Object.keys(chartData[0] || {}).find(key => key !== 'month') || 'value';
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => formatValue(value, role, type)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey={dataKey}
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'bar':
        return renderBarChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {getChartTitle(role, type)}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Datos de los últimos 6 meses
        </p>
      </div>
      
      <div className="w-full">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartContainer;