import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateTimeSeriesData } from '../../../data/mockData';
import { processTimelineData } from '../../../utils/timelineHelpers';
import ChartContainer from './ChartContainer';
import ChartSelector from './ChartSelector';
import ChartTooltip from './ChartTooltip';
import ChartTable from './ChartTable';
import { ChangeIndicator } from '../metrics';
import { formatCurrency } from '../../../utils/formatters';
import { COLORS, CHART_CONFIG } from '../../../utils/constants';
import { useTimeSeriesChartDataReadOnly } from '../../../hooks/useNormalizedData.js';

/**
 * Transform API data to chart format
 * The apiData comes from dashboard transformation and has structure:
 * { merchant: [{date, value, formattedDate}], competitor: [{date, value, formattedDate}] }
 */
const transformApiDataToChartFormat = (apiData, dataType) => {
  if (!apiData || (!apiData.merchant && !apiData.competitor)) {
    console.warn('⚠️ No API data available for chart:', dataType);
    return [];
  }

  // Get merchant and competitor data arrays
  const merchantData = apiData.merchant || [];
  const competitorData = apiData.competitor || [];



  // Create a map of dates to values
  const dataMap = new Map();

  // Get the correct property names for this data type
  const keys = getDataKey(dataType);

  // Process merchant data
  merchantData.forEach(item => {
    dataMap.set(item.date, {
      date: item.date,
      displayDate: item.formattedDate || item.date,
      // Use the property names expected by processTimelineData
      merchantRevenue: dataType === 'revenue' ? item.value : 0,
      merchantTransactions: dataType === 'transactions' ? item.value : 0,
      merchantCustomers: dataType === 'customers' ? item.value : 0,
      // Initialize competitor values
      competitorRevenue: 0,
      competitorTransactions: 0,
      competitorCustomers: 0
    });
  });

  // Process competitor data
  competitorData.forEach(item => {
    const existing = dataMap.get(item.date) || {
      date: item.date,
      displayDate: item.formattedDate || item.date,
      merchantRevenue: 0,
      merchantTransactions: 0,
      merchantCustomers: 0,
      competitorRevenue: 0,
      competitorTransactions: 0,
      competitorCustomers: 0
    };
    
    // Set competitor values based on dataType
    if (dataType === 'revenue') existing.competitorRevenue = item.value;
    if (dataType === 'transactions') existing.competitorTransactions = item.value;
    if (dataType === 'customers') existing.competitorCustomers = item.value;
    
    dataMap.set(item.date, existing);
  });

  // Convert map to array and sort by date
  return Array.from(dataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Get data keys based on chart type
 */
const getDataKey = (dataType) => {
  switch (dataType) {
    case 'revenue':
      return { merchant: 'merchantRevenue', competitor: 'competitorRevenue' };
    case 'transactions':
      return { merchant: 'merchantTransactions', competitor: 'competitorTransactions' };
    case 'customers':
      return { merchant: 'merchantCustomers', competitor: 'competitorCustomers' };
    default:
      return { merchant: 'merchantRevenue', competitor: 'competitorRevenue' };
  }
};

/**
 * Universal TimeSeriesChart component that handles revenue, transactions, and customers
 * Consolidates RevenueChart, TransactionsChart, and CustomersChart
 */
const TimeSeriesChart = ({
  filters,
  dataType = 'revenue', // 'revenue', 'transactions', 'customers'
  title,
  showComparison = true, // Whether to show merchant vs competition
  valueFormatter = null, // Custom formatter function
  unit = '', // Unit to display (e.g., '€', 'transactions')
  className = '',
  metricId = null, // Connect to store via metricId
  yAxisMode = 'absolute', // NEW: 'absolute' | 'percentage_change'
  metricConfig = {} // NEW: Configuration from tabConfigs.json
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');
  const [timeline, setTimeline] = useState('daily');

  // Connect to store when metricId is provided
  const storeData = metricId ? useTimeSeriesChartDataReadOnly(metricId) : null;
  
  // Show loading state if data is being fetched
  if (metricId && storeData?.isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Show error state if metricId provided but no store connection
  if (metricId && !storeData) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="text-red-800">Error: Unable to connect to chart data store</div>
      </div>
    );
  }

  // Use store data only - no fallback to mock data
  const rawData = storeData?.chartData;



  // Process data based on timeline selection
  let processedData = [];

  if (rawData) {
    console.log(`🔍 TimeSeriesChart DEBUG - rawData format:`, {
      rawDataType: typeof rawData,
      isArray: Array.isArray(rawData),
      rawDataKeys: typeof rawData === 'object' ? Object.keys(rawData) : 'not object',
      rawData: rawData
    });

    // The rawData from selector is in format: { merchant: [...], competitor: [...] }
    // We need to transform this to unified array format for processTimelineData
    
    if (rawData.merchant || rawData.competitor) {
      // Transform chart data to unified array format
      const transformedData = transformApiDataToChartFormat(rawData, dataType);
      
      processedData = processTimelineData(
        transformedData,
        timeline,
        filters?.dateRange?.start ? new Date(filters.dateRange.start) : null,
        filters?.dateRange?.end ? new Date(filters.dateRange.end) : null
      );
    } else if (Array.isArray(rawData)) {
      // Fallback: Already in array format
      processedData = processTimelineData(
        rawData,
        timeline,
        filters?.dateRange?.start ? new Date(filters.dateRange.start) : null,
        filters?.dateRange?.end ? new Date(filters.dateRange.end) : null
      );
    } else {
      console.log(`⚠️ TimeSeriesChart: Unexpected rawData format:`, rawData);
      processedData = [];
    }
  }

  // Show no data state if no data available
  if (!rawData || processedData.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-gray-600 text-center">No data available for this metric</div>
      </div>
    );
  }

  // Data mapping based on type
  const getDataMapping = () => {
    switch (dataType) {
      case 'revenue':
        return {
          merchantKey: 'merchantRevenue',
          competitorKey: 'competitorRevenue',
          merchantLabel: 'merchant',
          competitorLabel: 'competitor',
          defaultFormatter: formatCurrency,
          isCurrency: true
        };
      case 'transactions':
        return {
          merchantKey: 'merchantTransactions',
          competitorKey: 'competitorTransactions',
          merchantLabel: 'merchant',
          competitorLabel: 'competitor',
          defaultFormatter: (value) => `${value}`,
          isCurrency: false
        };
      case 'customers':
        return {
          merchantKey: 'merchantCustomers',
          competitorKey: null, // No competitor data for customers
          merchantLabel: 'customers',
          competitorLabel: null,
          defaultFormatter: (value) => `${value}`,
          isCurrency: false
        };
      default:
        return {
          merchantKey: 'merchantRevenue',
          competitorKey: 'competitorRevenue',
          merchantLabel: 'merchant',
          competitorLabel: 'competitor',
          defaultFormatter: formatCurrency,
          isCurrency: true
        };
    }
  };

  const dataMapping = getDataMapping();
  
  // Apply Y-axis mode transformation
  const transformDataForYAxis = (data, mode) => {
    if (mode === 'percentage_change') {
      // Calculate percentage change from previous year for each data point
      // For now, using mock percentage change data
      // TODO: Implement real percentage change calculation when previous year API data is available
      return data.map(item => ({
        ...item,
        [dataMapping.merchantKey]: ((Math.random() - 0.5) * 40).toFixed(1), // -20% to +20%
        [dataMapping.competitorKey]: dataMapping.competitorKey ? 
          ((Math.random() - 0.5) * 30).toFixed(1) : undefined // -15% to +15%
      }));
    }
    return data; // Return absolute values unchanged
  };

  // Apply Y-axis transformation
  const yAxisTransformedData = transformDataForYAxis(processedData, yAxisMode);
  
  // Update formatter based on Y-axis mode
  const formatter = valueFormatter || (yAxisMode === 'percentage_change' 
    ? (value) => `${value}%` 
    : dataMapping.defaultFormatter);

  // Transform data for chart
  const chartData = yAxisTransformedData.map(item => {
    const result = {
      date: item.displayDate,
      [dataMapping.merchantLabel]: dataMapping.merchantKey ? 
        (yAxisMode === 'percentage_change' ? 
          parseFloat(item[dataMapping.merchantKey]) : 
          Math.round(item[dataMapping.merchantKey])) : 0,
      merchantChange: ((Math.random() - 0.5) * 20).toFixed(1)
    };

    // Add competitor data if available
    if (showComparison && dataMapping.competitorKey) {
      result[dataMapping.competitorLabel] = yAxisMode === 'percentage_change' ? 
        parseFloat(item[dataMapping.competitorKey]) : 
        Math.round(item[dataMapping.competitorKey]);
      result.competitorChange = ((Math.random() - 0.5) * 15).toFixed(1);
    }

    return result;
  });

  // Table columns configuration
  const getTableColumns = () => {
    const columns = [
      {
        key: 'date',
        label: 'Date',
        render: (value) => value
      },
      {
        key: dataMapping.merchantLabel,
        label: t('dashboard.merchant'),
        render: (value, row) => (
          <div className="flex items-center justify-between">
            <span>{formatter(value)}{unit}</span>
            {row.merchantChange !== undefined && (
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
    if (showComparison && dataMapping.competitorLabel) {
      columns.push({
        key: dataMapping.competitorLabel,
        label: t('dashboard.competition'),
        render: (value, row) => (
          <div className="flex items-center justify-between">
            <span>{formatter(value)}{unit}</span>
            {row.competitorChange !== undefined && (
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
          <YAxis tickFormatter={formatter} />
          <Tooltip content={<ChartTooltip currency={dataMapping.isCurrency} showChange={true} />} />
          <Legend />
          <Line
            type="linear"
            dataKey={dataMapping.merchantLabel}
            stroke={COLORS.merchant}
            strokeWidth={2}
            name={t('dashboard.merchant')}
          />
          {showComparison && dataMapping.competitorLabel && (
            <Line
              type="linear"
              dataKey={dataMapping.competitorLabel}
              stroke={COLORS.competition}
              strokeWidth={2}
              name={t('dashboard.competition')}
            />
          )}
        </LineChart>
      );
    }

    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={formatter} />
        <Tooltip content={<ChartTooltip currency={dataMapping.isCurrency} showChange={true} />} />
        <Legend />
        <Bar 
          dataKey={dataMapping.merchantLabel} 
          fill={COLORS.merchant} 
          name={t('dashboard.merchant')} 
        />
        {showComparison && dataMapping.competitorLabel && (
          <Bar 
            dataKey={dataMapping.competitorLabel} 
            fill={COLORS.competition} 
            name={t('dashboard.competition')} 
          />
        )}
      </BarChart>
    );
  };

  return (
    <ChartContainer
      title={title}
      height={chartType === 'table' ? 'auto' : CHART_CONFIG.heights.default}
      controls={[
        <ChartSelector 
          key="chartType"
          type="chartType"
          value={chartType}
          onChange={setChartType}
        />,
        <ChartSelector 
          key="timeline"
          type="timeline"
          value={timeline}
          onChange={setTimeline}
          dateRange={filters?.dateRange}
        />
      ]}
      contentClassName={chartType === 'table' ? 'max-h-80 overflow-y-auto' : ''}
      className={className}
    >
      {chartType === 'table' ? (
        <ChartTable 
          data={chartData}
          columns={getTableColumns()}
          currency={dataMapping.isCurrency}
          showChange={true}
        />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default TimeSeriesChart;