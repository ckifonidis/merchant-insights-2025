/**
 * Analytics Service - API Integration
 * 
 * Handles analytics API calls with authentication and error handling
 */

import { 
  API_ENDPOINTS, 
  ANALYTICS_PROVIDER_IDS 
} from '../data/apiSchema.js';
import { 
  getMultipleMetricFiltersForContext, 
  validateMetricFilters 
} from '../data/metricFilters.js';
import { getPreviousYearDateRange } from '../utils/dateHelpers.js';
import { apiCallJson, handleAuthError } from '../utils/auth.js';

// API Configuration
const API_CONFIG = {
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  DEBUG: import.meta.env.VITE_DEBUG_API === 'true' || import.meta.env.DEV
};


class AnalyticsService {
  constructor() {
    this.providerIds = ANALYTICS_PROVIDER_IDS;
  }

  /**
   * Fetch and transform data for a specific tab
   * This is the main method used by Redux thunks
   */
  async fetchTabData(tabName, metricIDs, filters, options = {}) {

    const { metricSpecificFilters = {}, autoInferContext = true } = options;

    // Build the analytics request with metric-specific filters
    const request = this.buildAnalyticsRequest({
      metricIDs,
      ...filters,
      metricSpecificFilters,
      context: autoInferContext ? tabName : null
    });

    // Execute the API call
    const rawResponse = await this.queryAnalytics(request);
    return rawResponse;
  }

  /**
   * Fetch current year and previous year data simultaneously
   * Used for year-over-year comparisons
   */
  async fetchTabDataWithYearComparison(tabName, metricIDs, filters, options = {}) {

    const { metricSpecificFilters = {}, autoInferContext = true } = options;

    // Calculate previous year date range
    const previousYearDates = getPreviousYearDateRange(filters.startDate, filters.endDate);
    
    if (!previousYearDates.startDate || !previousYearDates.endDate) {
      const currentData = await this.fetchTabData(tabName, metricIDs, filters, options);
      return {
        current: currentData,
        previous: null
      };
    }

    // Build requests for both current and previous year
    const currentRequest = this.buildAnalyticsRequest({
      metricIDs,
      ...filters,
      metricSpecificFilters,
      context: autoInferContext ? tabName : null
    });

    const previousRequest = this.buildAnalyticsRequest({
      metricIDs,
      ...filters,
      startDate: previousYearDates.startDate,
      endDate: previousYearDates.endDate,
      metricSpecificFilters,
      context: autoInferContext ? tabName : null
    });

    try {
      // Execute both API calls in parallel
      const [currentResponse, previousResponse] = await Promise.all([
        this.queryAnalytics(currentRequest),
        this.queryAnalytics(previousRequest)
      ]);

      // Return raw API responses - let API normalizer handle processing
      return {
        current: currentResponse,
        previous: previousResponse,
        dateRanges: {
          current: { startDate: filters.startDate, endDate: filters.endDate },
          previous: { startDate: previousYearDates.startDate, endDate: previousYearDates.endDate }
        }
      };

    } catch (error) {
      
      // Fallback: try to get at least current year data
      try {
        const currentData = await this.fetchTabData(tabName, metricIDs, filters, options);
        return {
          current: currentData,
          previous: null,
          error: `Previous year data unavailable: ${error.message}`
        };
      } catch (fallbackError) {
        throw new Error(`Both current and previous year data failed: ${fallbackError.message}`);
      }
    }
  }

  /**
   * Build analytics request in proper format
   */
  buildAnalyticsRequest({
    userID = 'BANK\\test',
    startDate = '2025-01-01',
    endDate = '2025-01-31',
    merchantId = 'test-merchant',
    metricIDs = [],
    filterValues = [],
    metricParameters = {},
    metricSpecificFilters = {},
    context = null
  }) {
    // Merge user filters with metric-specific filters
    const combinedFilters = [
      ...filterValues, // User filters from sidebar
      ...this._buildMetricSpecificFilters(metricIDs, context, metricSpecificFilters)
    ];

    return {
      header: {
        ID: `analytics-${Date.now()}`,
        application: 'merchant-insights-ui'
      },
      payload: {
        userID,
        startDate,
        endDate,
        providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
        metricIDs,
        filterValues: combinedFilters,
        metricParameters,
        merchantId
      }
    };
  }

