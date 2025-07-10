import React from 'react';
import { UniversalMetricCard } from '../../ui';
import { METRIC_VARIANTS } from '../../../utils/constants';
import { useTranslation } from 'react-i18next';

/**
 * Go For More Total metric component for Revenue Tab
 * Merchant-only metric (no competition data)
 */
const GoForMoreMetric = ({ title }) => {
  const { t } = useTranslation();
  
  return (
    <UniversalMetricCard
      variant={METRIC_VARIANTS.single}
      title={title}
      subtitle={t('dashboard.merchant')}
      icon={
        <div className="text-orange-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        </div>
      }
      metricId="goformore_amount"
      valueType="currency"
      iconBackground="bg-gray-50"
    />
  );
};

export default GoForMoreMetric;