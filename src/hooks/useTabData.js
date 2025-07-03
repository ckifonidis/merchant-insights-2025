import { useEffect, useCallback, useMemo } from 'react';
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
export const useTabData = (tabName, metricIDs, options = {}) => {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const tabData = useSelector(state => selectTabData(state, tabName));
  const loading = useSelector(state => selectTabLoading(state, tabName));
  const error = useSelector(state => selectTabError(state, tabName));
  const filters = useSelector(selectApiRequestParams);
  const filtersChanged = useSelector(selectFiltersChanged);
  const selectedTab = useSelector(selectSelectedTab);
  
  // Options
  const { 
    autoRefresh = false, 
    refreshInterval = 300000, // 5 minutes
    dependencies = [],
    customFilters = null
  } = options;
  
  // Use custom filters if provided, otherwise use Redux filters
  const effectiveFilters = customFilters || filters;

  // Fetch data function
  const fetchData = useCallback(() => {
    if (!metricIDs || metricIDs.length === 0) {
      console.warn(`⚠️ No metricIDs provided for ${tabName} tab`);
      return;
    }

    console.log(`🔄 Fetching ${tabName} data...`);
    dispatch(fetchTabData({ 
      tabName, 
      metricIDs, 
      filters: effectiveFilters 
    }));
  }, [dispatch, tabName, metricIDs, effectiveFilters, ...dependencies]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter change detection - only refresh active tab
  useEffect(() => {
    if (filtersChanged && (selectedTab === tabName || selectedTab === 'dashboard')) {
      console.log(`🔄 Filters changed, refreshing ${tabName} data...`);
      fetchData();
      dispatch(markFiltersApplied()); // Mark filters as applied
    }
  }, [filtersChanged, selectedTab, tabName, fetchData, dispatch]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log(`🔄 Auto-refreshing ${tabName} data...`);
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log(`🔄 Manually refreshing ${tabName} data...`);
    fetchData();
  }, [fetchData]);

  return {
    data: tabData?.data || {},
    loading,
    error,
    refresh,
    lastUpdated: tabData?.lastUpdated
  };
};

// Static metric arrays to prevent infinite loops
const DASHBOARD_METRIC_IDS = [
  'total_revenue',
  'total_transactions', 
  'avg_ticket_per_user',
  'revenue_per_day',
  'transactions_per_day',
  'customers_per_day'
];

/**
 * Hook for Dashboard tab data
 */
export const useDashboardData = (options = {}) => {
  return useTabData('dashboard', DASHBOARD_METRIC_IDS, options);
};

const REVENUE_METRIC_IDS = [
  'total_revenue',
  'rewarded_amount',
  'redeemed_amount', 
  'revenue_per_day',
  'converted_customers_by_interest' // Add breakdown metric
];

const DEMOGRAPHICS_METRIC_IDS = [
  'converted_customers_by_age',
  'converted_customers_by_gender',
  'converted_customers_by_interest'
  // TODO: Add customer count metrics when available
];

const COMPETITION_METRIC_IDS = [
  'total_revenue',
  'transactions_per_day',
  'revenue_per_day'
  // TODO: Add competition-specific metrics
];

/**
 * Hook for Revenue tab data
 */
export const useRevenueData = (options = {}) => {
  const baseFilters = useSelector(selectApiRequestParams);
  
  // Add revenue-specific filters for breakdown data
  const revenueFilters = useMemo(() => ({
    ...baseFilters,
    filterValues: [
      ...(baseFilters.filterValues || []),
      {
        providerId: baseFilters.providerId,
        filterId: 'interest_type',
        value: 'revenue'
      }
    ]
  }), [baseFilters]);
  
  const revenueOptions = {
    ...options,
    customFilters: revenueFilters
  };
  
  return useTabData('revenue', REVENUE_METRIC_IDS, revenueOptions);
};

/**
 * Hook for Demographics tab data
 */
export const useDemographicsData = (options = {}) => {
  return useTabData('demographics', DEMOGRAPHICS_METRIC_IDS, options);
};

/**
 * Hook for Competition tab data
 */
export const useCompetitionData = (options = {}) => {
  // Competition tab always needs competition comparison
  const competitionOptions = {
    ...options,
    dependencies: [...(options.dependencies || []), 'competition']
  };

  return useTabData('competition', COMPETITION_METRIC_IDS, competitionOptions);
};

/**
 * Hook for specific time series data
 * Used by TimeSeriesChart components
 */
export const useTimeSeriesData = (metricType, options = {}) => {
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