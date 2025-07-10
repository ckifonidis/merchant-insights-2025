import React from 'react';
import { TimeSeriesChart } from '../../ui';

/**
 * Customers TimeSeries chart component for Dashboard
 * Bespoke component that passes configuration to universal component
 * Note: Customer data is merchant-only (no competition)
 */
const CustomersTimeSeriesChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      metricId="customers_per_day"
      yAxisMode="absolute"
      showCompetitor={false}
      dateRange={filters?.dateRange}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={(value) => value.toLocaleString()}
      labels={{ merchant: 'Customers', competitor: 'Competition' }}
      title={title}
    />
  );
};

export default CustomersTimeSeriesChart;