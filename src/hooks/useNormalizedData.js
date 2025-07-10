/**
 * Normalized Data Hooks
 * High-level hooks that use the new normalized data structure
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { 
  fetchMetricsData, 
  fetchMetricsDataWithYearComparison 
} from '../store/slices/dataSlice.js';
import {
  selectDashboardData,
  selectRevenueData,
  selectDemographicsData,
  createMetricCardDataSelector,
  createTimeSeriesChartDataSelector,
  createCategoricalChartDataSelector,
  selectMetricsSummary,
  selectIsAnyDataLoading,
  selectAllDataErrors
} from '../store/selectors/dataSelectors.js';
import { 
  selectApiRequestParams,
  selectFiltersChanged,
  markFiltersApplied
} from '../store/slices/filtersSlice.js';
import { METRIC_IDS } from '../data/apiSchema.js';

// =============================================================================
// Core Data Fetching Hooks
// =============================================================================

/**
 * Generic hook for fetching metrics data
 */
export const useMetricsData = (metricIDs, options = {}) => {
  const dispatch = useDispatch();
  const apiRequestParams = useSelector(selectApiRequestParams);
  const filtersChanged = useSelector(selectFiltersChanged);
  const isLoading = useSelector(selectIsAnyDataLoading);
  const errors = useSelector(selectAllDataErrors);
  
  const fetchData = useCallback(() => {
    if (metricIDs && metricIDs.length > 0) {
      dispatch(fetchMetricsData({ 
        metricIDs, 
        filters: apiRequestParams, 
        options 
      }));
    }
  }, [dispatch, metricIDs, apiRequestParams, options]);

  const fetchDataWithYoY = useCallback(() => {
    if (metricIDs && metricIDs.length > 0) {
      dispatch(fetchMetricsDataWithYearComparison({ 
        metricIDs, 
        filters: apiRequestParams, 
        options 
      }));
    }
  }, [dispatch, metricIDs, apiRequestParams, options]);

  // Auto-fetch when filters change
  useEffect(() => {
    if (filtersChanged) {
      if (options.yearOverYear) {
        fetchDataWithYoY();
      } else {
        fetchData();
      }
      
      // Mark filters as applied
      dispatch(markFiltersApplied());
    }
  }, [filtersChanged, fetchData, fetchDataWithYoY, options.yearOverYear, dispatch]);

  return {
    fetchData,
    fetchDataWithYoY,
    isLoading,
    errors,
    refetch: options.yearOverYear ? fetchDataWithYoY : fetchData
  };
};

// =============================================================================
// Tab-Specific Data Hooks
// =============================================================================

/**
 * Dashboard data hook with year-over-year support
 */
export const useDashboardDataNormalized = () => {
  const dashboardMetrics = [
    METRIC_IDS.TOTAL_REVENUE,
    METRIC_IDS.TOTAL_TRANSACTIONS,
    METRIC_IDS.AVG_TICKET_PER_USER,
    METRIC_IDS.REVENUE_PER_DAY,
    METRIC_IDS.TRANSACTIONS_PER_DAY,
    METRIC_IDS.CUSTOMERS_PER_DAY
  ];

  const dashboardData = useSelector(selectDashboardData);
  const metricsSummary = useSelector(selectMetricsSummary);
  
  const { fetchData, fetchDataWithYoY, isLoading, errors, refetch } = useMetricsData(
    dashboardMetrics,
    { yearOverYear: true }
  );

  // Initial data fetch
  useEffect(() => {
    if (!metricsSummary.hasValidData) {
      fetchDataWithYoY();
    }
  }, [fetchDataWithYoY, metricsSummary.hasValidData]);

  return {
    ...dashboardData,
    metricsSummary,
    refetch,
    isLoading,
    errors
  };
};

/**
 * Revenue data hook with year-over-year support
 */
export const useRevenueDataNormalized = () => {
  const revenueMetrics = [
    METRIC_IDS.TOTAL_REVENUE,
    METRIC_IDS.AVG_DAILY_REVENUE,
    METRIC_IDS.AVG_TICKET_PER_USER,
    METRIC_IDS.GOFORMORE_AMOUNT,
    METRIC_IDS.REWARDED_AMOUNT,
    METRIC_IDS.REDEEMED_AMOUNT,
    METRIC_IDS.REVENUE_PER_DAY,
    METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST,
    METRIC_IDS.REVENUE_BY_CHANNEL
  ];

  const revenueData = useSelector(selectRevenueData);
  const metricsSummary = useSelector(selectMetricsSummary);
  
  const { fetchData, fetchDataWithYoY, isLoading, errors, refetch } = useMetricsData(
    revenueMetrics,
    { yearOverYear: true }
  );

  // Initial data fetch
  useEffect(() => {
    if (!metricsSummary.hasValidData) {
      fetchDataWithYoY();
    }
  }, [fetchDataWithYoY, metricsSummary.hasValidData]);

  return {
    ...revenueData,
    metricsSummary,
    refetch,
    isLoading,
    errors
  };
};

