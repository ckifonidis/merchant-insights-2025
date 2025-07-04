import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/index.js';

// Request deduplication cache
const pendingRequests = new Map();

// Create request key for deduplication
const createRequestKey = ({ tabName, metricIDs, filters }) => {
  const filterKey = JSON.stringify(filters, Object.keys(filters).sort());
  const metricsKey = metricIDs.slice().sort().join(',');
  return `${tabName}:${metricsKey}:${filterKey}`;
};

// Async thunk for fetching tab data with automatic deduplication
export const fetchTabData = createAsyncThunk(
  'analytics/fetchTabData',
  async ({ tabName, metricIDs, filters }, { rejectWithValue, getState }) => {
    const requestKey = createRequestKey({ tabName, metricIDs, filters });
    
    // Check if identical request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating ${tabName} request (already pending)`);
      return await pendingRequests.get(requestKey);
    }
    
    // Check if we already have fresh data in store (optional cache check)
    const existingData = getState().analytics[tabName];
    if (existingData?.data && existingData.lastUpdated) {
      const timeSinceUpdate = Date.now() - new Date(existingData.lastUpdated).getTime();
      if (timeSinceUpdate < 30000) { // 30 seconds cache
        console.log(`🔄 Using cached ${tabName} data (${timeSinceUpdate}ms old)`);
        return { tabName, data: existingData.data };
      }
    }
    
    try {
      console.log(`🔄 Fetching ${tabName} data with metrics:`, metricIDs);
      
      // Create and cache the promise
      const requestPromise = analyticsService.fetchTabData(tabName, metricIDs, filters)
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

// Initial state structure
const initialState = {
  dashboard: {
    data: {},
    loading: false,
    error: null,
    lastUpdated: null
  },
  revenue: {
    data: {},
    loading: false,
    error: null,
    lastUpdated: null
  },
  demographics: {
    data: {},
    loading: false,
    error: null,
    lastUpdated: null
  },
  competition: {
    data: {},
    loading: false,
    error: null,
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
        state[tabName].error = null;
        state[tabName].lastUpdated = null;
      }
    },
    
    // Clear all analytics data
    clearAllData: (state) => {
      Object.keys(state).forEach(tabName => {
        state[tabName].data = {};
        state[tabName].loading = false;
        state[tabName].error = null;
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

// Export reducer
export default analyticsSlice.reducer;