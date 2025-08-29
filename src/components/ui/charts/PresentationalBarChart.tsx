import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCompactNumber } from '../../../utils/formatters';

// TypeScript interfaces
export interface BarChartDataPoint {
  category: string;
  merchant: number;
  competitor: number;
  merchantAbsolute?: number;
  competitorAbsolute?: number;
}

interface PresentationalBarChartProps {
  data: BarChartDataPoint[];
  merchantColor?: string;
  competitorColor?: string;
  yAxisLabel?: string;
  showAbsoluteValues?: boolean;
  note?: string | undefined;
  formatValue?: (value: number) => string;
  formatTooltipValue?: ((value: number) => string) | undefined;
  loading?: boolean;
  error?: string | null;
}

/**
 * Pure Presentational Bar Chart Component
 * 
 * Receives pre-processed data and renders bar charts in multiple views.
 * No Redux connections, no business logic - just pure UI rendering.
 */
const PresentationalBarChart: React.FC<PresentationalBarChartProps> = ({
  data,
  merchantColor = '#007B85',
  competitorColor = '#73AA3C',
  yAxisLabel = '%',
  showAbsoluteValues = false,
  note,
  formatValue = (value) => `${value}%`,
  formatTooltipValue,
  loading = false,
  error = null
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const dataPoint = data.find(item => item.category === label);
            const isMerchant = entry.dataKey === 'merchant';
            const absoluteValue = isMerchant ? dataPoint?.merchantAbsolute : dataPoint?.competitorAbsolute;
            
            let displayValue = formatValue(entry.value);
            if (formatTooltipValue && absoluteValue !== undefined && absoluteValue !== null) {
              displayValue = `${formatValue(entry.value)} (${formatTooltipValue(absoluteValue)})`;
            }

            return (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700">
                  {entry.name}: {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
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

  // Render bar chart
  const renderBarChart = () => {
    // Responsive configuration for mobile vs desktop
    const isMobile = window.innerWidth < 768;
    const responsiveConfig = {
      fontSize: isMobile ? 9 : 11,
      angle: isMobile ? -30 : -45,
      height: isMobile ? 60 : 80,
      bottomMargin: isMobile ? 60 : 80,
      leftMargin: isMobile ? 45 : 60
    };

    // Detect if this is a percentage chart by testing formatValue output
    const isPercentageChart = formatValue(100).includes('%');
    const yAxisFormatter = isPercentageChart 
      ? (value: number) => `${value}%`
      : formatCompactNumber;

    return (
      <div className="h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ 
              top: 5, 
              right: 30, 
              left: responsiveConfig.leftMargin, 
              bottom: responsiveConfig.bottomMargin 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: responsiveConfig.fontSize }}
              angle={responsiveConfig.angle}
              textAnchor="end"
              height={responsiveConfig.height}
            />
            <YAxis 
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              tickFormatter={yAxisFormatter}
              width={isMobile ? 40 : 55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="merchant" 
              fill={merchantColor} 
              name={t('dashboard.merchant')}
            />
            <Bar 
              dataKey="competitor" 
            fill={competitorColor} 
            name={t('dashboard.competition')}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  };

  return (
    <div>
      {/* Controls */}
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

      {/* Chart */}
      <div className="mt-4">
        {chartType === 'table' ? renderTable() : renderBarChart()}
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

export default PresentationalBarChart;