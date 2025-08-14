import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import PresentationalCalendarHeatmap from '../ui/charts/PresentationalCalendarHeatmap';
import { 
  createMetricSelector,
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';
import type { CalendarHeatmapData } from '../ui/charts/PresentationalCalendarHeatmap';

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
 * processes daily revenue data, and passes to presentational component.
 * Used for competition monthly heatmap charts.
 */
const GenericCalendarHeatmapContainer: React.FC<GenericCalendarHeatmapContainerProps> = ({
  title,
  metricId,
  valueLabel = 'Revenue',
  showMerchantAndCompetition = true,
  dateRange = null
}) => {
  // Connect to store using metricId
  const storeData = useSelector(createMetricSelector(metricId));
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.[metricId] || false;
  const error = errors?.metrics || errors?.specificMetrics?.[metricId] || null;

  // Transform store data to heatmap format - MEMOIZED to prevent infinite loops
  const heatmapData: CalendarHeatmapData = useMemo(() => {
    if (!storeData) return {};
    
    const transformedData: CalendarHeatmapData = {};
    
    // Process merchant data
    if (storeData.merchant?.current) {
      Object.entries(storeData.merchant.current).forEach(([dateKey, value]) => {
        if (!transformedData[dateKey]) transformedData[dateKey] = {};
        transformedData[dateKey].merchant = value as number;
      });
    }
    
    // Process competitor data
    if (storeData.competitor?.current) {
      Object.entries(storeData.competitor.current).forEach(([dateKey, value]) => {
        if (!transformedData[dateKey]) transformedData[dateKey] = {};
        transformedData[dateKey].competitor = value as number;
      });
    }
    
    return transformedData;
  }, [storeData]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <PresentationalCalendarHeatmap 
        heatmapData={heatmapData}
        title={title}
        valueLabel={valueLabel}
        showMerchantAndCompetition={showMerchantAndCompetition}
        isLoading={isLoading}
        error={error || undefined}
        initialMonth={null}
      />
    </div>
  );
};

export default GenericCalendarHeatmapContainer;