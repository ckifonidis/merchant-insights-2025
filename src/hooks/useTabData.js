import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTabData, selectTabData, selectTabLoading, selectTabError } from '../store/slices/analyticsSlice.js';
import { 
  selectApiRequestParams, 
  selectFiltersChanged, 
  selectSelectedTab, 
  markFiltersApplied 
} from '../store/slices/filtersSlice.js';

/**
 * Generic hook for fetching tab data
 * Used by all tab-specific hooks
 */
// Default options constant to prevent new object creation
const DEFAULT_OPTIONS = Object.freeze({
  autoRefresh: false,
  refreshInterval: 300000, // 5 minutes
  customFilters: null,
  metricSpecificFilters: {},
  autoInferContext: true
});

export const useTabData = (tabName, metricIDs, options = DEFAULT_OPTIONS) => {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const tabData = useSelector(state => selectTabData(state, tabName));
  const loading = useSelector(state => selectTabLoading(state, tabName));
  const error = useSelector(state => selectTabError(state, tabName));
  const filters = useSelector(selectApiRequestParams);
  const filtersChanged = useSelector(selectFiltersChanged);
  const selectedTab = useSelector(selectSelectedTab);
  
  // Options (use defaults for undefined values)
  const { 
    autoRefresh = DEFAULT_OPTIONS.autoRefresh, 
    refreshInterval = DEFAULT_OPTIONS.refreshInterval,
    customFilters = DEFAULT_OPTIONS.customFilters,
    metricSpecificFilters = DEFAULT_OPTIONS.metricSpecificFilters,
    autoInferContext = DEFAULT_OPTIONS.autoInferContext
  } = options;
  
  // Unified fetch function - deduplication handled at Redux level
  const performFetch = useCallback(() => {
    if (!metricIDs || metricIDs.length === 0) {
      console.warn(`⚠️ No metricIDs provided for ${tabName} tab`);
      return;
    }

    const effectiveFilters = customFilters || filters;
    dispatch(fetchTabData({ 
      tabName, 
      metricIDs, 
      filters: effectiveFilters,
      options: {
        metricSpecificFilters,
        autoInferContext
      }
    }));
  }, [dispatch, tabName, metricIDs, filters, customFilters, metricSpecificFilters, autoInferContext]);

  // Initial fetch - deduplication handled automatically
  useEffect(() => {
    performFetch();
  }, [performFetch]);

  // Filter change detection - only refresh active tab
  useEffect(() => {
    if (filtersChanged && (selectedTab === tabName || selectedTab === 'dashboard')) {
      performFetch();
      dispatch(markFiltersApplied()); // Mark filters as applied
    }
  }, [filtersChanged, selectedTab, tabName, performFetch, dispatch]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log(`🔄 Auto-refreshing ${tabName} data...`);
      performFetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, performFetch]);

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log(`🔄 Manually refreshing ${tabName} data...`);
    performFetch();
  }, [performFetch]);

  return {
    data: tabData?.data || {},
    loading,
    error,
    refresh,
    lastUpdated: tabData?.lastUpdated
  };
};

// Static metric arrays to prevent infinite loops
const DASHBOARD_METRIC_IDS = Object.freeze([
  'total_revenue',
  'total_transactions', 
  'avg_ticket_per_user',
  'revenue_per_day',
  'transactions_per_day',
  'customers_per_day'
]);

/**
 * Hook for Dashboard tab data
 */
export const useDashboardData = (options = DEFAULT_OPTIONS) => {
  return useTabData('dashboard', DASHBOARD_METRIC_IDS, options);
};

// Static array with Object.freeze to ensure immutability
const REVENUE_METRIC_IDS = Object.freeze([
  'total_revenue',
  'avg_daily_revenue',
  'avg_ticket_per_user',
  'goformore_amount',
  'rewarded_amount',
  'redeemed_amount', 
  'revenue_per_day',
  'converted_customers_by_interest', // Shopping interests breakdown
  'revenue_by_channel' // Channel breakdown metric
]);

const DEMOGRAPHICS_METRIC_IDS = Object.freeze([
  'converted_customers_by_age',
  'converted_customers_by_gender',
  'converted_customers_by_interest'
  // TODO: Add customer count metrics when available
]);

const COMPETITION_METRIC_IDS = Object.freeze([
  'total_revenue',
  'transactions_per_day',
  'revenue_per_day'
  // TODO: Add competition-specific metrics
]);

/**
 * Hook for Revenue tab data
 */
export const useRevenueData = (options = DEFAULT_OPTIONS) => {
  return useTabData('revenue', REVENUE_METRIC_IDS, options);
};

/**
 * Hook for Demographics tab data
 */
export const useDemographicsData = (options = DEFAULT_OPTIONS) => {
  return useTabData('demographics', DEMOGRAPHICS_METRIC_IDS, options);
};

/**
 * Hook for Competition tab data
 */
export const useCompetitionData = (options = DEFAULT_OPTIONS) => {
  return useTabData('competition', COMPETITION_METRIC_IDS, options);
};

/**
 * Hook for specific time series data
 * Used by TimeSeriesChart components
 */
export const useTimeSeriesData = (metricType, options = DEFAULT_OPTIONS) => {
  const metricMap = {
    'revenue': 'revenue_per_day',
    'transactions': 'transactions_per_day', 
    'customers': 'customers_per_day'
  };

  const metricID = metricMap[metricType];
  if (!metricID) {
    console.error(`❌ Unknown time series type: ${metricType}`);
    return { data: {}, loading: false, error: `Unknown metric type: ${metricType}` };
  }

  const tabName = `timeseries_${metricType}`;
  return useTabData(tabName, [metricID], options);
};

/**
 * Hook for getting multiple metrics across tabs
 * Useful for components that need data from different sources
 */
export const useMultiTabData = (tabConfigs) => {
  const results = {};
  
  tabConfigs.forEach(({ tabName, metricIDs, options = {} }) => {
    results[tabName] = useTabData(tabName, metricIDs, options);
  });
  
  return results;
};