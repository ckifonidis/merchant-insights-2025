# Metric Component Mapping Instructions

## Overview
This document provides comprehensive mapping instructions for connecting UI components with analytics API data. All components are populated by the endpoint `{{ProxyUrl}}/analytics/query` using specific MetricIDs and FilterValues parameters.

## API Structure
- **Endpoint**: `{{ProxyUrl}}/analytics/query`
- **Key Parameters**: 
  - `metricIDs`: Array of metric identifiers
  - `filterValues`: Array of filter criteria
  - `startDate/endDate`: Date range for data
  - `merchantId`: Target merchant identifier

## Component Categories

### 1. Time Series Chart Components

#### TimeSeriesChart
- **File**: `src/components/ui/charts/TimeSeriesChart.jsx:18-254`
- **MetricID Mappings**:
  - Revenue data: `revenue_per_day`
  - Transaction data: `transactions_per_day`
  - Customer data: `customers_per_day`
- **Data Structure Expected**:
  ```json
  {
    "seriesValues": [{
      "seriesID": "revenue|transactions|customers",
      "seriesPoints": [
        {"value1": "amount", "value2": "date"}
      ]
    }]
  }
  ```
- **Component Props**:
  - `filters`: Date range
  - `dataType`: 'revenue'|'transactions'|'customers'
  - `showComparison`: Boolean for merchant vs competitor

#### UniversalTimelineChart
- **File**: `src/components/ui/charts/UniversalTimelineChart.jsx:5-126`
- **MetricID Mappings**:
  - Weekly trends: Derived from `revenue_per_day` (calculated week-over-week)
- **Data Structure Expected**:
  ```json
  {
    "merchant": [{"week": "W1", "percentageChange": 5.2}],
    "competition": [{"week": "W1", "percentageChange": 2.1}]
  }
  ```

#### UniversalCalendarHeatmap
- **File**: `src/components/ui/charts/UniversalCalendarHeatmap.jsx:4-183`
- **MetricID Mappings**:
  - Daily revenue: `revenue_per_day`
  - Daily transactions: `transactions_per_day`
- **Data Structure Expected**:
  ```json
  {
    "2025-01-01": {"merchant": 3568.52, "competition": 708.903},
    "2025-01-02": {"merchant": 3497.07, "competition": 1404.009}
  }
  ```

### 2. Categorical Chart Components

#### UniversalBarChart
- **File**: `src/components/ui/charts/UniversalBarChart.jsx:6-179`
- **MetricID Mappings**:
  - Age groups: `converted_customers_by_age`
  - Gender data: `converted_customers_by_gender`
- **Data Structure Expected**:
  ```json
  [
    {"category": "18-24", "merchant": 25.5, "competitor": 22.1},
    {"category": "25-34", "merchant": 35.2, "competitor": 28.7}
  ]
  ```

#### UniversalBreakdownChart
- **File**: `src/components/ui/charts/UniversalBreakdownChart.jsx:7-365`
- **MetricID Mappings**:
  - Shopping interests: `converted_customers_by_interest`
  - Channel breakdown: Custom channel analysis
  - Gender breakdown: `converted_customers_by_gender`
- **Data Structure Expected**:
  ```json
  [
    {"category": "Fashion", "merchant": 1250, "competitor": 980},
    {"category": "Electronics", "merchant": 2100, "competitor": 1850}
  ]
  ```

#### UniversalHorizontalBarChart
- **File**: `src/components/ui/charts/UniversalHorizontalBarChart.jsx:5-173`
- **MetricID Mappings**:
  - Age demographics: `converted_customers_by_age`
  - Shopping interests: `converted_customers_by_interest`
- **Data Structure Expected**:
  ```json
  [
    {"category": "Tech", "merchant": 45.2, "competitor": 38.7},
    {"category": "Fashion", "merchant": 32.1, "competitor": 29.4}
  ]
  ```

### 3. Metric Display Components

#### UniversalMetricCard
- **File**: `src/components/ui/metrics/UniversalMetricCard.jsx:11-329`
- **MetricID Mappings**:
  - Revenue metrics: `rewarded_amount`, `redeemed_amount`
  - Transaction metrics: `total_transactions`, `avg_ticket_per_user`
  - Loyalty metrics: `rewarded_points`, `redeemed_points`
