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
  ANALYTICS_PROVIDERS,
  METRIC_IDS,
} from '../types/apiSchema';