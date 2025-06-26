/**
 * Dashboard Data Transformation Functions
 * Transforms raw API responses into component-ready data structures
 */

export const transformDashboardData = (apiResponse) => {
  console.log('🔄 Transforming dashboard data:', apiResponse);
  
  if (!apiResponse?.payload?.metrics) {
    console.warn('⚠️ No metrics data in API response:', apiResponse);
    return {};
  }

  const metrics = apiResponse.payload.metrics;
  const transformedData = {};

  // Group metrics by metricID and merchantId
  const groupedMetrics = groupMetricsByType(metrics);

  // Transform each metric type
  Object.keys(groupedMetrics).forEach(metricID => {
    const metricData = groupedMetrics[metricID];
    
    switch (metricID) {
      case 'total_revenue':
        transformedData.totalRevenue = transformScalarMetric(metricData, 'currency');
        break;
        
      case 'total_transactions':
        transformedData.totalTransactions = transformScalarMetric(metricData, 'number');
        break;
        
      case 'avg_ticket_per_user':
        transformedData.avgTransaction = transformScalarMetric(metricData, 'currency');
        break;
        
      case 'revenue_per_day':
        transformedData.revenueTimeSeries = transformTimeSeriesMetric(metricData);
        break;
        
      case 'transactions_per_day':
        transformedData.transactionsTimeSeries = transformTimeSeriesMetric(metricData);
        break;
        
      case 'customers_per_day':
        transformedData.customersTimeSeries = transformTimeSeriesMetric(metricData);
        break;
        
      default:
        console.warn(`⚠️ Unknown metric type: ${metricID}`);
    }
  });

  console.log('✅ Dashboard data transformed:', transformedData);
  return transformedData;
};

// Helper function to group metrics by type and merchant
const groupMetricsByType = (metrics) => {
  const grouped = {};
  
  metrics.forEach(metric => {
    const { metricID } = metric;
    
    if (!grouped[metricID]) {
      grouped[metricID] = [];
    }
    
    grouped[metricID].push(metric);
  });
  
  return grouped;
};

// Transform scalar metrics (revenue, transactions, etc.)
const transformScalarMetric = (metricArray, valueType) => {
  const result = {
    merchant: null,
    competitor: null
  };

  metricArray.forEach(metric => {
    const value = parseFloat(metric.scalarValue);
    const merchantType = metric.merchantId;
    
    const metricData = {
      value: isNaN(value) ? 0 : value,
      change: null, // TODO: Calculate from period comparison
      valueType: valueType
    };

    if (merchantType === 'competition') {
      result.competitor = metricData;
    } else {
      // Default to merchant data (ATTICA, etc.)
      result.merchant = metricData;
    }
  });

  // Ensure we always have merchant data structure
  if (!result.merchant) {
    result.merchant = {
      value: 0,
      change: null,
      valueType: valueType
    };
  }

  return result;
};

// Transform time series metrics (daily data)
const transformTimeSeriesMetric = (metricArray) => {
  const result = {
    merchant: [],
    competitor: []
  };

  metricArray.forEach(metric => {
    const merchantType = metric.merchantId;
    const seriesData = extractTimeSeriesData(metric);
    
    if (merchantType === 'competition') {
      result.competitor = seriesData;
    } else {
      result.merchant = seriesData;
    }
  });

  return result;
};

// Extract time series data from API format
const extractTimeSeriesData = (metric) => {
  if (!metric.seriesValues || !metric.seriesValues[0]?.seriesPoints) {
    return [];
  }

  const seriesPoints = metric.seriesValues[0].seriesPoints;
  
  return seriesPoints.map(point => ({
    date: point.value2,
    value: parseFloat(point.value1) || 0,
    formattedDate: formatDateForChart(point.value2)
  }));
};

// Format date for chart display
const formatDateForChart = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
};

// Calculate period-over-period change (for future use)
export const calculatePeriodChange = (currentValue, previousValue) => {
  if (!previousValue || previousValue === 0) {
    return null;
  }
  
  const change = ((currentValue - previousValue) / previousValue) * 100;
  return Math.round(change * 10) / 10; // Round to 1 decimal place
};

// Validate dashboard data structure
export const validateDashboardData = (data) => {
  const requiredFields = ['totalRevenue', 'totalTransactions', 'avgTransaction'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    console.warn('⚠️ Missing dashboard data fields:', missingFields);
  }
  
  return missingFields.length === 0;
};