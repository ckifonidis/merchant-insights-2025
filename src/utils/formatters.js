/**
 * Centralized formatting utilities for the application
 */

// Currency formatting for Greek locale
export const formatCurrency = (value, options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    locale = 'el-GR',
    currency = 'EUR'
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

// Number formatting
export const formatNumber = (value, options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    locale = 'el-GR'
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

// Percentage formatting
export const formatPercentage = (value, options = {}) => {
  const {
    minimumFractionDigits = 1,
    maximumFractionDigits = 1,
    showSign = false
  } = options;

  const formattedValue = Number(value).toFixed(maximumFractionDigits);
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formattedValue}%`;
};

// Universal value formatter based on type
export const formatValue = (value, type = 'number', options = {}) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  switch (type) {
    case 'currency':
      return formatCurrency(value, options);
    case 'percentage':
      return formatPercentage(value, options);
    case 'number':
      return formatNumber(value, options);
    default:
      return String(value);
  }
};

// Compact number formatting (1.2K, 1.5M, etc.)
export const formatCompactNumber = (value, locale = 'el-GR') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Format change with appropriate sign and color indication
export const formatChange = (value, options = {}) => {
  const {
    type = 'percentage',
    showSign = true,
    precision = 1
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return { formatted: '-', isPositive: null };
  }

  const isPositive = value > 0;
  const sign = showSign && isPositive ? '+' : '';
  
  let formatted;
  if (type === 'percentage') {
    formatted = `${sign}${Number(value).toFixed(precision)}%`;
  } else if (type === 'currency') {
    formatted = `${sign}${formatCurrency(Math.abs(value))}`;
  } else {
    formatted = `${sign}${Number(value).toFixed(precision)}`;
  }

  return {
    formatted,
    isPositive: value > 0,
    isNegative: value < 0,
    isZero: value === 0
  };
};