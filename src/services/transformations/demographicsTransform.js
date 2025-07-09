/**
 * Demographics Data Transformation Functions
 * Converts API responses to UI-compatible formats for customer analytics
 */

// Shopping interest code to label mapping
const SHOPPING_INTEREST_LABELS = {
  '': 'Unspecified',
  'other_category': 'Other Category',
  'SHOPINT1': 'Automotive & Fuel Products',
  'SHOPINT2': 'Electronics & Household Appliances', 
  'SHOPINT3': 'Telecommunication',
  'SHOPINT4': 'Health & Medical Care',
  'SHOPINT5': 'Entertainment & Hobbies',
  'SHOPINT6': 'Education',
  'SHOPINT7': 'Toys',
  'SHOPINT8': 'Travel & Transportation',
  'SHOPINT9': 'Personal Care',
  'SHOPINT10': 'Pets',
  'SHOPINT11': 'Fashion, Cosmetics & Jewelry',
  'SHOPINT12': 'Tourism',
  'SHOPINT13': 'Home & Garden',
  'SHOPINT14': 'Restaurants, Bars, Fast Food & Coffee',
  'SHOPINT15': 'Food & Drinks'
};

// Age group code to label mapping
const AGE_GROUP_LABELS = {
  '18-24': 'Generation Z (18-24)',
  '25-40': 'Millennials (25-40)',
  '41-56': 'Generation X (41-56)',
  '57-75': 'Baby Boomers (57-75)',
  '76-96': 'Silent Generation (76-96)'
};

// Gender code to label mapping
const GENDER_LABELS = {
  'm': 'Male',
  'f': 'Female'
};

// Frequency code to label mapping
const FREQUENCY_LABELS = {
  '1_transaction': '1 Transaction',
  '2_transactions': '2 Transactions',
  '3_transactions': '3 Transactions',
  '4_to_10_transactions': '4-10 Transactions',
  '10_plus_transactions': '10+ Transactions'
};

/**
 * Transform customer count scalar metrics API response to UI format
 * @param {Object} apiResponse - API response with customer metrics
 * @returns {Object} Object with metric ID as key and {merchant, competition} values
 */
export const transformDemographicsScalarMetrics = (apiResponse) => {
  console.log('🔄 Transforming demographics scalar metrics:', apiResponse);
  
  // Handle both full API response and Redux store format
  let metrics;
  if (apiResponse?.payload?.metrics) {
    metrics = apiResponse.payload.metrics;
  } else if (Array.isArray(apiResponse)) {
    metrics = apiResponse;
  } else {
    console.warn('⚠️ No metrics data in demographics scalar response', apiResponse);
    return {};
  }
  
  const result = {};
  
  // Group metrics by metricID
  const metricGroups = {};
  metrics.forEach(metric => {
    if (!metricGroups[metric.metricID]) {
      metricGroups[metric.metricID] = { merchant: 0, competition: null };
    }
    
    if (metric.merchantId === 'competition') {
      metricGroups[metric.metricID].competition = parseFloat(metric.scalarValue) || 0;
    } else {
      metricGroups[metric.metricID].merchant = parseFloat(metric.scalarValue) || 0;
    }
  });
  
  // Transform to standard format with value, change, valueType
  Object.keys(metricGroups).forEach(metricID => {
    const data = metricGroups[metricID];
    
    // Calculate percentage change (mock data for now - would come from API in production)
    const merchantChange = (Math.random() - 0.5) * 20; // -10% to +10%
    const competitionChange = (Math.random() - 0.5) * 20;
    
    result[metricID] = {
      merchant: {
        value: data.merchant || 0,
        change: merchantChange,
        valueType: 'number'
      },
      competition: data.competition !== null && data.competition !== undefined ? {
        value: data.competition || 0,
        change: competitionChange,
        valueType: 'number'
      } : null
    };
  });
  
  console.log('✅ Transformed demographics scalar metrics:', result);
  return result;
};

/**
 * Transform customer breakdown by age API response to UI format
 * @param {Object} apiResponse - API response with age breakdown
 * @returns {Array} Array of {category, merchant, competitor} objects
 */
