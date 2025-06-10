import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatValue } from '../../../utils/formatters';

/**
 * Standardized tooltip component for charts
 * Consolidates the repeated CustomTooltip implementations
 */
const ChartTooltip = ({ 
  active, 
  payload, 
  label,
  formatter, // Custom formatter function
  labelFormatter, // Custom label formatter
  showChange = false, // Show change percentages
  currency = false, // Format as currency
  className = ''
}) => {
  const { t } = useTranslation();

  if (!active || !payload || !payload.length) {
    return null;
  }

  // Default label formatter
  const formatLabel = labelFormatter || ((value) => value);

  // Default value formatter
  const formatTooltipValue = formatter || ((value, name, props) => {
    const valueType = currency ? 'currency' : 'number';
    let formattedValue = formatValue(value, valueType);
    
    // Add change percentage if available and requested
    if (showChange && props.payload) {
      const changeKey = `${name}Change`;
      const change = props.payload[changeKey];
      if (change !== undefined) {
        const sign = change > 0 ? '+' : '';
        formattedValue += ` (${sign}${change}% ${t('dashboard.vsLastYear')})`;
      }
    }
    
    return formattedValue;
  });

  return (
    <div className={`bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs ${className}`}>
      <p className="font-medium text-black mb-2">
        {formatLabel(label)}
      </p>
      
      {payload.map((entry, index) => {
        const value = formatTooltipValue(entry.value, entry.dataKey, entry);
        const color = entry.color || '#007B85';
        
        // Determine label from dataKey
        let displayName = entry.name || entry.dataKey;
        if (entry.dataKey === 'merchant') {
          displayName = t('dashboard.merchant');
        } else if (entry.dataKey === 'competitor' || entry.dataKey === 'competition') {
          displayName = t('dashboard.competition');
        }
        
        return (
          <div key={index} className="flex items-center text-sm text-black mt-1">
            <div 
              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="flex-1">
              <span className="font-medium">{displayName}:</span> {value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ChartTooltip;