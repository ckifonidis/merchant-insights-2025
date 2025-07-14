import { UniversalBarChart } from '../../ui';

const CustomersByInterestsChart = ({ title }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <UniversalBarChart
        yAxisLabel ='Customers'
        metricId="converted_customers_by_interest"
        colors={{
          'SHOPINT1': '#F59E0B',
          'SHOPINT2': '#10B981',
          'SHOPINT3': '#3B82F6',
          'SHOPINT4': '#EF4444',
          'SHOPINT5': '#8B5CF6',
          'SHOPINT6': '#EC4899',
          'SHOPINT7': '#14B8A6',
          'SHOPINT8': '#F97316'
        }}
        formatValue={(value) => `${value}%`}
        formatTooltipValue={(absoluteValue) => `${absoluteValue} customers`}
        maxCategories={8}
      />
    </div>
  );
};

export default CustomersByInterestsChart;