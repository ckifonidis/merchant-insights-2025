import { createSlice, createSelector } from '@reduxjs/toolkit';
import { 
  ANALYTICS_PROVIDER_IDS,
  SHOPPING_INTERESTS,
  AGE_GROUPS,
  GREEK_REGIONS
} from '../../data/apiSchema.js';
import { subDays, format } from 'date-fns';

// Date range presets
const DATE_PRESETS = {
  lastWeek: 'lastWeek',
  lastMonth: 'lastMonth', 
  lastQuarter: 'lastQuarter',
  lastYear: 'lastYear',
  custom: 'custom'
};

// Get preset date range
const getPresetDateRange = (preset) => {
  const endDate = subDays(new Date(), 1); // Yesterday
  let startDate;
  
  switch (preset) {
    case DATE_PRESETS.lastWeek:
      startDate = subDays(endDate, 7);
      break;
    case DATE_PRESETS.lastMonth:
      startDate = subDays(endDate, 30);
      break;
    case DATE_PRESETS.lastQuarter:
      startDate = subDays(endDate, 90);
      break;
    case DATE_PRESETS.lastYear:
      startDate = subDays(endDate, 365);
      break;
    default:
      startDate = subDays(endDate, 30); // Default to last month
  }
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

// Load persisted filters from localStorage
const loadPersistedFilters = () => {
  try {
    const stored = localStorage.getItem('merchant-insights-filters-v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and sanitize persisted data
      return {
        ...parsed,
        dateRange: {
          ...parsed.dateRange,
          preset: parsed.dateRange?.preset || DATE_PRESETS.lastMonth
        }
      };
    }
  } catch (error) {
    console.warn('Failed to load persisted filters:', error);
  }
  return null;
};

// Save filters to localStorage
const persistFilters = (uiFilters) => {
  try {
    localStorage.setItem('merchant-insights-filters-v2', JSON.stringify(uiFilters));
  } catch (error) {
    console.warn('Failed to persist filters:', error);
  }
};

// Default filter options (can be overridden by API)
const getDefaultFilterOptions = () => ({
  channel: ['all', 'ecommerce', 'physical'],
  gender: ['all', 'male', 'female'], 
  ageGroups: AGE_GROUPS,
  regions: GREEK_REGIONS,
  municipalities: [], // Loaded dynamically based on regions
  shoppingInterests: SHOPPING_INTERESTS,
  stores: [] // Loaded from API
});

// Initialize state
const getInitialState = () => {
  const persistedFilters = loadPersistedFilters();
  const defaultDateRange = getPresetDateRange(DATE_PRESETS.lastMonth);
  const defaultOptions = getDefaultFilterOptions();
  
  // Default UI filters
  const defaultUIFilters = {
    dateRange: {
      start: defaultDateRange.start,
      end: defaultDateRange.end,
      preset: DATE_PRESETS.lastMonth
    },
    channel: {
      selected: 'all',
      options: defaultOptions.channel
    },
    demographics: {
      gender: {
        selected: 'all',
        options: defaultOptions.gender
      },
      ageGroups: {
        selected: [],
        options: defaultOptions.ageGroups,
        multiSelect: true
      }
    },
    location: {
      regions: {
        selected: [],
        options: defaultOptions.regions,
        multiSelect: true
      },
      municipalities: {
        selected: [],
        options: defaultOptions.municipalities,
        multiSelect: true
      }
    },
    goForMore: {
      selected: null,
      available: false // Will be set based on merchant capabilities
    },
    shoppingInterests: {
      selected: [],
      options: defaultOptions.shoppingInterests,
      multiSelect: true
    },
    stores: {
      selected: [],
      options: defaultOptions.stores,
      multiSelect: true
    }
  };

  // Use persisted filters if available
  const uiFilters = persistedFilters ? {
    ...defaultUIFilters,
    ...persistedFilters,
    // Ensure options are always available (persisted data might not have them)
    channel: { ...defaultUIFilters.channel, ...persistedFilters.channel },
    demographics: {
      gender: { ...defaultUIFilters.demographics.gender, ...persistedFilters.demographics?.gender },
      ageGroups: { ...defaultUIFilters.demographics.ageGroups, ...persistedFilters.demographics?.ageGroups }
    },
    location: {
      regions: { ...defaultUIFilters.location.regions, ...persistedFilters.location?.regions },
      municipalities: { ...defaultUIFilters.location.municipalities, ...persistedFilters.location?.municipalities }
    },
    goForMore: { ...defaultUIFilters.goForMore, ...persistedFilters.goForMore },
    shoppingInterests: { ...defaultUIFilters.shoppingInterests, ...persistedFilters.shoppingInterests },
    stores: { ...defaultUIFilters.stores, ...persistedFilters.stores }
  } : defaultUIFilters;

  return {
    // UI filters (user-friendly format)
    ui: uiFilters,
    
    // API filters (API-ready format)
    api: {
      dateRange: {
        start: uiFilters.dateRange.start,
        end: uiFilters.dateRange.end
      },
      channel: 'all',
      gender: 'a', // API format: 'a' | 'm' | 'f'
      ageGroups: [],
      regions: [],
      municipalities: [],
      goForMore: null,
      shoppingInterests: [],
      stores: []
    },
    
    // Filter state management
    state: {
      filtersChanged: false,
      hasUnsavedChanges: false,
      lastApplied: new Date().toISOString(),
      isValid: true,
      validationErrors: []
    },
    
    // Saved filter sets
    saved: {
      default: {
        name: 'Default',
        filters: uiFilters,
        isDefault: true,
        createdAt: new Date().toISOString()
      }
    },
    
    // Global context (moved from separate fields)
    context: {
      merchantId: "52ba3854-a5d4-47bd-9d1a-b789ae139803",
      providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
      userID: "BANK\\E82629",
      showCompetition: true,
      selectedTab: 'dashboard'
    }
  };
};

const initialState = getInitialState();

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Date range management with presets
    setDateRangePreset: (state, action) => {
      const preset = action.payload;
      const dateRange = getPresetDateRange(preset);
      
      state.ui.dateRange = {
        start: dateRange.start,
        end: dateRange.end,
        preset
      };
      
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
      console.log(`📅 Date preset applied: ${preset}`, dateRange);
    },
    
    setCustomDateRange: (state, action) => {
      const { start, end } = action.payload;
      
      // Convert dates to ISO strings for serialization
      const startStr = start instanceof Date ? start.toISOString() : start;
      const endStr = end instanceof Date ? end.toISOString() : end;
      
      state.ui.dateRange = {
        start: startStr,
        end: endStr,
        preset: DATE_PRESETS.custom
      };
      
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
      
      console.log('📅 Custom date range set:', { start: startStr, end: endStr });
    },
    
    // Channel selection
    setChannel: (state, action) => {
      const channel = action.payload;
      state.ui.channel.selected = channel;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
    },
    
    // Demographics filters
    setGender: (state, action) => {
      const gender = action.payload;
      state.ui.demographics.gender.selected = gender;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
    },
    
    setAgeGroups: (state, action) => {
      const ageGroups = action.payload;
      state.ui.demographics.ageGroups.selected = ageGroups;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
    },
    
    // Location filters
    setRegions: (state, action) => {
      const regions = action.payload;
      state.ui.location.regions.selected = regions;
      
      // Clear municipalities when regions change
      state.ui.location.municipalities.selected = [];
      
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
    },
    
    setMunicipalities: (state, action) => {
      const municipalities = action.payload;
      state.ui.location.municipalities.selected = municipalities;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
    },
    
    // Update municipality options based on selected regions
    updateMunicipalityOptions: (state, action) => {
      const municipalities = action.payload;
      state.ui.location.municipalities.options = municipalities;
    },
    
    // Go For More filter
    setGoForMore: (state, action) => {
      const goForMore = action.payload;
      state.ui.goForMore.selected = goForMore;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
    },
    
    setGoForMoreAvailability: (state, action) => {
      state.ui.goForMore.available = action.payload;
      // If not available, clear selection
      if (!action.payload) {
        state.ui.goForMore.selected = null;
      }
    },
    
    // Shopping interests
    setShoppingInterests: (state, action) => {
      const interests = action.payload;
      state.ui.shoppingInterests.selected = interests;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
    },
    
    // Stores
    setStores: (state, action) => {
      const stores = action.payload;
      state.ui.stores.selected = stores;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.ui);
    },
    
    updateStoreOptions: (state, action) => {
      const stores = action.payload;
      state.ui.stores.options = stores;
    },
    
    // Bulk UI filter update
    updateUIFilters: (state, action) => {
      const updates = action.payload;
      
      // Deep merge updates into UI filters
      Object.keys(updates).forEach(key => {
        if (key in state.ui) {
          if (typeof state.ui[key] === 'object' && state.ui[key] !== null) {
            state.ui[key] = { ...state.ui[key], ...updates[key] };
          } else {
            state.ui[key] = updates[key];
          }
        }
      });
      
      state.state.hasUnsavedChanges = true;
      
      // Persist UI filters
      persistFilters(state.ui);
    },
    
    // Apply filters (convert UI to API and mark as applied)
    applyFilters: (state) => {
      // Convert all UI filters to API format
      // Date range
      state.api.dateRange = {
        start: state.ui.dateRange.start,
        end: state.ui.dateRange.end
      };
      
      // Channel
      state.api.channel = state.ui.channel.selected;
      
      // Gender
      if (state.ui.demographics.gender.selected === 'male') {
        state.api.gender = 'm';
      } else if (state.ui.demographics.gender.selected === 'female') {
        state.api.gender = 'f';
      } else {
        state.api.gender = 'a';
      }
      
      // Other filters (already in API format)
      state.api.ageGroups = state.ui.demographics.ageGroups.selected;
      state.api.regions = state.ui.location.regions.selected;
      state.api.municipalities = state.ui.location.municipalities.selected;
      state.api.goForMore = state.ui.goForMore.selected;
      state.api.shoppingInterests = state.ui.shoppingInterests.selected;
      state.api.stores = state.ui.stores.selected;
      
      // Update state
      state.state.filtersChanged = true;
      state.state.hasUnsavedChanges = false;
      state.state.lastApplied = new Date().toISOString();
      
      // Persist
      persistFilters(state.ui);
      
      console.log('🔄 Filters applied:', state.api);
    },
    
    // Mark filters as processed (called after data refresh)
    markFiltersApplied: (state) => {
      state.state.filtersChanged = false;
    },
    
    // Validation
    validateFilters: (state) => {
      const errors = [];
      
      // Date range validation
      if (new Date(state.ui.dateRange.start) >= new Date(state.ui.dateRange.end)) {
        errors.push('End date must be after start date');
      }
      
      // Check if date range is too large (e.g., > 2 years)
      const daysDiff = Math.abs(new Date(state.ui.dateRange.end) - new Date(state.ui.dateRange.start)) / (1000 * 60 * 60 * 24);
      if (daysDiff > 730) {
        errors.push('Date range cannot exceed 2 years');
      }
      
      state.state.validationErrors = errors;
      state.state.isValid = errors.length === 0;
    },
    
    // Saved filter sets management
    saveFilterSet: (state, action) => {
      const { name, filters } = action.payload;
      const id = name.toLowerCase().replace(/\s+/g, '-');
      
      state.saved[id] = {
        name,
        filters: filters || state.ui,
        isDefault: false,
        createdAt: new Date().toISOString()
      };
    },
    
    loadFilterSet: (state, action) => {
      const setId = action.payload;
      const filterSet = state.saved[setId];
      
      if (filterSet) {
        state.ui = { ...state.ui, ...filterSet.filters };
        state.state.hasUnsavedChanges = true;
        persistFilters(state.ui);
      }
    },
    
    deleteFilterSet: (state, action) => {
      const setId = action.payload;
      if (setId !== 'default' && state.saved[setId]) {
        delete state.saved[setId];
      }
    },
    
    // Context management
    setMerchantId: (state, action) => {
      state.context.merchantId = action.payload;
      console.log('🏪 Merchant changed:', action.payload);
    },
    
    setProviderId: (state, action) => {
      state.context.providerId = action.payload;
    },
    
    setUserID: (state, action) => {
      state.context.userID = action.payload;
    },
    
    toggleCompetition: (state) => {
      state.context.showCompetition = !state.context.showCompetition;
      console.log('🏆 Competition toggle:', state.context.showCompetition);
    },
    
    setCompetition: (state, action) => {
      state.context.showCompetition = action.payload;
    },
    
    setSelectedTab: (state, action) => {
      state.context.selectedTab = action.payload;
    },
    
    // Reset filters
    resetFilters: (state) => {
      const defaultDateRange = getPresetDateRange(DATE_PRESETS.lastMonth);
      const defaultOptions = getDefaultFilterOptions();
      
      state.ui = {
        dateRange: {
          start: defaultDateRange.start,
          end: defaultDateRange.end,
          preset: DATE_PRESETS.lastMonth
        },
        channel: {
          selected: 'all',
          options: defaultOptions.channel
        },
        demographics: {
          gender: {
            selected: 'all',
            options: defaultOptions.gender
          },
          ageGroups: {
            selected: [],
            options: defaultOptions.ageGroups,
            multiSelect: true
          }
        },
        location: {
          regions: {
            selected: [],
            options: defaultOptions.regions,
            multiSelect: true
          },
          municipalities: {
            selected: [],
            options: defaultOptions.municipalities,
            multiSelect: true
          }
        },
        goForMore: {
          selected: null,
          available: state.ui.goForMore.available // Preserve availability
        },
        shoppingInterests: {
          selected: [],
          options: defaultOptions.shoppingInterests,
          multiSelect: true
        },
        stores: {
          selected: [],
          options: state.ui.stores.options, // Preserve loaded options
          multiSelect: true
        }
      };
      
      state.api = {
        dateRange: {
          start: defaultDateRange.start,
          end: defaultDateRange.end
        },
        channel: 'all',
        gender: 'a',
        ageGroups: [],
        regions: [],
        municipalities: [],
        goForMore: null,
        shoppingInterests: [],
        stores: []
      };
      
      state.state.hasUnsavedChanges = true;
      
      // Clear persistence
      localStorage.removeItem('merchant-insights-filters-v2');
      
      console.log('🔄 Filters reset to defaults');
    }
  }
});

