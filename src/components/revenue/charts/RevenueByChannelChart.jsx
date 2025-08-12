import React from 'react';
import GenericBreakdownChartContainer from '../../containers/GenericBreakdownChartContainer';

/**
 * Revenue by Channel bespoke chart component for Revenue Tab
 * Now uses smart/presentational pattern with GenericBreakdownChartContainer
 */
const RevenueByChannelChart = ({ title }) => {
  return (
    <GenericBreakdownChartContainer
      title={title}
      metricId="revenue_by_channel"
      colors={{
        'Physical Store': '#007B85',
        'E-commerce': '#7BB3C0'
      }}
      formatValue={(value) => `${value}%`}
      formatTooltipValue={(absoluteValue) => 
        new Intl.NumberFormat('el-GR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(absoluteValue)
      }
      showAbsoluteValues={true}
    />
  );
};

export default RevenueByChannelChart;