// Parse filter values helper function
function parseFilterValues(filterValues = []) {
  const parsed = {};
  filterValues.forEach(filter => {
    switch (filter.filterId) {
      case 'interest_type':
        parsed.interestType = filter.value; // 'revenue' or 'customers'
        break;
      case 'data_origin':
        parsed.dataOrigin = filter.value;
        break;
    }
  });
  return parsed;
}

function generateMetricResponse(metricID, options = {}) {
  const { startDate, endDate, merchantId, filterValues = [] } = options;
  
  // Parse filter values for special filters
  const parsedFilters = parseFilterValues(filterValues);
  
  // Check if this is for competition data
  const isCompetition = hasCompetitionFilter(filterValues) || merchantId === 'competition';
  
  // Base metric structure
  const baseMetric = {
    metricID,
    percentageValue: false,
    scalarValue: null,
    seriesValues: null,
    merchantId: isCompetition ? 'competition' : 'ATTICA'
  };

  // Generate data based on metric type
  switch (metricID) {
    case 'total_revenue':
      return {
        ...baseMetric,
        scalarValue: generateScalarValue('revenue', isCompetition)
      };
      
    case 'total_transactions':
      return {
        ...baseMetric,
        scalarValue: generateScalarValue('transactions', isCompetition)
      };
      
    case 'avg_ticket_per_user':
      return {
        ...baseMetric,
        scalarValue: generateScalarValue('avgTicket', isCompetition)
      };
      
    case 'rewarded_amount':
      return {
        ...baseMetric,
        scalarValue: generateScalarValue('rewardedAmount', isCompetition)
      };
      
    case 'redeemed_amount':
      return {
        ...baseMetric,
        scalarValue: generateScalarValue('redeemedAmount', isCompetition)
      };
      
    case 'rewarded_points':
      return {
        ...baseMetric,
        scalarValue: generateScalarValue('rewardedPoints', isCompetition)
      };
      
    case 'redeemed_points':
      return {
        ...baseMetric,
        scalarValue: generateScalarValue('redeemedPoints', isCompetition)
      };
      
    case 'revenue_per_day':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'revenue',
          seriesPoints: generateDailyPoints(startDate, endDate, 'revenue', isCompetition)
        }]
      };
      
    case 'transactions_per_day':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'transactions',
          seriesPoints: generateDailyPoints(startDate, endDate, 'transactions', isCompetition)
        }]
      };
      
    case 'customers_per_day':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'customers',
          seriesPoints: generateDailyPoints(startDate, endDate, 'customers', isCompetition)
        }]
      };
      
    case 'converted_customers_by_age':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'age_groups',
          seriesPoints: generateDemographicPoints('age', isCompetition)
        }]
      };
      
    case 'converted_customers_by_gender':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'gender',
          seriesPoints: generateDemographicPoints('gender', isCompetition)
        }]
      };
      
    case 'converted_customers_by_interest':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'customers', // API returns 'customers' seriesID even for revenue
          seriesPoints: generateShoppingInterestPoints(parsedFilters.interestType, isCompetition)
        }]
      };
      
    case 'revenue_by_channel':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'revenue',
          seriesPoints: generateChannelPoints(isCompetition)
        }]
      };
      
    default:
      console.warn(`Unknown metricID: ${metricID}, generating default scalar value`);
      return {
        ...baseMetric,
        scalarValue: (Math.random() * 1000).toFixed(2)
      };
  }
}

