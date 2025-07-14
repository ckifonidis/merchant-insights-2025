import { useTranslation } from 'react-i18next';
import { UniversalBreakdownChart } from '../../ui';

const CustomersByGenderChart = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <UniversalBreakdownChart
        metricId="converted_customers_by_gender"
        colors={{
          'male': '#3B82F6',
          'female': '#F472B6',
          'Male': '#3B82F6',
          'Female': '#F472B6'
        }}
        formatValue={(value) => `${value}%`}
        formatTooltipValue={(absoluteValue) => `${absoluteValue} customers`}
        categoryLabels={{
          'male': t('genders.male'),
          'female': t('genders.female')
        }}
      />
    </div>
  );
};

export default CustomersByGenderChart;