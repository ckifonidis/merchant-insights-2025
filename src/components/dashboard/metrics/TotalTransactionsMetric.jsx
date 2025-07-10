import React from 'react';
import { UniversalMetricCard } from '../../ui';
import { METRIC_VARIANTS } from '../../../utils/constants';

/**
 * Total Transactions metric component for Dashboard
 * Encapsulates configuration and connects to store via metricId
 */
const TotalTransactionsMetric = ({ title }) => {
  return (
    <UniversalMetricCard
      variant={METRIC_VARIANTS.detailed}
      title={title}
      icon={
        <div className="text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="8" x2="21" y2="8"></line>
            <path d="M16 4h-8v4h8V4z"></path>
          </svg>
        </div>
      }
      metricId="total_transactions"
      valueType="number"
    />
  );
};

export default TotalTransactionsMetric;