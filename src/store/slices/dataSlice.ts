import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/index.js';
import { apiNormalizer } from '../../services/normalization/apiNormalizer.js';
import type { RootState } from '../index';

// Import unified metric types - single source of truth
import type { 
  EntityData, 
  MetricData, 
  MetricsState, 
  DataMeta, 
  DateRange, 
  DataValidation 
} from '../../types/metrics';

interface DataState {
  metrics: MetricsState;
  previousMetrics: MetricsState;
  meta: DataMeta;
  loading: {
    metrics: boolean;
    yearOverYear: boolean;
    specificMetrics: Record<string, boolean>;
  };
  errors: {
    metrics: string | null;
    yearOverYear: string | null;
    specificMetrics: Record<string, string>;
  };
}

interface FetchMetricsPayload {
  metricIDs: string[];
  filters: Record<string, any>;
  options?: Record<string, any>;
  userID?: string | null;
}

interface RequestKeyParams {
  metricIDs: string[];
  filters: Record<string, any>;
  isYearComparison?: boolean;
}

interface SetMetricDataPayload {
  metricId: string;
  merchantData?: EntityData;
  competitorData?: EntityData;
  timestamp?: string;
}

interface SetMetricErrorPayload {
  metricId: string;
  error: string;
}

interface ClearMetricPayload {
  metricId: string;
}

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// Create request key for deduplication
const createRequestKey = ({ metricIDs, filters, isYearComparison = false }: RequestKeyParams): string => {
  const filterKey = JSON.stringify(filters, Object.keys(filters).sort());
  const metricsKey = metricIDs.slice().sort().join(',');
  const suffix = isYearComparison ? '_yoy' : '';
  const key = `${metricsKey}:${filterKey}${suffix}`;
  
  if (isYearComparison) {
    console.log('🔑 YoY Request Key:', key);
  }
  
  return key;
};

// Async thunk for fetching metrics data
export const fetchMetricsData = createAsyncThunk(
  'data/fetchMetrics',
  async ({ metricIDs, filters, options = {}, userID }: FetchMetricsPayload, { rejectWithValue, getState }) => {
    // Get userID from state if not provided directly
    let resolvedUserID = userID;
    if (!resolvedUserID) {
      const state = getState() as RootState;
      resolvedUserID = state.userConfig?.userId;
      
      if (!resolvedUserID) {
        return rejectWithValue({
          metricIDs,
          error: 'User ID is required but not available. Please ensure user is authenticated.'
        });
      }
    }
    const requestKey = createRequestKey({ metricIDs, filters });
    
    // Check if identical request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating metrics request (already pending)`);
      return await pendingRequests.get(requestKey);
    }
    
    // Check if we already have fresh data in store (optional cache check)
    const filtersState = getState().filters;
    const hasFiltersChanged = filtersState?.state?.filtersChanged || false;
    
    const existingData = getState().data;
    if (!hasFiltersChanged && existingData?.meta?.lastUpdated) {
      const timeSinceUpdate = Date.now() - new Date(existingData.meta.lastUpdated).getTime();
      if (timeSinceUpdate < 30000) { // 30 seconds cache
        console.log(`🔄 Using cached metrics data (${timeSinceUpdate}ms old)`);
        return { metricIDs, data: existingData.metrics };
      }
    }
    
    try {
      console.log(`🔄 Fetching metrics data:`, metricIDs);
      
      // Create and cache the promise
      const requestPromise = analyticsService.fetchTabData('metrics', metricIDs, filters, { ...options, userID })
        .then(apiResponse => {
          console.log(`📥 Raw API response:`, apiResponse);
          
          // Normalize the API response
          const normalizedData = apiNormalizer.normalizeApiResponse(apiResponse, metricIDs);
          console.log(`✅ Normalized metrics data:`, normalizedData);
          
          return { metricIDs, data: normalizedData };
        })
        .finally(() => {
          // Remove from pending requests when complete
          pendingRequests.delete(requestKey);
        });
      
      pendingRequests.set(requestKey, requestPromise);
      return await requestPromise;
      
    } catch (error: unknown) {
      pendingRequests.delete(requestKey);
      console.error(`❌ Failed to load metrics data:`, error);
      return rejectWithValue({
        metricIDs,
        error: error instanceof Error ? error.message : 'Failed to load data'
      });
    }
  }
);

