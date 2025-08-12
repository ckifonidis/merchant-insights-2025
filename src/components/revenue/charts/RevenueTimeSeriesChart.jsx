import React from 'react';
import GenericTimeSeriesChartContainer from '../../containers/GenericTimeSeriesChartContainer';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Revenue TimeSeries chart component for Revenue Tab
 * Now uses smart/presentational pattern with GenericTimeSeriesChartContainer
 */
const RevenueTimeSeriesChart = ({ title, filters }) => {
  return (
    <GenericTimeSeriesChartContainer
      title={title}
      metricId="revenue_per_day"
      yAxisMode="absolute"
      showCompetitor={true}
      dateRange={filters?.dateRange}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={formatCurrency}
      labels={{ merchant: 'Merchant', competitor: 'Competition' }}
    />
  );
};

export default RevenueTimeSeriesChart;