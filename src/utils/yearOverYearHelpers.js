/**
 * Year-over-Year calculation utilities for metric cards
 */

/**
 * Calculate year-over-year percentage change
 * @param {number} currentValue - Current period value
 * @param {number} previousValue - Previous year same period value
 * @returns {number|null} - Percentage change or null if calculation not possible
 */
export const calculateYearOverYearChange = (currentValue, previousValue) => {
  // Handle invalid inputs
  if (typeof currentValue !== 'number' || typeof previousValue !== 'number') {
    return null;
  }
  
  // Handle division by zero
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : null;
  }
  
  // Standard percentage change calculation
  return ((currentValue - previousValue) / previousValue) * 100;
};

/**
 * Extract metric value from transformed dashboard data
 * @param {Object} data - Transformed dashboard data object  
 * @param {string} metricId - The metric identifier (e.g., 'total_revenue')
 * @param {string} type - 'merchant' or 'competitor'
 * @returns {number|null} - Extracted metric value or null if not found
 */
export const extractMetricValue = (data, metricId, type = 'merchant') => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  
  // Map API metric IDs to transformed data property names
  const metricMapping = {
    'total_revenue': 'totalRevenue',
    'total_transactions': 'totalTransactions', 
    'avg_ticket_per_user': 'avgTransaction'
  };
  
  const transformedKey = metricMapping[metricId];
  
  if (!transformedKey || !data[transformedKey]) {
    // Only warn if data object has keys (indicating it's loaded but missing this metric)
    if (data && Object.keys(data).length > 0) {
      console.warn(`⚠️ Metric not found: ${metricId} -> ${transformedKey}`, {
        availableKeys: Object.keys(data),
        requestedKey: transformedKey
      });
    }
    return null;
  }
  
  const metricData = data[transformedKey];
  
  // Extract value based on type (merchant/competitor)
  if (metricData[type] && typeof metricData[type].value === 'number') {
    return metricData[type].value;
  }
  
  console.warn(`⚠️ No ${type} data found for ${metricId}:`, metricData);
  return null;
};

/**
 * Prepare metric data for UniversalMetricCard detailed variant
 * Automatically calculates year-over-year percentages from current and previous data
 * @param {Object} params - Configuration object
 * @param {string} params.metricId - The metric identifier
 * @param {Object} params.currentData - Current year transformed data
 * @param {Object} params.previousData - Previous year transformed data  
 * @param {string} params.valueType - Value formatting type ('currency', 'number', etc.)
 * @returns {Object} - Formatted data for UniversalMetricCard
 */
export const prepareMetricCardData = ({ 
  metricId, 
  currentData, 
  previousData, 
  valueType = 'number'
}) => {
  // Extract merchant values
  const currentMerchant = extractMetricValue(currentData, metricId, 'merchant');
  const previousMerchant = extractMetricValue(previousData, metricId, 'merchant');
  
  // Extract competitor values from same data sources
  const currentCompetitor = extractMetricValue(currentData, metricId, 'competitor');
  const previousCompetitor = extractMetricValue(previousData, metricId, 'competitor');
  
  // Calculate year-over-year changes
  const merchantChange = calculateYearOverYearChange(currentMerchant, previousMerchant);
  const competitorChange = calculateYearOverYearChange(currentCompetitor, previousCompetitor);
  
  
  return {
    merchantData: {
      value: currentMerchant,
      change: merchantChange,
      valueType
    },
    competitorData: {
      value: currentCompetitor,
      change: competitorChange,
      valueType
    },
    // Additional metadata
    hasPreviousData: previousMerchant !== null || previousCompetitor !== null,
    metricId
  };
};

/**
 * Round percentage to 1 decimal place for display
 * @param {number} percentage - The percentage value
 * @returns {number|null} - Rounded percentage
 */
export const roundPercentage = (percentage) => {
  if (percentage === null || percentage === undefined) {
    return null;
  }
  return Math.round(percentage * 10) / 10;
};