/**
 * Filter Mapping Service
 * Translates UI filter values to API-compatible format
 */

import { ANALYTICS_PROVIDER_IDS } from '../data/apiSchema.js';

class FilterMappingService {
  constructor() {
    this.providerId = ANALYTICS_PROVIDER_IDS.POST_PROMOTION_ANALYTICS;
  }

  /**
   * Convert UI filters to API filterValues array
   */
  mapUIFiltersToAPI(uiFilters) {
    const filterValues = [];

    // Gender mapping
    if (uiFilters.gender && uiFilters.gender !== 'all') {
      const genderValue = uiFilters.gender === 'male' ? 'm' : 'f';
      filterValues.push({
        providerId: this.providerId,
        filterId: 'gender',
        value: `["${genderValue}"]`
      });
    }

    // Age groups mapping
    if (uiFilters.ageGroups && uiFilters.ageGroups.length > 0) {
      const ageGroupMapping = {
        'genZ': 'generation_z',
        'millennials': 'millennials', 
        'genX': 'generation_x',
        'boomers': 'baby_boomers',
        'silent': 'silent_generation'
      };
      
      const mappedAgeGroups = uiFilters.ageGroups
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
    if (uiFilters.channel && uiFilters.channel !== 'all') {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'channel',
        value: `["${uiFilters.channel}"]`
      });
    }

