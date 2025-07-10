/**
 * Filter Options Service
 * Handles loading and caching of dynamic filter options from APIs
 */

import { 
  GREEK_REGIONS, 
  SHOPPING_INTERESTS, 
  AGE_GROUPS,
  API_ENDPOINTS 
} from '../data/apiSchema.js';

class FilterOptionsService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultCacheTime = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(key) {
    const expiry = this.cacheExpiry.get(key);
    return expiry && Date.now() < expiry;
  }

  /**
   * Store data in cache with expiry
   */
  setCache(key, data, ttl = this.defaultCacheTime) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  /**
   * Get data from cache
   */
  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  /**
   * Load regions (static for now, could be from API later)
   */
  async loadRegions() {
    const cacheKey = 'regions';
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // For now, return static regions
      // In the future, this could be an API call
      const regions = GREEK_REGIONS.map(region => ({
        value: region,
        label: region,
        id: region.toLowerCase().replace(/\s+/g, '-')
      }));

      this.setCache(cacheKey, regions);
      return regions;
    } catch (error) {
      console.error('Failed to load regions:', error);
      // Return static fallback
      return GREEK_REGIONS.map(region => ({
        value: region,
        label: region,
        id: region.toLowerCase().replace(/\s+/g, '-')
      }));
    }
  }

  /**
   * Load municipalities based on selected regions
   */
  async loadMunicipalities(selectedRegions = []) {
    if (!selectedRegions.length) {
      return [];
    }

    const cacheKey = `municipalities-${selectedRegions.sort().join(',')}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Mock implementation - in real app this would be an API call
      const municipalityData = {
        'ΑΤΤΙΚΗ': [
          'ΑΘΗΝΑ', 'ΠΕΙΡΑΙΑΣ', 'ΠΕΡΙΣΤΕΡΙ', 'ΚΑΛΛΙΘΕΑ', 'ΝΙΚΑΙΑ', 'ΓΛΥΦΑΔΑ',
          'ΒΟΥΛΑ', 'ΒΟΥΛΙΑΓΜΕΝΗ', 'ΕΛΛΗΝΙΚΟ', 'ΑΡΓΥΡΟΥΠΟΛΗ', 'ΚΗΦΙΣΙΑ',
          'ΜΑΡΟΥΣΙ', 'ΧΑΛΑΝΔΡΙ', 'ΑΓΙΑ ΠΑΡΑΣΚΕΥΗ', 'ΒΡΙΛΗΣΣΙΑ'
        ],
        'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ': [
          'ΘΕΣΣΑΛΟΝΙΚΗ', 'ΚΑΛΑΜΑΡΙΑ', 'ΕΥΟΣΜΟΣ', 'ΣΤΑΥΡΟΥΠΟΛΗ', 'ΝΕΑΠΟΛΗ',
          'ΚΑΤΕΡΙΝΗ', 'ΣΕΡΡΕΣ', 'ΔΡΑΜΑ', 'ΚΙΛΚΙΣ', 'ΕΔΕΣΣΑ'
        ],
        'ΘΕΣΣΑΛΙΑ': [
          'ΛΑΡΙΣΑ', 'ΒΟΛΟΣ', 'ΤΡΙΚΑΛΑ', 'ΚΑΡΔΙΤΣΑ', 'ΦΑΡΣΑΛΑ', 'ΤΥΡΝΑΒΟΣ'
        ],
        'ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ': [
          'ΛΑΜΙΑ', 'ΧΑΛΚΙΔΑ', 'ΛΙΒΑΔΕΙΑ', 'ΘΗΒΑ', 'ΑΜΦΙΣΣΑ', 'ΚΑΡΠΕΝΗΣΙ'
        ],
        'ΔΥΤΙΚΗ ΕΛΛΑΔΑ': [
          'ΠΑΤΡΑ', 'ΑΓΡΙΝΙΟ', 'ΜΕΣΟΛΟΓΓΙ', 'ΠΥΡΓΟΣ', 'ΑΜΑΛΙΑΔΑ'
        ],
        'ΠΕΛΟΠΟΝΝΗΣΟΣ': [
          'ΚΑΛΑΜΑΤΑ', 'ΤΡΙΠΟΛΗ', 'ΣΠΑΡΤΗ', 'ΚΟΡΙΝΘΟΣ', 'ΑΡΓΟΣ', 'ΝΑΥΠΛΙΟ'
        ],
        'ΚΡΗΤΗ': [
          'ΗΡΑΚΛΕΙΟ', 'ΧΑΝΙΑ', 'ΡΕΘΥΜΝΟ', 'ΑΓΙΟΣ ΝΙΚΟΛΑΟΣ', 'ΣΗΤΕΙΑ'
        ],
        'ΗΠΕΙΡΟΣ': [
          'ΙΩΑΝΝΙΝΑ', 'ΑΡΤΑ', 'ΠΡΕΒΕΖΑ', 'ΗΓΟΥΜΕΝΙΤΣΑ'
        ]
      };

      const municipalities = [];
      selectedRegions.forEach(region => {
        if (municipalityData[region]) {
          municipalityData[region].forEach(municipality => {
            municipalities.push({
              value: municipality,
              label: municipality,
              region: region,
              id: `${region.toLowerCase().replace(/\s+/g, '-')}-${municipality.toLowerCase().replace(/\s+/g, '-')}`
            });
          });
        }
      });

      this.setCache(cacheKey, municipalities);
      return municipalities;
    } catch (error) {
      console.error('Failed to load municipalities:', error);
      return [];
    }
  }

  /**
   * Load stores for the current merchant
   */
  async loadStores(merchantId) {
    if (!merchantId) {
      return [];
    }

    const cacheKey = `stores-${merchantId}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Mock implementation - in real app this would be an API call
      // TODO: Replace with actual API call to get merchant stores
      const mockStores = [
        {
          id: 'store-001',
          name: 'Main Store - Athens',
          location: 'ΑΘΗΝΑ',
          region: 'ΑΤΤΙΚΗ',
          active: true
        },
        {
          id: 'store-002', 
          name: 'Branch Store - Thessaloniki',
          location: 'ΘΕΣΣΑΛΟΝΙΚΗ',
          region: 'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ',
          active: true
        },
        {
          id: 'store-003',
          name: 'Outlet - Patras',
          location: 'ΠΑΤΡΑ',
          region: 'ΔΥΤΙΚΗ ΕΛΛΑΔΑ',
          active: true
        }
      ];

      const stores = mockStores
        .filter(store => store.active)
        .map(store => ({
          value: store.id,
          label: store.name,
          location: store.location,
          region: store.region,
          id: store.id
        }));

      this.setCache(cacheKey, stores);
      return stores;
    } catch (error) {
      console.error('Failed to load stores:', error);
      return [];
    }
  }

  /**
   * Load shopping interests with localized labels
   */
  async loadShoppingInterests() {
    const cacheKey = 'shopping-interests';
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Mock implementation with localized labels
      // In real app, these could come from a localization API
      const interestLabels = {
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

      const interests = SHOPPING_INTERESTS.map(interest => ({
        value: interest,
        label: interestLabels[interest] || interest,
        id: interest.toLowerCase()
      }));

      this.setCache(cacheKey, interests);
      return interests;
    } catch (error) {
      console.error('Failed to load shopping interests:', error);
      // Return basic fallback
      return SHOPPING_INTERESTS.map(interest => ({
        value: interest,
        label: interest,
        id: interest.toLowerCase()
      }));
    }
  }

  /**
   * Load age groups (static but with consistent format)
   */
  async loadAgeGroups() {
    const cacheKey = 'age-groups';
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const ageGroupLabels = {
      '18-24': 'Generation Z (18-24)',
      '25-40': 'Millennials (25-40)',
      '41-56': 'Generation X (41-56)', 
      '57-75': 'Baby Boomers (57-75)',
      '76-96': 'Silent Generation (76-96)'
    };

    const ageGroups = AGE_GROUPS.map(group => ({
      value: group,
      label: ageGroupLabels[group] || group,
      id: group.replace('-', '_')
    }));

    this.setCache(cacheKey, ageGroups);
    return ageGroups;
  }

  /**
   * Check merchant Go For More participation
   */
  async checkGoForMoreAvailability(merchantId) {
    if (!merchantId) {
      return false;
    }

    const cacheKey = `goformore-${merchantId}`;
    const cached = this.getCache(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    try {
      // Mock implementation - in real app this would be an API call
      // For demo purposes, assume some merchants participate
      const participatingMerchants = [
        "52ba3854-a5d4-47bd-9d1a-b789ae139803", // Default merchant
        "merchant-002",
        "merchant-005"
      ];

      const isAvailable = participatingMerchants.includes(merchantId);
      
      this.setCache(cacheKey, isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('Failed to check Go For More availability:', error);
      return false;
    }
  }

  /**
   * Load all filter options at once
   */
  async loadAllFilterOptions(merchantId, selectedRegions = []) {
    try {
      console.log('🔄 Loading all filter options...');
      
      const [
        regions,
        municipalities, 
        stores,
        shoppingInterests,
        ageGroups,
        goForMoreAvailable
      ] = await Promise.all([
        this.loadRegions(),
        this.loadMunicipalities(selectedRegions),
        this.loadStores(merchantId),
        this.loadShoppingInterests(),
        this.loadAgeGroups(),
        this.checkGoForMoreAvailability(merchantId)
      ]);

      const options = {
        regions,
        municipalities,
        stores,
        shoppingInterests,
        ageGroups,
        goForMoreAvailable,
        channel: [
          { value: 'all', label: 'All Channels', id: 'all' },
          { value: 'ecommerce', label: 'E-commerce', id: 'ecommerce' },
          { value: 'physical', label: 'Physical Stores', id: 'physical' }
        ],
        gender: [
          { value: 'all', label: 'All Genders', id: 'all' },
          { value: 'male', label: 'Male', id: 'male' },
          { value: 'female', label: 'Female', id: 'female' }
        ]
      };

      console.log('✅ Filter options loaded:', {
        regions: regions.length,
        municipalities: municipalities.length,
        stores: stores.length,
        shoppingInterests: shoppingInterests.length,
        ageGroups: ageGroups.length,
        goForMoreAvailable
      });

      return options;
    } catch (error) {
      console.error('Failed to load filter options:', error);
      throw error;
    }
  }

  /**
   * Refresh specific filter options
   */
  async refreshFilterOptions(optionType, params = {}) {
    const cacheKey = this.getCacheKey(optionType, params);
    
    // Clear cache for this option
    this.cache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
    
    // Reload the options
    switch (optionType) {
      case 'regions':
        return this.loadRegions();
      case 'municipalities':
        return this.loadMunicipalities(params.selectedRegions);
      case 'stores':
        return this.loadStores(params.merchantId);
      case 'shoppingInterests':
        return this.loadShoppingInterests();
      case 'ageGroups':
        return this.loadAgeGroups();
      case 'goForMore':
        return this.checkGoForMoreAvailability(params.merchantId);
      default:
        throw new Error(`Unknown option type: ${optionType}`);
    }
  }

  /**
   * Generate cache key for specific option type and parameters
   */
  getCacheKey(optionType, params = {}) {
    switch (optionType) {
      case 'municipalities':
        return `municipalities-${(params.selectedRegions || []).sort().join(',')}`;
      case 'stores':
        return `stores-${params.merchantId}`;
      case 'goForMore':
        return `goformore-${params.merchantId}`;
      default:
        return optionType;
    }
  }

  /**
   * Clear all cached options
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('🗑️ Filter options cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      totalEntries: this.cache.size,
      validEntries: 0,
      expiredEntries: 0,
      entries: []
    };

    for (const [key, value] of this.cache.entries()) {
      const expiry = this.cacheExpiry.get(key);
      const isValid = expiry && Date.now() < expiry;
      
      if (isValid) {
        stats.validEntries++;
      } else {
        stats.expiredEntries++;
      }
      
      stats.entries.push({
        key,
        isValid,
        expiry: expiry ? new Date(expiry).toISOString() : null,
        size: JSON.stringify(value).length
      });
    }

    return stats;
  }
}

// Export singleton instance
export const filterOptionsService = new FilterOptionsService();
export default filterOptionsService;