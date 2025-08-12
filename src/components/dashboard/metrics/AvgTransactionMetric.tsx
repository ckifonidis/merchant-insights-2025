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
interface AvgTransactionMetricProps {
  title: string;
}

/**
 * Smart Average Transaction metric component for Dashboard
 * Connects to Redux store, processes data, and passes to presentational component
 */
const AvgTransactionMetric: React.FC<AvgTransactionMetricProps> = ({ title }) => {
  // Connect to store for avg_ticket_per_user metric
  const metricData = useSelector(createMetricSelector('avg_ticket_per_user'));
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  const merchantYoYChange = useSelector(createYoYChangeSelector('avg_ticket_per_user', 'merchant'));
  const competitorYoYChange = useSelector(createYoYChangeSelector('avg_ticket_per_user', 'competitor'));
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.['avg_ticket_per_user'] || false;
  const error = errors?.metrics || errors?.specificMetrics?.['avg_ticket_per_user'] || null;

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
        <div className="text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
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

export default AvgTransactionMetric;