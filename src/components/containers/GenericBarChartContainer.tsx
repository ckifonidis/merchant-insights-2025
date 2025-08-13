import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import PresentationalBarChart, { BarChartDataPoint } from '../ui/charts/PresentationalBarChart';
import { 
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';
import { SHOPPING_INTERESTS } from '../../data/apiSchema';
import type { RootState } from '../../store';
import type { MetricData } from '../../types/metrics';
import { isCategoricalEntityData, getCategoricalValue } from '../../types/metrics';

// Age group labels mapping
const AGE_GROUP_LABELS = {
  '18-24': 'Generation Z (18-24)',
  '25-40': 'Millennials (25-40)', 
  '41-56': 'Generation X (41-56)',
  '57-75': 'Baby Boomers (57-75)',
  '76-96': 'Silent Generation (76-96)'
};

// TypeScript interfaces
interface GenericBarChartContainerProps {
  title: string;
  metricId: string;
  merchantColor?: string;
  competitorColor?: string;
  yAxisLabel?: string;
  showAbsoluteValues?: boolean;
  note?: string;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  maxCategories?: number | null;
}

/**
 * Generic Bar Chart Container Component
 * 
 * Smart container component that connects to Redux store for bar chart metrics,
 * processes data with category mapping and sorting, and passes to presentational component.
 * Handles shopping interests, age groups, and other categorical breakdowns.
 */
const GenericBarChartContainer: React.FC<GenericBarChartContainerProps> = ({
  title,
  metricId,
  merchantColor = '#007B85',
  competitorColor = '#73AA3C',
  yAxisLabel = '%',
  showAbsoluteValues = false,
  note,
  formatValue = (value: number): string => `${value}%`,
  formatTooltipValue,
  maxCategories = null
}) => {
  // Memoized selector for raw metric data
  const selectRawMetricData = useMemo((): ((state: RootState) => { merchant: Record<string, number>; competitor: Record<string, number> } | null) => {
    return createSelector(
      [(state: RootState): Record<string, MetricData> => state.data.metrics],
      (metrics): { merchant: Record<string, number>; competitor: Record<string, number> } | null => {
        const metric: MetricData | undefined = metrics?.[metricId];
        if (!metric?.merchant) return null;
        
        // Handle both new typed data and legacy untyped data
        let merchantData: Record<string, number> | null = null;
        let competitorData: Record<string, number> = {};
        
        // Check if merchant data has type field (new unified system)
        if ('type' in metric.merchant && isCategoricalEntityData(metric.merchant)) {
          merchantData = getCategoricalValue(metric.merchant);
        } else if ('current' in metric.merchant && metric.merchant.current && typeof metric.merchant.current === 'object') {
          // Legacy data structure: { current: {...}, previous: {...} }
          merchantData = metric.merchant.current as Record<string, number>;
        }
        
        if (!merchantData) return null;
        
        // Handle competitor data similarly
        if (metric.competitor) {
          if ('type' in metric.competitor && isCategoricalEntityData(metric.competitor)) {
            competitorData = getCategoricalValue(metric.competitor) || {};
          } else if ('current' in metric.competitor && metric.competitor.current && typeof metric.competitor.current === 'object') {
            competitorData = metric.competitor.current as Record<string, number>;
          }
        }
        
        return {
          merchant: merchantData,
          competitor: competitorData
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

  // Calculate breakdown data from raw metric data
  const processedData = useMemo((): BarChartDataPoint[] => {
    if (!rawData || !metricId) return [];

    // Handle converted_customers_by_interest specifically
    if (metricId === 'converted_customers_by_interest') {
      const merchantData = rawData.merchant;
      const competitorData = rawData.competitor;
      
      // Calculate totals for percentage calculation
      const merchantTotal = Object.values(merchantData).reduce((sum: number, val: number) => sum + (val || 0), 0);
      const competitorTotal = Object.values(competitorData).reduce((sum: number, val: number) => sum + (val || 0), 0);
      
      let result = Object.keys(merchantData).map(interest => {
        const merchantAbsolute = merchantData[interest] || 0;
        const competitorAbsolute = competitorData[interest] || 0;
        
        // Use Greek labels from SHOPPING_INTERESTS, with fallback for other_category
        const categoryLabel = interest === 'other_category' 
          ? 'Άλλα' 
          : SHOPPING_INTERESTS[interest as keyof typeof SHOPPING_INTERESTS] || interest;
        
        return {
          category: categoryLabel,
          // Store both absolute and percentage values
          merchant: merchantTotal > 0 ? Number(((merchantAbsolute / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number(((competitorAbsolute / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute,
          competitorAbsolute
        };
      });

      // Sort by total revenue (merchant + competitor) and limit if maxCategories is set
      result = result
        .sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor));
      
      if (maxCategories) {
        result = result.slice(0, maxCategories);
      }

      // Truncate long category names
      result = result.map(item => ({
        ...item,
        category: item.category.length > 15 ? item.category.substring(0, 15) + '...' : item.category
      }));

      return result;
    }

    // Handle converted_customers_by_age specifically
    if (metricId === 'converted_customers_by_age') {
      const merchantData = rawData.merchant;
      const competitorData = rawData.competitor;
      
      // Calculate totals for percentage calculation
      const merchantTotal = Object.values(merchantData).reduce((sum: number, val: number) => sum + (val || 0), 0);
      const competitorTotal = Object.values(competitorData).reduce((sum: number, val: number) => sum + (val || 0), 0);
      
      let result = Object.keys(merchantData).map(ageGroup => {
        const merchantAbsolute = merchantData[ageGroup] || 0;
        const competitorAbsolute = competitorData[ageGroup] || 0;
        
        return {
          category: AGE_GROUP_LABELS[ageGroup as keyof typeof AGE_GROUP_LABELS] || ageGroup,
          merchant: merchantTotal > 0 ? Number(((merchantAbsolute / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number(((competitorAbsolute / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute,
          competitorAbsolute
        };
      });

      // Sort by total percentage (merchant + competitor)
      result = result
        .sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor));
      
      if (maxCategories) {
        result = result.slice(0, maxCategories);
      }

      return result;
    }

    // Add other metric types here as needed
    return [];
  }, [rawData, metricId, maxCategories]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <PresentationalBarChart
        data={processedData}
        merchantColor={merchantColor}
        competitorColor={competitorColor}
        yAxisLabel={yAxisLabel}
        showAbsoluteValues={showAbsoluteValues}
        note={note}
        formatValue={formatValue}
        formatTooltipValue={formatTooltipValue}
        loading={isLoading}
        error={error}
      />
    </div>
  );
};

export default GenericBarChartContainer;