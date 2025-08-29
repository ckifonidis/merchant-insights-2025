import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PresentationalTimeSeriesChart from '../ui/charts/PresentationalTimeSeriesChart';
import { 
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';
import { processTimelineData, getAvailableTimelines } from '../../utils/timelineHelpers';
import { CHART_CONFIG } from '../../utils/constants';
import type { TimelineType } from '../ui/charts/PresentationalTimeSeriesChart';
import type { RootState } from '../../store/index';

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
  selector: (state: RootState) => any;
  formatValue: (value: number) => string;
  showCompetitor: boolean;
  merchantLabel: string;
  hasCompetitorData: boolean;
  filters?: Filters | undefined;
  yAxisMode?: 'absolute' | 'percentage';
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
  filters,
  yAxisMode = 'absolute'
}) => {
  const { t } = useTranslation();
  const [timeline, setTimeline] = useState<TimelineType>('daily');
  
  // Connect to store using the provided selector
  const rawStoreData = useSelector(selector);
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.[metricId] || false;
  const error = errors?.metrics || errors?.specificMetrics?.[metricId] || null;

  // Calculate available timeline options based on date range
  const availableTimelineOptions = useMemo(() => {
    // Get all possible timeline options from constants
    const allOptions = CHART_CONFIG.timelines.map(timeline => ({
      value: timeline.value,
      label: timeline.labelKey // Pass labelKey for translation in presentational component
    }));
    
    // If dateRange is available, filter based on availability
    if (filters?.dateRange?.start && filters?.dateRange?.end) {
      const availableTimelines = getAvailableTimelines(
        filters.dateRange.start,
        filters.dateRange.end
      );
      return allOptions.filter(option => availableTimelines.includes(option.value));
    }
    
    // Otherwise return all options
    return allOptions;
  }, [filters?.dateRange]);

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
    const currentYearData = merchantData.map((item, index) => {
      const baseData = {
        date: item.date,
        displayDate: item.formattedDate
      };
      
      // Map values to appropriate fields based on metric type
      if (metricId === 'customers_per_day') {
        return {
          ...baseData,
          merchantCustomers: item.value,
          competitorCustomers: hasCompetitorData && competitorData?.[index] ? competitorData[index].value : 0,
          merchantRevenue: 0,
          competitorRevenue: 0
        };
      } else if (metricId === 'transactions_per_day') {
        return {
          ...baseData,
          merchantTransactions: item.value,
          competitorTransactions: hasCompetitorData && competitorData?.[index] ? competitorData[index].value : 0,
          merchantRevenue: 0,
          competitorRevenue: 0
        };
      } else {
        // Default to revenue (revenue_per_day and other metrics)
        return {
          ...baseData,
          merchantRevenue: item.value,
          competitorRevenue: hasCompetitorData && competitorData?.[index] ? competitorData[index].value : 0
        };
      }
    });

    // Create previous year data by mapping dates back one year
    const previousYearData = merchantData.map((item, _index) => {
      const currentDate = new Date(item.date);
      const previousYear = currentDate.getFullYear() - 1;
      const previousDateKey = `${previousYear}-${item.date.substring(5)}`;
      
      const previousMerchantValue = rawStoreData.merchant?.previous?.[previousDateKey] || 0;
      const previousCompetitorValue = hasCompetitorData ? (rawStoreData.competitor?.previous?.[previousDateKey] || 0) : 0;

      const baseData = {
        date: previousDateKey,
        displayDate: new Date(previousDateKey).toLocaleDateString()
      };
      
      // Map values to appropriate fields based on metric type
      if (metricId === 'customers_per_day') {
        return {
          ...baseData,
          merchantCustomers: previousMerchantValue,
          competitorCustomers: previousCompetitorValue,
          merchantRevenue: 0,
          competitorRevenue: 0
        };
      } else if (metricId === 'transactions_per_day') {
        return {
          ...baseData,
          merchantTransactions: previousMerchantValue,
          competitorTransactions: previousCompetitorValue,
          merchantRevenue: 0,
          competitorRevenue: 0
        };
      } else {
        // Default to revenue (revenue_per_day and other metrics)
        return {
          ...baseData,
          merchantRevenue: previousMerchantValue,
          competitorRevenue: previousCompetitorValue
        };
      }
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

    // Helper function to get field names based on metric type
    const getFieldNames = (metricId: string) => {
      if (metricId === 'customers_per_day') {
        return { merchant: 'merchantCustomers', competitor: 'competitorCustomers' };
      } else if (metricId === 'transactions_per_day') {
        return { merchant: 'merchantTransactions', competitor: 'competitorTransactions' };
      } else {
        return { merchant: 'merchantRevenue', competitor: 'competitorRevenue' };
      }
    };

    const fieldNames = getFieldNames(metricId);

    // Calculate YoY percentages between aggregated timeframes
    const processedData = aggregatedCurrent.map((currentItem: any, index: number) => {
      const previousItem = aggregatedPrevious[index];
      
      let merchantYoY = 0;
      let competitorYoY = 0;
      
      if (previousItem) {
        const previousMerchantValue = previousItem[fieldNames.merchant] || 0;
        const currentMerchantValue = currentItem[fieldNames.merchant] || 0;
        
        if (previousMerchantValue > 0) {
          merchantYoY = (((currentMerchantValue - previousMerchantValue) / previousMerchantValue) * 100);
        }
        
        if (hasCompetitorData) {
          const previousCompetitorValue = previousItem[fieldNames.competitor] || 0;
          const currentCompetitorValue = currentItem[fieldNames.competitor] || 0;
          
          if (previousCompetitorValue > 0) {
            competitorYoY = (((currentCompetitorValue - previousCompetitorValue) / previousCompetitorValue) * 100);
          }
        }
      }

      return {
        date: currentItem.displayDate,
        merchant: yAxisMode === 'percentage' ? parseFloat(merchantYoY.toFixed(1)) : (currentItem[fieldNames.merchant] || 0),
        competitor: hasCompetitorData ? 
          (yAxisMode === 'percentage' ? parseFloat(competitorYoY.toFixed(1)) : (currentItem[fieldNames.competitor] || 0)) : 0,
        merchantChange: parseFloat(merchantYoY.toFixed(1)),
        competitorChange: hasCompetitorData ? parseFloat(competitorYoY.toFixed(1)) : 0
      };
    });

    return processedData;
  }, [rawStoreData, timeline, filters?.dateRange, hasCompetitorData, yAxisMode]);

  return (
    <PresentationalTimeSeriesChart
      chartData={chartData}
      yAxisMode={yAxisMode}
      showCompetitor={showCompetitor}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={formatValue}
      labels={{ merchant: merchantLabel, competitor: t('dashboard.competition') }}
      title={title}
      isLoading={isLoading}
      error={error}
      onTimelineChange={setTimeline}
      timeline={timeline}
      availableTimelineOptions={availableTimelineOptions}
    />
  );
};

export default GenericTimeSeriesChartContainer;