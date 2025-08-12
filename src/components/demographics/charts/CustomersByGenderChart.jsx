import GenericBreakdownChartContainer from '../../containers/GenericBreakdownChartContainer';

/**
 * Customers by Gender bespoke chart component for Demographics Tab
 * Now uses smart/presentational pattern with GenericBreakdownChartContainer
 */
const CustomersByGenderChart = ({ title }) => {
  return (
    <GenericBreakdownChartContainer
      title={title}
      metricId="converted_customers_by_gender"
      colors={{
        'Male': '#3B82F6',
        'Female': '#F472B6'
      }}
      formatValue={(value) => `${value}%`}
      formatTooltipValue={(absoluteValue) => `${absoluteValue} customers`}
      showAbsoluteValues={true}
    />
  );
};

export default CustomersByGenderChart;