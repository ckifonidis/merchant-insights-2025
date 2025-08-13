/**
 * Metric Key Utilities
 * 
 * Handles generation and resolution of compound keys for metrics that require
 * context-specific filters (e.g., converted_customers_by_interest with different
 * interest_type values for revenue vs demographics contexts).
 * 
 * This solves the data store conflict where the same metric ID with different
 * filter contexts would overwrite each other in the Redux store.
 */

import { getMetricFiltersForContext } from '../data/metricFilters.js';

/**
 * Generate a compound key for a metric when it has context-specific filters
 * @param metricId - The base metric ID
 * @param context - The context (tab name) for metric-specific filters
 * @returns Compound key string or original metricId if no special filters
 */
export const generateMetricKey = (metricId: string, context?: string): string => {
  // If no context provided, return the original metric ID
  if (!context) {
    return metricId;
  }

  // Get metric-specific filters for this context
  const metricFilters = getMetricFiltersForContext(metricId, context);
  
  // If no metric-specific filters, return the original metric ID
  if (!metricFilters || Object.keys(metricFilters).length === 0) {
    return metricId;
  }

  // Create compound key by appending filter values
  const filterSuffix = Object.entries(metricFilters)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort for consistency
    .map(([filterId, value]) => `${filterId}_${value}`)
    .join('_');
  
  const compoundKey = `${metricId}_${filterSuffix}`;
  
  console.log(`🔑 Generated compound key: ${metricId} + context(${context}) → ${compoundKey}`);
  
  return compoundKey;
};

/**
 * Generate compound keys for multiple metrics in a given context
 * @param metricIds - Array of metric IDs
 * @param context - The context (tab name) for metric-specific filters
 * @returns Object mapping original metric IDs to their compound keys
 */
export const generateMetricKeys = (metricIds: string[], context?: string): Record<string, string> => {
  const keyMap: Record<string, string> = {};
  
  metricIds.forEach(metricId => {
    keyMap[metricId] = generateMetricKey(metricId, context);
  });
  
  return keyMap;
};

/**
 * Parse a compound key to extract the original metric ID and filter info
 * @param compoundKey - The compound key to parse
 * @returns Object with original metric ID and filter information
 */
export const parseMetricKey = (compoundKey: string): { 
  originalMetricId: string; 
  hasFilters: boolean; 
  filterInfo?: string 
} => {
  // Check if this is a compound key (contains underscore separators for filters)
  const knownMetricsWithFilters = ['converted_customers_by_interest'];
  
  for (const baseMetric of knownMetricsWithFilters) {
    if (compoundKey.startsWith(baseMetric + '_')) {
      const filterInfo = compoundKey.substring(baseMetric.length + 1);
      // Only consider it a compound key if the suffix looks like filter values
      if (filterInfo && (filterInfo.includes('revenue') || filterInfo.includes('customers'))) {
        return {
          originalMetricId: baseMetric,
          hasFilters: true,
          filterInfo
        };
      }
    }
  }
  
  // Not a compound key - return as-is
  return {
    originalMetricId: compoundKey,
    hasFilters: false
  };
};

/**
 * Check if a metric requires compound keys (has metric-specific filters)
 * @param metricId - The metric ID to check
 * @returns True if the metric has context-specific filters
 */
export const requiresCompoundKey = (metricId: string): boolean => {
  // Check if this metric is defined in metric-specific filters
  try {
    const testFilters = getMetricFiltersForContext(metricId, 'test');
    return Object.keys(testFilters).length > 0;
  } catch {
    return false;
  }
};

/**
 * Get the context-appropriate key for accessing metric data in selectors
 * @param metricId - The original metric ID  
 * @param context - The context (tab name)
 * @returns The appropriate key to use for store access
 */
export const getMetricStoreKey = (metricId: string, context?: string): string => {
  return generateMetricKey(metricId, context);
};

/**
 * Create a mapping of original metric IDs to their store keys for a given context
 * This is useful for updating selectors to use the correct keys
 * @param metricIds - Array of metric IDs
 * @param context - The context (tab name)
 * @returns Mapping of original IDs to store keys
 */
export const createMetricKeyMapping = (metricIds: string[], context?: string): Record<string, string> => {
  const mapping: Record<string, string> = {};
  
  metricIds.forEach(metricId => {
    mapping[metricId] = getMetricStoreKey(metricId, context);
  });
  
  return mapping;
};

/**
 * Debug utility to log compound key generation for troubleshooting
 * @param metricId - The metric ID
 * @param context - The context
 * @param generatedKey - The generated compound key
 */
export const logCompoundKeyGeneration = (metricId: string, context: string, generatedKey: string): void => {
  if (generatedKey !== metricId) {
    console.log(`🔍 Compound Key Debug:`, {
      originalMetricId: metricId,
      context,
      compoundKey: generatedKey,
      filters: getMetricFiltersForContext(metricId, context)
    });
  }
};