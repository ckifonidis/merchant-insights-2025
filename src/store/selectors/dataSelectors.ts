/**
 * Normalized Data Selectors
 * Provides memoized selectors for accessing metrics data in the new normalized structure
 */

import { createSelector } from '@reduxjs/toolkit';
import { METRIC_IDS } from '../../data/apiSchema.js';
import { getMetricStoreKey } from '../../utils/metricKeys.js';
import type { RootState } from '../index';
import type { MetricData } from '../../types/api';

interface MetricsState {
  [metricId: string]: MetricData;
}

interface DataMeta {
  lastUpdated: { [metricId: string]: string };
  freshness: { [metricId: string]: 'fresh' | 'stale' | 'error' };
  sources: { [metricId: string]: string };
  dateRanges: {
    current: { startDate: string; endDate: string } | null;
    previous: { startDate: string; endDate: string } | null;
  };
  validation: {
    hasValidCurrentData: boolean;
    hasValidPreviousData: boolean;
    missingMetrics: string[];
    incompletePeriods: string[];
  };
  globalLastUpdated: string | null;
  lastYoYUpdate: string | null;
}

interface DataLoading {
  metrics: boolean;
  yearOverYear: boolean;
  specificMetrics: { [metricId: string]: boolean };
}

interface DataErrors {
  metrics: string | null;
  yearOverYear: string | null;
  specificMetrics: { [metricId: string]: string };
}

// =============================================================================
// Basic Data Selectors
// =============================================================================

export const selectAllMetrics = (state: RootState): MetricsState => state.data?.metrics || {};
export const selectPreviousMetrics = (state: RootState): MetricsState => state.data?.previousMetrics || {};
export const selectDataMeta = (state: RootState): DataMeta => state.data?.meta || {} as DataMeta;
export const selectDataLoading = (state: RootState): DataLoading => state.data?.loading || {} as DataLoading;
export const selectDataErrors = (state: RootState): DataErrors => state.data?.errors || {} as DataErrors;

// Select metrics by IDs
export const selectMetricsByIds = createSelector(
  [selectAllMetrics, (state: RootState, metricIDs: string[]) => metricIDs],
  (allMetrics: MetricsState, metricIDs: string[]) => {
    if (!metricIDs || metricIDs.length === 0) return {};
    
    const result = {};
    metricIDs.forEach(metricId => {
      if (allMetrics[metricId]) {
        result[metricId] = allMetrics[metricId];
      }
    });
    return result;
  }
);

// Backwards compatibility aliases for useTabData
export const selectMetricsData = selectAllMetrics;
export const selectMetricsLoading = (state: RootState): boolean => state.data?.loading?.metrics || false;
export const selectMetricsError = (state: RootState): string | null => state.data?.errors?.metrics || null;

// =============================================================================
// Individual Metric Selectors
// =============================================================================

// Context-aware metric key resolver - uses utility functions for compound keys
const resolveMetricKey = (metricId: string, context?: string): string => {
  return getMetricStoreKey(metricId, context);
};

// Generic metric selector factory
export const createMetricSelector = (metricId: string) => createSelector(
  [selectAllMetrics],
  (metrics: MetricsState): MetricData | null => metrics[metricId] || null
);

// Context-aware metric selector factory
export const createContextAwareMetricSelector = (metricId: string, context?: string) => createSelector(
  [selectAllMetrics],
  (metrics: MetricsState): MetricData | null => {
    const resolvedKey = resolveMetricKey(metricId, context);
    return metrics[resolvedKey] || metrics[metricId] || null;
  }
);

// Specific metric selectors for commonly used metrics
export const selectTotalRevenue = createMetricSelector(METRIC_IDS.TOTAL_REVENUE);
export const selectTotalTransactions = createMetricSelector(METRIC_IDS.TOTAL_TRANSACTIONS);
export const selectAvgTicketPerUser = createMetricSelector(METRIC_IDS.AVG_TICKET_PER_USER);
export const selectAvgDailyRevenue = createMetricSelector(METRIC_IDS.AVG_DAILY_REVENUE);
export const selectGoForMoreAmount = createMetricSelector(METRIC_IDS.GOFORMORE_AMOUNT);
export const selectRewardedAmount = createMetricSelector(METRIC_IDS.REWARDED_AMOUNT);
export const selectRedeemedAmount = createMetricSelector(METRIC_IDS.REDEEMED_AMOUNT);

// Time series metric selectors
export const selectRevenuePerDay = createMetricSelector(METRIC_IDS.REVENUE_PER_DAY);
export const selectTransactionsPerDay = createMetricSelector(METRIC_IDS.TRANSACTIONS_PER_DAY);
export const selectCustomersPerDay = createMetricSelector(METRIC_IDS.CUSTOMERS_PER_DAY);

// Categorical metric selectors
export const selectCustomersByGender = createMetricSelector(METRIC_IDS.CONVERTED_CUSTOMERS_BY_GENDER);
export const selectCustomersByAge = createMetricSelector(METRIC_IDS.CONVERTED_CUSTOMERS_BY_AGE);
export const selectCustomersByInterest = createMetricSelector(METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST);
export const selectRevenueByChannel = createMetricSelector(METRIC_IDS.REVENUE_BY_CHANNEL);

