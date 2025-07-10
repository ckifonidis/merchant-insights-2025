import React from 'react';
import { UniversalBreakdownChart } from '../../ui';

/**
 * Revenue by Channel bespoke chart component for Revenue Tab
 * Passes metricId to UniversalBreakdownChart which handles data selection and percentage calculation
 */
const RevenueByChannelChart = ({ title }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <UniversalBreakdownChart
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
    </div>
  );
};

export default RevenueByChannelChart;