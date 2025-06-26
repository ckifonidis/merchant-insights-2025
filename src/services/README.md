# Analytics Service Usage Guide

This service provides an abstraction layer for the merchant analytics API. It can work in mock mode for development or real API mode for production.

## Quick Start

```javascript
import { analyticsService, buildAnalyticsRequest, buildFilterValue, METRIC_IDS, FILTER_IDS, FILTER_VALUES } from '../services';

// Example: Fetch analytics data for the last 30 days
const useAnalyticsData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const request = buildAnalyticsRequest({
          userID: 'BANK\\E82629',
          startDate: '2025-05-06',
          endDate: '2025-06-05',
          merchantId: '4065a7c9-f189-4834-af6b-dfa272affed3',
          metricIDs: [
            METRIC_IDS.TOTAL_TRANSACTIONS,
            METRIC_IDS.REVENUE_PER_DAY,
            METRIC_IDS.CONVERTED_CUSTOMERS_BY_AGE
          ],
          filterValues: [
            buildFilterValue(FILTER_IDS.DATA_ORIGIN, FILTER_VALUES.DATA_ORIGIN.OWN_DATA),
            buildFilterValue(FILTER_IDS.INTEREST_TYPE, FILTER_VALUES.INTEREST_TYPE.CUSTOMERS)
          ]
        });
        
        const response = await analyticsService.queryAnalytics(request);
        setData(response.payload.metrics);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { data, loading };
};
```

## Available Metrics

### Scalar Metrics (Single Values)
- `METRIC_IDS.REWARDED_POINTS` - Total loyalty points rewarded
- `METRIC_IDS.REWARDED_AMOUNT` - Total amount rewarded (€)
- `METRIC_IDS.REDEEMED_POINTS` - Total loyalty points redeemed
- `METRIC_IDS.REDEEMED_AMOUNT` - Total amount redeemed (€)
- `METRIC_IDS.TOTAL_TRANSACTIONS` - Total number of transactions
- `METRIC_IDS.AVG_TICKET_PER_USER` - Average transaction amount per user

### Series Metrics (Chart Data)
- `METRIC_IDS.CONVERTED_CUSTOMERS_BY_ACTIVITY` - Customer breakdown by activity level
- `METRIC_IDS.CONVERTED_CUSTOMERS_BY_AGE` - Customer breakdown by age groups
- `METRIC_IDS.CONVERTED_CUSTOMERS_BY_GENDER` - Customer breakdown by gender
- `METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST` - Customer breakdown by shopping interests
- `METRIC_IDS.REVENUE_PER_DAY` - Daily revenue time series
- `METRIC_IDS.TRANSACTIONS_PER_DAY` - Daily transactions time series
- `METRIC_IDS.CUSTOMERS_PER_DAY` - Daily customers time series
- `METRIC_IDS.TRANSACTIONS_BY_GEO` - Geographic distribution of transactions

## Filtering Data

```javascript
const filterValues = [
  // Show only customer data (not revenue)
  buildFilterValue(FILTER_IDS.INTEREST_TYPE, FILTER_VALUES.INTEREST_TYPE.CUSTOMERS),
  
  // Focus on merchant's own data
  buildFilterValue(FILTER_IDS.DATA_ORIGIN, FILTER_VALUES.DATA_ORIGIN.OWN_DATA),
  
  // Filter by customer region
  buildFilterValue(FILTER_IDS.CUSTOMER_REGION_TYPE, FILTER_VALUES.CUSTOMER_REGION_TYPE.HOME_ADDRESS),
  
  // Show transaction counts (not amounts)
  buildFilterValue(FILTER_IDS.TRANSACTIONS_TYPE, FILTER_VALUES.TRANSACTIONS_TYPE.COUNT)
];
```

## Response Format

### Scalar Metric Response
```javascript
{
  metricID: "total_transactions",
  percentageValue: false,
  scalarValue: "2077.0",
  seriesValues: null,
  merchantId: "ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ"
}
```

### Series Metric Response
```javascript
{
  metricID: "revenue_per_day",
  percentageValue: false,
  scalarValue: null,
  seriesValues: [{
    seriesID: "revenue",
    seriesPoints: [
      { value1: "6841.43", value2: "2025-05-06" },
      { value1: "6276.11", value2: "2025-05-07" }
      // ... more data points
    ]
  }],
  merchantId: "ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ"
}
```

## Merchant vs Competition Data

The API returns data for both the merchant and competition. Each metric appears twice in the response:
- `merchantId: "ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ"` - Merchant's own data
- `merchantId: "competition"` - Competition comparison data

## Processing Response Data

```javascript
const processMetrics = (metrics) => {
  const merchantData = {};
  const competitionData = {};
  
  metrics.forEach(metric => {
    const target = metric.merchantId === 'competition' ? competitionData : merchantData;
    target[metric.metricID] = metric;
  });
  
  return { merchantData, competitionData };
};
```

## Switching to Real API

To switch from mock to real API mode:

1. Set environment variable: `VITE_API_BASE_URL=https://your-api-domain.com`
2. Update the service configuration:
   ```javascript
   // In analyticsService.js
   const API_CONFIG = {
     USE_REAL_API: true, // Change this to true
     BASE_URL: process.env.VITE_API_BASE_URL,
     TIMEOUT: 30000
   };
   ```

The interface remains exactly the same - no code changes needed in components!

## Error Handling

```javascript
try {
  const response = await analyticsService.queryAnalytics(request);
  // Handle success
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request timed out');
  } else if (error.message.includes('API error')) {
    console.log('Server error:', error.message);
  } else {
    console.log('Network error:', error.message);
  }
}
```