import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PresentationalTimeSeriesChart from '../../ui/charts/PresentationalTimeSeriesChart';
import { 
  selectRevenuePerDay,
  selectDataLoading,
  selectDataErrors 
} from '../../../store/selectors/dataSelectors';
import { processTimelineData } from '../../../utils/timelineHelpers';
import { formatCurrency } from '../../../utils/formatters';

// TypeScript interfaces
interface DateRange {
  start?: string;
  end?: string;
}

interface Filters {
  dateRange?: DateRange;
}

interface RevenueTimeSeriesChartProps {
  title: string;
  filters?: Filters;
}

/**
 * Smart Revenue TimeSeries chart component for Dashboard
 * Connects to Redux store, processes data, and passes to presentational component
 */
const RevenueTimeSeriesChart: React.FC<RevenueTimeSeriesChartProps> = ({ title, filters }) => {
  const [timeline, setTimeline] = useState('daily');
  
  // Connect to store for revenue_per_day metric
  const rawStoreData = useSelector(selectRevenuePerDay);
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.['revenue_per_day'] || false;
  const error = errors?.metrics || errors?.specificMetrics?.['revenue_per_day'] || null;

  // Transform raw store data to chart format
  const chartData = useMemo(() => {
    if (!rawStoreData) return [];

    const transformEntity = (entityData, entityType) => {
      if (!entityData || !entityData.current) return [];

      const currentData = entityData.current;
      const previousData = entityData.previous || {};

      return Object.entries(currentData).map(([date, value]) => {
        const currentValue = parseFloat(value) || 0;
        
        // Map current year date to previous year date
        const currentDate = new Date(date);
        const previousYear = currentDate.getFullYear() - 1;
        const previousDateKey = `${previousYear}-${date.substring(5)}`;
        
        const previousValue = parseFloat(previousData[previousDateKey]);
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
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const merchantData = transformEntity(rawStoreData.merchant, 'merchant');
    const competitorData = transformEntity(rawStoreData.competitor, 'competitor');

    // Prepare current and previous year data for aggregation
    const currentYearData = merchantData.map((item, index) => ({
      date: item.date,
      displayDate: item.formattedDate,
      merchantRevenue: item.value,
      competitorRevenue: competitorData?.[index] ? competitorData[index].value : 0
    }));

    // Create previous year data by mapping dates back one year
    const previousYearData = merchantData.map((item, index) => {
      const currentDate = new Date(item.date);
      const previousYear = currentDate.getFullYear() - 1;
      const previousDateKey = `${previousYear}-${item.date.substring(5)}`;
      
      const previousMerchantValue = rawStoreData.merchant?.previous?.[previousDateKey] || 0;
      const previousCompetitorValue = rawStoreData.competitor?.previous?.[previousDateKey] || 0;

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
    const processedData = aggregatedCurrent.map((currentItem, index) => {
      const previousItem = aggregatedPrevious[index];
      
      let merchantYoY = 0;
      let competitorYoY = 0;
      
      if (previousItem) {
        if (previousItem.merchantRevenue > 0) {
          merchantYoY = (((currentItem.merchantRevenue - previousItem.merchantRevenue) / previousItem.merchantRevenue) * 100);
        }
        if (previousItem.competitorRevenue > 0) {
          competitorYoY = (((currentItem.competitorRevenue - previousItem.competitorRevenue) / previousItem.competitorRevenue) * 100);
        }
      }

      return {
        date: currentItem.displayDate,
        merchant: currentItem.merchantRevenue || 0,
        competitor: currentItem.competitorRevenue || 0,
        merchantChange: parseFloat(merchantYoY.toFixed(1)),
        competitorChange: parseFloat(competitorYoY.toFixed(1))
      };
    });

    return processedData;
  }, [rawStoreData, timeline, filters?.dateRange]);

  return (
    <PresentationalTimeSeriesChart
      chartData={chartData}
      yAxisMode="absolute"
      showCompetitor={true}
      yearOverYear={true}
      allowedChartTypes={['line', 'bar', 'table']}
      colors={{ merchant: '#007B85', competitor: '#73AA3C' }}
      formatValue={formatCurrency}
      labels={{ merchant: 'Merchant', competitor: 'Competition' }}
      title={title}
      isLoading={isLoading}
      error={error}
      onTimelineChange={setTimeline}
      timeline={timeline}
    />
  );
};

export default RevenueTimeSeriesChart;