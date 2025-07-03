/**
 * Filter-Aware Data Generator for Mock Server
 * Applies filters to generated data to simulate real API behavior
 */

// Parse filter values from the request
function parseFilterValues(filterValues = []) {
  const parsed = {};
  
  filterValues.forEach(filter => {
    switch (filter.filterId) {
      case 'gender':
        try {
          parsed.gender = JSON.parse(filter.value);
        } catch (e) {
          console.warn('Failed to parse gender filter:', filter.value);
        }
        break;
        
      case 'age_group':
        try {
          parsed.ageGroups = JSON.parse(filter.value);
        } catch (e) {
          console.warn('Failed to parse age group filter:', filter.value);
        }
        break;
        
      case 'shopping_interests':
        try {
          parsed.shoppingInterests = JSON.parse(filter.value);
        } catch (e) {
          console.warn('Failed to parse shopping interests filter:', filter.value);
        }
        break;
        
      case 'home_location':
        try {
          parsed.locations = JSON.parse(filter.value);
        } catch (e) {
          console.warn('Failed to parse location filter:', filter.value);
        }
        break;
        
      case 'channel':
        try {
          parsed.channels = JSON.parse(filter.value);
        } catch (e) {
          console.warn('Failed to parse channel filter:', filter.value);
        }
        break;
        
      case 'interest_type':
        parsed.interestType = filter.value; // revenue or customers
        break;
        
      case 'data_origin':
        parsed.dataOrigin = filter.value; // own_data, competition_comparison, etc.
        break;
        
      case 'age':
        try {
          const [min, max] = filter.value.split('|').map(Number);
          parsed.ageRange = { min, max };
        } catch (e) {
          console.warn('Failed to parse age range filter:', filter.value);
        }
        break;
    }
  });
  
  return parsed;
}

// Calculate filter reduction factor based on how restrictive filters are
function calculateFilterReduction(parsedFilters) {
  let reductionFactor = 1.0; // Start with no reduction
  
  // Gender filter reduces by 50% if specific gender selected
  if (parsedFilters.gender && parsedFilters.gender.length === 1) {
    reductionFactor *= 0.6; // Roughly 60% are of a specific gender
  }
  
  // Age group filter
  if (parsedFilters.ageGroups && parsedFilters.ageGroups.length > 0) {
    const totalAgeGroups = 5; // generation_z, millennials, generation_x, baby_boomers, silent_generation
    const selectedGroups = parsedFilters.ageGroups.length;
    reductionFactor *= (selectedGroups / totalAgeGroups);
  }
  
  // Shopping interests filter
  if (parsedFilters.shoppingInterests && parsedFilters.shoppingInterests.length > 0) {
    const totalInterests = 15; // SHOPINT1 through SHOPINT15
    const selectedInterests = parsedFilters.shoppingInterests.length;
    reductionFactor *= Math.min(1.0, (selectedInterests / totalInterests) + 0.3); // At least 30% coverage
  }
  
  // Location filter
  if (parsedFilters.locations && parsedFilters.locations.length > 0) {
    // Assume Attica region has most customers, other regions reduce significantly
    const atticaSelected = parsedFilters.locations.some(loc => 
      loc.includes('ΑΤΤΙΚΗ') || loc.includes('ΑΘΗΝΑ') || loc.includes('ΠΕΙΡΑΙΑΣ')
    );
    if (atticaSelected) {
      reductionFactor *= 0.7; // 70% of customers in Attica region
    } else {
      reductionFactor *= 0.3; // 30% in other regions
    }
  }
  
  // Channel filter
  if (parsedFilters.channels && parsedFilters.channels.length === 1) {
    if (parsedFilters.channels[0] === 'physical') {
      reductionFactor *= 0.8; // 80% physical
    } else if (parsedFilters.channels[0] === 'ecommerce') {
      reductionFactor *= 0.2; // 20% e-commerce
    }
  }
  
  console.log(`🔢 Filter reduction factor: ${reductionFactor.toFixed(2)}`);
  return Math.max(0.05, reductionFactor); // Never reduce below 5%
}

// Apply filters to demographic data
function applyFiltersToData(metricID, data, parsedFilters) {
  if (!parsedFilters || Object.keys(parsedFilters).length === 0) {
    return data; // No filters, return original data
  }
  
  console.log(`🔍 Applying filters to ${metricID}:`, parsedFilters);
  
  switch (metricID) {
    case 'converted_customers_by_gender':
      return applyGenderFilter(data, parsedFilters);
      
    case 'converted_customers_by_age':
      return applyAgeGroupFilter(data, parsedFilters);
      
    case 'converted_customers_by_interest':
      return applyShoppingInterestsFilter(data, parsedFilters);
      
    case 'transactions_by_geo':
      return applyLocationFilter(data, parsedFilters);
      
    default:
      // For scalar values and time series, apply general reduction
      return applyGeneralFilter(data, parsedFilters);
  }
}

function applyGenderFilter(data, parsedFilters) {
  if (!parsedFilters.gender) return data;
  
  // Filter gender data to only include selected genders
  if (data.seriesValues && data.seriesValues[0] && data.seriesValues[0].seriesPoints) {
    data.seriesValues[0].seriesPoints = data.seriesValues[0].seriesPoints.filter(point => 
      parsedFilters.gender.includes(point.value2)
    );
  }
  
  return data;
}