- **Data Structure Expected**:
  ```json
  {
    "merchantData": {
      "value": 125000,
      "change": 5.2,
      "valueType": "currency"
    },
    "competitorData": {
      "value": 98000,
      "change": 2.1,
      "valueType": "currency"
    }
  }
  ```

### 4. Dashboard Integration Components

#### Dashboard
- **File**: `src/components/dashboard/Dashboard.jsx:7-85`
- **Required MetricIDs**:
  - Overview metrics from all categories
  - Time series for revenue, transactions, customers
- **Integration Points**:
  - Lines 34-51: UniversalMetricCard instances
  - Lines 57-77: TimeSeriesChart instances

#### Revenue Component
- **File**: `src/components/revenue/Revenue.jsx:8-197`
- **Required MetricIDs**:
  - `rewarded_amount`, `redeemed_amount`
  - `revenue_per_day`
  - Interest/channel breakdown metrics
- **Integration Points**:
  - Lines 49-65: Revenue metric cards
  - Lines 107-121: Revenue time series
  - Lines 130-156, 163-187: Breakdown charts

#### Demographics Component
- **File**: `src/components/demographics/Demographics.jsx:8-181`
- **Required MetricIDs**:
  - `converted_customers_by_age`
  - `converted_customers_by_gender`
  - `converted_customers_by_interest`
- **Integration Points**:
  - Lines 39-49: Customer metric cards
  - Lines 67-88: Gender breakdown chart
  - Lines 95-106, 133-171: Age/interest charts

#### Competition Component
- **File**: `src/components/competition/Competition.jsx:7-121`
- **Required MetricIDs**:
  - All merchant metrics with competitor comparison
  - `revenue_per_day` for trends and heatmap
- **Integration Points**:
  - Lines 46-85: Competition metric cards
  - Lines 95-100: Timeline chart
  - Lines 107-112: Calendar heatmap

## Implementation Workflow

### Step 1: Identify Component Data Requirements
1. Determine which MetricIDs the component needs
2. Check if component requires merchant vs competitor comparison
3. Identify the data transformation needed from API response to component props

### Step 2: API Request Configuration
```json
{
  "metricIDs": ["specific_metric_id"],
  "filterValues": [],
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "merchantId": "merchant_uuid"
}
```

### Step 3: Data Transformation
1. Extract relevant metric from API response by matching `metricID`
2. Transform `seriesValues` or `scalarValue` to component-expected format
3. Handle merchant vs competitor data separation when needed
4. Apply value formatting (currency, percentage, number)

### Step 4: Component Integration
1. Pass transformed data as props to component
2. Ensure date ranges match between API request and component filters
3. Handle loading and error states appropriately

## Data Format Conversion Examples

### From API Response to TimeSeriesChart
```javascript
// API Response
{
  "metricID": "revenue_per_day",
  "seriesValues": [{
    "seriesID": "revenue",
    "seriesPoints": [
      {"value1": "3568.52", "value2": "2025-01-01"}
    ]
  }]
}

// Component Format
{
  dataType: "revenue",
  data: [
    {date: "2025-01-01", merchant: 3568.52, competitor: 708.903}
  ]
}
```

### From API Response to UniversalMetricCard
```javascript
// API Response (scalar metric)
{
  "metricID": "total_transactions",
  "scalarValue": 1250
}

// Component Format
{
  merchantData: {
    value: 1250,
    change: 5.2, // Calculated from previous period
    valueType: "number"
  }
}
```

## Dashboard Tab Specific Implementation

### Dashboard Metrics Integration
**File**: `src/components/dashboard/Dashboard.jsx:34-51`

#### Metric Card Mappings:

##### 1. Total Revenue
- **Static ID**: `totalRevenue` (tabConfigs.json:7)
- **API MetricID**: `METRIC_IDS.TOTAL_REVENUE`
- **Request Configuration**:
```json
{
  "metricIDs": ["total_revenue"],
  "filterValues": []
}
```
- **Data Transformation**:
```javascript
const merchantData = {
  value: totalRevenue.scalarValue,
  change: calculatePeriodChange(current, previous),
  valueType: "currency"
};
```