// Context-specific selectors for metrics that require compound keys
export const selectCustomersByInterestRevenue = createContextAwareMetricSelector(METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST, 'revenue');
export const selectCustomersByInterestDemographics = createContextAwareMetricSelector(METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST, 'demographics');

// =============================================================================
// Entity-Specific Selectors (Merchant/Competitor)
// =============================================================================

// Merchant data selectors
export const createMerchantSelector = (metricId: string) => createSelector(
  [createMetricSelector(metricId)],
  (metric: MetricData | null) => metric?.merchant || null
);

export const createCompetitorSelector = (metricId: string) => createSelector(
  [createMetricSelector(metricId)],
  (metric: MetricData | null) => metric?.competitor || null
);

// Current/Previous data selectors
export const createCurrentDataSelector = (metricId: string, entity: 'merchant' | 'competitor' = 'merchant') => createSelector(
  [createMetricSelector(metricId)],
  (metric: MetricData | null) => metric?.[entity]?.current || null
);

export const createPreviousDataSelector = (metricId: string, entity: 'merchant' | 'competitor' = 'merchant') => createSelector(
  [createMetricSelector(metricId)],
  (metric: MetricData | null) => metric?.[entity]?.previous || null
);

// =============================================================================
// Year-over-Year Calculation Selectors
// =============================================================================

// Calculate percentage change between current and previous values
export const createYoYChangeSelector = (metricId, entity = 'merchant') => createSelector(
  [createCurrentDataSelector(metricId, entity), createPreviousDataSelector(metricId, entity)],
  (current, previous) => {
    if (current === null || previous === null) return null;
    
    // Handle scalar values
    if (typeof current === 'number' && typeof previous === 'number') {
      if (previous === 0) return null;
      return ((current - previous) / previous) * 100;
    }
    
    // Handle time series data (objects with date keys)
    if (typeof current === 'object' && typeof previous === 'object') {
      const changes = {};
      const currentDates = Object.keys(current);
      
      currentDates.forEach(date => {
        // For year-over-year, look for the same date in previous year
        const previousYearDate = new Date(date);
        previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);
        const prevDateKey = previousYearDate.toISOString().split('T')[0];
        
        if (previous[prevDateKey] && previous[prevDateKey] !== 0) {
          changes[date] = ((current[date] - previous[prevDateKey]) / previous[prevDateKey]) * 100;
        }
      });
      
      return Object.keys(changes).length > 0 ? changes : null;
    }
    
    return null;
  }
);

// =============================================================================
// Tab-Specific Data Selectors
// =============================================================================

// Dashboard data selector
export const selectDashboardData = createSelector(
  [
    selectTotalRevenue,
    selectTotalTransactions,
    selectAvgTicketPerUser,
    selectRevenuePerDay,
    selectTransactionsPerDay,
    selectCustomersPerDay,
    selectDataLoading,
    selectDataErrors
  ],
  (totalRevenue, totalTransactions, avgTicket, revenuePerDay, transactionsPerDay, customersPerDay, loading, errors) => ({
    metrics: {
      totalRevenue,
      totalTransactions,
      avgTicket
    },
    timeSeries: {
      revenuePerDay,
      transactionsPerDay,
      customersPerDay
    },
    loading: loading.metrics || loading.yearOverYear,
    errors: errors.metrics || errors.yearOverYear
  })
);

// Revenue data selector
export const selectRevenueData = createSelector(
  [
    selectTotalRevenue,
    selectAvgDailyRevenue,
    selectAvgTicketPerUser,
    selectGoForMoreAmount,
    selectRewardedAmount,
    selectRedeemedAmount,
    selectRevenuePerDay,
    selectCustomersByInterest,
    selectRevenueByChannel,
    selectDataLoading,
    selectDataErrors
  ],
  (totalRevenue, avgDaily, avgTicket, goForMore, rewarded, redeemed, revenuePerDay, 
   customersByInterest, revenueByChannel, loading, errors) => ({
    metrics: {
      totalRevenue,
      avgDaily,
      avgTicket
    },
    goForMore: {
      amount: goForMore,
      rewarded,
      redeemed
    },
    timeSeries: {
      revenuePerDay
    },
    breakdowns: {
      customersByInterest,
      revenueByChannel
    },
    loading: loading.metrics || loading.yearOverYear,
    errors: errors.metrics || errors.yearOverYear
  })
);

// Demographics data selector
export const selectDemographicsData = createSelector(
  [
    selectCustomersByGender,
    selectCustomersByAge,
    selectCustomersByInterest,
    selectDataLoading,
    selectDataErrors
  ],
  (customersByGender, customersByAge, customersByInterest, loading, errors) => ({
    breakdowns: {
      customersByGender,
      customersByAge,
      customersByInterest
    },
    loading: loading.metrics || loading.yearOverYear,
    errors: errors.metrics || errors.yearOverYear
  })
);

// =============================================================================
// Data Quality and Validation Selectors
// =============================================================================

