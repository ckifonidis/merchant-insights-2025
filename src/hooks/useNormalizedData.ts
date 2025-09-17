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
  selectMetricsLoading,
  selectMetricsError,
} from '../store/selectors/dataSelectors.js';
import { 
  selectAPIRequestParams,
  selectFiltersChanged,
  selectSelectedTab,
  markFiltersApplied
} from '../store/slices/filtersSlice.js';
import { selectHasServiceAccess } from '../store/slices/authSlice.js';
import type { RootState, AppDispatch } from '../store/index';
// Hook return type interfaces

interface MetricDataResult {
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
    context // Extract context as primitive value only
  } = options;

  // Core selectors
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
      userID,
      context // Pass context for compound key generation
    }));
  }, [dispatch, metricIds, apiRequestParams, yearOverYear, userID, context]);

  // Simplified fetching: Only trigger on filter changes or tab changes
  useEffect(() => {
    if (!hasServiceAccess || !autoFetch || !metricIds || !userID) return;

    // Auto-fetch on filter changes
    if (filtersChanged) {
      console.log('🔄 Fetching data due to filter change on tab:', selectedTab);
      fetchData();
      dispatch(markFiltersApplied());
      return;
    }
  }, [filtersChanged, hasServiceAccess, autoFetch, metricIds, userID, selectedTab, fetchData, dispatch]);

  // Fetch on tab change (initial load of tab)
  useEffect(() => {
    if (!hasServiceAccess || !autoFetch || !metricIds || !userID) return;

    console.log('🔄 Fetching data due to tab change:', selectedTab, 'context:', context);
    fetchData();
  }, [selectedTab, hasServiceAccess, autoFetch, metricIds, userID, fetchData, context]);

  // Get processed data based on selector type

  return {
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
    yearOverYear: true,
    context: 'revenue' // Pass revenue context for compound keys
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
    yearOverYear: true,
    context: 'demographics' // Pass demographics context for compound keys
  });
};

/**
 * Competition metrics - uses generic hook
 */
export const useCompetitionData = () => {
  const competitionMetrics = [
    'total_revenue',
    'total_transactions',
    'avg_ticket_per_user',
    'revenue_per_day'
  ];

  return useMetricData(competitionMetrics, { 
    autoFetch: true, 
    yearOverYear: true 
  });
};