// Action creators
export const {
  setDateRangePreset,
  setCustomDateRange,
  setChannel,
  setGender,
  setAgeGroups,
  setRegions,
  setMunicipalities,
  updateMunicipalityOptions,
  setGoForMore,
  setGoForMoreAvailability,
  setShoppingInterests,
  setStores,
  updateStoreOptions,
  updateUIFilters,
  applyFilters,
  markFiltersApplied,
  validateFilters,
  saveFilterSet,
  loadFilterSet,
  deleteFilterSet,
  setMerchantId,
  setProviderId,
  setUserID,
  toggleCompetition,
  setCompetition,
  setSelectedTab,
  resetFilters
} = filtersSlice.actions;

// Basic selectors
export const selectUIFilters = (state) => state.filters.ui;
export const selectAPIFilters = (state) => state.filters.api;
export const selectFilterState = (state) => state.filters.state;
export const selectSavedFilterSets = (state) => state.filters.saved;
export const selectFilterContext = (state) => state.filters.context;

// Specific UI filter selectors
export const selectDateRange = (state) => state.filters.ui.dateRange;
export const selectChannel = (state) => state.filters.ui.channel;
export const selectGender = (state) => state.filters.ui.demographics.gender;
export const selectAgeGroups = (state) => state.filters.ui.demographics.ageGroups;
export const selectRegions = (state) => state.filters.ui.location.regions;
export const selectMunicipalities = (state) => state.filters.ui.location.municipalities;
export const selectGoForMore = (state) => state.filters.ui.goForMore;
export const selectShoppingInterests = (state) => state.filters.ui.shoppingInterests;
export const selectStores = (state) => state.filters.ui.stores;

