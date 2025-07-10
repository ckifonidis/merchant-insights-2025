import React from 'react';
import { TimeSeriesChart } from '../../ui';

/**
 * Transactions TimeSeries chart component for Dashboard
 * Encapsulates configuration and connects to store via dataType
 */
const TransactionsTimeSeriesChart = ({ title, filters }) => {
  return (
    <TimeSeriesChart
      filters={filters}
      dataType="transactions"
      title={title}
      showComparison={true}
      metricId="transactions_per_day"
    />
  );
};

export default TransactionsTimeSeriesChart;