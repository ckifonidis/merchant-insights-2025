import { UniversalBarChart } from '../../ui';

const CustomersByAgeChart = ({ title }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <UniversalBarChart
        metricId="converted_customers_by_age"
        colors={{
          'gen_z': '#10B981',
          'millennials': '#3B82F6', 
          'gen_x': '#F59E0B',
          'boomers': '#EF4444',
          'silent': '#8B5CF6'
        }}
        formatValue={(value) => `${value}%`}
        formatTooltipValue={(absoluteValue) => `${absoluteValue} customers`}
        categoryLabels={{
          'gen_z': 'Generation Z (18-24)',
          'millennials': 'Millennials (25-40)',
          'gen_x': 'Generation X (41-56)', 
          'boomers': 'Baby Boomers (57-75)',
          'silent': 'Silent Generation (76-96)'
        }}
        maxCategories={8}
      />
    </div>
  );
};

export default CustomersByAgeChart;