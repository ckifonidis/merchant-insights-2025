import { createSlice, createSelector, PayloadAction, current } from '@reduxjs/toolkit';
import { subDays } from 'date-fns';
import { filterService, FILTER_OPTIONS } from '../../services/filterService';
import { ANALYTICS_PROVIDER_IDS } from '../../data/apiSchema';
import { DateRangeFilter, FilterOption, UIFilters } from '../../types/filters';
import { RootState } from '../index';

// Date range presets
const DATE_PRESETS = {
  lastWeek: 'lastWeek',
  lastMonth: 'lastMonth',
  lastQuarter: 'lastQuarter', 
  lastYear: 'lastYear',
  custom: 'custom'
} as const;

type DatePreset = keyof typeof DATE_PRESETS;

// Filter state structure
interface FilterState {
  filtersChanged: boolean;
  hasUnsavedChanges: boolean;
  lastApplied: string;
  isValid: boolean;
  validationErrors: string[];
}

// Context structure
interface FilterContext {
  merchantId: string;
  providerId: string;
  userID: string | null;
  showCompetition: boolean;
  selectedTab: string;
}

// Root filters state
interface AppFiltersState {
  filters: UIFilters;
  state: FilterState;
  context: FilterContext;
}

// Get preset date range
const getPresetDateRange = (preset: DatePreset): DateRangeFilter => {
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
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Load persisted filters from localStorage
const loadPersistedFilters = (): UIFilters | null => {
  try {
    const stored = localStorage.getItem('merchant-insights-filters-v3'); // Updated version
    if (stored) {
      const parsed = JSON.parse(stored);
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
const persistFilters = (filters: UIFilters): void => {
  try {
    localStorage.setItem('merchant-insights-filters-v3', JSON.stringify(filters));
  } catch (error) {
    console.warn('Failed to persist filters:', error);
  }
};

// Initialize state with single source of truth
const getInitialState = (): AppFiltersState => {
  const persistedFilters = loadPersistedFilters();
  const defaultDateRange = getPresetDateRange(DATE_PRESETS.lastMonth);
  
  // Default filters (single state structure)
  const defaultFilters: UIFilters = {
    dateRange: {
      start: defaultDateRange.startDate,
      end: defaultDateRange.endDate,
      preset: DATE_PRESETS.lastMonth
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

  const filters = persistedFilters ? { ...defaultFilters, ...persistedFilters } : defaultFilters;

  return {
    // Single source of truth for filters
    filters,
    
    // Filter state management
    state: {
      filtersChanged: false,
      hasUnsavedChanges: false,
      lastApplied: new Date().toISOString(),
      isValid: true,
      validationErrors: []
    },
    
    // Global context
    context: {
      merchantId: "52ba3854-a5d4-47bd-9d1a-b789ae139803",
      providerId: ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS,
      userID: null, // Will be set when user info is available
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
    // Date range management
    setDateRangePreset: (state, action: PayloadAction<DatePreset>) => {
      const preset = action.payload;
      const dateRange = getPresetDateRange(preset);
      
      state.filters.dateRange = {
        start: dateRange.startDate,
        end: dateRange.endDate,
        preset
      };
      
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    setCustomDateRange: (state, action: PayloadAction<{ start: string | Date; end: string | Date }>) => {
      const { start, end } = action.payload;
      
      state.filters.dateRange = {
        start: typeof start === 'string' ? start : start.toISOString().split('T')[0],
        end: typeof end === 'string' ? end : end.toISOString().split('T')[0],
        preset: DATE_PRESETS.custom
      };
      
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    // Simple filter setters
    setChannel: (state, action: PayloadAction<string>) => {
      state.filters.channel = action.payload;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    setGender: (state, action: PayloadAction<string>) => {
      state.filters.gender = action.payload;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    setAgeGroups: (state, action: PayloadAction<string[]>) => {
      state.filters.ageGroups = action.payload;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    setRegions: (state, action: PayloadAction<string[]>) => {
      state.filters.regions = action.payload;
      // Clear municipalities when regions change
      state.filters.municipalities = [];
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    setMunicipalities: (state, action: PayloadAction<string[]>) => {
      state.filters.municipalities = action.payload;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    setGoForMore: (state, action: PayloadAction<boolean | null>) => {
      state.filters.goForMore = action.payload;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    setShoppingInterests: (state, action: PayloadAction<string[]>) => {
      state.filters.shoppingInterests = action.payload;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    setStores: (state, action: PayloadAction<string[]>) => {
      state.filters.stores = action.payload;
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    // Bulk filter update
    updateFilters: (state, action: PayloadAction<Partial<UIFilters>>) => {
      const updates = action.payload;
      state.filters = { ...state.filters, ...updates };
      state.state.hasUnsavedChanges = true;
      persistFilters(state.filters);
    },
    
    // Apply filters (mark as applied for cache bypass)
    applyFilters: (state) => {
      state.state.filtersChanged = true;
      state.state.hasUnsavedChanges = false;
      state.state.lastApplied = new Date().toISOString();
      persistFilters(state.filters);
      console.log('🔄 Filters applied:', state.filters);
    },
    
    // Mark filters as processed (called after data refresh)
    markFiltersApplied: (state) => {
      state.state.filtersChanged = false;
    },
    
    // Validation
    validateFilters: (state) => {
      const validation = filterService.validateFilters(state.filters);
      state.state.validationErrors = validation.errors;
      state.state.isValid = validation.isValid;
    },
    
    // Context management
    setMerchantId: (state, action: PayloadAction<string>) => {
      state.context.merchantId = action.payload;
    },
    
    setProviderId: (state, action: PayloadAction<string>) => {
      state.context.providerId = action.payload;
    },
    
    setUserID: (state, action: PayloadAction<string | null>) => {
      state.context.userID = action.payload;
    },
    
    toggleCompetition: (state) => {
      state.context.showCompetition = !state.context.showCompetition;
    },
    
    setCompetition: (state, action: PayloadAction<boolean>) => {
      state.context.showCompetition = action.payload;
    },
    
    setSelectedTab: (state, action: PayloadAction<string>) => {
      state.context.selectedTab = action.payload;
    },
    
    // Reset filters
    resetFilters: (state) => {
      const defaultDateRange = getPresetDateRange(DATE_PRESETS.lastMonth);
      
      state.filters = {
        dateRange: {
          start: defaultDateRange.startDate,
          end: defaultDateRange.endDate,
          preset: DATE_PRESETS.lastMonth
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
      localStorage.removeItem('merchant-insights-filters-v3');
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
  setGoForMore,
  setShoppingInterests,
  setStores,
  updateFilters,
  applyFilters,
  markFiltersApplied,
  validateFilters,
  setMerchantId,
  setProviderId,
  setUserID,
  toggleCompetition,
  setCompetition,
  setSelectedTab,
  resetFilters
} = filtersSlice.actions;

// Basic selectors
export const selectFilters = (state: RootState): UIFilters => state.filters.filters;
export const selectFilterState = (state: RootState): FilterState => state.filters.state;
export const selectFilterContext = (state: RootState): FilterContext => state.filters.context;

// Specific filter selectors
export const selectDateRange = (state: RootState) => state.filters.filters.dateRange;
export const selectChannel = (state: RootState): string => state.filters.filters.channel;
export const selectGender = (state: RootState): string => state.filters.filters.gender;
export const selectAgeGroups = (state: RootState): string[] => state.filters.filters.ageGroups;
export const selectRegions = (state: RootState): string[] => state.filters.filters.regions;
export const selectMunicipalities = (state: RootState): string[] => state.filters.filters.municipalities;
export const selectGoForMore = (state: RootState): boolean | null => state.filters.filters.goForMore;
export const selectShoppingInterests = (state: RootState): string[] => state.filters.filters.shoppingInterests;
export const selectStores = (state: RootState): string[] => state.filters.filters.stores;

// Context selectors
export const selectMerchantId = (state: RootState): string => state.filters.context.merchantId;
export const selectProviderId = (state: RootState): string => state.filters.context.providerId;
export const selectUserID = (state: RootState): string | null => state.filters.context.userID;
export const selectShowCompetition = (state: RootState): boolean => state.filters.context.showCompetition;
export const selectSelectedTab = (state: RootState): string => state.filters.context.selectedTab;

// State selectors
export const selectFiltersChanged = (state: RootState): boolean => state.filters.state.filtersChanged;
export const selectHasUnsavedChanges = (state: RootState): boolean => state.filters.state.hasUnsavedChanges;
export const selectFiltersValid = (state: RootState): boolean => state.filters.state.isValid;
export const selectValidationErrors = (state: RootState): string[] => state.filters.state.validationErrors;

// Computed selectors (memoized)
export const selectAPIRequestParams = createSelector(
  [
    selectUserID,
    selectFilters,
    selectProviderId,
    selectMerchantId
  ],
  (userID, filters, providerId, merchantId) => {
    return {
      userID,
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end,
      providerId,
      merchantId,
      filterValues: filterService.toFilterValuesArray(filters),
      metricParameters: {}
    };
  }
);

export const selectHasActiveFilters = createSelector(
  [selectFilters],
  (filters) => filterService.hasActiveFilters(filters)
);

export const selectFilterSummary = createSelector(
  [selectFilters, selectHasActiveFilters, selectHasUnsavedChanges],
  (filters, hasActiveFilters, hasUnsavedChanges) => {
    if (hasUnsavedChanges) {
      return 'You have unsaved filter changes';
    }
    
    if (!hasActiveFilters) {
      return 'No filters applied';
    }
    
    return filterService.getFilterSummary(filters as UIFilters);
  }
);

// Static filter options selectors (no async loading needed)
export const selectChannelOptions = (): FilterOption[] => FILTER_OPTIONS.channels;
export const selectGenderOptions = (): FilterOption[] => FILTER_OPTIONS.genders;
export const selectAgeGroupOptions = (): FilterOption[] => FILTER_OPTIONS.ageGroups;
export const selectRegionOptions = (): FilterOption[] => FILTER_OPTIONS.regions;
export const selectShoppingInterestOptions = (): FilterOption[] => FILTER_OPTIONS.shoppingInterests;

// Dynamic selectors
export const selectMunicipalityOptions = createSelector(
  [selectRegions],
  (selectedRegions) => filterService.getMunicipalitiesForRegions(selectedRegions)
);

export const selectGoForMoreAvailable = createSelector(
  [selectMerchantId],
  (merchantId) => filterService.hasGoForMore(merchantId)
);

export default filtersSlice.reducer;