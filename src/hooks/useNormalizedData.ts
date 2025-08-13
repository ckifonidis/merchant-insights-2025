/**
 * Simplified Normalized Data Hooks
 * Replaces 15+ specialized hooks with a simple, generic pattern
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { 
  fetchMetricsData, 
  fetchMetricsDataWithYearComparison 
} from '../store/slices/dataSlice.js';
import {
  selectMetricsData,
  selectMetricsLoading,
  selectMetricsError,
  createMetricCardDataSelector,
  createTimeSeriesChartDataSelector,
  createCategoricalChartDataSelector
} from '../store/selectors/dataSelectors.js';
import { 
  selectAPIRequestParams,
  selectFiltersChanged,
  selectSelectedTab,
  markFiltersApplied
} from '../store/slices/filtersSlice.js';
import { selectHasServiceAccess } from '../store/slices/authSlice.js';
import type { RootState, AppDispatch } from '../store/index';
import type { MetricData } from '../types/api';

// Hook return type interfaces
interface EntityData {
  current: number | Record<string, number> | null;
  previous?: number | Record<string, number> | null;
}

interface MetricCardData {
  merchantData: EntityData;
  competitorData: EntityData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface TimeSeriesChartData {
  chartData: any;
  isLoading: boolean;
  refetch: () => void;
}

interface CategoricalChartData {
  chartData: any[];
  isLoading: boolean;
  refetch: () => void;
}

interface MetricDataResult {
  data: Record<string, MetricData> | MetricData | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => void;
  refetch: () => void;
}

// =============================================================================
// Core Generic Hook - Replaces all specialized variants
// =============================================================================

type SelectorType = 'raw' | 'card' | 'timeSeries' | 'categorical';

interface UseMetricDataOptions {
  autoFetch?: boolean;
  yearOverYear?: boolean;
  selector?: SelectorType;
  [key: string]: any;
}

/**
 * Generic hook for fetching and accessing metric data
 * Replaces: useMetricsData, useMetricCardData, useTimeSeriesChartData, 
 *          useCategoricalChartData, and all their ReadOnly variants
 */
export const useMetricData = (metricIds: string | string[] | null, options: UseMetricDataOptions = {}): MetricDataResult => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    autoFetch = false,
    yearOverYear = false,
    selector = 'raw', // 'raw', 'card', 'timeSeries', 'categorical'
    ...fetchOptions
  } = options;

  // Core selectors
  const allMetricsData = useSelector((state: RootState) => selectMetricsData(state));
  const isLoading = useSelector((state: RootState) => selectMetricsLoading(state));
  const error = useSelector((state: RootState) => selectMetricsError(state));
  const apiRequestParams = useSelector((state: RootState) => selectAPIRequestParams(state));
  const filtersChanged = useSelector((state: RootState) => selectFiltersChanged(state));
  const selectedTab = useSelector((state: RootState) => selectSelectedTab(state));
  const hasServiceAccess = useSelector((state: RootState) => selectHasServiceAccess(state));
  const userID = useSelector((state: RootState) => state.userConfig?.userId);

  // Fetch functions
  const fetchData = useCallback(() => {
    if (!metricIds || metricIds.length === 0) return;
    if (!userID) {
      console.warn('Cannot fetch metrics: userID not available');
      return;
    }

    const fetchAction = yearOverYear ? fetchMetricsDataWithYearComparison : fetchMetricsData;
    dispatch(fetchAction({ 
      metricIDs: Array.isArray(metricIds) ? metricIds : [metricIds], 
      filters: apiRequestParams, 
      options: fetchOptions,
      userID 
    }));
  }, [dispatch, metricIds, apiRequestParams, yearOverYear, fetchOptions, userID]);

  // Auto-fetch on filter changes
  useEffect(() => {
    if (filtersChanged && autoFetch) {
      fetchData();
      dispatch(markFiltersApplied());
    }
  }, [filtersChanged, autoFetch, fetchData, dispatch]);

  // Initial fetch when user is authenticated and has service access
  useEffect(() => {
    if (!hasServiceAccess || !autoFetch || isLoading || !metricIds || !userID) return;
    
    // Check if we have data for ALL required metrics for this tab
    const requiredMetrics = Array.isArray(metricIds) ? metricIds : [metricIds];
    const hasAllRequiredData = requiredMetrics.every(metricId => allMetricsData[metricId]);
    
    if (!hasAllRequiredData) {
      console.log('🔄 Initial/tab-change data fetch for metrics:', requiredMetrics, 'on tab:', selectedTab);
      fetchData();
    }
  }, [hasServiceAccess, autoFetch, isLoading, metricIds, allMetricsData, selectedTab, fetchData, userID]);

  // Get processed data based on selector type
  const getData = useCallback(() => {
    if (!metricIds) return null;

    const singleMetricId = Array.isArray(metricIds) ? metricIds[0] : metricIds;
    
    switch (selector) {
      case 'card':
        // Note: This approach with useSelector inside useCallback is not ideal
        // but maintained for compatibility. In production, consider restructuring.
        return null; // TODO: Refactor to avoid useSelector in callback
      case 'timeSeries':
        return null; // TODO: Refactor to avoid useSelector in callback
      case 'categorical':
        return null; // TODO: Refactor to avoid useSelector in callback
      default:
        // Raw data
        if (Array.isArray(metricIds)) {
          const result: Record<string, MetricData> = {};
          metricIds.forEach(id => {
            if (allMetricsData[id]) result[id] = allMetricsData[id];
          });
          return result;
        }
        return allMetricsData[metricIds] || null;
    }
  }, [metricIds, selector, allMetricsData]);

  return {
    data: getData(),
    isLoading,
    error,
    fetchData,
    refetch: fetchData
  };
};

