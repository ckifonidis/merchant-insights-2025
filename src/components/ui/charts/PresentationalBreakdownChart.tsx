import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useResponsive } from '../../../hooks/useResponsive';

// TypeScript interfaces
export interface BreakdownDataPoint {
  category: string;
  merchant: number;
  competitor: number;
  merchantAbsolute?: number;
  competitorAbsolute?: number;
}

interface PresentationalBreakdownChartProps {
  data: BreakdownDataPoint[];
  colors: Record<string, string>;
  formatValue?: (value: number) => string;
  formatTooltipValue?: ((value: number) => string) | undefined;
  showAbsoluteValues?: boolean;
  note?: string | undefined;
  loading?: boolean;
  error?: string | null;
  hideCompetitorAbsolute?: boolean;
}

/**
 * Pure Presentational Breakdown Chart Component
 * 
 * Receives pre-processed data and renders breakdown charts in multiple views.
 * No Redux connections, no business logic - just pure UI rendering.
 */
const PresentationalBreakdownChart: React.FC<PresentationalBreakdownChartProps> = ({
  data,
  colors,
  formatValue = (value) => `${value}%`,
  formatTooltipValue,
  showAbsoluteValues = false,
  note,
  loading = false,
  error = null,
  hideCompetitorAbsolute = false
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('stacked');
  const { isMobile, isTablet } = useResponsive();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading data...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading data: {error}</div>
      </div>
    );
  }

  // Show no data state
  if (data.length === 0) {
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
  const merchantPieData = data.filter(item => {
    const merchantValue = typeof item.merchant === 'number' && !isNaN(item.merchant) ? item.merchant : 0;
    return merchantValue > 0; // Only include items with valid positive values
  }).map(item => ({
    name: item.category,
    value: typeof item.merchant === 'number' && !isNaN(item.merchant) ? item.merchant : 0,
    percentage: typeof item.merchant === 'number' && !isNaN(item.merchant) ? item.merchant : 0,
    absoluteValue: typeof item.merchantAbsolute === 'number' && !isNaN(item.merchantAbsolute) ? item.merchantAbsolute : null,
    color: colors[item.category] || '#999999'
  }));

  const competitorPieData = data.filter(item => {
    const competitorValue = typeof item.competitor === 'number' && !isNaN(item.competitor) ? item.competitor : 0;
    return competitorValue > 0; // Only include items with valid positive values
  }).map(item => ({
    name: item.category,
    value: typeof item.competitor === 'number' && !isNaN(item.competitor) ? item.competitor : 0,
    percentage: typeof item.competitor === 'number' && !isNaN(item.competitor) ? item.competitor : 0,
    absoluteValue: typeof item.competitorAbsolute === 'number' && !isNaN(item.competitorAbsolute) ? item.competitorAbsolute : null,
    color: colors[item.category] || '#999999'
  }));

  // Pie chart tooltip
  const PieTooltip = ({ active, payload }: any) => {
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
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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
                {t('dashboard.merchant')} (Value)
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.competition')} (%)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => {
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
              {data.map((item, index) => {
                const color = colors[item.category];
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
          </div>
          
          {/* Legend for Merchant */}
          <div className="flex justify-center space-x-6 flex-wrap">
            {data.map((item, index) => {
              const color = colors[item.category];
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
              {data.map((item, index) => {
                const color = colors[item.category];
                const absoluteValue = item.competitorAbsolute;
                const formattedAbsolute = !hideCompetitorAbsolute && formatTooltipValue && absoluteValue ? 
                  formatTooltipValue(absoluteValue) : 
                  (!hideCompetitorAbsolute && absoluteValue ? absoluteValue.toLocaleString() : '');
                
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
            {data.map((item, index) => {
              const color = colors[item.category];
              const absoluteValue = item.competitorAbsolute;
              const formattedAbsolute = !hideCompetitorAbsolute && formatTooltipValue && absoluteValue ? 
                formatTooltipValue(absoluteValue) : 
                (!hideCompetitorAbsolute && absoluteValue ? absoluteValue.toLocaleString() : '');
              
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
            <div className="w-full h-48 min-h-0">
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
            <div className="w-full h-48 min-h-0">
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
        <div className="flex justify-center mt-2">
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
            onChange={(selectedOption) => setChartType(selectedOption?.value || 'stacked')}
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
        chartType === 'pie' ? 'h-auto' :
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

export default PresentationalBreakdownChart;