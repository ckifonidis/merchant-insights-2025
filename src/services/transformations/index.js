/**
 * Transformation Functions Index
 * Central hub for all data transformation logic
 */

import { transformDashboardData, validateDashboardData } from './dashboardTransform.js';

// Tab-specific transformation functions
const transformations = {
  dashboard: transformDashboardData,
  revenue: (data) => {
    // TODO: Implement revenue transformation
    console.log('🔄 Revenue transformation not implemented yet');
    return {};
  },
  demographics: (data) => {
    // TODO: Implement demographics transformation
    console.log('🔄 Demographics transformation not implemented yet');
    return {};
  },
  competition: (data) => {
    // TODO: Implement competition transformation
    console.log('🔄 Competition transformation not implemented yet');
    return {};
  }
};

// Tab-specific validation functions
const validators = {
  dashboard: validateDashboardData,
  revenue: (data) => true, // TODO: Implement
  demographics: (data) => true, // TODO: Implement
  competition: (data) => true // TODO: Implement
};

// Main transformation router
export const transformTabData = (tabName, apiResponse) => {
  console.log(`🔄 Transforming ${tabName} data...`);
  
  if (!transformations[tabName]) {
    console.error(`❌ No transformation function for tab: ${tabName}`);
    return {};
  }

  try {
    const transformedData = transformations[tabName](apiResponse);
    const isValid = validators[tabName](transformedData);
    
    if (!isValid) {
      console.warn(`⚠️ Validation failed for ${tabName} data`);
    }
    
    return transformedData;
  } catch (error) {
    console.error(`❌ Transformation failed for ${tabName}:`, error);
    return {};
  }
};

// Export individual transformations for direct use
export { transformDashboardData, validateDashboardData };

// Utility functions for common transformations
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${(value || 0).toFixed(decimals)}%`;
};

// Error handling for transformations
export const createTransformationError = (tabName, originalError) => ({
  type: 'TRANSFORMATION_ERROR',
  tabName,
  message: `Failed to transform ${tabName} data`,
  originalError: originalError.message,
  timestamp: new Date().toISOString()
});