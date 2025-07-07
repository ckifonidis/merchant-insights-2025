import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/index.js';

// Request deduplication cache
const pendingRequests = new Map();

// Create request key for deduplication
const createRequestKey = ({ tabName, metricIDs, filters, isYearComparison = false }) => {
  const filterKey = JSON.stringify(filters, Object.keys(filters).sort());
  const metricsKey = metricIDs.slice().sort().join(',');
  const suffix = isYearComparison ? '_yoy' : '';
  return `${tabName}:${metricsKey}:${filterKey}${suffix}`;
};

// Async thunk for fetching tab data with automatic deduplication
export const fetchTabData = createAsyncThunk(
  'analytics/fetchTabData',
  async ({ tabName, metricIDs, filters, options = {} }, { rejectWithValue, getState }) => {
    const requestKey = createRequestKey({ tabName, metricIDs, filters });
    
    // Check if identical request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating ${tabName} request (already pending)`);
      return await pendingRequests.get(requestKey);
    }
    
    // Check if we already have fresh data in store (optional cache check)
    // IMPORTANT: Skip cache if filters have changed to ensure filtered data is fetched
    const filtersState = getState().filters;
    const hasFiltersChanged = filtersState.filtersChanged;
    
    const existingData = getState().analytics[tabName];
    if (existingData?.data && existingData.lastUpdated && !hasFiltersChanged) {
      const timeSinceUpdate = Date.now() - new Date(existingData.lastUpdated).getTime();
      if (timeSinceUpdate < 30000) { // 30 seconds cache
        console.log(`🔄 Using cached ${tabName} data (${timeSinceUpdate}ms old)`);
        return { tabName, data: existingData.data };
      }
    }
    
    // Skip cache when filters have changed to ensure fresh filtered data
    
    try {
      console.log(`🔄 Fetching ${tabName} data with metrics:`, metricIDs);
      console.log(`⚙️ Metric-specific options:`, options);
      
      // Create and cache the promise
      const requestPromise = analyticsService.fetchTabData(tabName, metricIDs, filters, options)
        .then(transformedData => {
          console.log(`✅ ${tabName} data loaded successfully:`, transformedData);
          return { tabName, data: transformedData };
        })
        .finally(() => {
          // Remove from pending requests when complete
          pendingRequests.delete(requestKey);
        });
      
      pendingRequests.set(requestKey, requestPromise);
      return await requestPromise;
      
    } catch (error) {
      pendingRequests.delete(requestKey);
      console.error(`❌ Failed to load ${tabName} data:`, error);
      return rejectWithValue({
        tabName,
        error: error.message || 'Failed to load data'
      });
    }
  }
);

// Async thunk for fetching year-over-year comparison data
export const fetchTabDataWithYearComparison = createAsyncThunk(
  'analytics/fetchTabDataWithYearComparison',
  async ({ tabName, metricIDs, filters, options = {} }, { rejectWithValue, getState }) => {
    const requestKey = createRequestKey({ tabName, metricIDs, filters, isYearComparison: true });
    
    // Check if identical request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating year-over-year ${tabName} request (already pending)`);
      return await pendingRequests.get(requestKey);
    }
    
    // Check if we already have fresh data in store (optional cache check)
    const filtersState = getState().filters;
    const hasFiltersChanged = filtersState.filtersChanged;
    
    const existingData = getState().analytics[tabName];
    if (existingData?.currentData && existingData?.previousData && existingData.lastUpdated && !hasFiltersChanged) {
      const timeSinceUpdate = Date.now() - new Date(existingData.lastUpdated).getTime();
      if (timeSinceUpdate < 30000) { // 30 seconds cache
        console.log(`🔄 Using cached year-over-year ${tabName} data (${timeSinceUpdate}ms old)`);
        return { 
          tabName, 
          currentData: existingData.currentData, 
          previousData: existingData.previousData,
          dateRanges: existingData.dateRanges
        };
      }
    }
    
    try {
      console.log(`🔄 Fetching year-over-year ${tabName} data with metrics:`, metricIDs);
      console.log(`⚙️ Year-over-year options:`, options);
      
      // Create and cache the promise
      const requestPromise = analyticsService.fetchTabDataWithYearComparison(tabName, metricIDs, filters, options)
        .then(yearOverYearData => {
          console.log(`✅ Year-over-year ${tabName} data loaded successfully:`, yearOverYearData);
          return { 
            tabName, 
            currentData: yearOverYearData.current, 
            previousData: yearOverYearData.previous,
            dateRanges: yearOverYearData.dateRanges,
            error: yearOverYearData.error || null
          };
        })
        .finally(() => {
          // Remove from pending requests when complete
          pendingRequests.delete(requestKey);
        });
      
      pendingRequests.set(requestKey, requestPromise);
      return await requestPromise;
      
    } catch (error) {
      pendingRequests.delete(requestKey);
      console.error(`❌ Failed to load year-over-year ${tabName} data:`, error);
      return rejectWithValue({
        tabName,
        error: error.message || 'Failed to load year-over-year data'
      });
    }
  }
);

