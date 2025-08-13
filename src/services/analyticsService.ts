/**
 * Analytics Service - API Integration
 * 
 * Handles analytics API calls with authentication and error handling
 */

import { 
  getMultipleMetricFiltersForContext, 
  validateMetricFilters 
} from '../utils/metricFilters.js';
import { getPreviousYearDateRange } from '../utils/dateHelpers.js';
import { apiCallJson, handleAuthError } from '../utils/auth.js';

interface FilterValue {
  providerId: string;
  filterId: string;
  value: string;
}

interface AnalyticsRequestPayload {
  userID: string;
  startDate: string;
  endDate: string;
  providerId: string;
  metricIDs: string[];
  filterValues: FilterValue[];
  metricParameters: Record<string, any>;
  merchantId: string;
}

interface AnalyticsRequest {
  header: {
    ID: string;
    application: string;
  };
  payload: AnalyticsRequestPayload;
}

interface FetchOptions {
  metricSpecificFilters?: Record<string, any>;
  autoInferContext?: boolean;
  userID?: string;
  [key: string]: any;
}

interface YearComparisonResult {
  current: any;
  previous: any | null;
  dateRanges?: {
    current: { startDate: string; endDate: string };
    previous: { startDate: string; endDate: string };
  };
  error?: string;
}

interface BuildRequestParams {
  userID: string;
  startDate?: string;
  endDate?: string;
  merchantId?: string;
  metricIDs?: string[];
  filterValues?: FilterValue[];
  metricParameters?: Record<string, any>;
  metricSpecificFilters?: Record<string, any>;
  context?: string | null;
}

// API Configuration with proper typing and validation
interface ApiConfig {
  TIMEOUT: number;
  DEBUG: boolean;
}

const POST_PROMOTION_ANALYTICS = '56f9cf99-3727-4f2f-bf1c-58dc532ebaf5';

const API_ENDPOINTS = {
  ANALYTICS_QUERY: '/api/ANALYTICS/QUERY',
  AUTHORIZATION_CHECK: '/api/authorization/checkUserStatus',
  CONFIGURATION_ADMIN: '/api/CONFIGURATION/ADMIN/GET',
  CONFIGURATION_MERCHANT: '/api/CONFIGURATION/MERCHANT/GET'
};

const API_CONFIG: ApiConfig = {
  TIMEOUT: (() => {
    const envTimeout = import.meta.env?.VITE_API_TIMEOUT;
    const parsed = envTimeout ? parseInt(envTimeout, 10) : 180000;
    return isNaN(parsed) ? 180000 : parsed; // 3 minutes default
  })(),
  DEBUG: import.meta.env?.VITE_DEBUG_API === 'true' || import.meta.env?.DEV === true
};

class AnalyticsService {
  private readonly config: ApiConfig;

  constructor() {
    this.config = API_CONFIG;
  }

