import React from 'react';
import GenericMetricContainer from '../../containers/GenericMetricContainer';

/**
 * Competition Transactions bespoke metric component for Competition Tab
 * Now uses smart/presentational pattern with GenericMetricContainer
 */
const CompetitionTransactionsMetric = ({ title }) => {
  return (
    <GenericMetricContainer
      title={title}
      metricId="total_transactions"
      valueType="number"
      icon={
        <div className="text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
      }
      variant="competition"
    />
  );
};

export default CompetitionTransactionsMetric;