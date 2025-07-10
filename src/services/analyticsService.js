/**
 * Analytics Service - Mock Implementation
 * 
 * This service provides the exact same interface as the real API
 * Later we can swap this mock implementation with actual API calls
 */

import { 
  API_ENDPOINTS, 
  ANALYTICS_PROVIDER_IDS, 
  METRIC_IDS, 
  FILTER_IDS,
  FILTER_VALUES,
  SHOPPING_INTERESTS,
  GREEK_REGIONS,
  AGE_GROUPS
} from '../data/apiSchema.js';
import { transformTabData } from './transformations/index.js';
import { 
  getMultipleMetricFiltersForContext, 
  convertMetricFiltersToAPI, 
  validateMetricFilters 
} from '../data/metricFilters.js';
import { getPreviousYearDateRange } from '../utils/dateHelpers.js';

// Configuration for different environments
const API_CONFIG = {
  USE_MOCK_SERVER: import.meta.env.VITE_USE_MOCK_SERVER === 'true' || import.meta.env.DEV, // Default to mock server in dev
  MOCK_SERVER_URL: import.meta.env.VITE_MOCK_SERVER_URL || 'http://localhost:3001',
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  DEBUG: import.meta.env.VITE_DEBUG_API === 'true' || import.meta.env.DEV
};

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', API_CONFIG);
  console.log('🌍 Environment variables:', {
    VITE_USE_MOCK_SERVER: import.meta.env.VITE_USE_MOCK_SERVER,
    VITE_MOCK_SERVER_URL: import.meta.env.VITE_MOCK_SERVER_URL,
    DEV: import.meta.env.DEV
  });
}

class AnalyticsService {
  constructor() {
    this.providerIds = ANALYTICS_PROVIDER_IDS;
  }

  /**
   * Fetch and transform data for a specific tab
   * This is the main method used by Redux thunks
   */
  async fetchTabData(tabName, metricIDs, filters, options = {}) {
    console.log(`🔄 AnalyticsService.fetchTabData called for ${tabName}`);
    console.log(`📊 MetricIDs: ${metricIDs.join(', ')}`);
    console.log(`🔍 Filters:`, filters);
    console.log(`⚙️ Options:`, options);

    const { metricSpecificFilters = {}, autoInferContext = true } = options;

    // Build the analytics request with metric-specific filters
    const request = this.buildAnalyticsRequest({
      metricIDs,
      ...filters,
      metricSpecificFilters,
      context: autoInferContext ? tabName : null
    });

    // Call the API
    const rawResponse = await this.queryAnalytics(request);
    console.log(`📥 Raw API response for ${tabName}:`, rawResponse);

    // Return raw response - let components handle transformation
    console.log(`📤 Returning raw API response for ${tabName} (components will transform)`);

    return rawResponse;
  }

