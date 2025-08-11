import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserConfiguration } from '../../services/userService.js';

/**
 * Redux slice for user configuration management
 * Handles user preferences, merchant IDs, and analytics visualization preferences
 */

// Async thunk for fetching user configuration
export const fetchUserConfig = createAsyncThunk(
  'userConfig/fetchUserConfig',
  async (userID, { rejectWithValue }) => {
    if (!userID) {
      return rejectWithValue('userID is required for user configuration fetch');
    }
    
    try {
      const response = await fetchUserConfiguration(userID);
      return response.payload?.userPreferences || null;
    } catch (error) {
      console.error('Failed to fetch user configuration:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Loading states
  isLoading: false,
  error: null,
  
  // User preferences data
  userPreferences: null,
  userId: null,
  merchantIds: [],
  
  // Analytics visualization preferences by provider
  analyticsMetricVisualizationPreferences: [],
  
  // Convenience flags
  isLoaded: false,
  hasValidConfig: false
};

const userConfigSlice = createSlice({
  name: 'userConfig',
  initialState,
  reducers: {
    // Clear user configuration (useful for logout)
    clearUserConfig: (state) => {
      state.userPreferences = null;
      state.userId = null;
      state.merchantIds = [];
      state.analyticsMetricVisualizationPreferences = [];
      state.isLoaded = false;
      state.hasValidConfig = false;
      state.error = null;
    },
    
    // Update specific merchant IDs (if needed for dynamic updates)
    updateMerchantIds: (state, action) => {
      state.merchantIds = action.payload;
      if (state.userPreferences) {
        state.userPreferences.merchantIds = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user configuration
      .addCase(fetchUserConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPreferences = action.payload;
        
        if (action.payload) {
          // Store the userId from the user preferences response
          state.userId = action.payload.userId;
          state.merchantIds = action.payload.merchantIds || [];
          state.analyticsMetricVisualizationPreferences = action.payload.analyticsMetricVisualizationPreferences || [];
          state.hasValidConfig = !!(action.payload.userId && action.payload.merchantIds?.length > 0);
        }
        
        state.isLoaded = true;
      })
      .addCase(fetchUserConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isLoaded = true;
        state.hasValidConfig = false;
      });
  }
});

// Actions
export const { clearUserConfig, updateMerchantIds } = userConfigSlice.actions;

// Selectors
export const selectUserConfig = (state) => state.userConfig;
export const selectUserPreferences = (state) => state.userConfig.userPreferences;
export const selectUserId = (state) => state.userConfig.userId;
export const selectMerchantIds = (state) => state.userConfig.merchantIds;
export const selectAnalyticsPreferences = (state) => state.userConfig.analyticsMetricVisualizationPreferences;
export const selectUserConfigLoading = (state) => state.userConfig.isLoading;
export const selectUserConfigError = (state) => state.userConfig.error;
export const selectHasValidConfig = (state) => state.userConfig.hasValidConfig;
export const selectIsConfigLoaded = (state) => state.userConfig.isLoaded;

// Primary merchant ID selector (first in the list)
export const selectPrimaryMerchantId = (state) => {
  const merchantIds = state.userConfig.merchantIds;
  return merchantIds && merchantIds.length > 0 ? merchantIds[0] : null;
};

// Visualization preferences by provider ID
export const selectVisualizationPreferencesByProvider = (state) => (providerId) => {
  const preferences = state.userConfig.analyticsMetricVisualizationPreferences || [];
  const providerPrefs = preferences.find(p => p.providerId === providerId);
  return providerPrefs?.metricVisualizationPreferencesList || [];
};

export default userConfigSlice.reducer;