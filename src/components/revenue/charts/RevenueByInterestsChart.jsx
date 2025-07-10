import React from 'react';
import { UniversalBarChart } from '../../ui';

/**
 * Revenue by Shopping Interests bespoke chart component for Revenue Tab
 * Passes metricId to UniversalBarChart which handles data selection and percentage calculation
 */
const RevenueByInterestsChart = ({ title }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <UniversalBarChart
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
    </div>
  );
};

export default RevenueByInterestsChart;