  /**
   * Fetch and transform data for a specific tab
   * This is the main method used by Redux thunks
   */
  async fetchTabData(tabName: string, metricIDs: string[], filters: Record<string, any>, options: FetchOptions = {}): Promise<any> {
    const { metricSpecificFilters = {}, autoInferContext = true, userID } = options;

    if (!userID) {
      throw new Error('userID is required for analytics tab data fetch');
    }

    // Build the analytics request with metric-specific filters
    const request = this.buildAnalyticsRequest({
      userID,
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
  async fetchTabDataWithYearComparison(tabName: string, metricIDs: string[], filters: Record<string, any>, options: FetchOptions = {}): Promise<YearComparisonResult> {
    const { metricSpecificFilters = {}, autoInferContext = true, userID } = options;

    if (!userID) {
      throw new Error('userID is required for analytics year comparison fetch');
    }

    // Calculate previous year date range
    console.log('🔍 DEBUG: Filters received in fetchTabDataWithYearComparison:', filters);
    const previousYearDates = getPreviousYearDateRange(filters.startDate, filters.endDate);
    console.log('🔍 DEBUG: Previous year dates calculated:', previousYearDates);
    
    if (!previousYearDates.startDate || !previousYearDates.endDate) {
      const currentData = await this.fetchTabData(tabName, metricIDs, filters, options);
      return {
        current: currentData,
        previous: null
      };
    }

    // Build requests for both current and previous year
    const currentRequest = this.buildAnalyticsRequest({
      userID,
      metricIDs,
      ...filters,
      metricSpecificFilters,
      context: autoInferContext ? tabName : null
    });
    
    console.log('🔍 DEBUG: Current request startDate/endDate:', {
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    console.log('🔍 DEBUG: Previous request startDate/endDate:', {
      startDate: previousYearDates.startDate,
      endDate: previousYearDates.endDate
    });

    const previousRequest = this.buildAnalyticsRequest({
      userID,
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

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Implement progressive fallback strategy for business continuity
      try {
        const currentData = await this.fetchTabData(tabName, metricIDs, filters, options);
        return {
          current: currentData,
          previous: null,
          error: `Previous year data unavailable: ${errorMessage}`
        };
      } catch (fallbackError: unknown) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
        throw new Error(`Critical failure - both current and previous year data failed: ${errorMessage} | ${fallbackMessage}`);
      }
    }
  }

  /**
   * Build analytics request in proper format
   */
  buildAnalyticsRequest(params: BuildRequestParams): AnalyticsRequest {
    const {
      userID,
      startDate = '2025-01-01',
      endDate = '2025-01-31',
      merchantId = 'test-merchant',
      metricIDs = [],
      filterValues = [],
      metricParameters = {},
      metricSpecificFilters = {},
      context = null
    } = params;
    if (!userID) {
      throw new Error('userID is required for analytics requests');
    }
    // Always include required data_origin filter
    const requiredFilters = [
      {
        providerId: POST_PROMOTION_ANALYTICS,
        filterId: "data_origin",
        value: "own_data"
      }
    ];

    // Merge required filters with user filters and metric-specific filters
    const combinedFilters = [
      ...requiredFilters, // Always required filters
      ...filterValues, // User filters from sidebar
      ...this._buildMetricSpecificFilters(metricIDs, context, metricSpecificFilters)
    ];

    if (API_CONFIG.DEBUG) {
      console.log('🔒 Required filters applied:', requiredFilters);
      console.log('📊 Total filters in request:', combinedFilters.length);
    }

    return {
      header: {
        ID: generateGUID(),
        application: '76A9FF99-64F9-4F72-9629-305CBE047902'
      },
      payload: {
        userID,
        startDate,
        endDate,
        providerId: POST_PROMOTION_ANALYTICS,
        metricIDs,
        filterValues: combinedFilters,
        metricParameters,
        merchantId
      }
    };
  }

  /**
   * Build metric-specific filters based on context and overrides
   */
  _buildMetricSpecificFilters(metricIDs: string[], context: string | null, overrides: Record<string, any> = {}): FilterValue[] {
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
          providerId: POST_PROMOTION_ANALYTICS,
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
   * Main analytics query method with comprehensive error handling
   */
  async queryAnalytics(request: AnalyticsRequest): Promise<any> {
    try {
      if (this.config.DEBUG) {
        console.log('🔍 Analytics API request:', {
          endpoint: `${API_ENDPOINTS.ANALYTICS_QUERY}`,
          metricIDs: request.payload?.metricIDs,
          hasFilters: !!request.payload?.filterValues?.length
        });
      }

      const response = await apiCallJson(`${API_ENDPOINTS.ANALYTICS_QUERY}`, {
        method: 'POST',
        body: JSON.stringify(request),
        timeout: this.config.TIMEOUT
      });

      if (this.config.DEBUG) {
        console.log('✅ Analytics API response received:', {
          hasPayload: !!response?.payload,
          dataPoints: response?.payload?.data?.length || 0
        });
      }

      return response;
    } catch (error: unknown) {
      console.error('❌ Analytics API call failed:', error);
      
      // Business-logic-aware error categorization and recovery
      if (error && typeof error === 'object' && 'status' in error) {
        const statusCode = (error as any).status;
        
        switch (statusCode) {
          case 401:
            // Authentication failure - delegate to auth handler
            handleAuthError(error);
            return null;
            
          case 403:
            // Authorization failure - user lacks permissions
            throw new Error('Access denied: Your account does not have permission to access this analytics data. Please contact your administrator.');
            
          case 429:
            // Rate limiting - implement exponential backoff
            const retryAfter = (error as any).headers?.['retry-after'] || '60';
            throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`);
            
          case 400:
            // Bad request - likely invalid filters or metric IDs
            const errorMessage = (error as any).message || 'Invalid request parameters';
            throw new Error(`Request validation failed: ${errorMessage}. Please check your filter settings and try again.`);
            
          case 500:
          case 502:
          case 503:
          case 504:
            // Server errors - suggest retry with graceful degradation
            throw new Error('Analytics service is temporarily unavailable. Data may be displayed from cache. Please try again in a few moments.');
            
          default:
            // Unknown HTTP error
            const message = error instanceof Error ? error.message : `HTTP ${statusCode} error`;
            throw new Error(`Analytics service error: ${message}`);
        }
      }
      
      // Network or other non-HTTP errors
      if (error instanceof Error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        }
        
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          throw new Error(`Request timed out after ${this.config.TIMEOUT / 1000} seconds. The analytics service may be experiencing high load.`);
        }
        
        // Re-throw with business context
        throw new Error(`Analytics data retrieval failed: ${error.message}`);
      }
      
      // Fallback for unknown error types
      throw new Error('An unexpected error occurred while retrieving analytics data. Please try again.');
    }
  }








}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Note: buildAnalyticsRequest is now only available as a class method
// Use analyticsService.buildAnalyticsRequest() for full feature support including metric-specific filters

export const buildFilterValue = (filterId: string, value: string): FilterValue => {
  return {
    providerId: POST_PROMOTION_ANALYTICS,
    filterId,
    value
  };
};

// Generate a new GUID for request headers
export const generateGUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};


export default analyticsService;