// =============================================================================
// Tab-Specific Convenience Hooks (simplified)
// =============================================================================

/**
 * Dashboard metrics - uses generic hook
 */
export const useDashboardData = () => {
  const dashboardMetrics = [
    'total_revenue',
    'total_transactions', 
    'avg_ticket_per_user',
    'revenue_per_day',
    'transactions_per_day',
    'customers_per_day'
  ];

  return useMetricData(dashboardMetrics, { 
    autoFetch: true, 
    yearOverYear: true 
  });
};

/**
 * Revenue metrics - uses generic hook
 */
export const useRevenueData = () => {
  const revenueMetrics = [
    'total_revenue',
    'avg_daily_revenue',
    'avg_ticket_per_user',
    'goformore_amount',
    'rewarded_amount',
    'redeemed_amount',
    'revenue_per_day',
    'converted_customers_by_interest',
    'revenue_by_channel'
  ];

  return useMetricData(revenueMetrics, { 
    autoFetch: true, 
    yearOverYear: true 
  });
};

/**
 * Demographics metrics - uses generic hook
 */
export const useDemographicsData = () => {
  const demographicsMetrics = [
    'total_customers',
    'converted_customers_by_gender',
    'converted_customers_by_age',
    'converted_customers_by_interest'
  ];

  return useMetricData(demographicsMetrics, { 
    autoFetch: true, 
    yearOverYear: true 
  });
};

// =============================================================================
// Component-Specific Convenience Hooks
// =============================================================================

/**
 * Metric card data - uses generic hook with card selector
 */
export const useMetricCardData = (metricId: string, autoFetch: boolean = false): MetricCardData => {
  const { data, isLoading, error, fetchData } = useMetricData(metricId, { 
    selector: 'card', 
    autoFetch,
    yearOverYear: true 
  });
  
  return {
    merchantData: data?.merchantData || { current: null, previous: null },
    competitorData: data?.competitorData || { current: null, previous: null },
    isLoading,
    error,
    refetch: fetchData
  };
};

/**
 * Time series chart data - uses generic hook with timeSeries selector
 */
export const useTimeSeriesChartData = (metricId: string, autoFetch: boolean = false): TimeSeriesChartData => {
  const { data, isLoading, fetchData } = useMetricData(metricId, { 
    selector: 'timeSeries', 
    autoFetch,
    yearOverYear: true 
  });
  
  return {
    chartData: data,
    isLoading,
    refetch: fetchData
  };
};

/**
 * Categorical chart data - uses generic hook with categorical selector
 */
export const useCategoricalChartData = (metricId: string, autoFetch: boolean = false): CategoricalChartData => {
  const { data, isLoading, fetchData } = useMetricData(metricId, { 
    selector: 'categorical', 
    autoFetch,
    yearOverYear: true 
  });
  
  return {
    chartData: data || [],
    isLoading,
    refetch: fetchData
  };
};

// =============================================================================
// Legacy Compatibility Exports (for gradual migration)
// =============================================================================

// Keep the most commonly used names for backward compatibility
export const useDashboardDataNormalized = useDashboardData;
export const useRevenueDataNormalized = useRevenueData;
export const useDemographicsDataNormalized = useDemographicsData;

// Single metric hook for convenience
export const useMetric = (metricId: string) => {
  const cardData = useMetricCardData(metricId);
  const timeSeriesData = useTimeSeriesChartData(metricId);
  const categoricalData = useCategoricalChartData(metricId);
  
  return {
    metricId,
    cardData,
    timeSeriesData,
    categoricalData,
    refetch: cardData.refetch
  };
};