// Async thunk for fetching year-over-year metrics data
export const fetchMetricsDataWithYearComparison = createAsyncThunk(
  'data/fetchMetricsYoY',
  async ({ metricIDs, filters, options = {}, userID }: FetchMetricsPayload, { rejectWithValue, getState }) => {
    // Get userID from state if not provided directly
    let resolvedUserID = userID;
    if (!resolvedUserID) {
      const state = getState() as RootState;
      resolvedUserID = state.userConfig?.userId;
      
      if (!resolvedUserID) {
        return rejectWithValue({
          metricIDs,
          error: 'User ID is required but not available. Please ensure user is authenticated.'
        });
      }
    }
    console.log(`🔍 DEBUG Step 0 - Thunk Called:`, {
      metricIDsReceived: metricIDs,
      filtersReceived: filters,
      optionsReceived: options
    });

    const requestKey = createRequestKey({ metricIDs, filters, isYearComparison: true });
    
    // Check if identical request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating year-over-year metrics request (already pending)`);
      console.log(`🔍 DEBUG: YoY Request Key:`, requestKey);
      return await pendingRequests.get(requestKey);
    }
    
    // Check cache similar to regular fetch
    const filtersState = getState().filters;
    const hasFiltersChanged = filtersState?.state?.filtersChanged || false;
    
    const existingData = getState().data;
    if (!hasFiltersChanged && existingData?.meta?.lastUpdated) {
      const timeSinceUpdate = Date.now() - new Date(existingData.meta.lastUpdated).getTime();
      if (timeSinceUpdate < 30000) { // 30 seconds cache
        console.log(`🔄 Using cached year-over-year metrics data (${timeSinceUpdate}ms old)`);
        return { 
          metricIDs, 
          currentData: existingData.metrics, 
          previousData: existingData.previousMetrics || {},
          dateRanges: existingData.meta.dateRanges
        };
      }
    }
    
    try {
      console.log(`🔄 Fetching year-over-year metrics data:`, metricIDs);
      
      // Create and cache the promise
      const requestPromise = analyticsService.fetchTabDataWithYearComparison('metrics', metricIDs, filters, { ...options, userID })
        .then(result => {
          console.log(`📥 Raw year-over-year API response:`, result);
          console.log(`🔍 DEBUG Step 1 - API Response Structure:`, {
            hasCurrentData: !!result.current,
            hasPreviousData: !!result.previous,
            currentDataKeys: result.current ? Object.keys(result.current) : 'no currentData',
            previousDataKeys: result.previous ? Object.keys(result.previous) : 'no previousData',
            resultKeys: Object.keys(result)
          });
          
          // Normalize both current and previous year data
          console.log(`🔍 DEBUG Step 2 - Before Normalization:`, {
            currentDataType: typeof result.current,
            previousDataType: typeof result.previous,
            metricIDsCount: metricIDs.length,
            metricIDs: metricIDs
          });

          const normalizedResult = apiNormalizer.normalizeYearOverYearResponse(
            result.current, 
            result.previous, 
            metricIDs
          );
          
          console.log(`🔍 DEBUG Step 3 - After Normalization:`, {
            hasNormalizedMetrics: !!normalizedResult.normalizedMetrics,
            normalizedMetricsKeys: normalizedResult.normalizedMetrics ? Object.keys(normalizedResult.normalizedMetrics) : 'none',
            hasErrors: !!normalizedResult.errors,
            errorsCount: normalizedResult.errors ? normalizedResult.errors.length : 0,
            fullNormalizedResult: normalizedResult
          });
          
          const returnPayload = { 
            metricIDs, 
            normalizedMetrics: normalizedResult.normalizedMetrics,
            errors: normalizedResult.errors,
            dateRanges: result.dateRanges
          };

          console.log(`🔍 DEBUG Step 4 - Thunk Return Payload:`, {
            payloadKeys: Object.keys(returnPayload),
            metricIDsCount: returnPayload.metricIDs.length,
            normalizedMetricsCount: returnPayload.normalizedMetrics ? Object.keys(returnPayload.normalizedMetrics).length : 0,
            fullPayload: returnPayload
          });

          return returnPayload;
        })
        .finally(() => {
          // Remove from pending requests when complete
          pendingRequests.delete(requestKey);
        });
      
      pendingRequests.set(requestKey, requestPromise);
      return await requestPromise;
      
    } catch (error: unknown) {
      pendingRequests.delete(requestKey);
      console.error(`❌ Failed to load year-over-year metrics data:`, error);
      return rejectWithValue({
        metricIDs,
        error: error instanceof Error ? error.message : 'Failed to load data'
      });
    }
  }
);

