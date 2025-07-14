import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMetricsData, 
  fetchMetricsDataWithYearComparison
} from '../store/slices/dataSlice.js';
import { 
  selectMetricsData,
  selectMetricsLoading,
  selectMetricsError,
  selectMetricsByIds
} from '../store/selectors/dataSelectors.js';
import { 
  selectApiRequestParams, 
  selectFiltersChanged, 
  selectSelectedTab, 
  markFiltersApplied 
} from '../store/slices/filtersSlice.js';

/**
 * Simplified hook for tab data access and dispatch utilities
 * Components handle their own fetching logic
 */
export const useTabData = () => {
  const dispatch = useDispatch();
  
  // Data selectors
  const allMetricsData = useSelector(selectMetricsData);
  const loading = useSelector(selectMetricsLoading);
  const error = useSelector(selectMetricsError);
  const filters = useSelector(selectApiRequestParams);
  const filtersChanged = useSelector(selectFiltersChanged);
  
  // Fetch function that components can call with their specific metrics
  const fetchData = useCallback((metricIDs, options = {}) => {
    if (!metricIDs || metricIDs.length === 0) {
      console.warn('⚠️ No metricIDs provided to fetchData');
      return;
    }

    const {
      customFilters = null,
      metricSpecificFilters = {},
      autoInferContext = true
    } = options;

    const effectiveFilters = customFilters || filters;
    
    dispatch(fetchMetricsData({ 
      metricIDs, 
      filters: effectiveFilters,
      options: {
        metricSpecificFilters,
        autoInferContext
      }
    }));
  }, [dispatch, filters]);

  // Year-over-year fetch function
  const fetchDataWithYearComparison = useCallback((metricIDs, options = {}) => {
    if (!metricIDs || metricIDs.length === 0) {
      console.warn('⚠️ No metricIDs provided to fetchDataWithYearComparison');
      return;
    }

    const {
      customFilters = null,
      metricSpecificFilters = {},
      autoInferContext = true
    } = options;

    const effectiveFilters = customFilters || filters;
    
    dispatch(fetchMetricsDataWithYearComparison({ 
      metricIDs, 
      filters: effectiveFilters,
      options: {
        metricSpecificFilters,
        autoInferContext
      }
    }));
  }, [dispatch, filters]);

  // Helper to get specific metrics data
  const getMetricsData = useCallback((metricIDs) => {
    if (!metricIDs || metricIDs.length === 0) return {};
    
    const result = {};
    metricIDs.forEach(metricId => {
      if (allMetricsData[metricId]) {
        result[metricId] = allMetricsData[metricId];
      }
    });
    return result;
  }, [allMetricsData]);

  // Mark filters as applied (for filter change workflow)
  const markFiltersAppliedAction = useCallback(() => {
    dispatch(markFiltersApplied());
  }, [dispatch]);

  return {
    // Data access
    allMetricsData,
    getMetricsData,
    loading,
    error,
    filters,
    filtersChanged,
    
    // Dispatch utilities
    fetchData,
    fetchDataWithYearComparison,
    markFiltersApplied: markFiltersAppliedAction
  };
};

// =============================================================================
// Metric ID Constants (can be imported by components)
// =============================================================================

export const DASHBOARD_METRIC_IDS = Object.freeze([
  'total_revenue',
  'total_transactions', 
  'avg_ticket_per_user',
  'revenue_per_day',
  'transactions_per_day',
  'customers_per_day'
]);

export const REVENUE_METRIC_IDS = Object.freeze([
  'total_revenue',
  'avg_daily_revenue',
  'avg_ticket_per_user',
  'goformore_amount',
  'rewarded_amount',
  'redeemed_amount',
  'revenue_per_day',
  'converted_customers_by_interest',
  'revenue_by_channel'
]);

export const DEMOGRAPHICS_METRIC_IDS = Object.freeze([
  'total_customers',
  'converted_customers_by_gender',
  'converted_customers_by_age',
  'converted_customers_by_interest'
]);

export const COMPETITION_METRIC_IDS = Object.freeze([
  'total_revenue',
  'total_transactions',
  'avg_ticket_per_user',
  'revenue_per_day'
]);