// Context selectors
export const selectMerchantId = (state) => state.filters.context.merchantId;
export const selectProviderId = (state) => state.filters.context.providerId;
export const selectUserID = (state) => state.filters.context.userID;
export const selectShowCompetition = (state) => state.filters.context.showCompetition;
export const selectSelectedTab = (state) => state.filters.context.selectedTab;

// State selectors
export const selectFiltersChanged = (state) => state.filters.state.filtersChanged;
export const selectHasUnsavedChanges = (state) => state.filters.state.hasUnsavedChanges;
export const selectFiltersValid = (state) => state.filters.state.isValid;
export const selectValidationErrors = (state) => state.filters.state.validationErrors;

// Computed selectors (memoized)
export const selectApiRequestParams = createSelector(
  [
    selectUserID,
    (state) => state.filters.api.dateRange,
    selectProviderId,
    selectAPIFilters,
    selectMerchantId
  ],
  (userID, dateRange, providerId, apiFilters, merchantId) => {
    // Convert date range to API format (YYYY-MM-DD)
    const startDate = dateRange?.start ? new Date(dateRange.start).toISOString().split('T')[0] : null;
    const endDate = dateRange?.end ? new Date(dateRange.end).toISOString().split('T')[0] : null;
    
    // Convert filters to API filterValues array format
    const filterValues = [];
    
    if (apiFilters.channel && apiFilters.channel !== 'all') {
      filterValues.push({ filterId: 'channel', value: apiFilters.channel });
    }
    
    if (apiFilters.gender && apiFilters.gender !== 'a') {
      filterValues.push({ filterId: 'gender', value: apiFilters.gender });
    }
    
    if (apiFilters.ageGroups && apiFilters.ageGroups.length > 0) {
      apiFilters.ageGroups.forEach(ageGroup => {
        filterValues.push({ filterId: 'ageGroup', value: ageGroup });
      });
    }
    
    if (apiFilters.regions && apiFilters.regions.length > 0) {
      apiFilters.regions.forEach(region => {
        filterValues.push({ filterId: 'region', value: region });
      });
    }
    
    if (apiFilters.shoppingInterests && apiFilters.shoppingInterests.length > 0) {
      apiFilters.shoppingInterests.forEach(interest => {
        filterValues.push({ filterId: 'shoppingInterest', value: interest });
      });
    }
    
    return {
      userID,
      startDate,
      endDate,
      providerId,
      merchantId,
      filterValues,
      metricParameters: {}
    };
  }
);