function generateShoppingInterestPoints(interestType = 'customers', isCompetition = false) {
  const points = [];
  const competitionMultiplier = isCompetition ? 1.2 : 1.0; // Competition typically has higher values
  
  // Shopping interests based on the API sample data
  const interests = [
    { code: '', label: 'Unspecified' },
    { code: 'other_category', label: 'Other Category' },
    { code: 'SHOPINT1', label: 'Automotive & Fuel Products' },
    { code: 'SHOPINT2', label: 'Electronics & Household Appliances' },
    { code: 'SHOPINT3', label: 'Telecommunication' },
    { code: 'SHOPINT4', label: 'Health & Medical Care' },
    { code: 'SHOPINT5', label: 'Entertainment & Hobbies' },
    { code: 'SHOPINT6', label: 'Education' },
    { code: 'SHOPINT7', label: 'Toys' },
    { code: 'SHOPINT8', label: 'Travel & Transportation' },
    { code: 'SHOPINT9', label: 'Personal Care' },
    { code: 'SHOPINT10', label: 'Pets' },
    { code: 'SHOPINT11', label: 'Fashion, Cosmetics & Jewelry' },
    { code: 'SHOPINT12', label: 'Tourism' },
    { code: 'SHOPINT13', label: 'Home & Garden' },
    { code: 'SHOPINT14', label: 'Restaurants, Bars, Fast Food & Coffee' },
    { code: 'SHOPINT15', label: 'Food & Drinks' }
  ];
  
  interests.forEach(interest => {
    let value;
    
    if (interestType === 'revenue') {
      // Generate revenue values (in euros)
      if (interest.code === '') {
        value = (Math.random() * 100000 + 50000 * competitionMultiplier).toFixed(2);
      } else if (interest.code === 'other_category') {
        value = isCompetition ? (Math.random() * 30000 + 10000).toFixed(3) : '0';
      } else {
        // Major interests get higher values
        const baseRevenue = ['SHOPINT1', 'SHOPINT12', 'SHOPINT13'].includes(interest.code) 
          ? Math.random() * 800000 + 400000 
          : Math.random() * 300000 + 100000;
        value = (baseRevenue * competitionMultiplier).toFixed(interest.code.includes('SHOPINT') ? Math.random() > 0.5 ? 2 : 3 : 2);
      }
    } else {
      // Generate customer counts
      if (interest.code === '') {
        value = Math.floor((Math.random() * 3000 + 1000) * competitionMultiplier).toString();
      } else if (interest.code === 'other_category') {
        value = isCompetition ? Math.floor(Math.random() * 6000 + 2000).toString() : '0';
      } else {
        // Major interests get higher customer counts
        const baseCustomers = ['SHOPINT1', 'SHOPINT12', 'SHOPINT13'].includes(interest.code) 
          ? Math.random() * 25000 + 15000 
          : Math.random() * 8000 + 2000;
        value = Math.floor(baseCustomers * competitionMultiplier).toString();
      }
    }
    
    points.push({
      value1: value,
      value2: interest.code
    });
  });
  
  return points;
}

function generateChannelPoints(isCompetition = false) {
  const points = [];
  const competitionMultiplier = isCompetition ? 1.2 : 1.0; // Competition typically has higher values
  
  // Based on the API sample, channels are 'physical' and 'ecommerce'
  const channels = [
    { code: 'physical', baseRevenue: Math.random() * 500000 + 200000 },
    { code: 'ecommerce', baseRevenue: Math.random() * 800000 + 300000 }
  ];
  
  channels.forEach(channel => {
    const revenue = (channel.baseRevenue * competitionMultiplier).toFixed(2);
    points.push({
      value1: revenue,
      value2: channel.code
    });
  });
  
  return points;
}

function generateScalarValue(type, isCompetition = false) {
  const competitionMultiplier = isCompetition ? 0.8 : 1.0; // Competition typically has 80% of merchant values
  
  switch (type) {
    case 'revenue':
      return (Math.random() * 1500000 + 1000000 * competitionMultiplier).toFixed(2);
    case 'transactions':
      return Math.floor((Math.random() * 40000 + 25000) * competitionMultiplier).toString();
    case 'avgTicket':
      return (Math.random() * 80 + 40 * competitionMultiplier).toFixed(2);
    case 'rewardedAmount':
      return (Math.random() * 500000 + 200000 * competitionMultiplier).toFixed(2);
    case 'redeemedAmount':
      return (Math.random() * 300000 + 150000 * competitionMultiplier).toFixed(2);
    case 'rewardedPoints':
      return Math.floor((Math.random() * 100000 + 50000) * competitionMultiplier).toString();
    case 'redeemedPoints':
      return Math.floor((Math.random() * 80000 + 40000) * competitionMultiplier).toString();
    default:
      return (Math.random() * 1000 * competitionMultiplier).toFixed(2);
  }
}

