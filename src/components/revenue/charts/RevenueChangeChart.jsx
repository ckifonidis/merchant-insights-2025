import React from 'react';
import { TimeSeriesChart } from '../../ui';

/**
 * Revenue Change chart component for Revenue Tab
 * Shows only percentage changes, not absolute values
 */
const RevenueChangeChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      filters={filters}
      dataType="revenue"
      title={title}
      showComparison={false}
      chartType="change"
      metricId="revenue_per_day"
    />
  );
};

export default RevenueChangeChart;