// DEPRECATED: This hook is replaced by useDashboardData from useTabData.js
// Keeping for backwards compatibility, but redirecting to new implementation

import { useDashboardData } from './useTabData.js';

export const useDashboardMetrics = (filters = {}) => {
  console.warn('⚠️ useDashboardMetrics is deprecated. Use useDashboardData instead.');
  
  const { data, loading, error, refresh } = useDashboardData();
  
  // Transform new data format to old format for backwards compatibility
  const legacyMetrics = {
    totalRevenue: data.totalRevenue,
    totalTransactions: data.totalTransactions,
    avgTransaction: data.avgTransaction
  };
  
  return { 
    metrics: legacyMetrics, 
    loading, 
    error,
    refresh // New functionality available
  };
};