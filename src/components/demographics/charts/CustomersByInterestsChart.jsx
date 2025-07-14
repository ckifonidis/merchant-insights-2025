import { UniversalHorizontalBarChart } from '../../ui';

const CustomersByInterestsChart = ({ title }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <UniversalHorizontalBarChart
        metricId="converted_customers_by_interest"
        formatValue={(value) => `${value}%`}
        formatTooltipValue={(absoluteValue) => `${absoluteValue} customers`}
        maxCategories={8}
      />
    </div>
  );
};

export default CustomersByInterestsChart;