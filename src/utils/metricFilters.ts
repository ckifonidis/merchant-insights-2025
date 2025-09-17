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
  },
  'converted_customers_by_age': {
    // Required filters for age demographics metric
    required: {
      age_group_type: {
        default: 'customers',
        contexts: {
          demographics: 'customers' // Demographics tab shows customer age groups
        },
        options: ['customers'], // Valid values
        description: 'Age groups focused on customer demographics'
      }
    }
  },
  'converted_customers_by_gender': {
    // Required filters for gender demographics metric
    required: {
      // Gender metric may need customer context filters in the future
      // Currently using default behavior but configured for extensibility
    }
  }
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