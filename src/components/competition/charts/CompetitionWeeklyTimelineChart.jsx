import React from 'react';
import { TimeSeriesChart } from '../../ui';

/**
 * Competition Weekly Timeline chart component
 * Bespoke component that passes configuration to universal component
 * Shows week-over-week percentage changes for merchant vs competition
 */
const CompetitionWeeklyTimelineChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      metricId="revenue_per_day"
      yAxisMode="percentage"
      showCompetitor={true}
      dateRange={filters?.dateRange}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={(value) => `${value.toFixed(1)}%`}
      labels={{ merchant: 'Merchant', competitor: 'Competition' }}
      title={title}
    />
  );
};

export default CompetitionWeeklyTimelineChart;