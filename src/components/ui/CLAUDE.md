# CLAUDE.md - Components Guide
 
## Universal Breakdown
Two categories, values for merchant and competition (if included)
One button on the top right if multi view enabled (pie, stacked bar, table) - configurable per metric shown
Show percentage per category or also absolute values (for merchant and competition)- configurable per metric shown for absolute values for competition
Absolute values -> direct API data
Percentages -> for merchant and for competition

## Timeseries
One bar per X axis value when merchant only
Two bars per x axis value when competition included
One button on the top right if multi view enabled (line, bar, table) - configurable per metric shown
One button on the top right if agreggation is enabled (daily, weekly, montly, quarterly, yearly)
Depending on the agreggation selected, transformation must take place:
daily -> direct api data
weekly, monthly, quarterly, yearly  -> group by week, month, quarter, year
agreggation are available based on the range of the date filter. for example, if 10 days are selected, weekly, monthly, quarterly, yearly  are not available:
Weekly becomes available when at least 14 days are selected
Monthly becomes available when at least 30 days are selected
Quarterly becomes available when at least 90 days are selected
Yearly becomes available when at least 365 days are selected
For y-axis, we either show absolute values or the percentage change from previous year - configurable per metric shown
On hover, when x-axis shows absolute values we show date value, merchant/competition, absolute values and percentage change from previous year or previous time period (week, month, quarter) - configurable per metric shown
On hover, when x-axis shows percentage change from previous year we show date value, merchant/competition and the percentage change from previous year

## Universal Bar Chart
More than two categories, values for merchant and competition (if included)
One button on the top right if multi view enabled (bar, table) - configurable per metric shown
Show percentage per category or also absolute values (for merchant and competition)- configurable per metric shown for absolute values for competition
Absolute values -> direct API data
Percentages -> for merchant and for competition

## Universal Metric Card
### Detailed
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

### Single
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

### Comparison
Merchant Yes
Competition Yes
Percent Change for merchant: Calculate based on previous year data
Percent Change compared with competition: Calculate  based on merchant and competition current data
Percent Change for competition: Calculate based on previous year data

---

## 🔍 CRITICAL COMPONENT REQUIREMENTS

### **Universal Chart Components Data Requirements**

**TimeSeriesChart (`src/components/ui/charts/TimeSeriesChart.jsx`)**
- **Expected Props:** `apiData` object with `{merchant: [], competitor: []}` format
- **Current Status:** 🟡 Receives API data but always falls back to mock on failure
- **Data Format:** `[{date, merchant, competitor, formattedDate}]`
- **File Location:** Lines 94-98 (fallback logic)

**UniversalMetricCard (`src/components/ui/metrics/UniversalMetricCard.jsx`)**
- **Expected Props:** `merchantData`, `competitorData` with `{value, change, valueType}`
- **Current Status:** ✅ Dashboard only, 🔴 Other tabs use static config
- **Transformation:** Requires period-over-period calculation

**UniversalBreakdownChart (`src/components/ui/charts/UniversalBreakdownChart.jsx`)**
- **Expected Props:** `data` array with `{category, merchant, competitor}` format
- **Current Status:** 🔴 All tabs using mock data
- **Missing:** API-to-chart transformation for all breakdown metrics

---

## 🚨 CRITICAL IMPLEMENTATION GAPS

### **1. Missing API MetricIDs**
```javascript
// These metrics are required by REQUIREMENTS.md but have no API mapping:
'total_customers'              // Demographics
'new_customers'                // Demographics  
'returning_customers'          // Demographics
'top_spenders'                 // Demographics
'loyal_customers'              // Demographics
'at_risk_customers'            // Demographics
'revenue_by_interests'         // Revenue breakdown
'revenue_by_channel'           // Revenue breakdown
'shopping_frequency'           // Demographics
```

### **2. Missing Transformation Functions**
```javascript
// src/services/transformations/index.js - Lines 11-25
revenue: (data) => {
  // TODO: Implement revenue transformation ❌
},
demographics: (data) => {
  // TODO: Implement demographics transformation ❌
},
competition: (data) => {
  // TODO: Implement competition transformation ❌
}
```

### **3. Missing Redux Integration**
- Revenue Tab: Still uses `getTabConfig()` instead of `useTabData()`
- Demographics Tab: Still uses `getTabConfig()` instead of `useTabData()`
- Competition Tab: No hook integration at all

### **4. Mock Data Dependencies**
- **File:** `src/data/mockData.js` - Still imported by 3/4 tabs
- **File:** `src/data/tabConfigs.json` - Still used by Revenue + Demographics
- **Issue:** Static data blocks API integration