const initialState: DataState = {
  // Normalized metrics data structure
  metrics: {
    // Example structure:
    // total_revenue: {
    //   merchant: { current: 1500, previous: 1400 },
    //   competitor: { current: 1200, previous: 1100 }
    // },
    // revenue_per_day: {
    //   merchant: {
    //     current: { '2025-01-01': 100, '2025-01-02': 150 },
    //     previous: { '2024-01-01': 90, '2024-01-02': 140 }
    //   },
    //   competitor: {
    //     current: { '2025-01-01': 80, '2025-01-02': 120 },
    //     previous: { '2024-01-01': 75, '2024-01-02': 115 }
    //   }
    // }
  },
  
  // Previous year metrics data
  previousMetrics: {},
  
  // Data metadata and management
  meta: {
    // Last update timestamps per metric
    lastUpdated: {},
    
    // Data freshness indicators
    freshness: {},
    
    // Data source tracking
    sources: {},
    
    // Year-over-year date ranges
    dateRanges: {
      current: null,
      previous: null
    },
    
    // Data validation status
    validation: {
      hasValidCurrentData: false,
      hasValidPreviousData: false,
      missingMetrics: [],
      incompletePeriods: []
    },
    
    // Global timestamps
    globalLastUpdated: null,
    lastYoYUpdate: null
  },
  
  // Loading states
  loading: {
    metrics: false,
    yearOverYear: false,
    specificMetrics: {} // { metricId: boolean }
  },
  
  // Error states
  errors: {
    metrics: null,
    yearOverYear: null,
    specificMetrics: {} // { metricId: 'error message' }
  }
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Normalize and store single metric data
    setMetricData: (state, action) => {
      const { metricId, merchantData, competitorData, timestamp } = action.payload;
      
      if (!state.metrics[metricId]) {
        state.metrics[metricId] = {};
      }
      
      if (merchantData) {
        state.metrics[metricId].merchant = merchantData;
      }
      
      if (competitorData) {
        state.metrics[metricId].competitor = competitorData;
      }
      
      // Update metadata
      state.meta.lastUpdated[metricId] = timestamp || new Date().toISOString();
      state.meta.freshness[metricId] = 'fresh';
      state.meta.sources[metricId] = 'api';
    },
    
    // Set previous year data for a metric
    setPreviousMetricData: (state, action: { payload: SetMetricDataPayload }) => {
      const { metricId, merchantData, competitorData } = action.payload;
      
      if (!state.previousMetrics[metricId]) {
        state.previousMetrics[metricId] = {};
      }
      
      if (merchantData) {
        state.previousMetrics[metricId].merchant = merchantData;
      }
      
      if (competitorData) {
        state.previousMetrics[metricId].competitor = competitorData;
      }
    },
    
    // Bulk update metrics data
    setMultipleMetrics: (state, action: { payload: { metrics: Record<string, MetricData>; timestamp?: string } }) => {
      const { metrics, timestamp } = action.payload;
      
      Object.keys(metrics).forEach(metricId => {
        const metricData = metrics[metricId];
        
        if (!state.metrics[metricId]) {
          state.metrics[metricId] = {};
        }
        
        state.metrics[metricId] = {
          ...state.metrics[metricId],
          ...metricData
        };
        
        // Update metadata
        state.meta.lastUpdated[metricId] = timestamp || new Date().toISOString();
        state.meta.freshness[metricId] = 'fresh';
        state.meta.sources[metricId] = 'api';
      });
      
      // Update global timestamp - don't overwrite the object!
      // state.meta.lastUpdated should remain an object for individual metric timestamps
    },
    
    // Mark data as stale
    markDataStale: (state, action) => {
      const metricIds = action.payload || Object.keys(state.metrics);
      
      metricIds.forEach(metricId => {
        if (state.meta.freshness[metricId]) {
          state.meta.freshness[metricId] = 'stale';
        }
      });
    },
    
    // Clear specific metric data
    clearMetricData: (state, action) => {
      const metricId = action.payload;
      
      if (state.metrics[metricId]) {
        delete state.metrics[metricId];
      }
      
      if (state.previousMetrics[metricId]) {
        delete state.previousMetrics[metricId];
      }
      
      // Clear metadata
      delete state.meta.lastUpdated[metricId];
      delete state.meta.freshness[metricId];
      delete state.meta.sources[metricId];
      delete state.loading.specificMetrics[metricId];
      delete state.errors.specificMetrics[metricId];
    },
    
    // Clear all data
    clearAllData: (state) => {
      state.metrics = {};
      state.previousMetrics = {};
      state.meta = {
        ...initialState.meta,
        lastUpdated: {},
        freshness: {},
        sources: {}
      };
      state.loading.specificMetrics = {};
      state.errors.specificMetrics = {};
    },
    
    // Set date ranges for year-over-year comparison
    setDateRanges: (state, action) => {
      state.meta.dateRanges = action.payload;
    },
    
    // Update validation status
    updateValidation: (state, action) => {
      state.meta.validation = {
        ...state.meta.validation,
        ...action.payload
      };
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.errors = {
        metrics: null,
        yearOverYear: null,
        specificMetrics: {}
      };
    },
    
    // Clear specific error
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType in state.errors) {
        state.errors[errorType] = null;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch metrics data
    builder
      .addCase(fetchMetricsData.pending, (state, action) => {
        state.loading.metrics = true;
        state.errors.metrics = null;
        
        // Set loading state for specific metrics
        action.meta.arg.metricIDs.forEach(metricId => {
          state.loading.specificMetrics[metricId] = true;
          state.errors.specificMetrics[metricId] = null;
        });
      })
      .addCase(fetchMetricsData.fulfilled, (state, action) => {
        state.loading.metrics = false;
        const { metricIDs, data } = action.payload;
        
        // Store normalized data
        Object.keys(data).forEach(metricId => {
          if (!state.metrics[metricId]) {
            state.metrics[metricId] = {};
          }
          
          state.metrics[metricId] = {
            ...state.metrics[metricId],
            ...data[metricId]
          };
          
          // Update metadata
          const timestamp = new Date().toISOString();
          state.meta.lastUpdated[metricId] = timestamp;
          state.meta.freshness[metricId] = 'fresh';
          state.meta.sources[metricId] = 'api';
          
          // Clear loading and error states
          state.loading.specificMetrics[metricId] = false;
          state.errors.specificMetrics[metricId] = null;
        });
        
        // Update global timestamp - don't overwrite the object!
        // state.meta.lastUpdated should remain an object for individual metric timestamps
        
        console.log('✅ Metrics data stored in normalized structure');
      })
      .addCase(fetchMetricsData.rejected, (state, action) => {
        state.loading.metrics = false;
        const { metricIDs, error } = action.payload || {};
        
        state.errors.metrics = error;
        
        // Set error state for specific metrics
        if (metricIDs) {
          metricIDs.forEach(metricId => {
            state.loading.specificMetrics[metricId] = false;
            state.errors.specificMetrics[metricId] = error;
            state.meta.freshness[metricId] = 'error';
          });
        }
        
        console.error('❌ Failed to fetch metrics data:', error);
      });
    
    // Fetch year-over-year metrics data
    builder
      .addCase(fetchMetricsDataWithYearComparison.pending, (state, action) => {
        state.loading.yearOverYear = true;
        state.errors.yearOverYear = null;
        
        // Set loading state for specific metrics
        action.meta.arg.metricIDs.forEach(metricId => {
          state.loading.specificMetrics[metricId] = true;
          state.errors.specificMetrics[metricId] = null;
        });
      })
      .addCase(fetchMetricsDataWithYearComparison.fulfilled, (state, action) => {
        console.log(`🔍 DEBUG Step 5 - Reducer Received:`, {
          hasPayload: !!action.payload,
          payloadKeys: action.payload ? Object.keys(action.payload) : 'no payload',
          fullPayload: action.payload
        });

        state.loading.yearOverYear = false;
        const { metricIDs, normalizedMetrics, errors, dateRanges } = action.payload || {};

        console.log(`🔍 DEBUG Step 6 - Extracted from Payload:`, {
          metricIDsCount: metricIDs ? metricIDs.length : 'no metricIDs',
          normalizedMetricsCount: normalizedMetrics ? Object.keys(normalizedMetrics).length : 'no normalizedMetrics',
          errorsCount: errors ? errors.length : 'no errors'
        });
        
        // Store normalized metrics data (already includes current + previous)
        if (normalizedMetrics && Object.keys(normalizedMetrics).length > 0) {
          console.log(`🔍 DEBUG Step 7 - Before Storing Metrics:`, {
            stateBefore: Object.keys(state.metrics),
            metricsToStore: Object.keys(normalizedMetrics)
          });

          Object.keys(normalizedMetrics).forEach(metricId => {
            console.log(`🔍 DEBUG Step 8 - Storing ${metricId}:`, normalizedMetrics[metricId]);
            state.metrics[metricId] = normalizedMetrics[metricId];
            
            // Update metadata
            const timestamp = new Date().toISOString();
            if (!state.meta.lastUpdated) {
              state.meta.lastUpdated = {};
            }
            state.meta.lastUpdated[metricId] = timestamp;
            if (!state.meta.freshness) {
              state.meta.freshness = {};
            }
            state.meta.freshness[metricId] = 'fresh';
            if (!state.meta.sources) {
              state.meta.sources = {};
            }
            state.meta.sources[metricId] = 'api';
            
            // Clear loading and error states
            if (!state.loading.specificMetrics) {
              state.loading.specificMetrics = {};
            }
            state.loading.specificMetrics[metricId] = false;
            if (!state.errors.specificMetrics) {
              state.errors.specificMetrics = {};
            }
            state.errors.specificMetrics[metricId] = null;
          });

          console.log(`🔍 DEBUG Step 9 - After Storing Metrics:`, {
            stateAfter: Object.keys(state.metrics),
            metricsStored: Object.keys(state.metrics).length
          });
        } else {
          console.log(`❌ DEBUG - No metrics to store! normalizedMetrics:`, normalizedMetrics);
        }
        
        // Store any errors
        if (errors && errors.length > 0) {
          state.errors.yearOverYear = errors.join(', ');
        } else {
          state.errors.yearOverYear = null;
        }
        
        // Update date ranges
        if (dateRanges) {
          state.meta.dateRanges = dateRanges;
        }
        
        // Update global timestamps
        // Don't overwrite lastUpdated object - it stores individual metric timestamps
        state.meta.lastYoYUpdate = new Date().toISOString();
        
        // Update validation
        state.meta.validation.hasValidCurrentData = normalizedMetrics ? Object.keys(normalizedMetrics).length > 0 : false;
        state.meta.validation.hasValidPreviousData = normalizedMetrics ? Object.keys(normalizedMetrics).some(
          metricId => normalizedMetrics[metricId].merchant?.previous !== undefined
        ) : false;
        
        console.log('✅ Year-over-year metrics data stored in normalized structure');
      })
      .addCase(fetchMetricsDataWithYearComparison.rejected, (state, action) => {
        state.loading.yearOverYear = false;
        const { metricIDs, error } = action.payload || {};
        
        state.errors.yearOverYear = error;
        
        // Set error state for specific metrics
        if (metricIDs) {
          metricIDs.forEach(metricId => {
            state.loading.specificMetrics[metricId] = false;
            state.errors.specificMetrics[metricId] = error;
            state.meta.freshness[metricId] = 'error';
          });
        }
        
        console.error('❌ Failed to fetch year-over-year metrics data:', error);
      });
  }
});

