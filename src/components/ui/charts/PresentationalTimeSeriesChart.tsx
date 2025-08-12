import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from './ChartContainer';
import ChartSelector from './ChartSelector';
import ChartTable from './ChartTable';
import { ChangeIndicator } from '../metrics';
import { CHART_CONFIG } from '../../../utils/constants';

// TypeScript interfaces
export type ChartType = 'line' | 'bar' | 'table';
export type TimelineType = 'daily' | 'weekly' | 'monthly';

export interface ChartDataPoint {
  date: string;
  merchant: number;
  competitor: number;
  merchantChange: number;
  competitorChange: number;
}

export interface ChartTypeOption {
  value: ChartType;
  label: string;
}

export interface TimelineOption {
  value: TimelineType;
  label: string;
}

export interface PresentationalTimeSeriesChartProps {
  // Data props
  chartData?: ChartDataPoint[];
  
  // Display props
  yAxisMode?: 'absolute' | 'percentage';
  showCompetitor?: boolean;
  yearOverYear?: boolean;
  allowedChartTypes?: ChartType[];
  colors?: {
    merchant: string;
    competitor: string;
  };
  formatValue?: (value: number) => string;
  labels?: {
    merchant: string;
    competitor: string;
  };
  
  // State props
  isLoading?: boolean;
  error?: string | null;
  
  // Interaction props
  onTimelineChange?: (timeline: TimelineType) => void;
  timeline?: TimelineType;
  
  // Layout props
  title?: string;
  className?: string;
}

/**
 * Presentational Time Series Chart Component
 * 
 * Pure UI component that renders chart data passed as props.
 * No Redux connections, no store dependencies, no data processing.
 */
const PresentationalTimeSeriesChart: React.FC<PresentationalTimeSeriesChartProps> = ({
  // Data props
  chartData = [],
  
  // Display props
  yAxisMode = 'absolute',
  showCompetitor = true,
  yearOverYear = false,
  allowedChartTypes = ['line', 'bar', 'table'],
  colors = { merchant: '#007B85', competitor: '#73AA3C' },
  formatValue = (value: number) => value.toString(),
  labels = { merchant: 'Merchant', competitor: 'Competition' },
  
  // State props
  isLoading = false,
  error = null,
  
  // Interaction props
  onTimelineChange = () => {},
  timeline = 'daily',
  
  // Layout props
  title = '',
  className = ''
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<ChartType>(allowedChartTypes[0] || 'line');

  // Type-safe option generators
  const getChartTypeOptions = (): ChartTypeOption[] => {
    return allowedChartTypes.map(type => ({
      value: type,
      label: t(`chartOptions.${type === 'bar' ? 'bars' : type}`)
    }));
  };

  const getTimelineOptions = (): TimelineOption[] => {
    return [
      { value: 'daily', label: t('chartOptions.daily') },
      { value: 'weekly', label: t('chartOptions.weekly') },
      { value: 'monthly', label: t('chartOptions.monthly') }
    ];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="text-red-800">Error loading chart data: {error}</div>
      </div>
    );
  }

  // No data state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-gray-600 text-center">No data available for this metric</div>
      </div>
    );
  }

  // Value formatter based on Y-axis mode
  const valueFormatter = yAxisMode === 'percentage' 
    ? (value: number) => `${value}%` 
    : formatValue;

  // Table columns configuration
  const getTableColumns = () => {
    const columns = [
      {
        key: 'date',
        label: 'Date',
        render: (value: string) => value
      },
      {
        key: 'merchant',
        label: labels.merchant,
        render: (value: number, row: ChartDataPoint) => (
          <div className="flex items-center justify-between">
            <span>{valueFormatter(value)}</span>
            {yearOverYear && row.merchantChange !== undefined && (
              <ChangeIndicator 
                value={row.merchantChange}
                type="percentage"
                size="xs"
                className="ml-2"
              />
            )}
          </div>
        )
      }
    ];

    // Add competitor column if showing comparison
    if (showCompetitor) {
      columns.push({
        key: 'competitor',
        label: labels.competitor,
        render: (value: number, row: ChartDataPoint) => (
          <div className="flex items-center justify-between">
            <span>{valueFormatter(value)}</span>
            {yearOverYear && row.competitorChange !== undefined && (
              <ChangeIndicator 
                value={row.competitorChange}
                type="percentage"
                size="xs"
                className="ml-2"
              />
            )}
          </div>
        )
      });
    }

    return columns;
  };

  // Custom tooltip with year-over-year support
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const dataPoint = chartData.find(d => d.date === label);
          const change = entry.dataKey === 'merchant' 
            ? dataPoint?.merchantChange 
            : dataPoint?.competitorChange;
          
          return (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  {valueFormatter(entry.value)}
                </span>
                {/* Only show ChangeIndicator if NOT in percentage mode to avoid redundancy */}
                {yearOverYear && yAxisMode !== 'percentage' && change !== undefined && change !== 0 && (
                  <ChangeIndicator 
                    value={change}
                    type="percentage"
                    size="xs"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: CHART_CONFIG.margins
    };

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={valueFormatter} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="linear"
            dataKey="merchant"
            stroke={colors.merchant}
            strokeWidth={2}
            name={labels.merchant}
            isAnimationActive={false}
          />
          {showCompetitor && (
            <Line
              type="linear"
              dataKey="competitor"
              stroke={colors.competitor}
              strokeWidth={2}
              name={labels.competitor}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      );
    }

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={valueFormatter} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="merchant" 
            fill={colors.merchant} 
            name={labels.merchant} 
            isAnimationActive={false}
          />
          {showCompetitor && (
            <Bar 
              dataKey="competitor" 
              fill={colors.competitor} 
              name={labels.competitor} 
              isAnimationActive={false}
            />
          )}
        </BarChart>
      );
    }

    if (chartType === 'table') {
      return (
        <ChartTable
          data={chartData}
          columns={getTableColumns()}
        />
      );
    }

    return null;
  };

  // Type-safe event handlers
  const handleChartTypeChange = (value: string) => {
    setChartType(value as ChartType);
  };

  const handleTimelineChange = (value: string) => {
    onTimelineChange(value as TimelineType);
  };

  // Create controls for title row
  const controls = (
    <div className="flex gap-2">
      <ChartSelector
        type="chartType"
        value={chartType}
        onChange={handleChartTypeChange}
        options={getChartTypeOptions()}
        size="sm"
      />
      <ChartSelector
        type="timeline"
        value={timeline}
        onChange={handleTimelineChange}
        options={getTimelineOptions()}
        size="sm"
      />
    </div>
  );

  return (
    <ChartContainer title={title} className={className} controls={controls}>
      {/* Chart Rendering */}
      {chartType !== 'table' ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      ) : (
        renderChart()
      )}
    </ChartContainer>
  );
};

export default PresentationalTimeSeriesChart;