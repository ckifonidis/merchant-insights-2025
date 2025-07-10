import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import Select from 'react-select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useResponsive } from '../../../hooks/useResponsive';

const UniversalBreakdownChart = ({ 
  data, 
  metricId,
  colors, 
  formatValue = (value) => `${value}%`,
  showAbsoluteValues = false,
  totalValue = null,
  note = null,
  formatTooltipValue = null
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('stacked');
  const { isMobile, isTablet } = useResponsive();

  // Memoized selector for raw metric data when metricId is provided
  const selectRawMetricData = useMemo(() => {
    if (!metricId) return null;
    
    return createSelector(
      [state => state.data.metrics],
      (metrics) => {
        const metric = metrics?.[metricId];
        if (!metric?.merchant?.current) return null;
        
        return {
          merchant: metric.merchant.current,
          competitor: metric.competitor?.current || {}
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

    // Handle revenue_by_channel specifically
    if (metricId === 'revenue_by_channel') {
      const merchantData = rawData.merchant;
      const competitorData = rawData.competitor;
      
      // Calculate totals for percentage calculation
      const merchantTotal = (merchantData.physical || 0) + (merchantData.ecommerce || 0);
      const competitorTotal = (competitorData.physical || 0) + (competitorData.ecommerce || 0);
      
      return [
        {
          category: 'Physical Store',
          merchant: merchantTotal > 0 ? Number((((merchantData.physical || 0) / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number((((competitorData.physical || 0) / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantData.physical || 0,
          competitorAbsolute: competitorData.physical || 0
        },
        {
          category: 'E-commerce', 
          merchant: merchantTotal > 0 ? Number((((merchantData.ecommerce || 0) / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number((((competitorData.ecommerce || 0) / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantData.ecommerce || 0,
          competitorAbsolute: competitorData.ecommerce || 0
        }
      ];
    }

    // Add other metric types here as needed
    return [];
  }, [data, rawData, metricId]);

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
    { value: 'stacked', label: 'Stacked Bar' },
    { value: 'pie', label: 'Pie Charts' },
    { value: 'table', label: t('chartOptions.table') }
  ];

  // Process data for pie charts with defensive programming
  const merchantPieData = processedData.filter(item => {
    const merchantValue = typeof item.merchant === 'number' && !isNaN(item.merchant) ? item.merchant : 0;
    return merchantValue > 0; // Only include items with valid positive values
  }).map(item => ({
    name: item.category,
    value: typeof item.merchant === 'number' && !isNaN(item.merchant) ? item.merchant : 0,
    percentage: typeof item.merchant === 'number' && !isNaN(item.merchant) ? item.merchant : 0,
    absoluteValue: typeof item.merchantAbsolute === 'number' && !isNaN(item.merchantAbsolute) ? item.merchantAbsolute : null,
    color: colors[item.category] || colors[item.key] || '#999999'
  }));

  const competitorPieData = processedData.filter(item => {
    const competitorValue = typeof item.competitor === 'number' && !isNaN(item.competitor) ? item.competitor : 0;
    return competitorValue > 0; // Only include items with valid positive values
  }).map(item => ({
    name: item.category,
    value: typeof item.competitor === 'number' && !isNaN(item.competitor) ? item.competitor : 0,
    percentage: typeof item.competitor === 'number' && !isNaN(item.competitor) ? item.competitor : 0,
    absoluteValue: typeof item.competitorAbsolute === 'number' && !isNaN(item.competitorAbsolute) ? item.competitorAbsolute : null,
    color: colors[item.category] || colors[item.key] || '#999999'
  }));

  // Pie chart tooltip
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      let displayValue;
      if (formatTooltipValue && data.absoluteValue !== undefined && data.absoluteValue !== null) {
        displayValue = formatTooltipValue(data.absoluteValue);
      } else {
        displayValue = `${data.percentage.toFixed(2)}%`;
      }
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-black">{data.name}: {displayValue}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate responsive pie chart radius
  const getPieRadius = () => {
    if (isMobile) return 40;
    if (isTablet) return 50;
    return 60;
  };

  // Custom label function with labels outside
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const labelRadius = outerRadius + 20;
    const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    );
  };

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
            {showAbsoluteValues && (
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
            return (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatValue(row.merchant)}
                </td>
                {showAbsoluteValues && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {row.merchantAbsolute ? 
                      (formatTooltipValue ? formatTooltipValue(row.merchantAbsolute) : row.merchantAbsolute.toLocaleString()) : 
                      '-'
                    }
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatValue(row.competitor)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Render stacked bar visualization
  const renderStackedBars = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Merchant Stacked Bar */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t('dashboard.merchant')}</h4>
          <div className="w-full h-12 bg-gray-100 rounded-lg overflow-hidden mb-3 relative group">
            <div className="flex h-full">
              {processedData.map((item, index) => {
                const color = colors[item.category] || colors[item.key];
                const absoluteValue = item.merchantAbsolute;
                const formattedAbsolute = formatTooltipValue && absoluteValue ? 
                  formatTooltipValue(absoluteValue) : 
                  (absoluteValue ? absoluteValue.toLocaleString() : '');
                
                return (
                  <div
                    key={index}
                    className="h-full transition-all duration-300 relative"
                    style={{
                      width: `${item.merchant}%`,
                      backgroundColor: color
                    }}
                    title={`${item.category}: ${item.merchant.toFixed(2)}%${formattedAbsolute ? ` (${formattedAbsolute})` : ''}`}
                  />
                );
              })}
            </div>

            {/* Hover tooltip */}
            {showAbsoluteValues && totalValue && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Total: {totalValue.toLocaleString()}
                </div>
              </div>
            )}
          </div>
          
          {/* Legend for Merchant */}
          <div className="flex justify-center space-x-6 flex-wrap">
            {processedData.map((item, index) => {
              const color = colors[item.category] || colors[item.key];
              const absoluteValue = item.merchantAbsolute;
              const formattedAbsolute = formatTooltipValue && absoluteValue ? 
                formatTooltipValue(absoluteValue) : 
                (absoluteValue ? absoluteValue.toLocaleString() : '');
              
              return (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-sm mr-2"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700">
                    {item.category} ({item.merchant.toFixed(2)}%{formattedAbsolute ? ` - ${formattedAbsolute}` : ''})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Competition Stacked Bar */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t('dashboard.competition')}</h4>
          <div className="w-full h-12 bg-gray-100 rounded-lg overflow-hidden mb-3">
            <div className="flex h-full">
              {processedData.map((item, index) => {
                const color = colors[item.category] || colors[item.key];
                const absoluteValue = item.competitorAbsolute;
                const formattedAbsolute = formatTooltipValue && absoluteValue ? 
                  formatTooltipValue(absoluteValue) : 
                  (absoluteValue ? absoluteValue.toLocaleString() : '');
                
                return (
                  <div
                    key={index}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${item.competitor}%`,
                      backgroundColor: color
                    }}
                    title={`${item.category}: ${item.competitor.toFixed(2)}%${formattedAbsolute ? ` (${formattedAbsolute})` : ''}`}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Legend for Competition */}
          <div className="flex justify-center space-x-6 flex-wrap">
            {processedData.map((item, index) => {
              const color = colors[item.category] || colors[item.key];
              const absoluteValue = item.competitorAbsolute;
              const formattedAbsolute = formatTooltipValue && absoluteValue ? 
                formatTooltipValue(absoluteValue) : 
                (absoluteValue ? absoluteValue.toLocaleString() : '');
              
              return (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-sm mr-2"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700">
                    {item.category} ({item.competitor.toFixed(2)}%{formattedAbsolute ? ` - ${formattedAbsolute}` : ''})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render pie charts
  const renderPieCharts = () => {
    return (
      <div className="flex flex-col h-full">
        <div className={`grid gap-4 flex-grow ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* Merchant Pie Chart */}
          <div className="flex flex-col items-center min-h-0">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.merchant')}</h4>
            <div className="w-full h-56 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={merchantPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={getPieRadius()}
                    dataKey="value"
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {merchantPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Competitor Pie Chart */}
          <div className="flex flex-col items-center min-h-0">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.competition')}</h4>
            <div className="w-full h-56 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={competitorPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={getPieRadius()}
                    dataKey="value"
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {competitorPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Common Color Legend */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-6 flex-wrap">
            {Object.entries(colors).map(([key, color]) => (
              <div key={key} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render chart
  const renderChart = () => {
    if (chartType === 'table') {
      return renderTable();
    }

    if (chartType === 'stacked') {
      return renderStackedBars();
    }

    if (chartType === 'pie') {
      return renderPieCharts();
    }

    return renderStackedBars();
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex justify-end mb-4">
        <div className="min-w-32">
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

      {/* Chart */}
      <div className={
        chartType === 'table' ? 'max-h-64 overflow-y-auto' :
        isMobile && chartType === 'pie' ? 'h-auto min-h-96' :
        'h-64'
      }>
        {renderChart()}
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

export default UniversalBreakdownChart;