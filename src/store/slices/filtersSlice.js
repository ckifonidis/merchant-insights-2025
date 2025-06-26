import { createSlice, createSelector } from '@reduxjs/toolkit';
import { 
  ANALYTICS_PROVIDER_IDS,
  FILTER_VALUES 
} from '../../data/apiSchema.js';

// Get default date range (last 30 days)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  return {
    startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    endDate: endDate.toISOString().split('T')[0]
  };
};

const initialState = {
  // Global date range
  dateRange: getDefaultDateRange(),
  
  // Merchant selection
  merchantId: "52ba3854-a5d4-47bd-9d1a-b789ae139803", // Default merchant
  
  // Provider selection
  providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
  
  // User context
  userID: "BANK\\E82629", // TODO: Get from auth context
  
  // Global filter values
  filterValues: [],
  
  // Competition comparison toggle (always true for now - data_origin filter not implemented)
  showCompetition: true,
  
  // Data refresh settings
  autoRefresh: false,
  refreshInterval: 300000, // 5 minutes in milliseconds
  
  // UI state
  isDatePickerOpen: false,
  selectedTab: 'dashboard'
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Date range management
    setDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.dateRange = { startDate, endDate };
      console.log('📅 Date range updated:', state.dateRange);
    },
    
    setStartDate: (state, action) => {
      state.dateRange.startDate = action.payload;
    },
    
    setEndDate: (state, action) => {
      state.dateRange.endDate = action.payload;
    },
    
    // Merchant selection
    setMerchantId: (state, action) => {
      state.merchantId = action.payload;
      console.log('🏪 Merchant changed:', state.merchantId);
    },
    
    // Provider selection
    setProviderId: (state, action) => {
      state.providerId = action.payload;
    },
    
    // User context
    setUserID: (state, action) => {
      state.userID = action.payload;
    },
    
    // Filter values management
    addFilterValue: (state, action) => {
      const newFilter = action.payload;
      const existingIndex = state.filterValues.findIndex(
        filter => filter.filterId === newFilter.filterId
      );
      
      if (existingIndex >= 0) {
        // Update existing filter
        state.filterValues[existingIndex] = newFilter;
      } else {
        // Add new filter
        state.filterValues.push(newFilter);
      }
    },
    
    removeFilterValue: (state, action) => {
      const { filterId } = action.payload;
      state.filterValues = state.filterValues.filter(
        filter => filter.filterId !== filterId
      );
    },
    
    clearAllFilters: (state) => {
      state.filterValues = [];
    },
    
    // Competition comparison
    toggleCompetition: (state) => {
      state.showCompetition = !state.showCompetition;
      
      // Add or remove competition filter
      const competitionFilterIndex = state.filterValues.findIndex(
        filter => filter.filterId === 'data_origin'
      );
      
      if (state.showCompetition) {
        // Add competition filter if not present
        if (competitionFilterIndex === -1) {
          state.filterValues.push({
            providerId: state.providerId,
            filterId: 'data_origin',
            value: FILTER_VALUES.DATA_ORIGIN.COMPETITION_COMPARISON
          });
        }
      } else {
        // Remove competition filter if present
        if (competitionFilterIndex >= 0) {
          state.filterValues.splice(competitionFilterIndex, 1);
        }
      }
      
      console.log('🏆 Competition toggle:', state.showCompetition);
    },
    
    setCompetition: (state, action) => {
      state.showCompetition = action.payload;
      
      // Handle filter update similar to toggle
      const competitionFilterIndex = state.filterValues.findIndex(
        filter => filter.filterId === 'data_origin'
      );
      
      if (state.showCompetition && competitionFilterIndex === -1) {
        state.filterValues.push({
          providerId: state.providerId,
          filterId: 'data_origin',
          value: FILTER_VALUES.DATA_ORIGIN.COMPETITION_COMPARISON
        });
      } else if (!state.showCompetition && competitionFilterIndex >= 0) {
        state.filterValues.splice(competitionFilterIndex, 1);
      }
    },
    
    // Auto refresh settings
    setAutoRefresh: (state, action) => {
      state.autoRefresh = action.payload;
    },
    
    setRefreshInterval: (state, action) => {
      state.refreshInterval = action.payload;
    },
    
    // UI state
    setDatePickerOpen: (state, action) => {
      state.isDatePickerOpen = action.payload;
    },
    
    setSelectedTab: (state, action) => {
      state.selectedTab = action.payload;
    },
    
    // Bulk filter update
    updateFilters: (state, action) => {
      const updates = action.payload;
      Object.keys(updates).forEach(key => {
        if (key in state) {
          state[key] = updates[key];
        }
      });
    },
    
    // Reset to defaults
    resetFilters: (state) => {
      return {
        ...initialState,
        dateRange: getDefaultDateRange()
      };
    }
  }
});

// Action creators
export const {
  setDateRange,
  setStartDate,
  setEndDate,
  setMerchantId,
  setProviderId,
  setUserID,
  addFilterValue,
  removeFilterValue,
  clearAllFilters,
  toggleCompetition,
  setCompetition,
  setAutoRefresh,
  setRefreshInterval,
  setDatePickerOpen,
  setSelectedTab,
  updateFilters,
  resetFilters
} = filtersSlice.actions;

// Selectors
export const selectDateRange = (state) => state.filters.dateRange;
export const selectMerchantId = (state) => state.filters.merchantId;
export const selectProviderId = (state) => state.filters.providerId;
export const selectUserID = (state) => state.filters.userID;
export const selectFilterValues = (state) => state.filters.filterValues;
export const selectShowCompetition = (state) => state.filters.showCompetition;
export const selectAutoRefresh = (state) => state.filters.autoRefresh;
export const selectSelectedTab = (state) => state.filters.selectedTab;
export const selectAllFilters = (state) => state.filters;

// Computed selectors - MEMOIZED to prevent infinite loops
export const selectApiRequestParams = createSelector(
  [
    (state) => state.filters.userID,
    (state) => state.filters.dateRange.startDate,
    (state) => state.filters.dateRange.endDate,
    (state) => state.filters.providerId,
    (state) => state.filters.filterValues,
    (state) => state.filters.merchantId
  ],
  (userID, startDate, endDate, providerId, filterValues, merchantId) => ({
    userID,
    startDate,
    endDate,
    providerId,
    filterValues,
    merchantId
  })
);

export default filtersSlice.reducer;