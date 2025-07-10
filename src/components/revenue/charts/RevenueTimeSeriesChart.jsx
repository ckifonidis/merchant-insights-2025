import React from 'react';
import { TimeSeriesChart } from '../../ui';

/**
 * Revenue TimeSeries chart component for Revenue Tab
 * Encapsulates configuration and connects to store via dataType
 */
const RevenueTimeSeriesChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      filters={filters}
      dataType="revenue"
      title={title}
      showComparison={true}
      metricId="revenue_per_day"
    />
  );
};

export default RevenueTimeSeriesChart;