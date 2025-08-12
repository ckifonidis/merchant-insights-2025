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
interface TotalTransactionsMetricProps {
  title: string;
}

/**
 * Smart Total Transactions metric component for Dashboard
 * Connects to Redux store, processes data, and passes to presentational component
 */
const TotalTransactionsMetric: React.FC<TotalTransactionsMetricProps> = ({ title }) => {
  // Connect to store for total_transactions metric
  const metricData = useSelector(createMetricSelector('total_transactions'));
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  const merchantYoYChange = useSelector(createYoYChangeSelector('total_transactions', 'merchant'));
  const competitorYoYChange = useSelector(createYoYChangeSelector('total_transactions', 'competitor'));
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.['total_transactions'] || false;
  const error = errors?.metrics || errors?.specificMetrics?.['total_transactions'] || null;

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
        <div className="text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="8" x2="21" y2="8"></line>
            <path d="M16 4h-8v4h8V4z"></path>
          </svg>
        </div>
      }
      merchantData={merchantData}
      competitorData={competitorData}
      valueType="number"
      isLoading={isLoading}
      error={error}
    />
  );
};

export default TotalTransactionsMetric;