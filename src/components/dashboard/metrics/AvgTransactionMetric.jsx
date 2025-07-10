import React from 'react';
import { UniversalMetricCard } from '../../ui';
import { METRIC_VARIANTS } from '../../../utils/constants';

/**
 * Average Transaction metric component for Dashboard
 * Encapsulates configuration and connects to store via metricId
 */
const AvgTransactionMetric = ({ title }) => {
  return (
    <UniversalMetricCard
      variant={METRIC_VARIANTS.detailed}
      title={title}
      icon={
        <div className="text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
        </div>
      }
      metricId="avg_ticket_per_user"
      valueType="currency"
    />
  );
};

export default AvgTransactionMetric;