  /**
   * Fetch current year and previous year data simultaneously
   * Used for year-over-year comparisons
   */
  async fetchTabDataWithYearComparison(tabName, metricIDs, filters, options = {}) {
    console.log(`🔄 AnalyticsService.fetchTabDataWithYearComparison called for ${tabName}`);
    console.log(`📊 MetricIDs: ${metricIDs.join(', ')}`);
    console.log(`🔍 Filters:`, filters);

    const { metricSpecificFilters = {}, autoInferContext = true } = options;

    // Calculate previous year date range
    const previousYearDates = getPreviousYearDateRange(filters.startDate, filters.endDate);
    
    if (!previousYearDates.startDate || !previousYearDates.endDate) {
      console.warn('⚠️ Could not calculate previous year dates, fetching current year only');
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

    console.log(`📅 Current year request: ${filters.startDate} to ${filters.endDate}`);
    console.log(`📅 Previous year request: ${previousYearDates.startDate} to ${previousYearDates.endDate}`);

    try {
      // Execute both API calls in parallel
      const [currentResponse, previousResponse] = await Promise.all([
        this.queryAnalytics(currentRequest),
        this.queryAnalytics(previousRequest)
      ]);

      console.log(`📥 Current year API response for ${tabName}:`, currentResponse);
      console.log(`📥 Previous year API response for ${tabName}:`, previousResponse);

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
      console.error(`❌ Failed to load year-over-year data for ${tabName}:`, error);
      
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
   * Routes to either mock server or real API based on configuration
   */
  async queryAnalytics(request) {
    if (API_CONFIG.USE_MOCK_SERVER) {
      return this._callMockServer(request);
    } else {
      return this._callRealAPI(request);
    }
  }

  /**
   * Mock server call implementation
   */
  async _callMockServer(request) {
    try {
      if (API_CONFIG.DEBUG) {
        console.log('📊 Calling mock server with request:', request);
      }

      const response = await fetch(`${API_CONFIG.MOCK_SERVER_URL}${API_ENDPOINTS.ANALYTICS_QUERY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`Mock server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (API_CONFIG.DEBUG) {
        console.log('📊 Mock server response:', data);
      }

      return data;
    } catch (error) {
      console.error('Mock server call failed:', error);
      // Fallback to inline mock if server is not available
      console.warn('Falling back to inline mock data generation');
      return this._fallbackMockResponse(request);
    }
  }

  /**
   * Real API call implementation
   */
  async _callRealAPI(request) {
    try {
      if (API_CONFIG.DEBUG) {
        console.log('🌐 Calling real API with request:', request);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ANALYTICS_QUERY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._getAuthToken()}`
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (API_CONFIG.DEBUG) {
        console.log('🌐 Real API response:', data);
      }

      return data;
    } catch (error) {
      console.error('Real API call failed:', error);
      throw error;
    }
  }

  /**
   * Fallback mock response generator (used when mock server is unavailable)
   * Returns data in exact API format
   */
  async _fallbackMockResponse(request) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const { startDate, endDate, metricIDs, filterValues, merchantId } = request;
    
    const response = {
      payload: {
        metrics: []
      },
      exception: null,
      messages: null,
      executionTime: Math.random() * 1000
    };

    // Generate mock data for each requested metric
    for (const metricID of metricIDs) {
      const merchantMetric = this._generateMetricData(metricID, 'merchant', startDate, endDate, filterValues);
      const competitionMetric = this._generateMetricData(metricID, 'competition', startDate, endDate, filterValues);
      
      response.payload.metrics.push(merchantMetric);
      response.payload.metrics.push(competitionMetric);
    }

    return response;
  }

  /**
   * Generate mock metric data based on metric type
   */
  _generateMetricData(metricID, merchantType, startDate, endDate, filterValues) {
    const isCompetition = merchantType === 'competition';
    const multiplier = isCompetition ? 5.2 : 1; // Competition has ~5x more data

    switch (metricID) {
      case METRIC_IDS.REWARDED_POINTS:
        return {
          metricID,
          percentageValue: false,
          scalarValue: String(Math.floor((Math.random() * 50000 + 50000) * multiplier)),
          seriesValues: null,
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.REWARDED_AMOUNT:
        return {
          metricID,
          percentageValue: false,
          scalarValue: ((Math.random() * 10000 + 10000) * multiplier).toFixed(2),
          seriesValues: null,
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.REDEEMED_POINTS:
        return {
          metricID,
          percentageValue: false,
          scalarValue: String(Math.floor((Math.random() * 20000 + 20000) * multiplier)),
          seriesValues: null,
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.REDEEMED_AMOUNT:
        return {
          metricID,
          percentageValue: false,
          scalarValue: ((Math.random() * 500 + 500) * multiplier).toFixed(2),
          seriesValues: null,
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.TOTAL_TRANSACTIONS:
        return {
          metricID,
          percentageValue: false,
          scalarValue: ((Math.random() * 1000 + 1000) * multiplier).toFixed(1),
          seriesValues: null,
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.AVG_TICKET_PER_USER:
        return {
          metricID,
          percentageValue: false,
          scalarValue: String((Math.random() * 50 + 30) * (isCompetition ? 0.7 : 1)),
          seriesValues: null,
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.CONVERTED_CUSTOMERS_BY_ACTIVITY:
        return {
          metricID,
          percentageValue: false,
          scalarValue: null,
          seriesValues: [{
            seriesID: 'customers',
            seriesPoints: [
              { value1: String(Math.floor((500 + Math.random() * 400) * multiplier)), value2: 'frequent' },
              { value1: String(Math.floor((400 + Math.random() * 400) * multiplier)), value2: 'less_frequent' }
            ]
          }],
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.CONVERTED_CUSTOMERS_BY_AGE:
        return {
          metricID,
          percentageValue: false,
          scalarValue: null,
          seriesValues: [{
            seriesID: 'customers',
            seriesPoints: AGE_GROUPS.map(ageGroup => ({
              value1: String(Math.floor((Math.random() * 500 + 100) * multiplier)),
              value2: ageGroup
            }))
          }],
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.CONVERTED_CUSTOMERS_BY_GENDER:
        return {
          metricID,
          percentageValue: false,
          scalarValue: null,
          seriesValues: [{
            seriesID: 'customers',
            seriesPoints: [
              { value1: String(Math.floor((600 + Math.random() * 500) * multiplier)), value2: 'f' },
              { value1: String(Math.floor((400 + Math.random() * 300) * multiplier)), value2: 'm' }
            ]
          }],
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST:
        return {
          metricID,
          percentageValue: false,
          scalarValue: null,
          seriesValues: [{
            seriesID: 'customers',
            seriesPoints: [
              { value1: String(Math.floor(Math.random() * 50 * multiplier)), value2: '' },
              { value1: String(Math.floor(Math.random() * 100 * multiplier)), value2: 'other_category' },
              ...SHOPPING_INTERESTS.map(interest => ({
                value1: String(Math.floor((Math.random() * 800 + 100) * multiplier)),
                value2: interest
              }))
            ]
          }],
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.REVENUE_PER_DAY:
        return {
          metricID,
          percentageValue: false,
          scalarValue: null,
          seriesValues: [{
            seriesID: 'revenue',
            seriesPoints: this._generateDailyData(startDate, endDate, 'revenue', multiplier)
          }],
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.TRANSACTIONS_PER_DAY:
        return {
          metricID,
          percentageValue: false,
          scalarValue: null,
          seriesValues: [{
            seriesID: 'transactions',
            seriesPoints: this._generateDailyData(startDate, endDate, 'transactions', multiplier)
          }],
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.CUSTOMERS_PER_DAY:
        return {
          metricID,
          percentageValue: false,
          scalarValue: null,
          seriesValues: [{
            seriesID: 'customers',
            seriesPoints: this._generateDailyData(startDate, endDate, 'customers', multiplier)
          }],
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      case METRIC_IDS.TRANSACTIONS_BY_GEO:
        return {
          metricID,
          percentageValue: false,
          scalarValue: null,
          seriesValues: [{
            seriesID: 'transactions',
            seriesPoints: GREEK_REGIONS.map(region => ({
              value1: String((Math.random() * 500 + 50) * multiplier),
              value2: region
            }))
          }],
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };

      default:
        return {
          metricID,
          percentageValue: false,
          scalarValue: '0',
          seriesValues: null,
          merchantId: isCompetition ? 'competition' : 'ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ'
        };
    }
  }

  /**
   * Generate daily data points for time series
   */
  _generateDailyData(startDate, endDate, dataType, multiplier = 1) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data = [];
    
    const current = new Date(start);
    while (current <= end) {
      let value;
      
      // Generate realistic patterns based on day of week
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor = isWeekend ? 0.3 : 1;
      
      switch (dataType) {
        case 'revenue':
          value = (Math.random() * 8000 + 3000) * multiplier * weekendFactor;
          break;
        case 'transactions':
          value = (Math.random() * 100 + 40) * multiplier * weekendFactor;
          break;
        case 'customers':
          value = Math.floor((Math.random() * 80 + 40) * multiplier * weekendFactor);
          break;
        default:
          value = Math.random() * 100 * multiplier * weekendFactor;
      }
      
      data.push({
        value1: dataType === 'revenue' ? value.toFixed(2) : 
                 dataType === 'transactions' ? value.toFixed(1) : 
                 String(Math.floor(value)),
        value2: current.toISOString().split('T')[0]
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  }

  /**
   * Get authentication token (for real API)
   */
  _getAuthToken() {
    // In real implementation, get from secure storage
    return localStorage.getItem('authToken') || 'mock-token';
  }

  /**
   * Check user authorization status
   */
  async checkUserStatus(userID) {
    if (API_CONFIG.USE_REAL_API) {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTHORIZATION_CHECK}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID })
      });
      return await response.json();
    } else {
      // Mock response
      return {
        payload: { status: 'signed' },
        exception: null,
        messages: null,
        executionTime: 0.0
      };
    }
  }

  /**
   * Get merchant configuration
   */
  async getMerchantConfiguration(userID, merchantId) {
    if (API_CONFIG.USE_REAL_API) {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CONFIGURATION_MERCHANT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, merchantId })
      });
      return await response.json();
    } else {
      // Return mock configuration matching the real API structure
      return this._getMockConfiguration();
    }
  }

  /**
   * Mock configuration (simplified version of real config)
   */
  _getMockConfiguration() {
    return {
      payload: {
        configuration: {
          audienceFilteringProviders: [{
            providerId: ANALYTICS_PROVIDER_IDS.AUDIENCE_FILTERING,
            availableFeatures: {
              filters: Object.values(FILTER_IDS)
            },
            enabledFeatures: {
              filters: Object.values(FILTER_IDS)
            }
          }],
          postPromotionAnalyticsProviders: [{
            providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
            availableFeatures: {
              filters: Object.values(FILTER_IDS),
              metrics: Object.values(METRIC_IDS)
            },
            enabledFeatures: {
              filters: Object.values(FILTER_IDS),
              metrics: Object.values(METRIC_IDS)
            }
          }],
          merchantSettings: {
            minimumAudienceSize: 500,
            minPromotionPercentage: 2.0,
            minPromotionDuration: 3,
            maxPromotionDuration: 90,
            minimumCustomersForAnalyticsDisplay: 20,
            minimumCustomersForPercentageAnalyticsDisplay: 100,
            defaultAnalyticsTimespan: 1
          }
        }
      },
      exception: null,
      messages: null,
      executionTime: 0.0
    };
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

export default analyticsService;