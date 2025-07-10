import React from 'react';
import { TimeSeriesChart } from '../../ui';

/**
 * Customers TimeSeries chart component for Dashboard
 * Encapsulates configuration and connects to store via dataType
 * Note: Customer data is merchant-only (no competition)
 */
const CustomersTimeSeriesChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      filters={filters}
      dataType="customers"
      title={title}
      showComparison={false}
      metricId="customers_per_day"
    />
  );
};

export default CustomersTimeSeriesChart;