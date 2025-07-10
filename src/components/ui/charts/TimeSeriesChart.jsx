import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { processTimelineData } from '../../../utils/timelineHelpers';
import ChartContainer from './ChartContainer';
import ChartSelector from './ChartSelector';
import ChartTooltip from './ChartTooltip';
import ChartTable from './ChartTable';
import { ChangeIndicator } from '../metrics';
import { CHART_CONFIG } from '../../../utils/constants';

/**
 * Simplified Universal TimeSeriesChart Component
 * 
 * Takes raw store data and performs all transformations internally.
 * Follows the established bespoke → universal pattern.
 */
const TimeSeriesChart = ({
  // 1. Metric ID to get data from store
  metricId,
  
  // 2. Y-axis mode
  yAxisMode = 'absolute', // 'absolute' | 'percentage'
  
  // 3. Competitor flag
  showCompetitor = true,
  
  // 4. Filter values for aggregation options
  dateRange = null,
  
  // 5. Year over year comparison
  yearOverYear = false,
  
  // 6. Chart type control
  allowedChartTypes = ['line', 'bar', 'table'],
  
  // 7. Colors
  colors = { merchant: '#007B85', competitor: '#73AA3C' },
  
  // 8. Value formatter
  formatValue = (value) => value.toString(),
  
  // 9. Labels
  labels = { merchant: 'Merchant', competitor: 'Competition' },
  
  // Additional props
  title = '',
  className = ''
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState(allowedChartTypes[0] || 'line');
  const [timeline, setTimeline] = useState('daily');

  // Get raw data from store
  const rawStoreData = useSelector(state => state.data.metrics[metricId]);
  const isLoading = useSelector(state => state.data.loading.specificMetrics[metricId]);
  const error = useSelector(state => state.data.errors.specificMetrics[metricId]);

  // Check if metric exists in store
  if (!rawStoreData && metricId) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="text-red-800">Error: Unable to connect to metric data store for metricId: {metricId}</div>
        <div className="text-red-600 text-sm mt-1">Available metrics: revenue_per_day, transactions_per_day, customers_per_day</div>
      </div>
    );
  }

  // Transform raw store data to chart format
  const transformedData = useMemo(() => {
    if (!rawStoreData) return null;

    const transformEntity = (entityData, entityType) => {
      if (!entityData || !entityData.current) return [];

      const currentData = entityData.current;
      const previousData = entityData.previous || {};

      // Debug the data structure first
      console.log(`📊 Entity data structure for ${entityType}:`, {
        hasEntityData: !!entityData,
        hasCurrent: !!entityData.current,
        hasPrevious: !!entityData.previous,
        currentKeys: Object.keys(currentData),
        previousKeys: Object.keys(previousData),
        sampleCurrent: Object.entries(currentData)[0],
        samplePrevious: Object.entries(previousData)[0]
      });

      return Object.entries(currentData).map(([date, value]) => {
        const currentValue = parseFloat(value) || 0;
        
        // Map current year date to previous year date
        // e.g., "2025-06-13" -> "2024-06-13"
        const currentDate = new Date(date);
        const previousYear = currentDate.getFullYear() - 1;
        const previousDateKey = `${previousYear}-${date.substring(5)}`; // Keep month-day, change year
        
        const previousValue = parseFloat(previousData[previousDateKey]);
        let yearOverYearChange = 0;
        
        console.log(`📊 Date mapping for ${date}:`, {
          currentDate: date,
          previousDateKey,
          currentValue,
          rawPrevious: previousData[previousDateKey],
          previousValue,
          hasMatch: previousData.hasOwnProperty(previousDateKey)
        });
        
        if (previousValue !== undefined && !isNaN(previousValue) && previousValue > 0) {
          yearOverYearChange = (((currentValue - previousValue) / previousValue) * 100);
          console.log(`📊 YoY calculation: ((${currentValue} - ${previousValue}) / ${previousValue}) * 100 = ${yearOverYearChange.toFixed(1)}%`);
        } else if (currentValue > 0 && (isNaN(previousValue) || previousValue === 0)) {
          yearOverYearChange = 100;
          console.log(`📊 No previous data or zero previous: 100%`);
        } else if (currentValue === 0 && previousValue > 0) {
          yearOverYearChange = -100;
          console.log(`📊 Complete decrease: -100%`);
        }

        return {
          date,
          formattedDate: new Date(date).toLocaleDateString(),
          value: currentValue,
          yearOverYearChange: parseFloat(yearOverYearChange.toFixed(1))
        };
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    return {
      merchant: transformEntity(rawStoreData.merchant, 'merchant'),
      competitor: showCompetitor ? transformEntity(rawStoreData.competitor, 'competitor') : []
    };
  }, [rawStoreData, showCompetitor]);

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
  if (!transformedData || !transformedData.merchant || transformedData.merchant.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-gray-600 text-center">No data available for this metric</div>
      </div>
    );
  }

  // Prepare current and previous year data separately for aggregation
  const currentYearData = transformedData.merchant.map((item, index) => ({
    date: item.date,
    displayDate: item.formattedDate,
    merchantRevenue: item.value,
    competitorRevenue: showCompetitor && transformedData.competitor?.[index] ? transformedData.competitor[index].value : 0
  }));

  // Create previous year data by mapping dates back one year
  const previousYearData = transformedData.merchant.map((item, index) => {
    const currentDate = new Date(item.date);
    const previousYear = currentDate.getFullYear() - 1;
    const previousDateKey = `${previousYear}-${item.date.substring(5)}`;
    
    // Find the previous year values from our raw store data
    const previousMerchantValue = rawStoreData.merchant?.previous?.[previousDateKey] || 0;
    const previousCompetitorValue = showCompetitor && rawStoreData.competitor?.previous?.[previousDateKey] || 0;

    return {
      date: previousDateKey,
      displayDate: new Date(previousDateKey).toLocaleDateString(),
      merchantRevenue: previousMerchantValue,
      competitorRevenue: previousCompetitorValue
    };
  });

  // Aggregate both current and previous year data
  const aggregatedCurrent = processTimelineData(
    currentYearData,
    timeline,
    dateRange?.start ? new Date(dateRange.start) : null,
    dateRange?.end ? new Date(dateRange.end) : null
  );

  const aggregatedPrevious = processTimelineData(
    previousYearData,
    timeline,
    // Map date range back one year for previous data
    dateRange?.start ? new Date(new Date(dateRange.start).getFullYear() - 1, new Date(dateRange.start).getMonth(), new Date(dateRange.start).getDate()) : null,
    dateRange?.end ? new Date(new Date(dateRange.end).getFullYear() - 1, new Date(dateRange.end).getMonth(), new Date(dateRange.end).getDate()) : null
  );

  // Calculate YoY percentages between aggregated timeframes
  const processedData = aggregatedCurrent.map((currentItem, index) => {
    const previousItem = aggregatedPrevious[index];
    
    let merchantYoY = 0;
    let competitorYoY = 0;
    
    if (previousItem) {
      if (previousItem.merchantRevenue > 0) {
        merchantYoY = (((currentItem.merchantRevenue - previousItem.merchantRevenue) / previousItem.merchantRevenue) * 100);
      }
      if (showCompetitor && previousItem.competitorRevenue > 0) {
        competitorYoY = (((currentItem.competitorRevenue - previousItem.competitorRevenue) / previousItem.competitorRevenue) * 100);
      }
    }

    return {
      ...currentItem,
      merchantChange: parseFloat(merchantYoY.toFixed(1)),
      competitorChange: parseFloat(competitorYoY.toFixed(1))
    };
  });

  console.log('📊 Aggregated timeline comparison:', {
    timeline,
    currentLength: aggregatedCurrent.length,
    previousLength: aggregatedPrevious.length,
    sampleCurrent: aggregatedCurrent[0],
    samplePrevious: aggregatedPrevious[0],
    sampleWithYoY: processedData[0]
  });

  // Transform data for chart rendering
  const chartData = processedData.map(item => ({
    date: item.displayDate,
    merchant: yAxisMode === 'percentage' ? (item.merchantChange || 0) : (item.merchantRevenue || 0),
    competitor: showCompetitor ? 
      (yAxisMode === 'percentage' ? (item.competitorChange || 0) : (item.competitorRevenue || 0)) : 0,
    merchantChange: item.merchantChange || 0,
    competitorChange: item.competitorChange || 0
  }));

  // Update formatter based on Y-axis mode
  const valueFormatter = yAxisMode === 'percentage' 
    ? (value) => `${value}%` 
    : formatValue;

  // Table columns configuration
  const getTableColumns = () => {
    const columns = [
      {
        key: 'date',
        label: 'Date',
        render: (value) => value
      },
      {
        key: 'merchant',
        label: labels.merchant,
        render: (value, row) => (
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
        render: (value, row) => (
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

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: CHART_CONFIG.margins
    };

    // Custom tooltip with year-over-year support
    const CustomTooltip = ({ active, payload, label }) => {
      if (!active || !payload || !payload.length) return null;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => {
            const dataPoint = chartData.find(d => d.date === label);
            const change = entry.dataKey === 'merchant' 
              ? dataPoint?.merchantChange 
              : dataPoint?.competitorChange;
            
            console.log('📊 Tooltip debug:', {
              label,
              entryDataKey: entry.dataKey,
              dataPoint,
              change,
              yearOverYear,
              chartDataSample: chartData[0]
            });
            
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
                  {yearOverYear && change !== undefined && change !== 0 && (
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
          />
          {showCompetitor && (
            <Line
              type="linear"
              dataKey="competitor"
              stroke={colors.competitor}
              strokeWidth={2}
              name={labels.competitor}
            />
          )}
        </LineChart>
      );
    }

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
        />
        {showCompetitor && (
          <Bar 
            dataKey="competitor" 
            fill={colors.competitor} 
            name={labels.competitor} 
          />
        )}
      </BarChart>
    );
  };

  // Create chart type options for ChartSelector
  const chartTypeOptions = allowedChartTypes
    .filter(type => ['line', 'bar', 'table'].includes(type))
    .map(type => ({
      value: type,
      label: type === 'line' ? 'Line Chart' : 
             type === 'bar' ? 'Bar Chart' : 
             'Table View'
    }));

  return (
    <ChartContainer
      title={title}
      height={chartType === 'table' ? 'auto' : CHART_CONFIG.heights.default}
      controls={[
        chartTypeOptions.length > 1 && (
          <ChartSelector 
            key="chartType"
            type="chartType"
            value={chartType}
            onChange={setChartType}
            options={chartTypeOptions}
          />
        ),
        <ChartSelector 
          key="timeline"
          type="timeline"
          value={timeline}
          onChange={setTimeline}
          dateRange={dateRange}
        />
      ].filter(Boolean)}
      contentClassName={chartType === 'table' ? 'max-h-80 overflow-y-auto' : ''}
      className={className}
    >
      {chartType === 'table' ? (
        <ChartTable 
          data={chartData}
          columns={getTableColumns()}
          showChange={yearOverYear}
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