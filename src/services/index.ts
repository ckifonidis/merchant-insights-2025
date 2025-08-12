/**
 * Services Index
 * Central export point for all services
 */

export { analyticsService, buildFilterValue, generateGUID } from './analyticsService.js';

// User service exports (functional API)
export { 
  checkUserStatus, 
  fetchUserConfiguration, 
  fetchMerchantDetails, 
  fetchAllMerchantDetails,
  getUserStatus,
  hasUserAccess,
  getUserPreferences
} from './userService.js';

// Re-export API schema constants for convenience
export {
  API_ENDPOINTS,
  ANALYTICS_PROVIDER_IDS,
  METRIC_IDS,
  FILTER_IDS,
  FILTER_VALUES
} from '../data/apiSchema.js';