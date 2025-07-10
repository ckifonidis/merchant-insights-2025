import React from 'react';
import { TimeSeriesChart } from '../../ui';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Revenue TimeSeries chart component for Revenue Tab
 * Bespoke component that passes configuration to universal component
 */
const RevenueTimeSeriesChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      metricId="revenue_per_day"
      yAxisMode="absolute"
      showCompetitor={true}
      dateRange={filters?.dateRange}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={formatCurrency}
      labels={{ merchant: 'Merchant', competitor: 'Competition' }}
      title={title}
    />
  );
};

export default RevenueTimeSeriesChart;