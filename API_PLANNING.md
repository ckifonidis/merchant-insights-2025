# API Behavior and Use Case Specification

## ✅ IMPLEMENTATION COMPLETED

The API integration and filter system has been successfully implemented with the following patterns:

### **✅ Implemented Patterns:**
- **Tab-Level Batch Requests**: One API call per tab with all required MetricIDs
- **Global Filter Management**: Redux-based filter state shared across all tabs
- **Service Layer Transformation**: Data transformed before storing in Redux
- **Smart Performance**: Only active tab refreshes when filters change
- **Filter Integration**: Complete UI→API filter mapping with persistence

## Implementation Results

## ✅ RESOLVED IMPLEMENTATION DECISIONS

### 1. **Single vs Batch Requests** ✅ IMPLEMENTED
**✅ Solution**: Tab-level batch requests - one API call per tab with all required MetricIDs
- **Benefits**: Reduced API calls, consistent loading states, easier filter application
- **Implementation**: `useTabData` hook batches metrics by tab
- **Result**: Dashboard makes 1 call, Revenue makes 1 call, etc.

### 2. **Competition Data Handling** ✅ IMPLEMENTED
**✅ Solution**: Both merchant and competition data returned in same API response
- **Pattern**: API returns both datasets with `merchantId` field differentiating
- **Filter Application**: Same filters applied to both merchant and competition data
- **Result**: Consistent comparison data across all metrics

### 3. **Date Range and Filtering** ✅ IMPLEMENTED
**✅ Solution**: Global filter management through Redux with smart refresh
- **Date Range**: Controlled globally through Redux filter state
- **Filter Values**: UI filters converted to API format automatically
- **Shared State**: All tabs use same date range and filters
- **Performance**: Only active tab refreshes when filters change

### 4. **Data Transformation Responsibility** ✅ IMPLEMENTED
**✅ Solution**: Service layer transformation before Redux storage
- **Location**: `src/services/transformations/` directory
- **Benefits**: Transform once, use everywhere; consistent data format
- **Pattern**: Raw API → Service Transform → Redux Store → Component Props
- **Result**: Components receive clean, typed data structures

### 5. **Error Handling and Loading States** ✅ IMPLEMENTED
**✅ Solution**: Tab-level loading states with partial failure support
- **Loading**: Each tab manages its own loading state independently
- **Errors**: Graceful handling with error boundaries and fallback UI
- **Partial Failures**: Individual metrics can fail without breaking entire tab
- **Fallback**: Mock server ensures development continues without real API

## Proposed API Behavior Patterns

Please review and provide feedback on these proposed patterns:

### Pattern A: Component-Specific Requests
```javascript
// Each component makes its own API call
const { metrics, loading, error } = useDashboardMetrics(filters);
const { timeSeriesData, loading: tsLoading } = useTimeSeriesData('revenue', filters);
```

**Pros**: Simple, component isolation, specific error handling
**Cons**: Multiple API calls, potential for duplicate requests

### Pattern B: Page-Level Data Fetching
```javascript
// Parent component fetches all data for a page
const { dashboardData, loading, error } = usePageData('dashboard', filters);

// Children receive processed data as props
<MetricCard data={dashboardData.totalRevenue} />
<TimeSeriesChart data={dashboardData.revenueTimeSeries} />
```

**Pros**: Single API call, centralized loading states, better performance
**Cons**: Tight coupling, harder to reuse components

### Pattern C: Global Data Store
```javascript
// Global store manages all metrics
const dispatch = useAnalyticsDispatch();
const metrics = useAnalyticsSelector(state => state.dashboard);

useEffect(() => {
  dispatch(fetchDashboardMetrics(filters));
}, [filters]);
```

**Pros**: Centralized state, caching, global loading states
**Cons**: More complex, overkill for current needs

## Specific Use Cases to Define

### 1. Dashboard Tab Requirements
- **Total Revenue**: Scalar value + period change
- **Total Transactions**: Scalar value + period change  
- **Average Transaction**: Scalar value + period change
- **Revenue Time Series**: Daily data for charts
- **Transactions Time Series**: Daily data for charts
- **Customers Time Series**: Daily data for charts (no competition)

**Questions**:
- Should all 6 metrics be fetched in one request?
- How do we calculate period changes?
- Should competition data be fetched automatically?

### 2. Competition Comparison
**Current Example**: Revenue data with both merchant and competition values
**Questions**:
- Is this triggered by a filter (`data_origin: competition_comparison`)?
- Do we always show comparison when available?
- How do we handle metrics without competition data?

### 3. Date Range Management
**Current Pattern**: Each request includes startDate/endDate
**Questions**:
- Should date range be set globally or per component?
- How do we handle different granularities (daily, weekly, monthly)?
- Should we validate date ranges before making requests?

### 4. Filter Application
**Current Pattern**: `filterValues` array in request
**Questions**:
- Which filters apply to which metrics?
- How do we build filter combinations?
- Should filters be component-specific or global?

## Request Format Questions

### Current Request Structure:
```json
{
  "header": {
    "ID": "unique-request-id",
    "application": "application-id"
  },
  "payload": {
    "userID": "BANK\\username",
    "startDate": "2025-01-01",
    "endDate": "2025-01-15", 
    "providerId": "provider-uuid",
    "metricIDs": ["metric1", "metric2"],
    "filterValues": [],
    "merchantId": "merchant-uuid"
  }
}
```

**Questions**:
- Are header.ID and header.application required?
- Should userID come from authentication context?
- Is providerId always the same or does it vary by metric?
- How do we handle merchantId for competition requests?

## Response Format Questions

### Current Response Structure:
```json
{
  "payload": {
    "metrics": [
      {
        "metricID": "metric_name",
        "percentageValue": false,
        "scalarValue": "123.45" | null,
        "seriesValues": [...] | null,
        "merchantId": "merchant_name" | "competition"
      }
    ]
  },
  "exception": null,
  "messages": null,
  "executionTime": 1234.5
}
```

**Questions**:
- Why are scalar values strings instead of numbers?
- How do we distinguish between merchant and competition data?
- Should we expect multiple metric objects for comparison data?
- How do we handle missing or failed metrics?

## Recommended Discussion Points

1. **API Call Strategy**: Single page-level calls vs component-level calls
2. **Competition Data**: Automatic vs on-demand fetching
3. **Date Ranges**: Global vs component-specific management
4. **Data Transformation**: Where and how to transform API responses
5. **Error Handling**: Graceful degradation vs hard failures
6. **Loading States**: Component vs page-level loading indicators
7. **Caching Strategy**: Should we cache responses and for how long?

## Next Steps

1. **Review this document** and provide feedback on the questions
2. **Choose preferred patterns** for each use case
3. **Define specific API contracts** for each component
4. **Update implementation** based on agreed patterns
5. **Update documentation** to reflect final decisions

Please provide your thoughts on these patterns and questions so we can establish the definitive API behavior specification.