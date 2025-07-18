import React from 'react';
import { UniversalCalendarHeatmap } from '../../ui';

/**
 * Competition Monthly Heatmap chart component
 * Bespoke component that passes configuration to universal component
 * Shows monthly revenue data in calendar heatmap format
 */
const CompetitionMonthlyHeatmapChart = ({ title, filters }) => {
  return (
    <UniversalCalendarHeatmap 
      metricId="revenue_per_day"
      title={title}
      valueLabel="Revenue"
      filters={filters}
      showMerchantAndCompetition={true}
    />
  );
};

export default CompetitionMonthlyHeatmapChart;