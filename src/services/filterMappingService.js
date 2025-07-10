/**
 * Enhanced Filter Mapping Service
 * Handles bidirectional conversion between UI and API filter formats
 * for the new normalized filter state structure
 */

import { ANALYTICS_PROVIDER_IDS } from '../data/apiSchema.js';

class FilterMappingService {
  constructor() {
    this.providerId = ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS;
  }

  /**
   * Convert API filters from normalized state to API filterValues array
   * This method works with the new filters.api structure
   */
  mapAPIFiltersToFilterValues(apiFilters) {
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
    if (apiFilters.ageGroups && apiFilters.ageGroups.length > 0) {
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
    if (apiFilters.shoppingInterests && apiFilters.shoppingInterests.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'shopping_interests',
        value: JSON.stringify(apiFilters.shoppingInterests)
      });
    }

    // Regional location mapping
    if (apiFilters.regions && apiFilters.regions.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'customer_region_type',
        value: JSON.stringify(apiFilters.regions)
      });
    }

    // Municipal location mapping
    if (apiFilters.municipalities && apiFilters.municipalities.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'home_location',
        value: JSON.stringify(apiFilters.municipalities)
      });
    }

    // Go For More mapping
    if (apiFilters.goForMore !== null) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'customer_activity_promotion',
        value: `["${apiFilters.goForMore ? 'active' : 'inactive'}"]`
      });
    }

    // Store mapping
    if (apiFilters.stores && apiFilters.stores.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'store',
        value: JSON.stringify(apiFilters.stores)
      });
    }

    console.log('🔄 API filters mapped to filterValues:', filterValues);
    return filterValues;
  }

  /**
   * Convert legacy UI filters to new normalized API format
   * This helps with migration from the old filter structure
   */
  mapLegacyUIFiltersToAPI(legacyUIFilters) {
    const apiFilters = {
      dateRange: {
        start: legacyUIFilters.dateRange?.start?.split('T')[0] || legacyUIFilters.dateRange?.startDate,
        end: legacyUIFilters.dateRange?.end?.split('T')[0] || legacyUIFilters.dateRange?.endDate
      },
      channel: legacyUIFilters.channel || 'all',
      gender: 'a', // Default to 'all'
      ageGroups: legacyUIFilters.ageGroups || [],
      regions: [],
      municipalities: [],
      goForMore: legacyUIFilters.goForMore || null,
      shoppingInterests: legacyUIFilters.shoppingInterests || [],
      stores: legacyUIFilters.stores || []
    };

    // Convert gender
    if (legacyUIFilters.gender === 'male') {
      apiFilters.gender = 'm';
    } else if (legacyUIFilters.gender === 'female') {
      apiFilters.gender = 'f';
    }

    // Convert customer location to regions/municipalities
    if (legacyUIFilters.customerLocation && legacyUIFilters.customerLocation.length > 0) {
      const regions = [];
      const municipalities = [];
      
      legacyUIFilters.customerLocation.forEach(location => {
        if (location.includes('/')) {
          // This is a municipality path like "ΑΤΤΙΚΗ/ΑΘΗΝΑ"
          const parts = location.split('/');
          const region = parts[0];
          const municipality = parts[parts.length - 1];
          
          if (!regions.includes(region)) {
            regions.push(region);
          }
          municipalities.push(municipality);
        } else {
          // This is just a region
          if (!regions.includes(location)) {
            regions.push(location);
          }
        }
      });
      
      apiFilters.regions = regions;
      apiFilters.municipalities = municipalities;
    }

    return apiFilters;
  }

  /**
   * Convert normalized UI filters to API format
   * This method works with the new filters.ui structure
   */
  mapNormalizedUIFiltersToAPI(uiFilters) {
    const apiFilters = {
      dateRange: {
        start: uiFilters.dateRange.start,
        end: uiFilters.dateRange.end
      },
      channel: uiFilters.channel.selected,
      gender: 'a', // Default
      ageGroups: uiFilters.demographics.ageGroups.selected,
      regions: uiFilters.location.regions.selected,
      municipalities: uiFilters.location.municipalities.selected,
      goForMore: uiFilters.goForMore.selected,
      shoppingInterests: uiFilters.shoppingInterests.selected,
      stores: uiFilters.stores.selected
    };

    // Convert gender to API format
    if (uiFilters.demographics.gender.selected === 'male') {
      apiFilters.gender = 'm';
    } else if (uiFilters.demographics.gender.selected === 'female') {
      apiFilters.gender = 'f';
    }

    return apiFilters;
  }

  /**
   * Convert API filters back to normalized UI format
   * Useful for loading saved filter sets or API responses
   */
  mapAPIFiltersToNormalizedUI(apiFilters, existingUIFilters = {}) {
    const uiFilters = {
      dateRange: {
        start: apiFilters.dateRange.start,
        end: apiFilters.dateRange.end,
        preset: 'custom' // Will need to be determined based on the actual dates
      },
      channel: {
        selected: apiFilters.channel,
        options: existingUIFilters.channel?.options || ['all', 'ecommerce', 'physical']
      },
      demographics: {
        gender: {
          selected: apiFilters.gender === 'm' ? 'male' : 
                   apiFilters.gender === 'f' ? 'female' : 'all',
          options: existingUIFilters.demographics?.gender?.options || ['all', 'male', 'female']
        },
        ageGroups: {
          selected: apiFilters.ageGroups || [],
          options: existingUIFilters.demographics?.ageGroups?.options || [],
          multiSelect: true
        }
      },
      location: {
        regions: {
          selected: apiFilters.regions || [],
          options: existingUIFilters.location?.regions?.options || [],
          multiSelect: true
        },
        municipalities: {
          selected: apiFilters.municipalities || [],
          options: existingUIFilters.location?.municipalities?.options || [],
          multiSelect: true
        }
      },
      goForMore: {
        selected: apiFilters.goForMore,
        available: existingUIFilters.goForMore?.available || false
      },
      shoppingInterests: {
        selected: apiFilters.shoppingInterests || [],
        options: existingUIFilters.shoppingInterests?.options || [],
        multiSelect: true
      },
      stores: {
        selected: apiFilters.stores || [],
        options: existingUIFilters.stores?.options || [],
        multiSelect: true
      }
    };

    return uiFilters;
  }

  /**
   * Validate filter values
   */
  validateFilters(apiFilters) {
    const errors = [];
    
    // Date range validation
    if (!apiFilters.dateRange?.start || !apiFilters.dateRange?.end) {
      errors.push('Date range is required');
    } else {
      const startDate = new Date(apiFilters.dateRange.start);
      const endDate = new Date(apiFilters.dateRange.end);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
      
      // Check if date range is reasonable (not too far in the past or future)
      const now = new Date();
      const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (startDate < twoYearsAgo) {
        errors.push('Start date cannot be more than 2 years in the past');
      }
      
      if (endDate > oneYearFromNow) {
        errors.push('End date cannot be more than 1 year in the future');
      }
    }

    // Gender validation
    if (apiFilters.gender && !['a', 'm', 'f'].includes(apiFilters.gender)) {
      errors.push('Invalid gender value');
    }

    // Channel validation
    if (apiFilters.channel && !['all', 'ecommerce', 'physical'].includes(apiFilters.channel)) {
      errors.push('Invalid channel value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate a hash of filter values for caching purposes
   */
  generateFilterHash(apiFilters) {
    const filterString = JSON.stringify(apiFilters, Object.keys(apiFilters).sort());
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < filterString.length; i++) {
      const char = filterString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Compare two filter objects to see if they're equivalent
   */
  areFiltersEqual(filters1, filters2) {
    return this.generateFilterHash(filters1) === this.generateFilterHash(filters2);
  }

  /**
   * Get a human-readable description of applied filters
   */
  getFilterDescription(uiFilters) {
    const descriptions = [];
    
    // Date range
    descriptions.push(`${uiFilters.dateRange.start} to ${uiFilters.dateRange.end}`);
    
    // Channel
    if (uiFilters.channel.selected !== 'all') {
      descriptions.push(`Channel: ${uiFilters.channel.selected}`);
    }
    
    // Gender
    if (uiFilters.demographics.gender.selected !== 'all') {
      descriptions.push(`Gender: ${uiFilters.demographics.gender.selected}`);
    }
    
    // Age groups
    if (uiFilters.demographics.ageGroups.selected.length > 0) {
      descriptions.push(`Age groups: ${uiFilters.demographics.ageGroups.selected.join(', ')}`);
    }
    
    // Regions
    if (uiFilters.location.regions.selected.length > 0) {
      descriptions.push(`Regions: ${uiFilters.location.regions.selected.length} selected`);
    }
    
    // Municipalities
    if (uiFilters.location.municipalities.selected.length > 0) {
      descriptions.push(`Municipalities: ${uiFilters.location.municipalities.selected.length} selected`);
    }
    
    // Go For More
    if (uiFilters.goForMore.selected !== null) {
      descriptions.push(`Go For More: ${uiFilters.goForMore.selected ? 'Yes' : 'No'}`);
    }
    
    // Shopping interests
    if (uiFilters.shoppingInterests.selected.length > 0) {
      descriptions.push(`Shopping interests: ${uiFilters.shoppingInterests.selected.length} selected`);
    }
    
    // Stores
    if (uiFilters.stores.selected.length > 0) {
      descriptions.push(`Stores: ${uiFilters.stores.selected.length} selected`);
    }
    
    return descriptions.join(' | ');
  }

  /**
   * Legacy method for backward compatibility
   * Maps old-style UI filters to API filterValues array
   */
  mapUIFiltersToAPI(uiFilters) {
    // First convert to normalized API format
    const apiFilters = this.mapLegacyUIFiltersToAPI(uiFilters);
    
    // Then convert to filterValues array
    return this.mapAPIFiltersToFilterValues(apiFilters);
  }
}

// Export singleton instance
export const filterMappingService = new FilterMappingService();
export default filterMappingService;