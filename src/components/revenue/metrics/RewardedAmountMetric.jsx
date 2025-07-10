import React from 'react';
import { UniversalMetricCard } from '../../ui';
import { METRIC_VARIANTS } from '../../../utils/constants';
import { useTranslation } from 'react-i18next';

/**
 * Rewarded Amount metric component for Revenue Tab
 * Merchant-only metric (no competition data)
 */
const RewardedAmountMetric = ({ title }) => {
  const { t } = useTranslation();
  
  return (
    <UniversalMetricCard
      variant={METRIC_VARIANTS.single}
      title={title}
      subtitle={t('dashboard.merchant')}
      icon={
        <div className="text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
      }
      metricId="rewarded_amount"
      valueType="currency"
      iconBackground="bg-gray-50"
    />
  );
};

export default RewardedAmountMetric;