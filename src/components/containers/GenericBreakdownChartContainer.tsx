import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { 
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';

// Import the presentational component
import PresentationalBreakdownChart from '../ui/charts/PresentationalBreakdownChart';

// TypeScript interfaces
export interface BreakdownDataPoint {
  category: string;
  merchant: number;
  competitor: number;
  merchantAbsolute?: number;
  competitorAbsolute?: number;
}

interface GenericBreakdownChartContainerProps {
  title: string;
  metricId: string;
  colors: Record<string, string>;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  showAbsoluteValues?: boolean;
  note?: string;
}

/**
 * Generic Breakdown Chart Container Component
 * 
 * Smart container component that connects to Redux store for breakdown metrics,
 * processes data with percentage calculations, and passes to presentational component.
 * Handles revenue by channel, customers by gender, and other breakdown metrics.
 */
const GenericBreakdownChartContainer: React.FC<GenericBreakdownChartContainerProps> = ({
  title,
  metricId,
  colors,
  formatValue = (value) => `${value}%`,
  formatTooltipValue,
  showAbsoluteValues = false,
  note
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
  const processedData = useMemo((): BreakdownDataPoint[] => {
    if (!rawData || !metricId) return [];

    // Handle revenue_by_channel specifically
    if (metricId === 'revenue_by_channel') {
      const merchantData = rawData.merchant;
      const competitorData = rawData.competitor;
      
      // Calculate totals for percentage calculation
      const merchantTotal = (merchantData.physical || 0) + (merchantData.ecommerce || 0);
      const competitorTotal = (competitorData.physical || 0) + (competitorData.ecommerce || 0);
      
      return [
        {
          category: 'Physical Store',
          merchant: merchantTotal > 0 ? Number((((merchantData.physical || 0) / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number((((competitorData.physical || 0) / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantData.physical || 0,
          competitorAbsolute: competitorData.physical || 0
        },
        {
          category: 'E-commerce', 
          merchant: merchantTotal > 0 ? Number((((merchantData.ecommerce || 0) / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number((((competitorData.ecommerce || 0) / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantData.ecommerce || 0,
          competitorAbsolute: competitorData.ecommerce || 0
        }
      ];
    }

    // Handle demographics metrics
    if (metricId === 'converted_customers_by_gender') {
      const merchantData = rawData.merchant;
      const competitorData = rawData.competitor;
      
      // Calculate totals for percentage calculation
      const merchantTotal = (merchantData.male || merchantData.m || 0) + (merchantData.female || merchantData.f || 0);
      const competitorTotal = (competitorData.male || competitorData.m || 0) + (competitorData.female || competitorData.f || 0);
      
      return [
        {
          category: 'Male',
          merchant: merchantTotal > 0 ? Number((((merchantData.male || merchantData.m || 0) / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number((((competitorData.male || competitorData.m || 0) / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantData.male || merchantData.m || 0,
          competitorAbsolute: competitorData.male || competitorData.m || 0
        },
        {
          category: 'Female', 
          merchant: merchantTotal > 0 ? Number((((merchantData.female || merchantData.f || 0) / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number((((competitorData.female || competitorData.f || 0) / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantData.female || merchantData.f || 0,
          competitorAbsolute: competitorData.female || competitorData.f || 0
        }
      ];
    }

    // Add other metric types here as needed
    return [];
  }, [rawData, metricId]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <PresentationalBreakdownChart
        data={processedData}
        colors={colors}
        formatValue={formatValue}
        formatTooltipValue={formatTooltipValue}
        showAbsoluteValues={showAbsoluteValues}
        note={note}
        loading={isLoading}
        error={error}
      />
    </div>
  );
};

export default GenericBreakdownChartContainer;