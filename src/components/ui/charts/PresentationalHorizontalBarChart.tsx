import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

// TypeScript interfaces
export interface HorizontalBarDataPoint {
  category: string;
  merchant: number;
  competitor: number;
  merchantAbsolute?: number;
  competitorAbsolute?: number;
}

interface PresentationalHorizontalBarChartProps {
  data: HorizontalBarDataPoint[];
  merchantColor?: string;
  competitorColor?: string;
  formatValue?: (value: number) => string;
  formatTooltipValue?: ((value: number) => string) | null;
  showTable?: boolean;
  note?: string | null;
  loading?: boolean;
  error?: string | null;
  hideCompetitorAbsolute?: boolean;
}

/**
 * Pure Presentational Horizontal Bar Chart Component
 * 
 * Receives pre-processed demographic data and renders horizontal bar charts.
 * No Redux connections, no business logic - just pure UI rendering.
 */
const PresentationalHorizontalBarChart: React.FC<PresentationalHorizontalBarChartProps> = ({
  data,
  merchantColor = '#007B85',
  competitorColor = '#73AA3C',
  formatValue = (value) => `${value}%`,
  formatTooltipValue = null,
  showTable = true,
  note,
  loading = false,
  error = null,
  hideCompetitorAbsolute = false
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');

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
    { value: 'bars', label: t('chartOptions.bars') },
    { value: 'table', label: t('chartOptions.table') }
  ];

  // Render table view
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="w-3/10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.merchant')} (%)
            </th>
            <th className="w-3/10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.competition')} (%)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatValue(row.merchant)}
                {row.merchantAbsolute !== undefined && formatTooltipValue && (
                  <span className="text-gray-400 ml-1">
                    ({formatTooltipValue(row.merchantAbsolute)})
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatValue(row.competitor)}
                {!hideCompetitorAbsolute && row.competitorAbsolute !== undefined && formatTooltipValue && (
                  <span className="text-gray-400 ml-1">
                    ({formatTooltipValue(row.competitorAbsolute)})
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render horizontal bars
  const renderHorizontalBars = () => {
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const difference = item.merchant - item.competitor;
          const isPositive = difference >= 0;
          
          // Create tooltip text
          let tooltipText = formatValue(item.merchant);
          if (item.merchantAbsolute !== undefined && formatTooltipValue) {
            tooltipText += ` (${formatTooltipValue(item.merchantAbsolute)})`;
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
                    {item.merchantAbsolute !== undefined && formatTooltipValue && (
                      <span> ({formatTooltipValue(item.merchantAbsolute)})</span>
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
                onChange={(selectedOption) => setChartType(selectedOption?.value || 'bars')}
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

export default PresentationalHorizontalBarChart;