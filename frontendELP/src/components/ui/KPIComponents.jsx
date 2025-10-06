import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

export const KPICard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon, 
  gradient = 'from-blue-500 to-blue-600',
  format = 'number' // 'number', 'currency', 'percentage'
}) => {
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-CO', { 
          style: 'currency', 
          currency: 'COP' 
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('es-CO').format(val);
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <ArrowUpIcon className="w-4 h-4" />;
      case 'negative':
        return <ArrowDownIcon className="w-4 h-4" />;
      default:
        return <MinusIcon className="w-4 h-4" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{formatValue(value)}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl p-6 border-2 ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <Icon className="w-8 h-8" />
        )}
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-current/20">
          <div className="flex items-center text-sm">
            {trend.direction === 'up' ? (
              <ArrowUpIcon className="w-5 h-5 mr-1" />
            ) : (
              <ArrowDownIcon className="w-5 h-5 mr-1" />
            )}
            <span>{trend.value} {trend.label}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  gradient = 'from-blue-500 to-blue-600',
  badge
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <div className="ml-4">
          {badge && (
            <div className="mb-2">
              <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                {badge}
              </span>
            </div>
          )}
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export const AlertCard = ({ 
  type = 'info', // 'success', 'warning', 'error', 'info'
  title, 
  message, 
  onDismiss 
}) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 ${typeStyles[type]}`}
    >
      <div className="flex items-start">
        <span className="text-lg mr-3">{iconStyles[type]}</span>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
};