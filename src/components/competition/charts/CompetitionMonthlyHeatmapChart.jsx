import React from 'react';
import GenericCalendarHeatmapContainer from '../../containers/GenericCalendarHeatmapContainer';

/**
 * Competition Monthly Heatmap chart component
 * Bespoke component that passes configuration to generic container
 * Shows monthly revenue data in calendar heatmap format
 * Now uses smart/presentational pattern with GenericCalendarHeatmapContainer
 */
const CompetitionMonthlyHeatmapChart = ({ title, filters }) => {
  return (
    <GenericCalendarHeatmapContainer
      title={title}
      metricId="revenue_per_day"
      valueLabel="Revenue"
      showMerchantAndCompetition={true}
      dateRange={filters?.dateRange}
    />
  );
};

export default CompetitionMonthlyHeatmapChart;