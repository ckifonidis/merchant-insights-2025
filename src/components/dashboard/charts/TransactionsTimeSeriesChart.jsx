import React from 'react';
import { TimeSeriesChart } from '../../ui';

/**
 * Transactions TimeSeries chart component for Dashboard
 * Bespoke component that passes configuration to universal component
 */
const TransactionsTimeSeriesChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      metricId="transactions_per_day"
      yAxisMode="absolute"
      showCompetitor={true}
      dateRange={filters?.dateRange}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={(value) => value.toLocaleString()}
      labels={{ merchant: 'Merchant', competitor: 'Competition' }}
      title={title}
    />
  );
};

export default TransactionsTimeSeriesChart;