function applyAgeGroupFilter(data, parsedFilters) {
  if (!parsedFilters.ageGroups) return data;
  
  // Map age groups to age ranges
  const ageGroupMapping = {
    'generation_z': ['18-24'],
    'millennials': ['25-34', '35-44'], 
    'generation_x': ['45-54'],
    'baby_boomers': ['55-64'],
    'silent_generation': ['65+']
  };
  
  const allowedAgeRanges = [];
  parsedFilters.ageGroups.forEach(group => {
    if (ageGroupMapping[group]) {
      allowedAgeRanges.push(...ageGroupMapping[group]);
    }
  });
  
  if (data.seriesValues && data.seriesValues[0] && data.seriesValues[0].seriesPoints) {
    data.seriesValues[0].seriesPoints = data.seriesValues[0].seriesPoints.filter(point => 
      allowedAgeRanges.includes(point.value2)
    );
  }
  
  return data;
}

function applyShoppingInterestsFilter(data, parsedFilters) {
  if (!parsedFilters.shoppingInterests) return data;
  
  // Filter shopping interests to only include selected ones
  if (data.seriesValues && data.seriesValues[0] && data.seriesValues[0].seriesPoints) {
    data.seriesValues[0].seriesPoints = data.seriesValues[0].seriesPoints.filter(point => 
      parsedFilters.shoppingInterests.includes(point.value2) || point.value2 === '' || point.value2 === 'other_category'
    );
  }
  
  return data;
}

function applyLocationFilter(data, parsedFilters) {
  if (!parsedFilters.locations) return data;
  
  // For geo data, only show regions that match the filter
  if (data.seriesValues && data.seriesValues[0] && data.seriesValues[0].seriesPoints) {
    // If Attica municipalities are selected, show only Attica region
    const atticaSelected = parsedFilters.locations.some(loc => 
      loc.includes('ΑΤΤΙΚΗ') || loc.includes('ΑΘΗΝΑ') || loc.includes('ΠΕΙΡΑΙΑΣ')
    );
    
    if (atticaSelected) {
      data.seriesValues[0].seriesPoints = data.seriesValues[0].seriesPoints.filter(point => 
        point.value2 === 'ΑΤΤΙΚΗ'
      );
    } else {
      // Filter out Attica and show other regions
      data.seriesValues[0].seriesPoints = data.seriesValues[0].seriesPoints.filter(point => 
        point.value2 !== 'ΑΤΤΙΚΗ'
      );
    }
  }
  
  return data;
}

function applyGeneralFilter(data, parsedFilters) {
  const reductionFactor = calculateFilterReduction(parsedFilters);
  
  // Apply reduction to scalar values
  if (data.scalarValue && !isNaN(parseFloat(data.scalarValue))) {
    const originalValue = parseFloat(data.scalarValue);
    data.scalarValue = (originalValue * reductionFactor).toFixed(2);
  }
  
  // Apply reduction to time series data
  if (data.seriesValues && data.seriesValues[0] && data.seriesValues[0].seriesPoints) {
    data.seriesValues[0].seriesPoints = data.seriesValues[0].seriesPoints.map(point => {
      if (!isNaN(parseFloat(point.value1))) {
        const originalValue = parseFloat(point.value1);
        return {
          ...point,
          value1: (originalValue * reductionFactor).toFixed(2)
        };
      }
      return point;
    });
  }
  
  return data;
}

// Check if dataset meets minimum size requirements
function validateDatasetSize(data, minimumSize = 10) {
  if (!data) return false;
  
  if (data.scalarValue) {
    const value = parseFloat(data.scalarValue);
    return !isNaN(value) && value >= minimumSize;
  }
  
  if (data.seriesValues && data.seriesValues[0] && data.seriesValues[0].seriesPoints) {
    // For demographic data, check if we have any data points rather than total value
    const points = data.seriesValues[0].seriesPoints;
    if (points.length === 0) return false;
    
    // Check if at least one point has meaningful data
    const hasValidData = points.some(point => {
      const value = parseFloat(point.value1);
      return !isNaN(value) && value > 0;
    });
    
    return hasValidData;
  }
  
  return true; // Default to valid if we can't determine
}

// Create insufficient data response
function createInsufficientDataResponse(metricID, merchantId) {
  return {
    metricID,
    percentageValue: false,
    scalarValue: null,
    seriesValues: null,
    merchantId,
    insufficientData: true
  };
}

// Enhanced metric generation with filter awareness
function generateFilterAwareMetric(metricID, options = {}) {
  const { filterValues = [], ...otherOptions } = options;
  
  // Parse filters
  const parsedFilters = parseFilterValues(filterValues);
  console.log(`🎯 Generating ${metricID} with filters:`, parsedFilters);
  
  // Generate base data using existing generator
  const { generateMetricResponse } = require('./dataGenerator');
  let data = generateMetricResponse(metricID, { ...otherOptions, filterValues });
  
  // Apply filters to the data
  data = applyFiltersToData(metricID, data, parsedFilters);
  
  // Validate dataset size
  if (!validateDatasetSize(data)) {
    console.log(`⚠️  Insufficient data for ${metricID} after filtering`);
    return createInsufficientDataResponse(metricID, data.merchantId);
  }
  
  return data;
}

module.exports = {
  parseFilterValues,
  calculateFilterReduction,
  applyFiltersToData,
  validateDatasetSize,
  createInsufficientDataResponse,
  generateFilterAwareMetric
};