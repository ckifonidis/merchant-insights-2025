import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import Select from 'react-select';

// Shopping interest labels mapping
const SHOPPING_INTEREST_LABELS = {
  'SHOPINT1': 'Fashion & Apparel',
  'SHOPINT2': 'Electronics & Tech',
  'SHOPINT3': 'Home & Garden',
  'SHOPINT4': 'Sports & Fitness',
  'SHOPINT5': 'Books & Media',
  'SHOPINT6': 'Beauty & Personal Care',
  'SHOPINT7': 'Food & Beverages',
  'SHOPINT8': 'Travel & Tourism',
  'SHOPINT9': 'Automotive',
  'SHOPINT10': 'Health & Wellness',
  'SHOPINT11': 'Entertainment',
  'SHOPINT12': 'Jewelry & Accessories',
  'SHOPINT13': 'Toys & Games',
  'SHOPINT14': 'Art & Crafts',
  'SHOPINT15': 'Office & Business',
  'other_category': 'Other'
};

const UniversalHorizontalBarChart = ({ 
  data, 
  metricId,
  title,
  merchantColor = '#007B85',
  competitorColor = '#73AA3C',
  formatValue = (value) => `${value}%`,
  formatTooltipValue = null,
  maxCategories = null,
  totalValue = null,
  showTable = true,
  note = null,
  filters 
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');

  // Memoized selector for raw metric data when metricId is provided
  const selectRawMetricData = useMemo(() => {
    if (!metricId) return null;
    
    return createSelector(
      [state => state.data.metrics],
      (metrics) => {
        const metric = metrics?.[metricId];
        if (!metric?.merchant?.current) return null;
        
        return {
          merchant: metric.merchant,
          competitor: metric.competitor || {}
        };
      }
    );
  }, [metricId]);

  const rawData = useSelector(selectRawMetricData || (() => null));
  const loading = useSelector(state => 
    metricId ? (state.data.loading?.metrics || state.data.loading?.specificMetrics?.[metricId]) : false
  );
  const error = useSelector(state => 
    metricId ? (state.data.errors?.metrics || state.data.errors?.specificMetrics?.[metricId]) : null
  );

  // Calculate breakdown data from raw metric data when metricId is provided
  const processedData = useMemo(() => {
    if (data) return data; // Use provided data if available
    if (!rawData || !metricId) return [];

    // Handle converted_customers_by_interest specifically
    if (metricId === 'converted_customers_by_interest') {
      const merchantData = rawData.merchant?.current || {};
      const competitorData = rawData.competitor?.current || {};
      
      // Calculate totals for percentage calculation
      const merchantTotal = Object.values(merchantData).reduce((sum, val) => sum + (val || 0), 0);
      const competitorTotal = Object.values(competitorData).reduce((sum, val) => sum + (val || 0), 0);
      
      let result = Object.keys(merchantData).map(interest => {
        const merchantAbsolute = merchantData[interest] || 0;
        const competitorAbsolute = competitorData[interest] || 0;
        
        return {
          category: SHOPPING_INTEREST_LABELS[interest] || interest,
          // Store both absolute and percentage values
          merchant: merchantTotal > 0 ? Number(((merchantAbsolute / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number(((competitorAbsolute / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute,
          competitorAbsolute
        };
      });

      // Sort by total revenue (merchant + competitor) and limit if maxCategories is set
      result = result
        .sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor));
      
      if (maxCategories) {
        result = result.slice(0, maxCategories);
      }

      // Truncate long category names for horizontal display
      result = result.map(item => ({
        ...item,
        category: item.category.length > 20 ? item.category.substring(0, 20) + '...' : item.category
      }));

      return result;
    }

    // Handle converted_customers_by_age specifically
    if (metricId === 'converted_customers_by_age') {
      const merchantData = rawData.merchant;
      const competitorData = rawData.competitor;
      
      // Calculate totals for percentage calculation
      const merchantTotal = Object.values(merchantData).reduce((sum, val) => sum + (val || 0), 0);
      const competitorTotal = Object.values(competitorData).reduce((sum, val) => sum + (val || 0), 0);
      
      // Age group labels mapping
      const AGE_GROUP_LABELS = {
        '18-24': 'Generation Z (18-24)',
        '25-40': 'Millennials (25-40)', 
        '41-56': 'Generation X (41-56)',
        '57-75': 'Baby Boomers (57-75)',
        '76-96': 'Silent Generation (76-96)'
      };
      
      let result = Object.keys(merchantData).map(ageGroup => {
        const merchantAbsolute = merchantData[ageGroup] || 0;
        const competitorAbsolute = competitorData[ageGroup] || 0;
        
        return {
          category: AGE_GROUP_LABELS[ageGroup] || ageGroup,
          merchant: merchantTotal > 0 ? Number(((merchantAbsolute / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number(((competitorAbsolute / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute,
          competitorAbsolute
        };
      });

      // Sort by total percentage (merchant + competitor)
      result = result
        .sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor));
      
      if (maxCategories) {
        result = result.slice(0, maxCategories);
      }

      return result;
    }

    // Add other metric types here as needed
    return [];
  }, [data, rawData, metricId, maxCategories]);

  // Show loading state when using metricId
  if (metricId && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading data...</div>
      </div>
    );
  }

  // Show error state when using metricId
  if (metricId && error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading data: {error}</div>
      </div>
    );
  }

  // Show no data state
  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  // Chart type options
  const chartTypeOptions = [
    { value: 'bars', label: t('chartOptions.bars') },
    { value: 'table', label: t('chartOptions.table') }
  ];

  // Render table view
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.merchant')} (%)
            </th>
            {totalValue && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Merchant (Value)
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.competition')} (%)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {processedData.map((row, index) => {
            const absoluteValue = totalValue ? Math.round(row.merchant * totalValue / 100) : row.merchantAbsolute;
            
            return (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatValue(row.merchant)}
                  {absoluteValue !== undefined && formatTooltipValue && (
                    <span className="text-gray-400 ml-1">
                      ({formatTooltipValue(absoluteValue)})
                    </span>
                  )}
                </td>
                {totalValue && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {absoluteValue?.toLocaleString()}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatValue(row.competitor)}
                  {row.competitorAbsolute !== undefined && formatTooltipValue && (
                    <span className="text-gray-400 ml-1">
                      ({formatTooltipValue(row.competitorAbsolute)})
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Render horizontal bars
  const renderHorizontalBars = () => {
    return (
      <div className="space-y-4">
        {processedData.map((item, index) => {
          const absoluteValue = totalValue ? Math.round(item.merchant * totalValue / 100) : item.merchantAbsolute;
          const difference = item.merchant - item.competitor;
          const isPositive = difference >= 0;
          
          // Create tooltip text
          let tooltipText = formatValue(item.merchant);
          if (absoluteValue !== undefined && formatTooltipValue) {
            tooltipText += ` (${formatTooltipValue(absoluteValue)})`;
          }
          
          return (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-40 text-sm font-medium text-gray-700 text-right">
                {item.category}
              </div>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-200 rounded-lg overflow-hidden relative">
                  <div 
                    className="h-full transition-all duration-300" 
                    title={tooltipText}
                    style={{ 
                      width: `${item.merchant}%`, 
                      backgroundColor: merchantColor 
                    }}
                  />
                  <div 
                    className="absolute top-0 h-full w-1 bg-black transition-all duration-300" 
                    style={{ left: `${item.competitor}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className="font-medium" style={{ color: merchantColor }}>
                    {formatValue(item.merchant)}
                    {absoluteValue !== undefined && formatTooltipValue && (
                      <span> ({formatTooltipValue(absoluteValue)})</span>
                    )}
                  </span>
                  <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    ({formatValue(item.competitor)})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Legend */}
        <div className="flex justify-center space-x-8 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-3 rounded" 
              style={{ backgroundColor: merchantColor }}
            />
            <span className="text-sm text-gray-700">{t('dashboard.merchant')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-1" 
              style={{ backgroundColor: competitorColor }}
            />
            <span className="text-sm text-gray-700">{t('dashboard.competition')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Controls */}
      {showTable && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
          <div></div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="min-w-[120px]">
              <Select
                value={chartTypeOptions.find(option => option.value === chartType)}
                onChange={(selectedOption) => setChartType(selectedOption.value)}
                options={chartTypeOptions}
                isSearchable={false}
                className="text-sm"
                classNamePrefix="select"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mt-4">
        {chartType === 'table' ? renderTable() : renderHorizontalBars()}
      </div>

      {/* Note */}
      {note && (
        <div className="mt-4 text-xs text-gray-500">
          <p>{note}</p>
        </div>
      )}
    </div>
  );
};

export default UniversalHorizontalBarChart;