/**
 * Demographics data hook
 */
export const useDemographicsDataNormalized = () => {
  const demographicsMetrics = [
    METRIC_IDS.CONVERTED_CUSTOMERS_BY_GENDER,
    METRIC_IDS.CONVERTED_CUSTOMERS_BY_AGE,
    METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST,
    // TODO: Add customer segmentation metrics when API supports them
    // 'total_customers',
    // 'new_customers',
    // 'returning_customers'
  ];

  const demographicsData = useSelector(selectDemographicsData);
  const metricsSummary = useSelector(selectMetricsSummary);
  
  const { fetchData, fetchDataWithYoY, isLoading, errors, refetch } = useMetricsData(
    demographicsMetrics,
    { yearOverYear: true }
  );

  // Initial data fetch
  useEffect(() => {
    if (!metricsSummary.hasValidData) {
      fetchDataWithYoY();
    }
  }, [fetchDataWithYoY, metricsSummary.hasValidData]);

  return {
    ...demographicsData,
    metricsSummary,
    refetch,
    isLoading,
    errors
  };
};

// =============================================================================
// Component-Specific Data Hooks
// =============================================================================

/**
 * Hook for metric card data (UniversalMetricCard component)
 * Auto-fetches data if missing (for standalone usage)
 */
export const useMetricCardData = (metricId) => {
  const metricCardDataSelector = useCallback(
    createMetricCardDataSelector(metricId),
    [metricId]
  );
  
  const metricCardData = useSelector(metricCardDataSelector);
  const isLoading = useSelector(selectIsAnyDataLoading);
  
  // Auto-fetch if no data
  const { refetch } = useMetricsData([metricId], { yearOverYear: true });
  
  useEffect(() => {
    if (!metricCardData.merchantData.current && !isLoading) {
      refetch();
    }
  }, [metricCardData.merchantData.current, isLoading, refetch]);

  return {
    merchantData: metricCardData.merchantData,
    competitorData: metricCardData.competitorData,
    isLoading,
    refetch
  };
};

/**
 * Hook for metric card data (READ-ONLY - no auto-fetch)
 * Used when parent component handles data fetching
 */
export const useMetricCardDataReadOnly = (metricId) => {
  const metricCardDataSelector = useCallback(
    createMetricCardDataSelector(metricId),
    [metricId]
  );
  
  const metricCardData = useSelector(metricCardDataSelector);
  const isLoading = useSelector(selectIsAnyDataLoading);

  return {
    merchantData: metricCardData.merchantData,
    competitorData: metricCardData.competitorData,
    isLoading
  };
};

/**
 * Hook for time series chart data (TimeSeriesChart component)
 * Auto-fetches data if missing (for standalone usage)
 */
export const useTimeSeriesChartData = (metricId) => {
  const timeSeriesDataSelector = useCallback(
    createTimeSeriesChartDataSelector(metricId),
    [metricId]
  );
  
  const chartData = useSelector(timeSeriesDataSelector);
  const isLoading = useSelector(selectIsAnyDataLoading);
  
  // Auto-fetch if no data
  const { refetch } = useMetricsData([metricId], { yearOverYear: true });
  
  useEffect(() => {
    if (!chartData && !isLoading) {
      refetch();
    }
  }, [chartData, isLoading, refetch]);

  return {
    chartData,
    isLoading,
    refetch
  };
};

/**
 * Hook for time series chart data (READ-ONLY - no auto-fetch)
 * Used when parent component handles data fetching
 */
export const useTimeSeriesChartDataReadOnly = (metricId) => {
  const timeSeriesDataSelector = useCallback(
    createTimeSeriesChartDataSelector(metricId),
    [metricId]
  );
  
  const chartData = useSelector(timeSeriesDataSelector);
  const isLoading = useSelector(selectIsAnyDataLoading);

  return {
    chartData,
    isLoading
  };
};

