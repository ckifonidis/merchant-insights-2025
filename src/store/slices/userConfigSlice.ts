import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserConfiguration, fetchAllMerchantDetails as fetchAllMerchantDetailsService } from '../../services/userService.js';
import type { RootState } from '../index';

/**
 * Redux slice for user configuration management
 * Handles user preferences, merchant IDs, and analytics visualization preferences
 */

interface UserPreferences {
  userId: string;
  merchantIds: string[];
  [key: string]: any;
}

interface Merchant {
  id: string;
  name: string;
  logo?: string;
  customerCode?: string;
  address?: string;
  city?: string;
  sector?: string;
}

interface MerchantFetchError {
  merchantId: string;
  error: string;
}

interface UserConfigState {
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // User preferences data
  userPreferences: UserPreferences | null;
  userId: string | null;
  merchantIds: string[];
  
  // Analytics visualization preferences by provider
  analyticsMetricVisualizationPreferences: any[];
  
  // Merchant details
  merchants: Merchant[];
  merchantsLoading: boolean;
  merchantsError: string | null;
  merchantsFetchErrors: MerchantFetchError[];
  
  // Convenience flags
  isLoaded: boolean;
  hasValidConfig: boolean;
  merchantsLoaded: boolean;
}

interface FetchMerchantDetailsParams {
  userID: string;
  merchantIds: string[];
}

interface FetchMerchantDetailsResult {
  merchants: Merchant[];
  errors: MerchantFetchError[];
}

// Async thunk for fetching user configuration
export const fetchUserConfig = createAsyncThunk<UserPreferences | null, string>(
  'userConfig/fetchUserConfig',
  async (userID: string, { rejectWithValue }) => {
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

// Async thunk for fetching merchant details for all user's merchants
export const fetchAllMerchantDetails = createAsyncThunk<FetchMerchantDetailsResult, FetchMerchantDetailsParams>(
  'userConfig/fetchAllMerchantDetails',
  async ({ userID, merchantIds }: FetchMerchantDetailsParams, { rejectWithValue }) => {
    if (!userID) {
      return rejectWithValue('userID is required for merchant details fetch');
    }
    if (!Array.isArray(merchantIds) || merchantIds.length === 0) {
      return { merchants: [], errors: [] };
    }
    
    try {
      const merchants = await fetchAllMerchantDetailsService(userID, merchantIds);
      return { merchants, errors: [] };
    } catch (error) {
      console.error('Failed to fetch merchant details:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState: UserConfigState = {
  // Loading states
  isLoading: false,
  error: null,
  
  // User preferences data
  userPreferences: null,
  userId: null,
  merchantIds: [],
  
  // Analytics visualization preferences by provider
  analyticsMetricVisualizationPreferences: [],
  
  // Merchant details
  merchants: [], // Array of merchant objects with id, name, logo, customerCode
  merchantsLoading: false,
  merchantsError: null,
  merchantsFetchErrors: [], // Array of failed merchant fetches
  
  // Convenience flags
  isLoaded: false,
  hasValidConfig: false,
  merchantsLoaded: false
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
      state.merchants = [];
      state.merchantsLoading = false;
      state.merchantsError = null;
      state.merchantsFetchErrors = [];
      state.isLoaded = false;
      state.hasValidConfig = false;
      state.merchantsLoaded = false;
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
      })
      // Fetch merchant details
      .addCase(fetchAllMerchantDetails.pending, (state) => {
        state.merchantsLoading = true;
        state.merchantsError = null;
        state.merchantsFetchErrors = [];
      })
      .addCase(fetchAllMerchantDetails.fulfilled, (state, action) => {
        state.merchantsLoading = false;
        state.merchants = action.payload.merchants || [];
        state.merchantsFetchErrors = action.payload.errors || [];
        state.merchantsLoaded = true;
        
        // Set error if some merchants failed but still got some data
        if (action.payload.errors?.length > 0) {
          state.merchantsError = `Failed to fetch ${action.payload.errors.length} merchant(s)`;
        }
      })
      .addCase(fetchAllMerchantDetails.rejected, (state, action) => {
        state.merchantsLoading = false;
        state.merchantsError = action.payload;
        state.merchantsLoaded = true;
        state.merchants = [];
        state.merchantsFetchErrors = [];
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

// Merchant selectors
export const selectMerchants = (state) => state.userConfig.merchants;
export const selectMerchantsLoading = (state) => state.userConfig.merchantsLoading;
export const selectMerchantsError = (state) => state.userConfig.merchantsError;
export const selectMerchantsLoaded = (state) => state.userConfig.merchantsLoaded;
export const selectMerchantsFetchErrors = (state) => state.userConfig.merchantsFetchErrors;

// Get merchant by ID
export const selectMerchantById = (state) => (merchantId) => {
  return state.userConfig.merchants.find(merchant => merchant.id === merchantId) || null;
};

// Primary merchant selector (first merchant in the list)
export const selectPrimaryMerchant = (state) => {
  const merchants = state.userConfig.merchants;
  return merchants && merchants.length > 0 ? merchants[0] : null;
};

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