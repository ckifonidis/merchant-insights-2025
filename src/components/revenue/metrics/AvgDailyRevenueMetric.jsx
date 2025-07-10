import React from 'react';
import { UniversalMetricCard } from '../../ui';
import { METRIC_VARIANTS } from '../../../utils/constants';

/**
 * Average Daily Revenue metric component for Revenue Tab
 * Encapsulates configuration and connects to store via metricId
 */
const AvgDailyRevenueMetric = ({ title }) => {
  return (
    <UniversalMetricCard
      variant={METRIC_VARIANTS.detailed}
      title={title}
      icon={
        <div className="text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
          </svg>
        </div>
      }
      metricId="avg_daily_revenue"
      valueType="currency"
    />
  );
};

export default AvgDailyRevenueMetric;