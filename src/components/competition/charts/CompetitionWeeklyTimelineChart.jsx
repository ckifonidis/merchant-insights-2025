import React from 'react';
import GenericTimeSeriesChartContainer from '../../containers/GenericTimeSeriesChartContainer';

/**
 * Competition Weekly Timeline bespoke chart component for Competition Tab
 * Shows week-over-week percentage changes for merchant vs competition
 * Now uses smart/presentational pattern with GenericTimeSeriesChartContainer
 */
const CompetitionWeeklyTimelineChart = ({ title, filters }) => {
  return (
    <GenericTimeSeriesChartContainer
      title={title}
      metricId="revenue_per_day"
      yAxisMode="percentage"
      showCompetitor={true}
      dateRange={filters?.dateRange}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={(value) => `${value.toFixed(1)}%`}
      labels={{ merchant: 'Merchant', competitor: 'Competition' }}
    />
  );
};

export default CompetitionWeeklyTimelineChart;