/**
 * Metric-Specific Filters Configuration
 * 
 * This file defines filters that are automatically applied to specific metrics
 * based on context (tab) or explicit configuration. These filters determine
 * the data structure/type returned by the API rather than filtering the data.
 * 
 * Example: interest_type filter determines if converted_customers_by_interest
 * returns revenue amounts or customer counts.
 */

import { ANALYTICS_PROVIDER_IDS } from './apiSchema.js';

export const METRIC_SPECIFIC_FILTERS = {
  'converted_customers_by_interest': {
    // Required filters for this metric
    required: {
      interest_type: {
        default: 'revenue',
        contexts: {
          revenue: 'revenue',      // Revenue tab shows revenue data
          demographics: 'customers' // Demographics tab shows customer counts
        },
        options: ['revenue', 'customers'], // Valid values
        description: 'Determines if API returns revenue amounts or customer counts'
      }
    }
  }
  
  // Future metrics can be added here following the same pattern
  // Example:
  // 'future_metric_example': {
  //   required: {
  //     data_aggregation: {
  //       default: 'daily',
  //       contexts: {
  //         dashboard: 'daily',
  //         analytics: 'hourly'
  //       },
  //       options: ['hourly', 'daily', 'weekly'],
  //       description: 'Time aggregation level for the metric'
  //     }
  //   }
  // }
};

/**
 * Get metric-specific filters for a given metric in a specific context
 * @param {string} metricID - The metric identifier
 * @param {string} context - The context (usually tab name)
 * @returns {Object} Object with filterId: value pairs
 */
export const getMetricFiltersForContext = (metricID, context) => {
  const config = METRIC_SPECIFIC_FILTERS[metricID];
  if (!config) return {};
  
  const filters = {};
  Object.entries(config.required).forEach(([filterId, filterConfig]) => {
    const value = filterConfig.contexts[context] || filterConfig.default;
    filters[filterId] = value;
  });
  
  return filters;
};

/**
 * Get all metric-specific filters for multiple metrics in a context
 * @param {string[]} metricIDs - Array of metric identifiers
 * @param {string} context - The context (usually tab name)
 * @returns {Object} Object with metricID as keys and filter objects as values
 */
export const getMultipleMetricFiltersForContext = (metricIDs, context) => {
  const result = {};
  
  metricIDs.forEach(metricID => {
    const filters = getMetricFiltersForContext(metricID, context);
    if (Object.keys(filters).length > 0) {
      result[metricID] = filters;
    }
  });
  
  return result;
};

/**
 * Convert metric-specific filters to API filter format
 * @param {Object} metricFilters - Object with metricID: {filterId: value} structure
 * @param {string} providerId - The provider ID to use
 * @returns {Array} Array of filter objects in API format
 */
export const convertMetricFiltersToAPI = (metricFilters, providerId = ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS) => {
  const apiFilters = [];
  
  Object.entries(metricFilters).forEach(([metricID, filters]) => {
    Object.entries(filters).forEach(([filterId, value]) => {
      apiFilters.push({
        providerId,
        filterId,
        value: String(value)
      });
    });
  });
  
  return apiFilters;
};

/**
 * Validate metric-specific filters
 * @param {string} metricID - The metric identifier
 * @param {Object} filters - Object with filterId: value pairs
 * @returns {Object} Validation result with valid boolean and optional error message
 */
export const validateMetricFilters = (metricID, filters) => {
  const config = METRIC_SPECIFIC_FILTERS[metricID];
  if (!config) return { valid: true };

  for (const [filterId, value] of Object.entries(filters)) {
    const filterConfig = config.required[filterId];
    if (filterConfig && !filterConfig.options.includes(value)) {
      return {
        valid: false,
        error: `Invalid value '${value}' for ${filterId}. Valid options: ${filterConfig.options.join(', ')}`
      };
    }
  }
  
  return { valid: true };
};

/**
 * Get all available metric-specific filters for documentation/debugging
 * @returns {Object} Complete configuration object
 */
export const getAllMetricFilters = () => METRIC_SPECIFIC_FILTERS;

/**
 * Check if a metric requires metric-specific filters
 * @param {string} metricID - The metric identifier
 * @returns {boolean} True if metric has required filters
 */
export const metricRequiresSpecificFilters = (metricID) => {
  return !!METRIC_SPECIFIC_FILTERS[metricID];
};

/**
 * Get available contexts for a metric
 * @param {string} metricID - The metric identifier
 * @returns {string[]} Array of available context names
 */
export const getAvailableContextsForMetric = (metricID) => {
  const config = METRIC_SPECIFIC_FILTERS[metricID];
  if (!config) return [];
  
  const contexts = new Set();
  Object.values(config.required).forEach(filterConfig => {
    Object.keys(filterConfig.contexts).forEach(context => {
      contexts.add(context);
    });
  });
  
  return Array.from(contexts);
};

export default METRIC_SPECIFIC_FILTERS;