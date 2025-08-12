import GenericBarChartContainer from '../../containers/GenericBarChartContainer';

/**
 * Customers by Shopping Interests bespoke chart component for Demographics Tab
 * Now uses smart/presentational pattern with GenericBarChartContainer
 */
const CustomersByInterestsChart = ({ title }) => {
  return (
    <GenericBarChartContainer
      title={title}
      metricId="converted_customers_by_interest"
      merchantColor="#3B82F6"
      competitorColor="#73AA3C"
      yAxisLabel="%"
      formatValue={(value) => `${value}%`}
      formatTooltipValue={(absoluteValue) => `${absoluteValue} customers`}
      showAbsoluteValues={true}
      maxCategories={8}
    />
  );
};

export default CustomersByInterestsChart;