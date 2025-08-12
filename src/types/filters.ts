/**
 * Filter System Type Definitions
 */

// Filter types
export type FilterType = 
  | 'dateRange'
  | 'channel'
  | 'gender'
  | 'ageGroups'
  | 'location'
  | 'goForMore'
  | 'interests'
  | 'stores';

// Date range filter
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

// Channel filter options
export type ChannelOption = 'all' | 'physical' | 'ecommerce';

// Gender filter options
export type GenderOption = 'all' | 'male' | 'female';

// Age group options
export type AgeGroupOption = 
  | 'all'
  | 'gen_z'      // 18-24
  | 'millennials' // 25-40
  | 'gen_x'      // 41-56
  | 'boomers'    // 57-75
  | 'silent';    // 76-96

// Location filter structure
export interface LocationFilter {
  type: 'region' | 'regional_unit' | 'municipality';
  value: string;
  label: string;
}

// Shopping interest options (SHOPINT1-15)
export type ShoppingInterest = 
  | 'SHOPINT1'  | 'SHOPINT2'  | 'SHOPINT3'  | 'SHOPINT4'  | 'SHOPINT5'
  | 'SHOPINT6'  | 'SHOPINT7'  | 'SHOPINT8'  | 'SHOPINT9'  | 'SHOPINT10'
  | 'SHOPINT11' | 'SHOPINT12' | 'SHOPINT13' | 'SHOPINT14' | 'SHOPINT15';

// UI filter state (user-friendly values)
export interface UIFilters {
  dateRange: DateRangeFilter;
  channel: ChannelOption;
  gender: GenderOption;
  ageGroups: AgeGroupOption[];
  location: LocationFilter[];
  goForMore: boolean | null;
  interests: ShoppingInterest[];
  stores: string[];
}

// API filter format (backend-compatible)
export interface APIFilters {
  startDate: string;
  endDate: string;
  channel?: string;
  gender?: string;
  ageGroups?: string[];
  location?: {
    type: string;
    values: string[];
  };
  goForMore?: boolean;
  interests?: string[];
  merchantIds?: string[];
}

// Filter configuration for specific metrics
export interface MetricFilterConfig {
  metricId: string;
  supportedFilters: FilterType[];
  requiresLocation: boolean;
  requiresTimeRange: boolean;
}

// Filter state in Redux
export interface FiltersState {
  // Current tab
  selectedTab: string;
  
  // Filter state
  state: {
    // UI filters (user selections)
    uiFilters: UIFilters;
    
    // API filters (converted for backend)
    apiFilters: APIFilters;
    
    // Change tracking
    filtersChanged: boolean;
  };
  
  // User context
  userID: string | null;
}

// Filter option for dropdowns
export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}