function generateMetricResponse(metricID, options = {}) {
  const { startDate, endDate, merchantId, filterValues = [] } = options;
  
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
          seriesID: 'interests',
          seriesPoints: generateDemographicPoints('interests', isCompetition)
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
      const genders = ['Male', 'Female', 'Other'];
      const totalCustomers = Math.floor((Math.random() * 20000 + 10000) * competitionMultiplier);
      let remaining = totalCustomers;
      
      genders.forEach((gender, index) => {
        let value;
        if (index === genders.length - 1) {
          value = remaining; // Last item gets remaining count
        } else {
          const percentage = gender === 'Male' ? 0.45 : gender === 'Female' ? 0.52 : 0.03;
          value = Math.floor(totalCustomers * percentage);
          remaining -= value;
        }
        
        points.push({
          value1: value.toString(),
          value2: gender
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