export const transformDemographicsByAge = (apiResponse) => {
  console.log('🔄 Transforming demographics by age data:', apiResponse);
  
  // Handle both full API response and Redux store format
  let metrics;
  if (apiResponse?.payload?.metrics) {
    metrics = apiResponse.payload.metrics;
  } else if (Array.isArray(apiResponse)) {
    metrics = apiResponse;
  } else {
    console.warn('⚠️ No metrics data in demographics age response', apiResponse);
    return [];
  }
  
  // Find age breakdown metrics
  const ageMetrics = metrics.filter(m => m.metricID === 'converted_customers_by_age');
  
  const merchantData = ageMetrics.find(m => m.merchantId !== 'competition');
  const competitionData = ageMetrics.find(m => m.merchantId === 'competition');
  
  if (!merchantData?.seriesValues?.[0]?.seriesPoints) {
    console.warn('⚠️ No merchant series data in demographics age response');
    return [];
  }

  const merchantPoints = merchantData.seriesValues[0].seriesPoints;
  const competitionPoints = competitionData?.seriesValues?.[0]?.seriesPoints || [];
  
  // Create lookup for competition data
  const competitionLookup = {};
  competitionPoints.forEach(point => {
    competitionLookup[point.value2] = parseFloat(point.value1) || 0;
  });
  
  // Transform to UI format
  const transformedData = merchantPoints.map(point => {
    const ageCode = point.value2;
    const ageLabel = AGE_GROUP_LABELS[ageCode] || ageCode;
    const merchantValue = parseFloat(point.value1) || 0;
    const competitorValue = competitionLookup[ageCode] || 0;
    
    return {
      category: ageLabel,
      merchant: merchantValue,
      competitor: competitorValue
    };
  });
  
  console.log(`✅ Transformed ${transformedData.length} age groups`);
  return transformedData;
};

/**
 * Transform customer breakdown by gender API response to UI format
 * @param {Object} apiResponse - API response with gender breakdown
 * @returns {Array} Array of {category, merchant, competitor} objects
 */
export const transformDemographicsByGender = (apiResponse) => {
  console.log('🔄 Transforming demographics by gender data:', apiResponse);
  
  // Handle both full API response and Redux store format
  let metrics;
  if (apiResponse?.payload?.metrics) {
    metrics = apiResponse.payload.metrics;
  } else if (Array.isArray(apiResponse)) {
    metrics = apiResponse;
  } else {
    console.warn('⚠️ No metrics data in demographics gender response', apiResponse);
    return [];
  }
  
  // Find gender breakdown metrics
  const genderMetrics = metrics.filter(m => m.metricID === 'converted_customers_by_gender');
  
  const merchantData = genderMetrics.find(m => m.merchantId !== 'competition');
  const competitionData = genderMetrics.find(m => m.merchantId === 'competition');
  
  if (!merchantData?.seriesValues?.[0]?.seriesPoints) {
    console.warn('⚠️ No merchant series data in demographics gender response');
    return [];
  }

  const merchantPoints = merchantData.seriesValues[0].seriesPoints;
  const competitionPoints = competitionData?.seriesValues?.[0]?.seriesPoints || [];
  
  // Create lookup for competition data
  const competitionLookup = {};
  competitionPoints.forEach(point => {
    competitionLookup[point.value2] = parseFloat(point.value1) || 0;
  });
  
  // Transform to UI format
  const transformedData = merchantPoints.map(point => {
    const genderCode = point.value2;
    const genderLabel = GENDER_LABELS[genderCode] || genderCode;
    const merchantValue = parseFloat(point.value1) || 0;
    const competitorValue = competitionLookup[genderCode] || 0;
    
    return {
      category: genderLabel,
      merchant: merchantValue,
      competitor: competitorValue
    };
  });
  
  console.log(`✅ Transformed ${transformedData.length} gender categories`);
  return transformedData;
};

/**
 * Transform customer breakdown by interests API response to UI format
 * @param {Object} apiResponse - API response with interests breakdown
 * @returns {Array} Array of {category, merchant, competitor} objects
 */
export const transformDemographicsByInterests = (apiResponse) => {
  console.log('🔄 Transforming demographics by interests data:', apiResponse);
  
  // Handle both full API response and Redux store format
  let metrics;
  if (apiResponse?.payload?.metrics) {
    metrics = apiResponse.payload.metrics;
  } else if (Array.isArray(apiResponse)) {
    metrics = apiResponse;
  } else {
    console.warn('⚠️ No metrics data in demographics interests response', apiResponse);
    return [];
  }
  
  // Find interests breakdown metrics (note: looking for customers by interest, not revenue)
  const interestMetrics = metrics.filter(m => m.metricID === 'converted_customers_by_interest');
  
  const merchantData = interestMetrics.find(m => m.merchantId !== 'competition');
  const competitionData = interestMetrics.find(m => m.merchantId === 'competition');
  
  if (!merchantData?.seriesValues?.[0]?.seriesPoints) {
    console.warn('⚠️ No merchant series data in demographics interests response');
    return [];
  }

  const merchantPoints = merchantData.seriesValues[0].seriesPoints;
  const competitionPoints = competitionData?.seriesValues?.[0]?.seriesPoints || [];
  
  // Create lookup for competition data
  const competitionLookup = {};
  competitionPoints.forEach(point => {
    competitionLookup[point.value2] = parseFloat(point.value1) || 0;
  });
  
  // Transform to UI format
  const transformedData = merchantPoints.map(point => {
    const interestCode = point.value2;
    const interestLabel = SHOPPING_INTEREST_LABELS[interestCode] || interestCode;
    const merchantValue = parseFloat(point.value1) || 0;
    const competitorValue = competitionLookup[interestCode] || 0;
    
    return {
      category: interestLabel,
      merchant: merchantValue,
      competitor: competitorValue
    };
  });
  
  // Filter out zero values and sort by total value
  const filteredData = transformedData
    .filter(item => item.merchant > 0 || item.competitor > 0)
    .sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor));
  
  console.log(`✅ Transformed ${filteredData.length} interest categories`);
  return filteredData;
};

