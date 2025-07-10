import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { filterOptionsService } from '../../services/filterOptionsService.js';

// Async thunk for loading all filter options
export const loadFilterOptions = createAsyncThunk(
  'filterOptions/loadAll',
  async ({ merchantId, selectedRegions = [] }, { rejectWithValue }) => {
    try {
      const options = await filterOptionsService.loadAllFilterOptions(merchantId, selectedRegions);
      return options;
    } catch (error) {
      console.error('Failed to load filter options:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading municipalities when regions change
export const loadMunicipalities = createAsyncThunk(
  'filterOptions/loadMunicipalities', 
  async (selectedRegions, { rejectWithValue }) => {
    try {
      const municipalities = await filterOptionsService.loadMunicipalities(selectedRegions);
      return municipalities;
    } catch (error) {
      console.error('Failed to load municipalities:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading stores when merchant changes
export const loadStores = createAsyncThunk(
  'filterOptions/loadStores',
  async (merchantId, { rejectWithValue }) => {
    try {
      const stores = await filterOptionsService.loadStores(merchantId);
      return stores;
    } catch (error) {
      console.error('Failed to load stores:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for checking Go For More availability
export const checkGoForMoreAvailability = createAsyncThunk(
  'filterOptions/checkGoForMore',
  async (merchantId, { rejectWithValue }) => {
    try {
      const isAvailable = await filterOptionsService.checkGoForMoreAvailability(merchantId);
      return isAvailable;
    } catch (error) {
      console.error('Failed to check Go For More availability:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Loading states
  loading: {
    all: false,
    municipalities: false,
    stores: false,
    goForMore: false
  },
  
  // Error states
  errors: {
    all: null,
    municipalities: null,
    stores: null,
    goForMore: null
  },
  
  // Options data
  options: {
    channel: [
      { value: 'all', label: 'All Channels', id: 'all' },
      { value: 'ecommerce', label: 'E-commerce', id: 'ecommerce' },
      { value: 'physical', label: 'Physical Stores', id: 'physical' }
    ],
    gender: [
      { value: 'all', label: 'All Genders', id: 'all' },
      { value: 'male', label: 'Male', id: 'male' },
      { value: 'female', label: 'Female', id: 'female' }
    ],
    ageGroups: [],
    regions: [],
    municipalities: [],
    shoppingInterests: [],
    stores: []
  },
  
  // Availability flags
  availability: {
    goForMore: false
  },
  
  // Metadata
  lastUpdated: null,
  merchantId: null
};

const filterOptionsSlice = createSlice({
  name: 'filterOptions',
  initialState,
  reducers: {
    // Clear specific option type
    clearOptions: (state, action) => {
      const optionType = action.payload;
      if (optionType in state.options) {
        state.options[optionType] = [];
      }
    },
    
    // Clear all options
    clearAllOptions: (state) => {
      state.options = {
        ...initialState.options,
        channel: state.options.channel, // Keep static options
        gender: state.options.gender
      };
      state.availability = initialState.availability;
      state.lastUpdated = null;
    },
    
    // Set specific options (for manual updates)
    setOptions: (state, action) => {
      const { optionType, options } = action.payload;
      if (optionType in state.options) {
        state.options[optionType] = options;
      }
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.errors = {
        all: null,
        municipalities: null,
        stores: null,
        goForMore: null
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
    // Load all filter options
    builder
      .addCase(loadFilterOptions.pending, (state) => {
        state.loading.all = true;
        state.errors.all = null;
      })
      .addCase(loadFilterOptions.fulfilled, (state, action) => {
        state.loading.all = false;
        const options = action.payload;
        
        // Update all options
        state.options.regions = options.regions;
        state.options.municipalities = options.municipalities;
        state.options.stores = options.stores;
        state.options.shoppingInterests = options.shoppingInterests;
        state.options.ageGroups = options.ageGroups;
        
        // Update availability
        state.availability.goForMore = options.goForMoreAvailable;
        
        // Update metadata
        state.lastUpdated = new Date().toISOString();
        
        console.log('✅ Filter options loaded into state');
      })
      .addCase(loadFilterOptions.rejected, (state, action) => {
        state.loading.all = false;
        state.errors.all = action.payload;
        console.error('❌ Failed to load filter options:', action.payload);
      });
    
    // Load municipalities
    builder
      .addCase(loadMunicipalities.pending, (state) => {
        state.loading.municipalities = true;
        state.errors.municipalities = null;
      })
      .addCase(loadMunicipalities.fulfilled, (state, action) => {
        state.loading.municipalities = false;
        state.options.municipalities = action.payload;
      })
      .addCase(loadMunicipalities.rejected, (state, action) => {
        state.loading.municipalities = false;
        state.errors.municipalities = action.payload;
      });
    
    // Load stores
    builder
      .addCase(loadStores.pending, (state) => {
        state.loading.stores = true;
        state.errors.stores = null;
      })
      .addCase(loadStores.fulfilled, (state, action) => {
        state.loading.stores = false;
        state.options.stores = action.payload;
      })
      .addCase(loadStores.rejected, (state, action) => {
        state.loading.stores = false;
        state.errors.stores = action.payload;
      });
    
    // Check Go For More availability
    builder
      .addCase(checkGoForMoreAvailability.pending, (state) => {
        state.loading.goForMore = true;
        state.errors.goForMore = null;
      })
      .addCase(checkGoForMoreAvailability.fulfilled, (state, action) => {
        state.loading.goForMore = false;
        state.availability.goForMore = action.payload;
      })
      .addCase(checkGoForMoreAvailability.rejected, (state, action) => {
        state.loading.goForMore = false;
        state.errors.goForMore = action.payload;
      });
  }
});

// Action creators
export const {
  clearOptions,
  clearAllOptions,
  setOptions,
  clearErrors,
  clearError
} = filterOptionsSlice.actions;

// Selectors
export const selectFilterOptionsLoading = (state) => state.filterOptions.loading;
export const selectFilterOptionsErrors = (state) => state.filterOptions.errors;
export const selectFilterOptions = (state) => state.filterOptions.options;
export const selectFilterAvailability = (state) => state.filterOptions.availability;
export const selectFilterOptionsLastUpdated = (state) => state.filterOptions.lastUpdated;

// Specific option selectors
export const selectChannelOptions = (state) => state.filterOptions.options.channel;
export const selectGenderOptions = (state) => state.filterOptions.options.gender;
export const selectAgeGroupOptions = (state) => state.filterOptions.options.ageGroups;
export const selectRegionOptions = (state) => state.filterOptions.options.regions;
export const selectMunicipalityOptions = (state) => state.filterOptions.options.municipalities;
export const selectShoppingInterestOptions = (state) => state.filterOptions.options.shoppingInterests;
export const selectStoreOptions = (state) => state.filterOptions.options.stores;

// Availability selectors
export const selectGoForMoreAvailability = (state) => state.filterOptions.availability.goForMore;

// Loading state selectors
export const selectIsLoadingFilterOptions = (state) => state.filterOptions.loading.all;
export const selectIsLoadingMunicipalities = (state) => state.filterOptions.loading.municipalities;
export const selectIsLoadingStores = (state) => state.filterOptions.loading.stores;

// Error selectors
export const selectFilterOptionsError = (state) => state.filterOptions.errors.all;
export const selectMunicipalitiesError = (state) => state.filterOptions.errors.municipalities;
export const selectStoresError = (state) => state.filterOptions.errors.stores;

export default filterOptionsSlice.reducer;