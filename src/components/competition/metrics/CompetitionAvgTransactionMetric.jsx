import React from 'react';
import { UniversalMetricCard } from '../../ui';
import { METRIC_VARIANTS } from '../../../utils/constants';

/**
 * Competition Average Transaction metric component
 * Encapsulates configuration and connects to store via metricId
 */
const CompetitionAvgTransactionMetric = ({ title }) => {
  return (
    <UniversalMetricCard
      variant={METRIC_VARIANTS.competition}
      title={title}
      icon={
        <div className="text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      }
      metricId="avg_ticket_per_user"
    />
  );
};

export default CompetitionAvgTransactionMetric;