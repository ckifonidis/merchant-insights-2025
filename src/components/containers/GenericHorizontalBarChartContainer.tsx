import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { 
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';
import { SHOPPING_INTERESTS } from '../../types/apiSchema';
import { getMetricStoreKey } from '../../utils/metricKeys';

// Import the presentational component
import PresentationalHorizontalBarChart from '../ui/charts/PresentationalHorizontalBarChart';

// TypeScript interfaces
export interface HorizontalBarDataPoint {
  category: string;
  merchant: number;
  competitor: number;
  merchantAbsolute?: number;
  competitorAbsolute?: number;
}

interface GenericHorizontalBarChartContainerProps {
  title: string;
  metricId: string;
  merchantColor?: string;
  competitorColor?: string;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  maxCategories?: number;
  showTable?: boolean;
  note?: string;
  context?: string; // Tab context for compound key resolution
  hideCompetitorAbsolute?: boolean;
}

/**
 * Generic Horizontal Bar Chart Container Component
 * 
 * Smart container component that connects to Redux store for demographic metrics,
 * processes data with percentage calculations, and passes to presentational component.
 * Handles age groups and shopping interests with proper label mapping.
 */
const GenericHorizontalBarChartContainer: React.FC<GenericHorizontalBarChartContainerProps> = ({
  title,
  metricId,
  merchantColor = '#007B85',
  competitorColor = '#73AA3C',
  formatValue = (value) => `${value}%`,
  formatTooltipValue,
  maxCategories,
  showTable = true,
  note,
  context,
  hideCompetitorAbsolute = false
}) => {
  // Memoized selector for raw metric data
  const selectRawMetricData = useMemo(() => {
    return createSelector(
      [state => state.data.metrics],
      (metrics: any) => {
        // Use context-aware key resolution for metrics that need it
        const storeKey = getMetricStoreKey(metricId, context);
        const metric = metrics?.[storeKey];
        
        // Debug logging for shopping interests specifically
        if (metricId === 'converted_customers_by_interest') {
          console.log(`🔍 HorizontalBar - metricId: ${metricId}, context: ${context}`);
          console.log(`🔍 HorizontalBar - storeKey: ${storeKey}`);
          console.log(`🔍 HorizontalBar - metric exists:`, !!metric);
          console.log(`🔍 HorizontalBar - merchant.current exists:`, !!metric?.merchant?.current);
          if (metric?.merchant?.current) {
            console.log(`🔍 HorizontalBar - merchant data keys:`, Object.keys(metric.merchant.current));
          }
        }
        
        if (!metric?.merchant?.current) return null;
        
        return {
          merchant: metric.merchant,
          competitor: metric.competitor || {}
        };
      }
    );
  }, [metricId, context]);

  const rawData = useSelector(selectRawMetricData);
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  
  // Use compound key for loading/error state checks
  const storeKey = getMetricStoreKey(metricId, context);
  
  // Check for specific loading/error states using the correct store key
  const isLoading = loading?.metrics || loading?.specificMetrics?.[metricId] || loading?.specificMetrics?.[storeKey] || false;
  const error = errors?.metrics || errors?.specificMetrics?.[metricId] || errors?.specificMetrics?.[storeKey] || null;

  // Calculate horizontal bar data from raw metric data
  const processedData = useMemo((): HorizontalBarDataPoint[] => {
    // Debug logging for shopping interests specifically
    if (metricId === 'converted_customers_by_interest') {
      console.log(`🔍 HorizontalBar Processing - rawData:`, rawData);
      console.log(`🔍 HorizontalBar Processing - metricId:`, metricId);
    }
    
    if (!rawData || !metricId) {
      if (metricId === 'converted_customers_by_interest') {
        console.log(`❌ HorizontalBar Processing failed - no rawData or metricId`);
      }
      return [];
    }

    // Handle converted_customers_by_interest
    if (metricId === 'converted_customers_by_interest') {
      const merchantData = rawData.merchant?.current || {};
      const competitorData = rawData.competitor?.current || {};
      
      // Calculate totals for percentage calculation
      const merchantTotal = Object.values(merchantData).reduce((sum: number, val: any) => sum + (val || 0), 0);
      const competitorTotal = Object.values(competitorData).reduce((sum: number, val: any) => sum + (val || 0), 0);
      
      // Shopping interest labels mapping - use our single source of truth
      const SHOPPING_INTEREST_LABELS: Record<string, string> = {
        ...SHOPPING_INTERESTS,
        'other_category': 'Other'
      };
      
      let result = Object.keys(merchantData).map(interest => {
        const merchantAbsolute = merchantData[interest] || 0;
        const competitorAbsolute = competitorData[interest] || 0;
        
        return {
          category: SHOPPING_INTEREST_LABELS[interest] || interest,
          merchant: merchantTotal > 0 ? Number(((merchantAbsolute / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number(((competitorAbsolute / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute,
          competitorAbsolute
        };
      });

      // Sort by merchant percentage in descending order
      result = result
        .sort((a, b) => b.merchant - a.merchant);
      
      if (maxCategories) {
        result = result.slice(0, maxCategories);
      }

      // Truncate long category names for horizontal display
      result = result.map(item => ({
        ...item,
        category: item.category.length > 35 ? item.category.substring(0, 35) + '...' : item.category
      }));

      return result;
    }

    // Handle converted_customers_by_age
    if (metricId === 'converted_customers_by_age') {
      const merchantData = rawData.merchant?.current || {};
      const competitorData = rawData.competitor?.current || {};
      
      // Calculate totals for percentage calculation
      const merchantTotal = Object.values(merchantData).reduce((sum: number, val: any) => sum + (val || 0), 0);
      const competitorTotal = Object.values(competitorData).reduce((sum: number, val: any) => sum + (val || 0), 0);
      
      // Age group labels mapping
      const AGE_GROUP_LABELS: Record<string, string> = {
        '18-24': 'Generation Z (18-24)',
        '25-40': 'Millennials (25-40)', 
        '41-56': 'Generation X (41-56)',
        '57-75': 'Baby Boomers (57-75)',
        '76-96': 'Silent Generation (76-96)'
      };
      
      let result = Object.keys(merchantData).map(ageGroup => {
        const merchantAbsolute = merchantData[ageGroup] || 0;
        const competitorAbsolute = competitorData[ageGroup] || 0;
        
        return {
          category: AGE_GROUP_LABELS[ageGroup] || ageGroup,
          merchant: merchantTotal > 0 ? Number(((merchantAbsolute / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number(((competitorAbsolute / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute,
          competitorAbsolute
        };
      });

      // Sort by predefined chronological age order: Gen Z, Millennials, Gen X, Baby Boomers, Silent Gen
      const ageGroupOrder = ['18-24', '25-40', '41-56', '57-75', '76-96'];
      result = result
        .sort((a, b) => {
          // Find the age group key from the category name
          const getAgeKey = (category: string) => {
            return Object.keys(AGE_GROUP_LABELS).find(key => AGE_GROUP_LABELS[key] === category) || '';
          };
          
          const aKey = getAgeKey(a.category);
          const bKey = getAgeKey(b.category);
          
          const aIndex = ageGroupOrder.indexOf(aKey);
          const bIndex = ageGroupOrder.indexOf(bKey);
          
          return aIndex - bIndex;
        });
      
      if (maxCategories) {
        result = result.slice(0, maxCategories);
      }

      return result;
    }

    // Default case - no data
    return [];
  }, [rawData, metricId, maxCategories]);

  // Debug loading state for shopping interests
  if (metricId === 'converted_customers_by_interest') {
    console.log(`🔍 HorizontalBar Final State:`, {
      isLoading,
      rawDataExists: !!rawData,
      processedDataLength: processedData.length,
      loadingMetrics: loading?.metrics,
      loadingSpecificMetric: loading?.specificMetrics?.[metricId],
      loadingSpecificStoreKey: loading?.specificMetrics?.[storeKey],
      hasError: !!error
    });
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <PresentationalHorizontalBarChart
        data={processedData}
        merchantColor={merchantColor}
        competitorColor={competitorColor}
        formatValue={formatValue}
        formatTooltipValue={formatTooltipValue || null}
        showTable={showTable}
        note={note || null}
        loading={isLoading}
        error={error}
        hideCompetitorAbsolute={hideCompetitorAbsolute}
      />
    </div>
  );
};

export default GenericHorizontalBarChartContainer;