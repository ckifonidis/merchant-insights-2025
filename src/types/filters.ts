/**
 * Filter System Type Definitions
 */

import { selectGenderOptions } from "../store/slices/filtersSlice";

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

// Date range with preset (for UI state)
export interface UIDateRange {
  start: string;
  end: string;
  preset?: string;
}

// Use API values directly in state - display labels are handled in UI layer
export type ChannelOption = 'all' | 'physical' | 'ecommerce';
export type GenderOption = 'a' | 'm' | 'f'; // API values: all, male, female
export type AgeGroupOption = 'generation_z' | 'millennials' | 'generation_x' | 'baby_boomers' | 'silent_generation';

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

// UI filter state - stores API values, display labels handled in UI components
export interface UIFilters {
  dateRange: UIDateRange;
  channel: ChannelOption;
  gender: GenderOption; 
  ageGroups: AgeGroupOption[];
  regions: string[];
  municipalities: string[];
  goForMore: boolean | null;
  shoppingInterests: string[]; // API values: SHOPINT1, SHOPINT2, etc.
  stores: string[];
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