// Check if metric has valid data
export const createHasValidDataSelector = (metricId) => createSelector(
  [createMetricSelector(metricId), selectDataMeta],
  (metric, meta) => {
    if (!metric) return false;
    
    const freshness = meta.freshness?.[metricId];
    return freshness !== 'error' && (metric.merchant || metric.competitor);
  }
);

// Check if metric is loading
export const createIsLoadingSelector = (metricId) => createSelector(
  [selectDataLoading],
  (loading) => loading.specificMetrics?.[metricId] || false
);

// Check if metric has error
export const createHasErrorSelector = (metricId) => createSelector(
  [selectDataErrors],
  (errors) => !!errors.specificMetrics?.[metricId]
);

// =============================================================================
// Component-Ready Data Selectors
// =============================================================================

// Prepare metric card data (for UniversalMetricCard component)
export const createMetricCardDataSelector = (metricId) => createSelector(
  [
    createCurrentDataSelector(metricId, 'merchant'),
    createPreviousDataSelector(metricId, 'merchant'),
    createCurrentDataSelector(metricId, 'competitor'),
    createPreviousDataSelector(metricId, 'competitor'),
    createYoYChangeSelector(metricId, 'merchant'),
    createYoYChangeSelector(metricId, 'competitor')
  ],
  (merchantCurrent, merchantPrevious, competitorCurrent, competitorPrevious, 
   merchantChange, competitorChange) => ({
    merchantData: {
      current: merchantCurrent,
      previous: merchantPrevious,
      change: typeof merchantChange === 'number' ? merchantChange : null
    },
    competitorData: competitorCurrent ? {
      current: competitorCurrent,
      previous: competitorPrevious,
      change: typeof competitorChange === 'number' ? competitorChange : null
    } : null
  })
);

// Prepare time series chart data (for TimeSeriesChart component)
export const createTimeSeriesChartDataSelector = (metricId) => createSelector(
  [createMetricSelector(metricId)],
  (metric) => {
    if (!metric) return null;
    
    // Transform normalized data to chart format
    const chartData = {
      merchant: [],
      competitor: []
    };
    
    // Process merchant data
    if (metric.merchant?.current) {
      chartData.merchant = Object.keys(metric.merchant.current)
        .sort()
        .map(date => ({
          date,
          value: metric.merchant.current[date],
          formattedDate: new Date(date).toLocaleDateString()
        }));
    }
    
    // Process competitor data
    if (metric.competitor?.current) {
      chartData.competitor = Object.keys(metric.competitor.current)
        .sort()
        .map(date => ({
          date,
          value: metric.competitor.current[date],
          formattedDate: new Date(date).toLocaleDateString()
        }));
    }
    
    return chartData;
  }
);

// Prepare categorical chart data (for breakdown charts)
export const createCategoricalChartDataSelector = (metricId) => createSelector(
  [createMetricSelector(metricId)],
  (metric) => {
    if (!metric) return [];
    
    const merchantData = metric.merchant?.current || {};
    const competitorData = metric.competitor?.current || {};
    
    // Get all categories
    const allCategories = new Set([
      ...Object.keys(merchantData),
      ...Object.keys(competitorData)
    ]);
    
    return Array.from(allCategories).map(category => ({
      category,
      merchant: merchantData[category] || 0,
      competitor: competitorData[category] || 0
    }));
  }
);

// =============================================================================
// Performance and Summary Selectors
// =============================================================================

// Get metrics summary for dashboard
export const selectMetricsSummary = createSelector(
  [selectAllMetrics, selectDataMeta],
  (metrics, meta) => {
    const totalMetrics = Object.keys(metrics).length;
    const freshMetrics = Object.values(meta.freshness || {}).filter(f => f === 'fresh').length;
    const staleMetrics = Object.values(meta.freshness || {}).filter(f => f === 'stale').length;
    const errorMetrics = Object.values(meta.freshness || {}).filter(f => f === 'error').length;
    
    return {
      totalMetrics,
      freshMetrics,
      staleMetrics,
      errorMetrics,
      lastUpdated: meta.lastUpdated,
      hasValidData: totalMetrics > 0 && errorMetrics < totalMetrics
    };
  }
);

// Check if any data is loading
export const selectIsAnyDataLoading = createSelector(
  [selectDataLoading],
  (loading) => loading.metrics || loading.yearOverYear || 
    Object.values(loading.specificMetrics || {}).some(isLoading => isLoading)
);

// Get all errors
export const selectAllDataErrors = createSelector(
  [selectDataErrors],
  (errors) => {
    const allErrors = [];
    
    if (errors.metrics) allErrors.push({ type: 'metrics', error: errors.metrics });
    if (errors.yearOverYear) allErrors.push({ type: 'yearOverYear', error: errors.yearOverYear });
    
    Object.keys(errors.specificMetrics || {}).forEach(metricId => {
      if (errors.specificMetrics[metricId]) {
        allErrors.push({ 
          type: 'metric', 
          metricId, 
          error: errors.specificMetrics[metricId] 
        });
      }
    });
    
    return allErrors;
  }
);