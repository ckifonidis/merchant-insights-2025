import React from 'react';
import GenericMetricContainer from '../../containers/GenericMetricContainer';

/**
 * Competition Revenue bespoke metric component for Competition Tab
 * Now uses smart/presentational pattern with GenericMetricContainer
 */
const CompetitionRevenueMetric = ({ title }) => {
  return (
    <GenericMetricContainer
      title={title}
      metricId="total_revenue"
      valueType="currency"
      icon={
        <div className="text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
      }
      variant="competition"
    />
  );
};

export default CompetitionRevenueMetric;