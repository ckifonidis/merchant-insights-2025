import React from 'react';
import GenericTimeSeriesChartContainer from '../../containers/GenericTimeSeriesChartContainer';

/**
 * Revenue Change chart component for Revenue Tab
 * Shows percentage changes from previous year, not absolute values
 * Now uses smart/presentational pattern with GenericTimeSeriesChartContainer
 */
const RevenueChangeChart = ({ title, filters }) => {
  return (
    <GenericTimeSeriesChartContainer
      title={title}
      metricId="revenue_per_day"
      yAxisMode="percentage"
      showCompetitor={true}
      dateRange={filters?.dateRange}
      yearOverYear={true} // Don't show YoY indicators since we're already showing percentages
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={(value) => `${value}%`}
      labels={{ merchant: 'Revenue Change', competitor: 'Competition Change' }}
    />
  );
};

export default RevenueChangeChart;