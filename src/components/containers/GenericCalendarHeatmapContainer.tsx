import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { UniversalCalendarHeatmap } from '../ui';
import { 
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';

interface GenericCalendarHeatmapContainerProps {
  title: string;
  metricId: string;
  valueLabel?: string;
  showMerchantAndCompetition?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  } | null;
}

/**
 * Generic Calendar Heatmap Container Component
 * 
 * Smart container component that connects to Redux store for calendar heatmap metrics,
 * processes daily revenue data, and passes to universal heatmap component.
 * Used for competition monthly heatmap charts.
 */
const GenericCalendarHeatmapContainer: React.FC<GenericCalendarHeatmapContainerProps> = ({
  title,
  metricId,
  valueLabel = 'Revenue',
  showMerchantAndCompetition = true,
  dateRange = null
}) => {
  // Memoized selector for raw metric data
  const selectRawMetricData = useMemo(() => {
    return createSelector(
      [state => state.data.metrics],
      (metrics: any) => {
        const metric = metrics?.[metricId];
        if (!metric?.merchant?.current) return null;
        
        return {
          merchant: metric.merchant.current,
          competitor: metric.competitor?.current || {}
        };
      }
    );
  }, [metricId]);

  const rawData = useSelector(selectRawMetricData);
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.[metricId] || false;
  const error = errors?.metrics || errors?.specificMetrics?.[metricId] || null;

  // Process data for calendar heatmap
  const processedData = useMemo(() => {
    if (!rawData || !metricId) return { merchant: {}, competitor: {} };

    // Return daily data as-is for calendar heatmap
    // Format: { "2025-06-13": 85326.35, "2025-06-14": 92156.78, ... }
    return {
      merchant: rawData.merchant || {},
      competitor: rawData.competitor || {}
    };
  }, [rawData, metricId]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <UniversalCalendarHeatmap 
        metricId={metricId}
        title={title}
        valueLabel={valueLabel}
        showMerchantAndCompetition={showMerchantAndCompetition}
        data={processedData}
        loading={isLoading}
        error={error}
        dateRange={dateRange}
      />
    </div>
  );
};

export default GenericCalendarHeatmapContainer;