/**
 * Transform customer frequency breakdown API response to UI format
 * @param {Object} apiResponse - API response with frequency breakdown
 * @returns {Array} Array of {category, merchant, competitor} objects
 */
export const transformDemographicsByFrequency = (apiResponse) => {
  console.log('🔄 Transforming demographics by frequency data:', apiResponse);
  
  // Handle both full API response and Redux store format
  let metrics;
  if (apiResponse?.payload?.metrics) {
    metrics = apiResponse.payload.metrics;
  } else if (Array.isArray(apiResponse)) {
    metrics = apiResponse;
  } else {
    console.warn('⚠️ No metrics data in demographics frequency response', apiResponse);
    return [];
  }
  
  // Find frequency breakdown metrics
  const frequencyMetrics = metrics.filter(m => m.metricID === 'customers_by_frequency');
  
  const merchantData = frequencyMetrics.find(m => m.merchantId !== 'competition');
  const competitionData = frequencyMetrics.find(m => m.merchantId === 'competition');
  
  if (!merchantData?.seriesValues?.[0]?.seriesPoints) {
    console.warn('⚠️ No merchant series data in demographics frequency response');
    return [];
  }

  const merchantPoints = merchantData.seriesValues[0].seriesPoints;
  const competitionPoints = competitionData?.seriesValues?.[0]?.seriesPoints || [];
  
  // Create lookup for competition data
  const competitionLookup = {};
  competitionPoints.forEach(point => {
    competitionLookup[point.value2] = parseFloat(point.value1) || 0;
  });
  
  // Transform to UI format
  const transformedData = merchantPoints.map(point => {
    const frequencyCode = point.value2;
    const frequencyLabel = FREQUENCY_LABELS[frequencyCode] || frequencyCode;
    const merchantValue = parseFloat(point.value1) || 0;
    const competitorValue = competitionLookup[frequencyCode] || 0;
    
    return {
      category: frequencyLabel,
      merchant: merchantValue,
      competitor: competitorValue
    };
  });
  
  console.log(`✅ Transformed ${transformedData.length} frequency categories`);
  return transformedData;
};

/**
 * Main demographics transformation function
 * Routes different types of demographics data to appropriate transformers
 * @param {Object} apiResponse - API response
 * @param {String} dataType - Type of demographics data ('scalars', 'age', 'gender', 'interests', 'frequency')
 * @returns {Object} Transformed data
 */
export const transformDemographicsData = (apiResponse, dataType = 'scalars') => {
  console.log(`🔄 Transforming demographics data (type: ${dataType})`);
  
  try {
    switch (dataType) {
      case 'scalars':
        return transformDemographicsScalarMetrics(apiResponse);
      case 'age':
        return transformDemographicsByAge(apiResponse);
      case 'gender':
        return transformDemographicsByGender(apiResponse);
      case 'interests':
        return transformDemographicsByInterests(apiResponse);
      case 'frequency':
        return transformDemographicsByFrequency(apiResponse);
      default:
        // For regular metrics, just return the metrics array
        return apiResponse?.payload?.metrics || [];
    }
  } catch (error) {
    console.error(`❌ Demographics transformation failed for ${dataType}:`, error);
    return dataType === 'scalars' ? {} : [];
  }
};

/**
 * Validate demographics data structure
 * @param {Object} data - Transformed demographics data
 * @param {String} dataType - Type of data to validate
 * @returns {Boolean} Whether data is valid
 */
export const validateDemographicsData = (data, dataType = 'scalars') => {
  switch (dataType) {
    case 'scalars':
      return typeof data === 'object' && data !== null;
    case 'age':
    case 'gender':
    case 'interests':
    case 'frequency':
      return Array.isArray(data) && data.every(item => 
        typeof item.category === 'string' &&
        typeof item.merchant === 'number' &&
        typeof item.competitor === 'number'
      );
    default:
      return Array.isArray(data);
  }
};

export default {
  transformDemographicsData,
  transformDemographicsScalarMetrics,
  transformDemographicsByAge,
  transformDemographicsByGender,
  transformDemographicsByInterests,
  transformDemographicsByFrequency,
  validateDemographicsData
};