// Initial state structure
const initialState = {
  dashboard: {
    data: {},
    currentData: {},
    previousData: {},
    dateRanges: null,
    loading: false,
    yearOverYearLoading: false,
    error: null,
    yearOverYearError: null,
    lastUpdated: null
  },
  revenue: {
    data: {},
    currentData: {},
    previousData: {},
    dateRanges: null,
    loading: false,
    yearOverYearLoading: false,
    error: null,
    yearOverYearError: null,
    lastUpdated: null
  },
  demographics: {
    data: {},
    currentData: {},
    previousData: {},
    dateRanges: null,
    loading: false,
    yearOverYearLoading: false,
    error: null,
    yearOverYearError: null,
    lastUpdated: null
  },
  competition: {
    data: {},
    currentData: {},
    previousData: {},
    dateRanges: null,
    loading: false,
    yearOverYearLoading: false,
    error: null,
    yearOverYearError: null,
    lastUpdated: null
  }
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Clear data for a specific tab
    clearTabData: (state, action) => {
      const { tabName } = action.payload;
      if (state[tabName]) {
        state[tabName].data = {};
        state[tabName].currentData = {};
        state[tabName].previousData = {};
        state[tabName].dateRanges = null;
        state[tabName].error = null;
        state[tabName].yearOverYearError = null;
        state[tabName].lastUpdated = null;
      }
    },
    
    // Clear all analytics data
    clearAllData: (state) => {
      Object.keys(state).forEach(tabName => {
        state[tabName].data = {};
        state[tabName].currentData = {};
        state[tabName].previousData = {};
        state[tabName].dateRanges = null;
        state[tabName].loading = false;
        state[tabName].yearOverYearLoading = false;
        state[tabName].error = null;
        state[tabName].yearOverYearError = null;
        state[tabName].lastUpdated = null;
      });
    },
    
    // Update specific metric in tab data
    updateMetric: (state, action) => {
      const { tabName, metricName, data } = action.payload;
      if (state[tabName]) {
        state[tabName].data[metricName] = data;
        state[tabName].lastUpdated = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tab data - pending
      .addCase(fetchTabData.pending, (state, action) => {
        const { tabName } = action.meta.arg;
        if (state[tabName]) {
          state[tabName].loading = true;
          state[tabName].error = null;
        }
      })
      
      // Fetch tab data - fulfilled
      .addCase(fetchTabData.fulfilled, (state, action) => {
        const { tabName, data } = action.payload;
        console.log(`🗃️ Redux store - Storing ${tabName} data:`, data);
        console.log(`🗃️ Redux store - Data type: ${typeof data}, keys:`, Object.keys(data || {}));
        if (state[tabName]) {
          state[tabName].loading = false;
          state[tabName].data = data;
          state[tabName].error = null;
          state[tabName].lastUpdated = new Date().toISOString();
          console.log(`🗃️ Redux store - ${tabName} state updated:`, state[tabName].data);
        }
      })
      
      // Fetch tab data - rejected
      .addCase(fetchTabData.rejected, (state, action) => {
        const { tabName, error } = action.payload || {};
        const tabNameFromMeta = action.meta?.arg?.tabName;
        const targetTab = tabName || tabNameFromMeta;
        
        if (state[targetTab]) {
          state[targetTab].loading = false;
          state[targetTab].error = error || action.error.message;
        }
      })
      
      // Year-over-year data - pending
      .addCase(fetchTabDataWithYearComparison.pending, (state, action) => {
        const { tabName } = action.meta.arg;
        if (state[tabName]) {
          state[tabName].yearOverYearLoading = true;
          state[tabName].yearOverYearError = null;
        }
      })
      
      // Year-over-year data - fulfilled
      .addCase(fetchTabDataWithYearComparison.fulfilled, (state, action) => {
        const { tabName, currentData, previousData, dateRanges, error } = action.payload;
        console.log(`🗃️ Redux store - Storing year-over-year ${tabName} data:`, { currentData, previousData, dateRanges });
        if (state[tabName]) {
          state[tabName].yearOverYearLoading = false;
          state[tabName].currentData = currentData || {};
          state[tabName].previousData = previousData || {};
          state[tabName].dateRanges = dateRanges || null;
          state[tabName].yearOverYearError = error || null;
          state[tabName].lastUpdated = new Date().toISOString();
          console.log(`🗃️ Redux store - Year-over-year ${tabName} state updated`);
        }
      })
      
      // Year-over-year data - rejected
      .addCase(fetchTabDataWithYearComparison.rejected, (state, action) => {
        const { tabName, error } = action.payload || {};
        const tabNameFromMeta = action.meta?.arg?.tabName;
        const targetTab = tabName || tabNameFromMeta;
        
        if (state[targetTab]) {
          state[targetTab].yearOverYearLoading = false;
          state[targetTab].yearOverYearError = error || action.error.message;
        }
      });
  }
});