// Action creators
export const {
  setMetricData,
  setPreviousMetricData,
  setMultipleMetrics,
  markDataStale,
  clearMetricData,
  clearAllData,
  setDateRanges,
  updateValidation,
  clearErrors,
  clearError
} = dataSlice.actions;

// Basic selectors
export const selectAllMetrics = (state) => state.data.metrics;
export const selectPreviousMetrics = (state) => state.data.previousMetrics;
export const selectDataMeta = (state) => state.data.meta;
export const selectDataLoading = (state) => state.data.loading;
export const selectDataErrors = (state) => state.data.errors;

// Specific metric selectors
export const selectMetric = (metricId) => (state) => state.data.metrics[metricId];
export const selectPreviousMetric = (metricId) => (state) => state.data.previousMetrics[metricId];

// Merchant/competitor specific selectors
export const selectMerchantMetric = (metricId) => (state) => state.data.metrics[metricId]?.merchant;
export const selectCompetitorMetric = (metricId) => (state) => state.data.metrics[metricId]?.competitor;

// Loading state selectors
export const selectIsLoadingMetric = (metricId) => (state) => 
  state.data.loading.specificMetrics[metricId] || false;

export const selectIsLoadingAnyMetrics = (state) => 
  state.data.loading.metrics || state.data.loading.yearOverYear || 
  Object.values(state.data.loading.specificMetrics).some(loading => loading);

