import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/index.js';

// Async thunk for fetching tab data
export const fetchTabData = createAsyncThunk(
  'analytics/fetchTabData',
  async ({ tabName, metricIDs, filters }, { rejectWithValue }) => {
    try {
      console.log(`🔄 Fetching ${tabName} data with metrics:`, metricIDs);
      
      const transformedData = await analyticsService.fetchTabData(tabName, metricIDs, filters);
      
      console.log(`✅ ${tabName} data loaded successfully:`, transformedData);
      return { tabName, data: transformedData };
    } catch (error) {
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
        if (state[tabName]) {
          state[tabName].loading = false;
          state[tabName].data = data;
          state[tabName].error = null;
          state[tabName].lastUpdated = new Date().toISOString();
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