    // Shopping interests mapping
    if (uiFilters.shoppingInterests && uiFilters.shoppingInterests.length > 0) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'shopping_interests',
        value: JSON.stringify(uiFilters.shoppingInterests)
      });
    }

    // Customer location mapping
    if (uiFilters.customerLocation && uiFilters.customerLocation.length > 0) {
      // Extract municipalities from the location hierarchy
      const municipalities = uiFilters.customerLocation
        .filter(location => location.includes('/'))
        .map(location => {
          const parts = location.split('/');
          return parts[parts.length - 1]; // Get the municipality name
        })
        .filter(Boolean);

      if (municipalities.length > 0) {
        filterValues.push({
          providerId: this.providerId,
          filterId: 'home_location',
          value: JSON.stringify(municipalities)
        });
      }
    }

    // Go For More mapping (if applicable)
    if (uiFilters.goForMore && uiFilters.goForMore !== 'all') {
      const goForMoreValue = uiFilters.goForMore === 'yes' ? 'true' : 'false';
      filterValues.push({
        providerId: this.providerId,
        filterId: 'go_for_more_participant',
        value: goForMoreValue
      });
    }

    // Age range mapping (if specific age range is set)
    if (uiFilters.ageRange) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'age',
        value: `${uiFilters.ageRange.min}|${uiFilters.ageRange.max}`
      });
    }

    // Interest type mapping (revenue vs customers for breakdown charts)
    if (uiFilters.interestType) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'interest_type',
        value: uiFilters.interestType // 'revenue' or 'customers'
      });
    }

    // Data origin mapping (own_data vs competition_comparison)
    if (uiFilters.dataOrigin) {
      filterValues.push({
        providerId: this.providerId,
        filterId: 'data_origin',
        value: uiFilters.dataOrigin
      });
    }

    return filterValues;
  }

  /**
   * Convert API filterValues back to UI format (for persistence)
   */
  mapAPIFiltersToUI(filterValues = []) {
    const uiFilters = {
      gender: 'all',
      ageGroups: [],
      channel: 'all',
      shoppingInterests: [],
      customerLocation: [],
      goForMore: null,
      interestType: null,
      dataOrigin: null
    };

    filterValues.forEach(filter => {
      switch (filter.filterId) {
        case 'gender':
          try {
            const genderArray = JSON.parse(filter.value);
            if (genderArray.includes('m')) uiFilters.gender = 'male';
            else if (genderArray.includes('f')) uiFilters.gender = 'female';
          } catch (e) {
            console.warn('Failed to parse gender filter:', filter.value);
          }
          break;

        case 'age_group':
          try {
            const ageGroups = JSON.parse(filter.value);
            const reverseMapping = {
              'generation_z': 'genZ',
              'millennials': 'millennials',
              'generation_x': 'genX', 
              'baby_boomers': 'boomers',
              'silent_generation': 'silent'
            };
            uiFilters.ageGroups = ageGroups
              .map(group => reverseMapping[group])
              .filter(Boolean);
          } catch (e) {
            console.warn('Failed to parse age group filter:', filter.value);
          }
          break;

        case 'channel':
          try {
            const channels = JSON.parse(filter.value);
            uiFilters.channel = channels[0] || 'all';
          } catch (e) {
            console.warn('Failed to parse channel filter:', filter.value);
          }
          break;

        case 'shopping_interests':
          try {
            uiFilters.shoppingInterests = JSON.parse(filter.value);
          } catch (e) {
            console.warn('Failed to parse shopping interests filter:', filter.value);
          }
          break;

        case 'home_location':
          try {
            uiFilters.customerLocation = JSON.parse(filter.value);
          } catch (e) {
            console.warn('Failed to parse location filter:', filter.value);
          }
          break;

        case 'go_for_more_participant':
          uiFilters.goForMore = filter.value === 'true' ? 'yes' : 'no';
          break;

        case 'age':
          try {
            const [min, max] = filter.value.split('|').map(Number);
            uiFilters.ageRange = { min, max };
          } catch (e) {
            console.warn('Failed to parse age range filter:', filter.value);
          }
          break;

        case 'interest_type':
          uiFilters.interestType = filter.value;
          break;

        case 'data_origin':
          uiFilters.dataOrigin = filter.value;
          break;
      }
    });

    return uiFilters;
  }

  /**
   * Check if a dataset meets minimum size requirements
   */
  validateDatasetSize(data, minimumSize = 20) {
    if (!data) return false;
    
    if (Array.isArray(data)) {
      return data.length >= minimumSize;
    }
    
    if (typeof data === 'object' && data.seriesValues) {
      const totalPoints = data.seriesValues.reduce((total, series) => {
        return total + (series.seriesPoints?.length || 0);
      }, 0);
      return totalPoints >= minimumSize;
    }
    
    return true; // For scalar values, assume they're valid
  }

  /**
   * Create insufficient data placeholder
   */
  createInsufficientDataPlaceholder(metricId, merchantId = 'merchant') {
    return {
      metricID: metricId,
      percentageValue: false,
      scalarValue: null,
      seriesValues: null,
      merchantId,
      insufficientData: true,
      message: 'Insufficient data for current filter selection'
    };
  }

  /**
   * Apply filters to mock data generation
   */
  applyFiltersToMockData(baseData, filterValues) {
    if (!filterValues || filterValues.length === 0) {
      return baseData;
    }

    const parsedFilters = this.parseFilterValues(filterValues);
    let filteredData = { ...baseData };

    // Apply gender filter
    if (parsedFilters.gender) {
      filteredData = this.applyGenderFilter(filteredData, parsedFilters.gender);
    }

    // Apply age group filter
    if (parsedFilters.ageGroups) {
      filteredData = this.applyAgeGroupFilter(filteredData, parsedFilters.ageGroups);
    }

    // Apply shopping interests filter
    if (parsedFilters.shoppingInterests) {
      filteredData = this.applyShoppingInterestsFilter(filteredData, parsedFilters.shoppingInterests);
    }

    // Apply location filter
    if (parsedFilters.locations) {
      filteredData = this.applyLocationFilter(filteredData, parsedFilters.locations);
    }

    return filteredData;
  }

  /**
   * Parse filterValues array into structured object
   */
  parseFilterValues(filterValues) {
    const parsed = {};

    filterValues.forEach(filter => {
      switch (filter.filterId) {
        case 'gender':
          try {
            parsed.gender = JSON.parse(filter.value);
          } catch (e) {
            console.warn('Failed to parse gender filter');
          }
          break;

        case 'age_group':
          try {
            parsed.ageGroups = JSON.parse(filter.value);
          } catch (e) {
            console.warn('Failed to parse age group filter');
          }
          break;

        case 'shopping_interests':
          try {
            parsed.shoppingInterests = JSON.parse(filter.value);
          } catch (e) {
            console.warn('Failed to parse shopping interests filter');
          }
          break;

        case 'home_location':
          try {
            parsed.locations = JSON.parse(filter.value);
          } catch (e) {
            console.warn('Failed to parse location filter');
          }
          break;

        case 'interest_type':
          parsed.interestType = filter.value; // revenue or customers
          break;

        case 'data_origin':
          parsed.dataOrigin = filter.value;
          break;
      }
    });

    return parsed;
  }

  applyGenderFilter(data, genderFilter) {
    // This will be implemented based on the specific data structure
    return data;
  }

  applyAgeGroupFilter(data, ageGroupFilter) {
    // This will be implemented based on the specific data structure
    return data;
  }

  applyShoppingInterestsFilter(data, interestsFilter) {
    // This will be implemented based on the specific data structure
    return data;
  }

  applyLocationFilter(data, locationFilter) {
    // This will be implemented based on the specific data structure
    return data;
  }
}

// Export singleton instance
export const filterMappingService = new FilterMappingService();
export default filterMappingService;