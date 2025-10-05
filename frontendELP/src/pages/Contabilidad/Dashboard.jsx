import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BanknotesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import SearchableDataView from '../../components/common/SearchableDataView';

const ContabilidadDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    processedInvoices: 0
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalRevenue: 2450000,
        monthlyExpenses: 890000,
        pendingPayments: 15,
        processedInvoices: 234
      });
    }, 1000);
  }, []);

  const quickActions = [
    {
      name: 'Gestión Financiera',
      description: 'Administrar finanzas institucionales',
      href: '/contabilidad/finances',
      icon: BanknotesIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Documentos Contables',
      description: 'Facturas y documentos fiscales',
      href: '/contabilidad/documents',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Reportes Financieros',
      description: 'Estados financieros y balances',
      href: '/contabilidad/reports',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Calculadora Fiscal',
      description: 'Herramientas de cálculo',
      href: '/contabilidad/calculator',
      icon: CalculatorIcon,
      color: 'bg-green-500',
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.nombre_completo || 'Contabilidad'}!
            </h1>
            <p className="text-yellow-100 text-lg">
              Panel de Contabilidad - Sistema ELP Pontificia
            </p>
          </div>
          <div className="text-right">
            <div className="bg-yellow-500 bg-opacity-50 rounded-lg p-3">
              <CurrencyDollarIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">Balance Mensual</p>
              <p className="font-bold">{formatCurrency(stats.totalRevenue - stats.monthlyExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos Totales
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-6 py-3">
            <div className="text-sm text-green-700">
              +8.5% vs mes anterior
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gastos Mensuales
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.monthlyExpenses)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-red-50 px-6 py-3">
            <div className="text-sm text-red-700">
              Dentro del presupuesto
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pagos Pendientes
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.pendingPayments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-6 py-3">
            <div className="text-sm text-blue-700">
              Requieren aprobación
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Facturas Procesadas
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.processedInvoices}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-6 py-3">
            <div className="text-sm text-purple-700">
              Este mes
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de navegación - Panel Contabilidad */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Panel Financiero
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" />
              Facturas
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CurrencyDollarIcon className="w-5 h-5 inline mr-2" />
              Pagos
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
              Búsqueda Financiera
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Resumen Financiero</h3>
              <p className="text-gray-600">Estado consolidado de ingresos, gastos y transacciones pendientes.</p>
            </div>
          )}

          {activeTab === 'invoices' && (
            <SearchableDataView
              dataType="invoices"
              title="Gestión de Facturas"
              onView={(item) => console.log('Ver factura:', item)}
              onEdit={(item) => console.log('Editar factura:', item)}
            />
          )}

          {activeTab === 'payments' && (
            <SearchableDataView
              dataType="payments"
              title="Control de Pagos y Transacciones"
              onView={(item) => console.log('Ver pago:', item)}
              showActions={false}
            />
          )}

          {activeTab === 'search' && (
            <SearchableDataView
              dataType="documents"
              title="Búsqueda Avanzada - Datos Financieros"
              onView={(item) => console.log('Ver elemento:', item)}
              onEdit={(item) => console.log('Editar elemento:', item)}
            />
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-500 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <span className={`${action.color} rounded-lg inline-flex p-3 text-white ring-4 ring-white`}>
                  <action.icon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-yellow-600">
                  {action.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ingresos por Categoría</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Matrículas</span>
                <span className="text-sm font-medium">{formatCurrency(1800000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Servicios</span>
                <span className="text-sm font-medium">{formatCurrency(450000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Otros</span>
                <span className="text-sm font-medium">{formatCurrency(200000)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Gastos por Categoría</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nómina</span>
                <span className="text-sm font-medium">{formatCurrency(650000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Operativos</span>
                <span className="text-sm font-medium">{formatCurrency(150000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mantenimiento</span>
                <span className="text-sm font-medium">{formatCurrency(90000)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadDashboard;