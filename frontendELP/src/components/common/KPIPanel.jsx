import React from 'react';

const KPIPanel = ({ kpis }) => {
  if (!kpis || Object.keys(kpis).length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay indicadores disponibles
      </div>
    );
  }

  const formatValue = (value, key) => {
    // Format monetary values
    if (key.toLowerCase().includes('monto') || 
        key.toLowerCase().includes('ingreso') || 
        key.toLowerCase().includes('pago')) {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(value);
    }
    
    // Format percentage values
    if (key.toLowerCase().includes('actividad') || 
        key.toLowerCase().includes('margen')) {
      return `${value}%`;
    }
    
    // Format regular numbers
    if (typeof value === 'number') {
      return new Intl.NumberFormat('es-PE').format(value);
    }
    
    return value;
  };

  const getChangeColor = (change) => {
    if (!change) return 'text-gray-500';
    
    const isPositive = change.startsWith('+');
    const isZero = change === '0%';
    
    if (isZero) return 'text-gray-500';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change) => {
    if (!change) return null;
    
    const isPositive = change.startsWith('+');
    const isZero = change === '0%';
    
    if (isZero) return '─';
    return isPositive ? '↗' : '↘';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(kpis).map(([key, kpi]) => {
        const IconComponent = kpi.icon;
        
        return (
          <div
            key={key}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatValue(kpi.value, key)}
                </p>
                
                {kpi.change && (
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${getChangeColor(kpi.change)}`}>
                      {getChangeIcon(kpi.change)} {kpi.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs. mes anterior
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                <div className="bg-blue-50 rounded-full p-3">
                  {IconComponent && (
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPIPanel;