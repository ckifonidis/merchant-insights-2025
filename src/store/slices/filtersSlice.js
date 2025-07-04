import { createSlice, createSelector } from '@reduxjs/toolkit';
import { 
  ANALYTICS_PROVIDER_IDS,
  FILTER_VALUES 
} from '../../data/apiSchema.js';
import { filterMappingService } from '../../services/filterMappingService.js';
import { subDays } from 'date-fns';

// Get default date range (last 30 days)
const getDefaultDateRange = () => {
  const endDate = subDays(new Date(), 1); // Yesterday
  const startDate = subDays(endDate, 30); // 30 days before yesterday
  
  return {
    startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    endDate: endDate.toISOString().split('T')[0],
    start: startDate.toISOString(), // Store as ISO string for Redux serialization
    end: endDate.toISOString()
  };
};

// Load persisted filters from localStorage
const loadPersistedFilters = () => {
  try {
    const stored = localStorage.getItem('merchant-insights-filters');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure dates are valid - keep as ISO strings for Redux serialization
      if (parsed.dateRange) {
        // Convert to ISO strings if they're Date objects
        if (parsed.dateRange.start instanceof Date) {
          parsed.dateRange.start = parsed.dateRange.start.toISOString();
        }
        if (parsed.dateRange.end instanceof Date) {
          parsed.dateRange.end = parsed.dateRange.end.toISOString();
        }
      }
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load persisted filters:', error);
  }
  return null;
};

// Save filters to localStorage
const persistFilters = (uiFilters) => {
  try {
    localStorage.setItem('merchant-insights-filters', JSON.stringify(uiFilters));
  } catch (error) {
    console.warn('Failed to persist filters:', error);
  }
};

// Initialize state with persisted filters
const getInitialState = () => {
  const defaultDateRange = getDefaultDateRange();
  const persistedFilters = loadPersistedFilters();
  
  const uiFilters = persistedFilters || {
    dateRange: defaultDateRange,
    channel: 'all',
    gender: 'all', 
    ageGroups: [],
    customerLocation: [],
    goForMore: null,
    shoppingInterests: [],
    stores: []
  };

  return {
    // Global date range (API format)
    dateRange: {
      startDate: uiFilters.dateRange.start?.toISOString?.()?.split('T')[0] || defaultDateRange.startDate,
      endDate: uiFilters.dateRange.end?.toISOString?.()?.split('T')[0] || defaultDateRange.endDate,
      start: uiFilters.dateRange.start || defaultDateRange.start,
      end: uiFilters.dateRange.end || defaultDateRange.end
    },
    
    // UI Filters (for FilterSidebar)
    uiFilters,
    
    // Merchant selection
    merchantId: "52ba3854-a5d4-47bd-9d1a-b789ae139803", // Default merchant
    
    // Provider selection
    providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
    
    // User context
    userID: "BANK\\E82629", // TODO: Get from auth context
    
    // Global filter values (API format)
    filterValues: [],
    
    // Competition comparison toggle
    showCompetition: true,
    
    // Data refresh settings
    autoRefresh: false,
    refreshInterval: 300000, // 5 minutes in milliseconds
    
    // UI state
    isDatePickerOpen: false,
    selectedTab: 'dashboard',
    
    // Track if filters have changed and need refresh
    filtersChanged: false
  };
};

const initialState = getInitialState();

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
    
    // UI Filters management
    updateUIFilters: (state, action) => {
      const newUIFilters = { ...state.uiFilters, ...action.payload };
      state.uiFilters = newUIFilters;
      
      // Update dateRange for API compatibility
      if (newUIFilters.dateRange) {
        state.dateRange = {
          startDate: newUIFilters.dateRange.start?.toISOString?.()?.split('T')[0] || state.dateRange.startDate,
          endDate: newUIFilters.dateRange.end?.toISOString?.()?.split('T')[0] || state.dateRange.endDate,
          start: newUIFilters.dateRange.start?.toISOString?.() || state.dateRange.start,
          end: newUIFilters.dateRange.end?.toISOString?.() || state.dateRange.end
        };
      }
      
      // DON'T convert to API format or trigger refresh here - only when Apply Filters is clicked
      // DON'T set filtersChanged = true here - only in applyFilters action
      
      // Persist to localStorage for UI state
      persistFilters(newUIFilters);
      
      // UI filters updated but not yet applied to API
    },
    
    applyFilters: (state) => {
      // This action is called when "Apply Filters" is clicked
      // Convert current UI filters to API format
      state.filterValues = filterMappingService.mapUIFiltersToAPI(state.uiFilters);
      state.filtersChanged = true;
      persistFilters(state.uiFilters);
    },
    
    markFiltersApplied: (state) => {
      // Called after data refresh to clear the changed flag
      state.filtersChanged = false;
    },
    
    // Reset to defaults
    resetFilters: (state) => {
      const defaultState = getInitialState();
      const defaultUIFilters = {
        dateRange: defaultState.dateRange,
        channel: 'all',
        gender: 'all',
        ageGroups: [],
        customerLocation: [],
        goForMore: null,
        shoppingInterests: [],
        stores: []
      };
      
      state.uiFilters = defaultUIFilters;
      state.dateRange = defaultState.dateRange;
      state.filterValues = [];
      state.filtersChanged = true;
      
      // Clear persistence
      localStorage.removeItem('merchant-insights-filters');
      
      console.log('🔄 Filters reset to defaults');
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
  updateUIFilters,
  applyFilters,
  markFiltersApplied,
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
export const selectUIFilters = (state) => state.filters.uiFilters;
export const selectFiltersChanged = (state) => state.filters.filtersChanged;

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