function generateDailyPoints(startDate, endDate, type, isCompetition = false) {
  const points = [];
  const start = new Date(startDate || '2025-01-01');
  const end = new Date(endDate || '2025-01-31');
  
  const competitionMultiplier = isCompetition ? 0.75 : 1.0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    let baseValue;
    
    // Add weekly patterns (weekends typically lower)
    const dayOfWeek = d.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
    
    switch (type) {
      case 'revenue':
        baseValue = (Math.random() * 100000 + 50000) * competitionMultiplier * weekendMultiplier;
        break;
      case 'transactions':
        baseValue = Math.floor((Math.random() * 800 + 200) * competitionMultiplier * weekendMultiplier);
        break;
      case 'customers':
        baseValue = Math.floor((Math.random() * 400 + 100) * competitionMultiplier * weekendMultiplier);
        break;
      default:
        baseValue = Math.random() * 1000 * competitionMultiplier;
    }
    
    points.push({
      value1: type === 'transactions' || type === 'customers' ? baseValue.toString() : baseValue.toFixed(2),
      value2: dateStr
    });
  }
  
  return points;
}

function generateDemographicPoints(category, isCompetition = false) {
  const points = [];
  const competitionMultiplier = isCompetition ? 0.8 : 1.0;
  
  switch (category) {
    case 'age':
      const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
      ageGroups.forEach(group => {
        points.push({
          value1: Math.floor((Math.random() * 5000 + 1000) * competitionMultiplier).toString(),
          value2: group
        });
      });
      break;
      
    case 'gender':
      const genders = [
        { code: 'm', label: 'Male', percentage: 0.45 },
        { code: 'f', label: 'Female', percentage: 0.52 },
        { code: 'other', label: 'Other', percentage: 0.03 }
      ];
      const totalCustomers = Math.floor((Math.random() * 20000 + 10000) * competitionMultiplier);
      let remaining = totalCustomers;
      
      genders.forEach((gender, index) => {
        let value;
        if (index === genders.length - 1) {
          value = remaining; // Last item gets remaining count
        } else {
          value = Math.floor(totalCustomers * gender.percentage);
          remaining -= value;
        }
        
        points.push({
          value1: value.toString(),
          value2: gender.code // Use 'm', 'f', 'other' to match API format
        });
      });
      break;
      
    case 'interests':
      const interests = ['Fashion', 'Electronics', 'Home & Garden', 'Sports', 'Books', 'Food & Beverage', 'Travel', 'Health & Beauty'];
      interests.forEach(interest => {
        points.push({
          value1: Math.floor((Math.random() * 3000 + 500) * competitionMultiplier).toString(),
          value2: interest
        });
      });
      break;
      
    default:
      // Generic categorical data
      for (let i = 1; i <= 5; i++) {
        points.push({
          value1: Math.floor((Math.random() * 2000 + 500) * competitionMultiplier).toString(),
          value2: `Category ${i}`
        });
      }
  }
  
  return points;
}

function hasCompetitionFilter(filterValues) {
  return filterValues.some(filter => 
    filter.filterId === 'data_origin' && filter.value === 'competition_comparison'
  );
}

function generateResponseWithBothMerchantAndCompetition(metricID, options) {
  // Generate merchant data
  const merchantData = generateMetricResponse(metricID, {
    ...options,
    merchantId: 'merchant'
  });
  
  // Generate competition data
  const competitionData = generateMetricResponse(metricID, {
    ...options,
    merchantId: 'competition'
  });
  
  return [merchantData, competitionData];
}

module.exports = {
  generateMetricResponse,
  generateDailyPoints,
  generateDemographicPoints,
  generateResponseWithBothMerchantAndCompetition,
  hasCompetitionFilter
};