/**
 * Hook for categorical chart data (breakdown charts)
 */
export const useCategoricalChartData = (metricId) => {
  const categoricalDataSelector = useCallback(
    createCategoricalChartDataSelector(metricId),
    [metricId]
  );
  
  const chartData = useSelector(categoricalDataSelector);
  const isLoading = useSelector(selectIsAnyDataLoading);
  
  // Auto-fetch if no data
  const { refetch } = useMetricsData([metricId], { yearOverYear: true });
  
  useEffect(() => {
    if (!chartData.length && !isLoading) {
      refetch();
    }
  }, [chartData.length, isLoading, refetch]);

  return {
    chartData,
    isLoading,
    refetch
  };
};

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook for monitoring data status
 */
export const useDataStatus = () => {
  const metricsSummary = useSelector(selectMetricsSummary);
  const isLoading = useSelector(selectIsAnyDataLoading);
  const errors = useSelector(selectAllDataErrors);
  
  return {
    ...metricsSummary,
    isLoading,
    errors,
    hasErrors: errors.length > 0
  };
};

/**
 * Hook for bulk data refresh
 */
export const useDataRefresh = () => {
  const dispatch = useDispatch();
  const apiRequestParams = useSelector(selectApiRequestParams);
  
  const refreshAllData = useCallback(() => {
    // Refresh all main metrics
    const allMetrics = [
      METRIC_IDS.TOTAL_REVENUE,
      METRIC_IDS.TOTAL_TRANSACTIONS,
      METRIC_IDS.AVG_TICKET_PER_USER,
      METRIC_IDS.AVG_DAILY_REVENUE,
      METRIC_IDS.GOFORMORE_AMOUNT,
      METRIC_IDS.REWARDED_AMOUNT,
      METRIC_IDS.REDEEMED_AMOUNT,
      METRIC_IDS.REVENUE_PER_DAY,
      METRIC_IDS.TRANSACTIONS_PER_DAY,
      METRIC_IDS.CUSTOMERS_PER_DAY,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_GENDER,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_AGE,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST,
      METRIC_IDS.REVENUE_BY_CHANNEL
    ];
    
    dispatch(fetchMetricsDataWithYearComparison({
      metricIDs: allMetrics,
      filters: apiRequestParams,
      options: { yearOverYear: true }
    }));
  }, [dispatch, apiRequestParams]);

  const refreshDashboard = useCallback(() => {
    const dashboardMetrics = [
      METRIC_IDS.TOTAL_REVENUE,
      METRIC_IDS.TOTAL_TRANSACTIONS,
      METRIC_IDS.AVG_TICKET_PER_USER,
      METRIC_IDS.REVENUE_PER_DAY,
      METRIC_IDS.TRANSACTIONS_PER_DAY,
      METRIC_IDS.CUSTOMERS_PER_DAY
    ];
    
    dispatch(fetchMetricsDataWithYearComparison({
      metricIDs: dashboardMetrics,
      filters: apiRequestParams,
      options: { yearOverYear: true }
    }));
  }, [dispatch, apiRequestParams]);

  const refreshRevenue = useCallback(() => {
    const revenueMetrics = [
      METRIC_IDS.TOTAL_REVENUE,
      METRIC_IDS.AVG_DAILY_REVENUE,
      METRIC_IDS.AVG_TICKET_PER_USER,
      METRIC_IDS.GOFORMORE_AMOUNT,
      METRIC_IDS.REWARDED_AMOUNT,
      METRIC_IDS.REDEEMED_AMOUNT,
      METRIC_IDS.REVENUE_PER_DAY,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST,
      METRIC_IDS.REVENUE_BY_CHANNEL
    ];
    
    dispatch(fetchMetricsDataWithYearComparison({
      metricIDs: revenueMetrics,
      filters: apiRequestParams,
      options: { yearOverYear: true }
    }));
  }, [dispatch, apiRequestParams]);

  return {
    refreshAllData,
    refreshDashboard,
    refreshRevenue
  };
};

/**
 * Hook for single metric management
 */
export const useMetric = (metricId) => {
  const metricCardData = useMetricCardData(metricId);
  const timeSeriesData = useTimeSeriesChartData(metricId);
  const categoricalData = useCategoricalChartData(metricId);
  
  return {
    metricId,
    cardData: metricCardData,
    timeSeriesData,
    categoricalData,
    refetch: metricCardData.refetch
  };
};