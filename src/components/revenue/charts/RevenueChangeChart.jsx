import React from 'react';
import { TimeSeriesChart } from '../../ui';

/**
 * Revenue Change chart component for Revenue Tab
 * Shows percentage changes from previous year, not absolute values
 */
const RevenueChangeChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      metricId="revenue_per_day"
      yAxisMode="percentage"
      showCompetitor={true}
      dateRange={filters?.dateRange}
      yearOverYear={true} // Don't show YoY indicators since we're already showing percentages
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={(value) => `${value}%`}
      labels={{ merchant: 'Revenue Change', competitor: 'Competition Change' }}
      title={title}
    />
  );
};

export default RevenueChangeChart;