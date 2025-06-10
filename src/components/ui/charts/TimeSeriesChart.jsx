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
  className = ''
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');
  const [timeline, setTimeline] = useState('daily');

  // Generate mock data filtered by date range
  const rawData = generateTimeSeriesData(
    filters?.dateRange?.start,
    filters?.dateRange?.end
  );

  // Process data based on timeline selection
  const processedData = processTimelineData(
    rawData,
    timeline,
    filters?.dateRange?.start ? new Date(filters.dateRange.start) : null,
    filters?.dateRange?.end ? new Date(filters.dateRange.end) : null
  );

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
  const formatter = valueFormatter || dataMapping.defaultFormatter;

  // Transform data for chart
  const chartData = processedData.map(item => {
    const result = {
      date: item.displayDate,
      [dataMapping.merchantLabel]: dataMapping.merchantKey ? 
        Math.round(item[dataMapping.merchantKey]) : 0,
      merchantChange: ((Math.random() - 0.5) * 20).toFixed(1)
    };

    // Add competitor data if available
    if (showComparison && dataMapping.competitorKey) {
      result[dataMapping.competitorLabel] = Math.round(item[dataMapping.competitorKey]);
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