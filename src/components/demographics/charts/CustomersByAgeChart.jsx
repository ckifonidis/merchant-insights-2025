import GenericBarChartContainer from '../../containers/GenericBarChartContainer';

/**
 * Customers by Age Groups bespoke chart component for Demographics Tab
 * Now uses smart/presentational pattern with GenericBarChartContainer
 */
const CustomersByAgeChart = ({ title }) => {
  return (
    <GenericBarChartContainer
      title={title}
      metricId="converted_customers_by_age"
      merchantColor="#3B82F6"
      competitorColor="#73AA3C"
      yAxisLabel="%"
      formatValue={(value) => `${value}%`}
      formatTooltipValue={(absoluteValue) => `${absoluteValue} customers`}
      showAbsoluteValues={true}
      maxCategories={5}
    />
  );
};

export default CustomersByAgeChart;