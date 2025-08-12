import React from 'react';
import GenericMetricContainer from '../../containers/GenericMetricContainer';

/**
 * Competition Average Transaction bespoke metric component for Competition Tab
 * Now uses smart/presentational pattern with GenericMetricContainer
 */
const CompetitionAvgTransactionMetric = ({ title }) => {
  return (
    <GenericMetricContainer
      title={title}
      metricId="avg_ticket_per_user"
      valueType="currency"
      icon={
        <div className="text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      }
      variant="competition"
    />
  );
};

export default CompetitionAvgTransactionMetric;