##### 2. Total Transactions
- **Static ID**: `totalTransactions` (tabConfigs.json:25)
- **API MetricID**: `METRIC_IDS.TOTAL_TRANSACTIONS`
- **Request Configuration**:
```json
{
  "metricIDs": ["total_transactions"],
  "filterValues": []
}
```
- **Data Transformation**:
```javascript
const merchantData = {
  value: totalTransactions.scalarValue,
  change: calculatePeriodChange(current, previous),
  valueType: "number"
};
```

##### 3. Average Transaction
- **Static ID**: `avgTransaction` (tabConfigs.json:42)
- **API MetricID**: `METRIC_IDS.AVG_TICKET_PER_USER`
- **Request Configuration**:
```json
{
  "metricIDs": ["avg_ticket_per_user"],
  "filterValues": []
}
```
- **Data Transformation**:
```javascript
const merchantData = {
  value: avgTicket.scalarValue,
  change: calculatePeriodChange(current, previous),
  valueType: "currency"
};
```

### Dashboard Charts Integration
**File**: `src/components/dashboard/Dashboard.jsx:57-77`

#### Chart Component Mappings:

##### 1. Revenue Time Series Chart (Lines 57-62)
- **Component**: `TimeSeriesChart`
- **API MetricID**: `METRIC_IDS.REVENUE_PER_DAY`
- **Props Configuration**:
```javascript
<TimeSeriesChart
  filters={filters}
  dataType="revenue"
  title={t('dashboard.revenue')}
  showComparison={true}
/>
```
- **API Request**:
```json
{
  "metricIDs": ["revenue_per_day"],
  "filterValues": [
    {
      "providerId": "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
      "filterId": "data_origin", 
      "value": "competition_comparison"
    }
  ]
}
```

##### 2. Transactions Time Series Chart (Lines 64-69)
- **Component**: `TimeSeriesChart`
- **API MetricID**: `METRIC_IDS.TRANSACTIONS_PER_DAY`
- **Props Configuration**:
```javascript
<TimeSeriesChart
  filters={filters}
  dataType="transactions"
  title={t('dashboard.transactions')}
  showComparison={true}
/>
```

##### 3. Customers Time Series Chart (Lines 71-76)
- **Component**: `TimeSeriesChart`
- **API MetricID**: `METRIC_IDS.CUSTOMERS_PER_DAY`
- **Props Configuration**:
```javascript
<TimeSeriesChart
  filters={filters}
  dataType="customers"
  title={t('dashboard.customers')}
  showComparison={false}  // Note: No competitor data
/>
```

### Implementation Steps for Dashboard

1. **Replace Static Data Source**:
   - Remove dependency on `tabConfigs.json` for dashboard metrics
   - Implement API calls for each metric in Dashboard component

2. **Create Dashboard Data Hook**:
```javascript
// useDashboardData.js
const useDashboardData = (filters) => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      const requests = [
        fetchMetric(['total_revenue']),
        fetchMetric(['total_transactions']),
        fetchMetric(['avg_ticket_per_user'])
      ];
      
      const results = await Promise.all(requests);
      setMetrics(transformDashboardMetrics(results));
      setLoading(false);
    };
    
    fetchDashboardMetrics();
  }, [filters]);
  
  return { metrics, loading };
};
```

3. **Update Dashboard Component**:
```javascript
// Dashboard.jsx lines 20-52
const Dashboard = ({ filters }) => {
  const { metrics, loading } = useDashboardData(filters);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Use metrics from API instead of tabConfigs */}
      <UniversalMetricCard
        variant={METRIC_VARIANTS.detailed}
        title={t('dashboard.totalRevenue')}
        merchantData={metrics.totalRevenue.merchant}
        competitorData={metrics.totalRevenue.competitor}
      />
      {/* ... other metrics */}
    </div>
  );
};
```

## Notes
- All components support real-time data updates when API parameters change
- Date ranges should be validated before API requests
- Error handling should be implemented for missing or invalid MetricIDs
- Consider caching strategies for frequently requested metrics
- Maintain consistency in value formatting across all components