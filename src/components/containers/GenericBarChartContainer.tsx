import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import PresentationalBarChart, { BarChartDataPoint } from '../ui/charts/PresentationalBarChart';
import { 
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';

// Shopping interest labels mapping
const SHOPPING_INTEREST_LABELS = {
  'SHOPINT1': 'Fashion & Apparel',
  'SHOPINT2': 'Electronics & Tech',
  'SHOPINT3': 'Home & Garden',
  'SHOPINT4': 'Sports & Fitness',
  'SHOPINT5': 'Books & Media',
  'SHOPINT6': 'Beauty & Personal Care',
  'SHOPINT7': 'Food & Beverages',
  'SHOPINT8': 'Travel & Tourism',
  'SHOPINT9': 'Automotive',
  'SHOPINT10': 'Health & Wellness',
  'SHOPINT11': 'Entertainment',
  'SHOPINT12': 'Jewelry & Accessories',
  'SHOPINT13': 'Toys & Games',
  'SHOPINT14': 'Art & Crafts',
  'SHOPINT15': 'Office & Business',
  'other_category': 'Other'
};

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
  formatValue = (value) => `${value}%`,
  formatTooltipValue,
  maxCategories = null
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

  // Calculate breakdown data from raw metric data
  const processedData = useMemo((): BarChartDataPoint[] => {
    if (!rawData || !metricId) return [];

    // Handle converted_customers_by_interest specifically
    if (metricId === 'converted_customers_by_interest') {
      const merchantData = rawData.merchant;
      const competitorData = rawData.competitor;
      
      // Calculate totals for percentage calculation
      const merchantTotal = Object.values(merchantData).reduce((sum: number, val: any) => sum + (val || 0), 0);
      const competitorTotal = Object.values(competitorData).reduce((sum: number, val: any) => sum + (val || 0), 0);
      
      let result = Object.keys(merchantData).map(interest => {
        const merchantAbsolute = merchantData[interest] || 0;
        const competitorAbsolute = competitorData[interest] || 0;
        
        return {
          category: SHOPPING_INTEREST_LABELS[interest as keyof typeof SHOPPING_INTEREST_LABELS] || interest,
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
      const merchantTotal = Object.values(merchantData).reduce((sum: number, val: any) => sum + (val || 0), 0);
      const competitorTotal = Object.values(competitorData).reduce((sum: number, val: any) => sum + (val || 0), 0);
      
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