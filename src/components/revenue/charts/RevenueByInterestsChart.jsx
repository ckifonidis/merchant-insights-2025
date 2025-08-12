import React from 'react';
import GenericBarChartContainer from '../../containers/GenericBarChartContainer';

/**
 * Revenue by Shopping Interests bespoke chart component for Revenue Tab
 * Now uses smart/presentational pattern with GenericBarChartContainer
 */
const RevenueByInterestsChart = ({ title }) => {
  return (
    <GenericBarChartContainer
      title={title}
      metricId="converted_customers_by_interest"
      merchantColor="#007B85"
      competitorColor="#73AA3C"
      yAxisLabel="%"
      formatValue={(value) => `${value}%`}
      formatTooltipValue={(absoluteValue) => 
        new Intl.NumberFormat('el-GR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(absoluteValue)
      }
      showAbsoluteValues={true}
      maxCategories={6}
    />
  );
};

export default RevenueByInterestsChart;