// Error selectors
export const selectMetricError = (metricId) => (state) => 
  state.data.errors.specificMetrics[metricId];

// Metadata selectors
export const selectMetricFreshness = (metricId) => (state) => 
  state.data.meta.freshness[metricId];

export const selectMetricLastUpdated = (metricId) => (state) => 
  state.data.meta.lastUpdated[metricId];

export const selectDateRanges = (state) => state.data.meta.dateRanges;
export const selectDataValidation = (state) => state.data.meta.validation;

// Computed selectors (memoized)
export const selectMetricWithYearOverYear = createSelector(
  [(state, metricId) => selectMetric(metricId)(state), 
   (state, metricId) => selectPreviousMetric(metricId)(state)],
  (currentMetric, previousMetric) => ({
    current: currentMetric,
    previous: previousMetric,
    hasComparison: !!previousMetric
  })
);

// Calculate year-over-year percentage change for scalar metrics
export const selectMetricYoYChange = createSelector(
  [(state, metricId) => selectMerchantMetric(metricId)(state),
   (state, metricId) => state.data.previousMetrics[metricId]?.merchant],
  (current, previous) => {
    if (!current || !previous) return null;
    
    // Handle scalar values
    if (typeof current.current === 'number' && typeof previous.current === 'number') {
      if (previous.current === 0) return null;
      return ((current.current - previous.current) / previous.current) * 100;
    }
    
    return null;
  }
);

// Check if metric has valid data
export const selectHasValidMetricData = createSelector(
  [(state, metricId) => selectMetric(metricId)(state),
   (state, metricId) => selectMetricFreshness(metricId)(state)],
  (metric, freshness) => {
    return !!metric && freshness !== 'error' && (metric.merchant || metric.competitor);
  }
);

// Get metrics summary
export const selectMetricsSummary = createSelector(
  [selectAllMetrics, selectDataMeta],
  (metrics, meta) => {
    const totalMetrics = Object.keys(metrics).length;
    const freshMetrics = Object.values(meta.freshness).filter(f => f === 'fresh').length;
    const staleMetrics = Object.values(meta.freshness).filter(f => f === 'stale').length;
    const errorMetrics = Object.values(meta.freshness).filter(f => f === 'error').length;
    
    return {
      totalMetrics,
      freshMetrics,
      staleMetrics,
      errorMetrics,
      lastUpdated: meta.lastUpdated
    };
  }
);

export default dataSlice.reducer;