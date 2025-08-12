import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PresentationalTimeSeriesChart from '../ui/charts/PresentationalTimeSeriesChart';
import { 
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';
import { processTimelineData } from '../../utils/timelineHelpers';
import type { TimelineType } from '../ui/charts/PresentationalTimeSeriesChart';

// TypeScript interfaces
interface DateRange {
  start?: string;
  end?: string;
}

interface Filters {
  dateRange?: DateRange;
}

interface GenericTimeSeriesChartContainerProps {
  title: string;
  metricId: string;
  selector: (state: any) => any;
  formatValue: (value: number) => string;
  showCompetitor: boolean;
  merchantLabel: string;
  hasCompetitorData: boolean;
  filters?: Filters | undefined;
}

/**
 * Generic TimeSeries Chart Container Component
 * 
 * Smart container component that connects to Redux store for any time series metric,
 * processes data with year-over-year calculations, and passes to presentational component.
 * Consolidates all Dashboard chart components to eliminate duplication.
 */
const GenericTimeSeriesChartContainer: React.FC<GenericTimeSeriesChartContainerProps> = ({
  title,
  metricId,
  selector,
  formatValue,
  showCompetitor,
  merchantLabel,
  hasCompetitorData,
  filters
}) => {
  const [timeline, setTimeline] = useState<TimelineType>('daily');
  
  // Connect to store using the provided selector
  const rawStoreData = useSelector(selector);
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.[metricId] || false;
  const error = errors?.metrics || errors?.specificMetrics?.[metricId] || null;

  // Transform raw store data to chart format
  const chartData = useMemo(() => {
    if (!rawStoreData) return [];

    const transformEntity = (entityData: any) => {
      if (!entityData || !entityData.current) return [];

      const currentData = entityData.current;
      const previousData = entityData.previous || {};

      return Object.entries(currentData).map(([date, value]) => {
        const currentValue = parseFloat(value as string) || 0;
        
        // Map current year date to previous year date
        const currentDate = new Date(date);
        const previousYear = currentDate.getFullYear() - 1;
        const previousDateKey = `${previousYear}-${date.substring(5)}`;
        
        const previousValue = parseFloat(previousData[previousDateKey] as string);
        let yearOverYearChange = 0;
        
        if (previousValue !== undefined && !isNaN(previousValue) && previousValue > 0) {
          yearOverYearChange = (((currentValue - previousValue) / previousValue) * 100);
        } else if (currentValue > 0 && (isNaN(previousValue) || previousValue === 0)) {
          yearOverYearChange = 100;
        } else if (currentValue === 0 && previousValue > 0) {
          yearOverYearChange = -100;
        }

        return {
          date,
          formattedDate: new Date(date).toLocaleDateString(),
          value: currentValue,
          yearOverYearChange: parseFloat(yearOverYearChange.toFixed(1))
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const merchantData = transformEntity(rawStoreData.merchant);
    const competitorData = hasCompetitorData ? transformEntity(rawStoreData.competitor) : [];

    // Prepare current and previous year data for aggregation
    const currentYearData = merchantData.map((item, index) => ({
      date: item.date,
      displayDate: item.formattedDate,
      merchantRevenue: item.value,
      competitorRevenue: hasCompetitorData && competitorData?.[index] ? competitorData[index].value : 0
    }));

    // Create previous year data by mapping dates back one year
    const previousYearData = merchantData.map((item, _index) => {
      const currentDate = new Date(item.date);
      const previousYear = currentDate.getFullYear() - 1;
      const previousDateKey = `${previousYear}-${item.date.substring(5)}`;
      
      const previousMerchantValue = rawStoreData.merchant?.previous?.[previousDateKey] || 0;
      const previousCompetitorValue = hasCompetitorData ? (rawStoreData.competitor?.previous?.[previousDateKey] || 0) : 0;

      return {
        date: previousDateKey,
        displayDate: new Date(previousDateKey).toLocaleDateString(),
        merchantRevenue: previousMerchantValue,
        competitorRevenue: previousCompetitorValue
      };
    });

    // Aggregate both current and previous year data
    const aggregatedCurrent = processTimelineData(
      currentYearData,
      timeline,
      filters?.dateRange?.start ? new Date(filters.dateRange.start) : null,
      filters?.dateRange?.end ? new Date(filters.dateRange.end) : null
    );

    const aggregatedPrevious = processTimelineData(
      previousYearData,
      timeline,
      filters?.dateRange?.start ? new Date(new Date(filters.dateRange.start).getFullYear() - 1, new Date(filters.dateRange.start).getMonth(), new Date(filters.dateRange.start).getDate()) : null,
      filters?.dateRange?.end ? new Date(new Date(filters.dateRange.end).getFullYear() - 1, new Date(filters.dateRange.end).getMonth(), new Date(filters.dateRange.end).getDate()) : null
    );

    // Calculate YoY percentages between aggregated timeframes
    const processedData = aggregatedCurrent.map((currentItem: any, index: number) => {
      const previousItem = aggregatedPrevious[index];
      
      let merchantYoY = 0;
      let competitorYoY = 0;
      
      if (previousItem) {
        if (previousItem.merchantRevenue > 0) {
          merchantYoY = (((currentItem.merchantRevenue - previousItem.merchantRevenue) / previousItem.merchantRevenue) * 100);
        }
        if (hasCompetitorData && previousItem.competitorRevenue > 0) {
          competitorYoY = (((currentItem.competitorRevenue - previousItem.competitorRevenue) / previousItem.competitorRevenue) * 100);
        }
      }

      return {
        date: currentItem.displayDate,
        merchant: currentItem.merchantRevenue || 0,
        competitor: hasCompetitorData ? (currentItem.competitorRevenue || 0) : 0,
        merchantChange: parseFloat(merchantYoY.toFixed(1)),
        competitorChange: hasCompetitorData ? parseFloat(competitorYoY.toFixed(1)) : 0
      };
    });

    return processedData;
  }, [rawStoreData, timeline, filters?.dateRange, hasCompetitorData]);

  return (
    <PresentationalTimeSeriesChart
      chartData={chartData}
      yAxisMode="absolute"
      showCompetitor={showCompetitor}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={formatValue}
      labels={{ merchant: merchantLabel, competitor: 'Competition' }}
      title={title}
      isLoading={isLoading}
      error={error}
      onTimelineChange={setTimeline}
      timeline={timeline}
    />
  );
};

export default GenericTimeSeriesChartContainer;