---

## 📈 IMPLEMENTATION PRIORITY MATRIX

### **Priority 1: Complete Dashboard Tab**
- Fix TimeSeriesChart API data flow (remove mock fallback)
- Ensure all dashboard charts use API data exclusively

### **Priority 2: Revenue Tab API Integration**
```javascript
// Required implementations:
1. Create `useRevenueData()` hook with API calls
2. Implement `revenueTransform.js` transformation
3. Define missing MetricIDs: revenue_by_interests, revenue_by_channel
4. Replace tabConfigs.json usage with API data
5. Replace mockData imports with transformed API data
```

### **Priority 3: Demographics Tab API Integration**  
```javascript
// Required implementations:
1. Define missing customer segmentation MetricIDs
2. Create `useDemographicsData()` hook
3. Implement `demographicsTransform.js`
4. Replace tabConfigs.json and mockData dependencies
```

### **Priority 4: Competition Tab Implementation**
```javascript
// Required implementations:
1. Define competition-specific MetricIDs
2. Implement competition data aggregation logic
3. Create week-over-week and month-over-month calculations
4. Build competition transformation layer
```

---

## 💡 ARCHITECTURAL INSIGHTS

### **What's Working Well:**
- Redux filter integration architecture ✅
- Analytics service abstraction layer ✅
- Dashboard tab API pattern ✅
- Component prop structure ✅
- **Year-over-year comparison system** ✅
- **Parallel API query execution** ✅
- **Memoized Redux selectors** ✅

### **What Needs Fixing:**
- **75% of metrics still use mock data** 🔴
- **Missing transformation functions** 🔴  
- **API MetricID gaps** 🔴
- **TimeSeriesChart fallback pattern** 🔴

### **Development Pattern for Full API Integration:**
1. **Define MetricIDs** in API schema
2. **Create transformation functions** in `/src/services/transformations/`
3. **Replace imports** from `tabConfigs.json` and `mockData.js`
4. **Use `useTabDataWithYearComparison()` hooks** for API integration with year-over-year data
5. **Test filter integration** with real API data
6. **Utilize year-over-year data** in component UI for comparison metrics

### **Year-Over-Year Data Usage Pattern:**
```javascript
// Component usage example
const { 
  current,              // Current year data
  previous,             // Previous year data  
  dateRanges,           // Both date ranges
  loading,              // Loading state
  hasPreviousYearData   // Helper function
} = useDashboardDataWithYearComparison();

// Calculate year-over-year percentage change
const calculateYoYChange = (currentValue, previousValue) => {
  if (!previousValue || previousValue === 0) return null;
  return ((currentValue - previousValue) / previousValue) * 100;
};
```

---

## 🚨 INFINITE LOOP PREVENTION (CRITICAL)

### **Issue Resolved: Redux + useEffect Infinite Loop (FIXED July 2025)**

**Status:** ✅ **COMPLETELY RESOLVED** - App loads properly with data display

### **Root Causes & Solutions:**

**❌ WRONG - Causes Infinite Loop:**
```javascript
// Selector creates new object every render
export const selectApiParams = (state) => ({
  userID: state.filters.userID,  // ← NEW OBJECT EVERY TIME!
  // ...
});

// Array created inside hook
export const useDashboardData = () => {
  const metricIDs = ['total_revenue', ...];  // ← NEW ARRAY EVERY RENDER!
  return useTabData('dashboard', metricIDs);
};
```

**✅ CORRECT - Stable References:**
```javascript
// Memoized selector
export const selectApiParams = createSelector(
  [(state) => state.filters.userID, ...],
  (userID, ...) => ({ userID, ... })
);

// Constant outside component
const DASHBOARD_METRIC_IDS = ['total_revenue', ...];
export const useDashboardData = () => {
  return useTabData('dashboard', DASHBOARD_METRIC_IDS);
};
```

### **Prevention Rules:**
1. **Always use `createSelector` for object-returning selectors**
2. **Define arrays/objects as constants outside components**  
3. **Keep useCallback dependencies stable**
4. **Monitor console for repeated API calls during development**

### **Applied Fixes (July 2025):**
1. **Removed spread operator** `...dependencies` from useCallback dependency array in `useTabData.js:53`
2. **Frozen all metric ID arrays** with `Object.freeze()` to prevent new references
3. **Created stable DEFAULT_OPTIONS** object for hook parameters
4. **Eliminated unstable dependencies** option that was causing new array creation
5. **Result:** App loads properly, data displays correctly, no infinite loops