// Check if any filters are active
export const selectHasActiveFilters = createSelector(
  [selectAPIFilters],
  (apiFilters) => {
    return (
      apiFilters.channel !== 'all' ||
      apiFilters.gender !== 'a' ||
      apiFilters.ageGroups.length > 0 ||
      apiFilters.regions.length > 0 ||
      apiFilters.municipalities.length > 0 ||
      apiFilters.goForMore !== null ||
      apiFilters.shoppingInterests.length > 0 ||
      apiFilters.stores.length > 0
    );
  }
);

// Get filter summary for display
export const selectFilterSummary = createSelector(
  [selectUIFilters, selectHasActiveFilters, selectHasUnsavedChanges],
  (uiFilters, hasActiveFilters, hasUnsavedChanges) => {
    // Safe check for uiFilters structure
    if (!uiFilters || typeof uiFilters !== 'object') {
      return 'Loading filters...';
    }
    
    if (hasUnsavedChanges) {
      return 'You have unsaved filter changes';
    }
    
    if (!hasActiveFilters) {
      return 'No filters applied';
    }
    
    const summary = [];
    
    try {
      // Safe channel check
      if (uiFilters.channel?.selected && uiFilters.channel.selected !== 'all') {
        summary.push(`Channel: ${uiFilters.channel.selected}`);
      }
      
      // Safe gender check
      if (uiFilters.demographics?.gender?.selected && uiFilters.demographics.gender.selected !== 'all') {
        summary.push(`Gender: ${uiFilters.demographics.gender.selected}`);
      }
      
      // Safe age groups check
      if (uiFilters.demographics?.ageGroups?.selected?.length > 0) {
        summary.push(`Age groups: ${uiFilters.demographics.ageGroups.selected.length}`);
      }
      
      // Safe regions check
      if (uiFilters.location?.regions?.selected?.length > 0) {
        summary.push(`Regions: ${uiFilters.location.regions.selected.length}`);
      }
      
      // Safe shopping interests check
      if (uiFilters.shoppingInterests?.selected?.length > 0) {
        summary.push(`Interests: ${uiFilters.shoppingInterests.selected.length}`);
      }
      
      return summary.length > 0 ? summary.join(', ') : 'No filters applied';
    } catch (error) {
      console.warn('Error generating filter summary:', error);
      return 'Filter summary unavailable';
    }
  }
);

export default filtersSlice.reducer;