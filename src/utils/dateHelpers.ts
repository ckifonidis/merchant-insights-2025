/**
 * Date Helper Functions
 * Utility functions for date calculations and year-over-year comparisons
 */

/**
 * Calculate previous year date range based on current date range
 * @param {string} startDate - Current start date in YYYY-MM-DD format
 * @param {string} endDate - Current end date in YYYY-MM-DD format
 * @returns {object} Previous year date range
 */
export const getPreviousYearDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    console.warn('getPreviousYearDateRange: Invalid date inputs', { startDate, endDate });
    return { startDate: null, endDate: null };
  }

  try {
    // Parse current dates
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    
    // Validate dates
    if (isNaN(currentStart.getTime()) || isNaN(currentEnd.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Calculate previous year dates (subtract exactly 1 year)
    const previousStart = new Date(currentStart);
    previousStart.setFullYear(currentStart.getFullYear() - 1);
    
    const previousEnd = new Date(currentEnd);
    previousEnd.setFullYear(currentEnd.getFullYear() - 1);
    
    // Format as YYYY-MM-DD
    const previousStartDate = previousStart.toISOString().split('T')[0];
    const previousEndDate = previousEnd.toISOString().split('T')[0];
    
    console.log(`📅 Previous year range calculated:`, {
      current: { startDate, endDate },
      previous: { startDate: previousStartDate, endDate: previousEndDate }
    });
    
    return {
      startDate: previousStartDate,
      endDate: previousEndDate
    };
  } catch (error) {
    console.error('Error calculating previous year date range:', error);
    return { startDate: null, endDate: null };
  }
};

/**
 * Calculate the number of days between two dates
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {number} Number of days
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format date for display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date
 */
export const formatDateForDisplay = (dateString, locale = 'en-US') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Check if a date range is valid
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {boolean} True if valid
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return !isNaN(start.getTime()) && 
           !isNaN(end.getTime()) && 
           start <= end;
  } catch (error) {
    return false;
  }
};

/**
 * Get date range period description
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string} Description like "30 days", "3 months", etc.
 */
export const getDateRangePeriod = (startDate, endDate) => {
  if (!isValidDateRange(startDate, endDate)) return 'Invalid range';
  
  const days = getDaysBetween(startDate, endDate);
  
  if (days <= 1) return '1 day';
  if (days <= 7) return `${days} days`;
  if (days <= 31) return `${Math.round(days / 7)} weeks`;
  if (days <= 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};

/**
 * Generate a cache key for date-based requests
 * @param {string} startDate - Start date in YYYY-MM-DD format  
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} suffix - Optional suffix
 * @returns {string} Cache key
 */
export const generateDateCacheKey = (startDate, endDate, suffix = '') => {
  return `${startDate}_${endDate}${suffix ? `_${suffix}` : ''}`;
};

/**
 * Constants for common date calculations
 */
export const DATE_CONSTANTS = {
  DAYS_IN_WEEK: 7,
  DAYS_IN_MONTH: 30, // Approximate
  DAYS_IN_YEAR: 365,
  MILLISECONDS_IN_DAY: 1000 * 60 * 60 * 24
};