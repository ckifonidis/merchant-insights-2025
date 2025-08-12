/**
 * Simplified Filter Service
 * 
 * Unified service that handles:
 * - Static filter options (no complex async loading)
 * - API format conversion (on-demand, no dual state)
 * - Filter validation
 * - Metric-specific filters
 */

import { 
  ANALYTICS_PROVIDER_IDS,
  SHOPPING_INTERESTS,
  AGE_GROUPS,
  GREEK_REGIONS
} from '../data/apiSchema.js';

interface FilterOption {
  value: string;
  label: string;
  region?: string;
}

interface MunicipalityData {
  [region: string]: string[];
}

interface UIFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  channel?: string;
  gender?: string;
  ageGroups?: string[];
  regions?: string[];
  municipalities?: string[];
  goForMore?: boolean;
  shoppingInterests?: string[];
  stores?: string[];
}

interface APIFilters {
  dateRange: {
    start?: string;
    end?: string;
  };
  channel: string;
  gender: string;
  ageGroups: string[];
  regions: string[];
  municipalities: string[];
  goForMore?: boolean;
  shoppingInterests: string[];
  stores: string[];
}

interface FilterValue {
  providerId: string;
  filterId: string;
  value: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Static filter options (no async loading needed)
export const FILTER_OPTIONS = {
  channels: [
    { value: 'all', label: 'All Channels' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'physical', label: 'Physical Stores' }
  ],
  genders: [
    { value: 'all', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ],
  ageGroups: AGE_GROUPS.map(group => {
    const labels = {
      '18-24': 'Generation Z (18-24)',
      '25-40': 'Millennials (25-40)',
      '41-56': 'Generation X (41-56)',
      '57-75': 'Baby Boomers (57-75)',
      '76-96': 'Silent Generation (76-96)'
    };
    return { value: group, label: labels[group] || group };
  }),
  regions: GREEK_REGIONS.map(region => ({
    value: region,
    label: region
  })),
  shoppingInterests: SHOPPING_INTERESTS.map(interest => {
    const labels = {
      'SHOPINT1': 'Shopping & Fashion',
      'SHOPINT2': 'Electronics & Technology',
      'SHOPINT3': 'Food & Dining',
      'SHOPINT4': 'Health & Beauty',
      'SHOPINT5': 'Home & Garden',
      'SHOPINT6': 'Sports & Fitness',
      'SHOPINT7': 'Books & Education',
      'SHOPINT8': 'Travel & Tourism',
      'SHOPINT9': 'Entertainment',
      'SHOPINT10': 'Automotive',
      'SHOPINT11': 'Financial Services',
      'SHOPINT12': 'Real Estate',
      'SHOPINT13': 'Professional Services',
      'SHOPINT14': 'Insurance',
      'SHOPINT15': 'Other'
    };
    return { value: interest, label: labels[interest] || interest };
  }),
  // Municipality data (static for demo - could be API-loaded if needed)
  municipalities: {
    'ΑΤΤΙΚΗ': ['ΑΘΗΝΑ', 'ΠΕΙΡΑΙΑΣ', 'ΠΕΡΙΣΤΕΡΙ', 'ΚΑΛΛΙΘΕΑ', 'ΝΙΚΑΙΑ', 'ΓΛΥΦΑΔΑ'],
    'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ': ['ΘΕΣΣΑΛΟΝΙΚΗ', 'ΚΑΛΑΜΑΡΙΑ', 'ΕΥΟΣΜΟΣ', 'ΣΤΑΥΡΟΥΠΟΛΗ'],
    'ΘΕΣΣΑΛΙΑ': ['ΛΑΡΙΣΑ', 'ΒΟΛΟΣ', 'ΤΡΙΚΑΛΑ', 'ΚΑΡΔΙΤΣΑ'],
    'ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ': ['ΛΑΜΙΑ', 'ΧΑΛΚΙΔΑ', 'ΛΙΒΑΔΕΙΑ', 'ΘΗΒΑ'],
    'ΔΥΤΙΚΗ ΕΛΛΑΔΑ': ['ΠΑΤΡΑ', 'ΑΓΡΙΝΙΟ', 'ΜΕΣΟΛΟΓΓΙ', 'ΠΥΡΓΟΣ'],
    'ΠΕΛΟΠΟΝΝΗΣΟΣ': ['ΚΑΛΑΜΑΤΑ', 'ΤΡΙΠΟΛΗ', 'ΣΠΑΡΤΗ', 'ΚΟΡΙΝΘΟΣ'],
    'ΚΡΗΤΗ': ['ΗΡΑΚΛΕΙΟ', 'ΧΑΝΙΑ', 'ΡΕΘΥΜΝΟ', 'ΑΓΙΟΣ ΝΙΚΟΛΑΟΣ'],
    'ΗΠΕΙΡΟΣ': ['ΙΩΑΝΝΙΝΑ', 'ΑΡΤΑ', 'ΠΡΕΒΕΖΑ', 'ΗΓΟΥΜΕΝΙΤΣΑ']
  }
};

// Metric-specific filters (simplified from metricFilters.js)
const METRIC_SPECIFIC_FILTERS = {
  'converted_customers_by_interest': {
    interest_type: {
      revenue: 'revenue',      // Revenue tab shows revenue data
      demographics: 'customers' // Demographics tab shows customer counts
    }
  }
};

class FilterService {
  constructor() {
    this.providerId = ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS;
  }

  /**
   * Get municipalities for selected regions
   */
  getMunicipalitiesForRegions(selectedRegions: string[] = []): FilterOption[] {
    if (!selectedRegions.length) return [];
    
    const municipalities = [];
    selectedRegions.forEach(region => {
      if (FILTER_OPTIONS.municipalities[region]) {
        FILTER_OPTIONS.municipalities[region].forEach(municipality => {
          municipalities.push({
            value: municipality,
            label: municipality,
            region: region
          });
        });
      }
    });
    
    return municipalities;
  }

  /**
   * Check if merchant has Go For More (simplified - no async needed)
   */
  hasGoForMore(merchantId: string): boolean {
    // Demo merchants that participate in Go For More
    const participatingMerchants = [
      "52ba3854-a5d4-47bd-9d1a-b789ae139803", // Default merchant
      "merchant-002",
      "merchant-005"
    ];
    
    return participatingMerchants.includes(merchantId);
  }

  /**
   * Convert UI filters to API format (on-demand conversion)
   */
  toAPIFormat(uiFilters: UIFilters): APIFilters {
    const apiFilters = {
      dateRange: {
        start: uiFilters.dateRange?.start,
        end: uiFilters.dateRange?.end
      },
      channel: uiFilters.channel || 'all',
      gender: this._mapGender(uiFilters.gender),
      ageGroups: uiFilters.ageGroups || [],
      regions: uiFilters.regions || [],
      municipalities: uiFilters.municipalities || [],
      goForMore: uiFilters.goForMore,
      shoppingInterests: uiFilters.shoppingInterests || [],
      stores: uiFilters.stores || []
    };

    return apiFilters;
  }

  /**
   * Convert API filters to filterValues array format
   */
  toFilterValuesArray(apiFilters: APIFilters): FilterValue[] {
    const filterValues = [];

    // Gender mapping
    if (apiFilters.gender && apiFilters.gender !== 'a') {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'gender',
        value: `["${apiFilters.gender}"]`
      });
    }

    // Age groups mapping
    if (apiFilters.ageGroups?.length > 0) {
      const ageGroupMapping = {
        '18-24': 'generation_z',
        '25-40': 'millennials',
        '41-56': 'generation_x',
        '57-75': 'baby_boomers',
        '76-96': 'silent_generation'
      };
      
      const mappedAgeGroups = apiFilters.ageGroups
        .map(group => ageGroupMapping[group])
        .filter(Boolean);
      
      if (mappedAgeGroups.length > 0) {
        filterValues.push({
          providerId: this.providerId,
          filterId: 'age_group',
          value: JSON.stringify(mappedAgeGroups)
        });
      }
    }

    // Channel mapping
    if (apiFilters.channel && apiFilters.channel !== 'all') {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'channel',
        value: `["${apiFilters.channel}"]`
      });
    }

    // Shopping interests mapping
    if (apiFilters.shoppingInterests?.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'shopping_interests',
        value: JSON.stringify(apiFilters.shoppingInterests)
      });
    }

    // Regional location mapping
    if (apiFilters.regions?.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'customer_region_type',
        value: JSON.stringify(apiFilters.regions)
      });
    }

    // Municipal location mapping
    if (apiFilters.municipalities?.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'home_location',
        value: JSON.stringify(apiFilters.municipalities)
      });
    }

    // Go For More mapping
    if (apiFilters.goForMore !== null && apiFilters.goForMore !== undefined) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'customer_activity_promotion',
        value: `["${apiFilters.goForMore ? 'active' : 'inactive'}"]`
      });
    }

    // Store mapping
    if (apiFilters.stores?.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'store',
        value: JSON.stringify(apiFilters.stores)
      });
    }

    return filterValues;
  }

  /**
   * Get metric-specific filters for context (simplified)
   */
  getMetricFiltersForContext(metricIDs: string[], context: string): FilterValue[] {
    const metricFilters = [];
    
    metricIDs.forEach(metricID => {
      const config = METRIC_SPECIFIC_FILTERS[metricID];
      if (config) {
        Object.entries(config).forEach(([filterId, contextMap]) => {
          const value = contextMap[context] || Object.values(contextMap)[0]; // Default to first value
          metricFilters.push({
            providerId: this.providerId,
            filterId,
            value: String(value)
          });
        });
      }
    });

    return metricFilters;
  }

  /**
   * Validate filters (simplified)
   */
  validateFilters(filters: UIFilters): ValidationResult {
    const errors = [];
    
    // Date range validation
    if (!filters.dateRange?.start || !filters.dateRange?.end) {
      errors.push('Date range is required');
    } else {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    // Gender validation
    if (filters.gender && !['all', 'male', 'female'].includes(filters.gender)) {
      errors.push('Invalid gender value');
    }

    // Channel validation
    if (filters.channel && !['all', 'ecommerce', 'physical'].includes(filters.channel)) {
      errors.push('Invalid channel value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get filter summary for display
   */
  getFilterSummary(filters: UIFilters): string {
    const summary = [];
    
    if (filters.channel && filters.channel !== 'all') {
      summary.push(`Channel: ${filters.channel}`);
    }
    
    if (filters.gender && filters.gender !== 'all') {
      summary.push(`Gender: ${filters.gender}`);
    }
    
    if (filters.ageGroups?.length > 0) {
      summary.push(`Age groups: ${filters.ageGroups.length}`);
    }
    
    if (filters.regions?.length > 0) {
      summary.push(`Regions: ${filters.regions.length}`);
    }
    
    if (filters.shoppingInterests?.length > 0) {
      summary.push(`Interests: ${filters.shoppingInterests.length}`);
    }
    
    return summary.length > 0 ? summary.join(', ') : 'No filters applied';
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(filters: UIFilters): boolean {
    return (
      (filters.channel && filters.channel !== 'all') ||
      (filters.gender && filters.gender !== 'all') ||
      (filters.ageGroups?.length > 0) ||
      (filters.regions?.length > 0) ||
      (filters.municipalities?.length > 0) ||
      (filters.goForMore !== null && filters.goForMore !== undefined) ||
      (filters.shoppingInterests?.length > 0) ||
      (filters.stores?.length > 0)
    );
  }

  /**
   * Map gender to API format
   */
  _mapGender(gender?: string): string {
    if (gender === 'male') return 'm';
    if (gender === 'female') return 'f';
    return 'a'; // all
  }
}

// Export singleton instance
export const filterService = new FilterService();
export default filterService;