// Action creators
export const { clearTabData, clearAllData, updateMetric } = analyticsSlice.actions;

// Selectors
export const selectTabData = (state, tabName) => state.analytics[tabName];
export const selectTabLoading = (state, tabName) => state.analytics[tabName]?.loading || false;
export const selectTabError = (state, tabName) => state.analytics[tabName]?.error;
export const selectAllTabs = (state) => state.analytics;

// Year-over-year selectors
export const selectTabCurrentData = (state, tabName) => state.analytics[tabName]?.currentData || {};
export const selectTabPreviousData = (state, tabName) => state.analytics[tabName]?.previousData || {};
export const selectTabYearOverYearLoading = (state, tabName) => state.analytics[tabName]?.yearOverYearLoading || false;
export const selectTabYearOverYearError = (state, tabName) => state.analytics[tabName]?.yearOverYearError;
export const selectTabDateRanges = (state, tabName) => state.analytics[tabName]?.dateRanges;

// Memoized selector for year-over-year data to prevent unnecessary rerenders
export const selectTabYearOverYearData = createSelector(
  [
    (state, tabName) => state.analytics[tabName]?.currentData,
    (state, tabName) => state.analytics[tabName]?.previousData,
    (state, tabName) => state.analytics[tabName]?.dateRanges,
    (state, tabName) => state.analytics[tabName]?.yearOverYearLoading,
    (state, tabName) => state.analytics[tabName]?.yearOverYearError
  ],
  (currentData, previousData, dateRanges, loading, error) => ({
    current: currentData || {},
    previous: previousData || {},
    dateRanges,
    loading: loading || false,
    error
  })
);

// Export reducer
export default analyticsSlice.reducer;