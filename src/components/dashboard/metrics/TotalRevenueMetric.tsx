import React from 'react';
import { useSelector } from 'react-redux';
import PresentationalMetricCard from '../../ui/metrics/PresentationalMetricCard';
import { 
  createMetricSelector, 
  createYoYChangeSelector,
  selectDataLoading,
  selectDataErrors 
} from '../../../store/selectors/dataSelectors';
import { METRIC_VARIANTS } from '../../../utils/constants';

// TypeScript interface
interface TotalRevenueMetricProps {
  title: string;
}

/**
 * Smart Total Revenue metric component for Dashboard
 * Connects to Redux store, processes data, and passes to presentational component
 */
const TotalRevenueMetric: React.FC<TotalRevenueMetricProps> = ({ title }) => {
  // Connect to store for total_revenue metric
  const metricData = useSelector(createMetricSelector('total_revenue'));
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  const merchantYoYChange = useSelector(createYoYChangeSelector('total_revenue', 'merchant'));
  const competitorYoYChange = useSelector(createYoYChangeSelector('total_revenue', 'competitor'));
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.['total_revenue'] || false;
  const error = errors?.metrics || errors?.specificMetrics?.['total_revenue'] || null;

  // Process merchant data
  const merchantData = {
    value: metricData?.merchant?.current || null,
    change: merchantYoYChange
  };

  // Process competitor data
  const competitorData = {
    value: metricData?.competitor?.current || null,
    change: competitorYoYChange
  };

  return (
    <PresentationalMetricCard
      variant={METRIC_VARIANTS.detailed}
      title={title}
      icon={
        <div className="text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
      }
      merchantData={merchantData}
      competitorData={competitorData}
      valueType="currency"
      isLoading={isLoading}
      error={error}
    />
  );
};

export default TotalRevenueMetric;