  /**
   * Build metric-specific filters based on context and overrides
   * @param {string[]} metricIDs - Array of metric identifiers
   * @param {string|null} context - The context (usually tab name) for auto-inference
   * @param {Object} overrides - Explicit metric-specific filter overrides
   * @returns {Array} Array of filter objects in API format
   */
  _buildMetricSpecificFilters(metricIDs, context, overrides = {}) {
    const metricFilters = [];

    // Get auto-inferred filters based on context (tab name)
    const contextFilters = context ? getMultipleMetricFiltersForContext(metricIDs, context) : {};
    
    // Merge context-inferred filters with explicit overrides
    const finalMetricFilters = {};
    metricIDs.forEach(metricID => {
      const contextFilter = contextFilters[metricID] || {};
      const overrideFilter = overrides[metricID] || {};
      
      if (Object.keys(contextFilter).length > 0 || Object.keys(overrideFilter).length > 0) {
        finalMetricFilters[metricID] = { ...contextFilter, ...overrideFilter };
      }
    });

    // Validate and convert to API format
    Object.entries(finalMetricFilters).forEach(([metricID, filters]) => {
      // Validate filters
      const validation = validateMetricFilters(metricID, filters);
      if (!validation.valid) {
        console.warn(`Invalid metric filters for ${metricID}:`, validation.error);
        return;
      }

      // Convert to API format
      Object.entries(filters).forEach(([filterId, value]) => {
        metricFilters.push({
          providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
          filterId,
          value: String(value)
        });
      });
    });

    if (metricFilters.length > 0) {
      console.log(`🎯 Auto-generated metric-specific filters:`, metricFilters);
    }

    return metricFilters;
  }

  /**
   * Main analytics query method
   */
  async queryAnalytics(request) {
    try {
      if (API_CONFIG.DEBUG) {
        console.log('🔍 Analytics API request:', {
          endpoint: `${API_ENDPOINTS.ANALYTICS_QUERY}`,
          metricIDs: request.payload?.metricIDs,
          hasFilters: !!request.payload?.filterValues?.length
        });
      }

      const response = await apiCallJson(`${API_ENDPOINTS.ANALYTICS_QUERY}`, {
        method: 'POST',
        body: JSON.stringify(request)
      });

      if (API_CONFIG.DEBUG) {
        console.log('✅ Analytics API response received:', {
          hasPayload: !!response?.payload,
          dataPoints: response?.payload?.data?.length || 0
        });
      }

      return response;
    } catch (error) {
      console.error('❌ Analytics API call failed:', error);
      
      // Handle authentication errors
      if (error.status === 401) {
        handleAuthError(error);
        return null;
      }

      throw error;
    }
  }








}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export helper functions for building requests
export const buildAnalyticsRequest = ({
  userID = 'BANK\\test',
  startDate = '2025-01-01',
  endDate = '2025-01-31',
  merchantId = 'test-merchant',
  metricIDs = [],
  filterValues = [],
  metricParameters = {}
}) => {
  return {
    header: {
      ID: `analytics-${Date.now()}`,
      application: 'merchant-insights-ui'
    },
    payload: {
      userID,
      startDate,
      endDate,
      providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
      metricIDs,
      filterValues,
      metricParameters,
      merchantId
    }
  };
};

export const buildFilterValue = (filterId, value) => {
  return {
    providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
    filterId,
    value
  };
};

// Generate a new GUID for request headers
export const generateGUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Check user status API function with OAuth2 authentication
export const checkUserStatus = async (userID = 'XANDRH004400003') => {
  const requestBody = {
    header: {
      ID: generateGUID(),
      application: 'merchant-insights-ui'
    },
    payload: {
      userID
    }
  };
  
  try {
    if (API_CONFIG.DEBUG) {
      console.log('🔍 Checking user status for:', userID);
    }

    const response = await apiCallJson(`/api${API_ENDPOINTS.AUTHORIZATION_CHECK}`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    if (API_CONFIG.DEBUG) {
      console.log('✅ User status response:', {
        status: response?.payload?.status,
        hasPayload: !!response?.payload
      });
    }

    return response;
  } catch (error) {
    console.error('❌ Check user status error:', error);
    
    // Handle authentication errors
    if (error.status === 401) {
      handleAuthError(error);
      return null;
    }

    if (API_CONFIG.DEBUG) {
      console.error('Full error details:', error);
    }
    
    throw error;
  }
};

export default analyticsService;