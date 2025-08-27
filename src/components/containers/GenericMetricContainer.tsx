import React from 'react';
import { useSelector } from 'react-redux';
import PresentationalMetricCard from '../ui/metrics/PresentationalMetricCard';
import { 
  createMetricSelector, 
  createYoYChangeSelector,
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';
import { METRIC_VARIANTS } from '../../utils/constants';
import type { MetricVariant, ValueType } from '../ui/metrics/PresentationalMetricCard';

// TypeScript interface
interface GenericMetricContainerProps {
  title: string;
  metricId: string;
  valueType: ValueType;
  icon: React.ReactNode;
  variant?: MetricVariant;
  hideCompetitorAbsolute?: boolean;
}

/**
 * Generic Metric Container Component
 * 
 * Smart container component that connects to Redux store for any metric,
 * processes data, and passes to presentational component.
 * Consolidates all Dashboard metric components to eliminate duplication.
 */
const GenericMetricContainer: React.FC<GenericMetricContainerProps> = ({
  title,
  metricId,
  valueType,
  icon,
  variant = METRIC_VARIANTS.detailed as MetricVariant,
  hideCompetitorAbsolute = false
}) => {
  // Connect to store using the provided metricId
  const metricData = useSelector(createMetricSelector(metricId));
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  const merchantYoYChange = useSelector(createYoYChangeSelector(metricId, 'merchant'));
  const competitorYoYChange = useSelector(createYoYChangeSelector(metricId, 'competitor'));
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.[metricId] || false;
  const error = errors?.metrics || errors?.specificMetrics?.[metricId] || null;

  // Process merchant data
  const merchantData = {
    value: metricData?.merchant?.current || null,
    change: (typeof merchantYoYChange === 'number') ? merchantYoYChange : null
  };

  // Process competitor data
  const competitorData = {
    value: metricData?.competitor?.current || null,
    change: (typeof competitorYoYChange === 'number') ? competitorYoYChange : null
  };

  return (
    <PresentationalMetricCard
      variant={variant}
      title={title}
      icon={icon}
      merchantData={merchantData}
      competitorData={competitorData}
      valueType={valueType}
      isLoading={isLoading}
      error={error}
      hideCompetitorAbsolute={hideCompetitorAbsolute}
    />
  );
};

export default GenericMetricContainer;