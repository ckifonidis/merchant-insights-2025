# CLAUDE.md - Components Implementation Guide

**Detailed component specifications for all tabs with API integration status and implementation details.**

**Reference:** Universal component behaviors defined in `/home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md`

## IMPLEMENTATION STATUS LEGEND
- ✅ **Fully Implemented** - API integrated with proper transformations
- 🟡 **Partially Implemented** - Some API integration, fallbacks to mock data
- 🔴 **Not Implemented** - Using mock data/config only
- ❌ **Missing** - Required but not implemented at all

### **TAB 1: DASHBOARD**
 
#### **Dashboard Metrics (Scalar Values)**
| Metric | API MetricID | Component | Status | Data Source | Notes |
|--------|--------------|-----------|---------|-------------|--------|
| Total Revenue | `total_revenue` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |
| Total Transactions | `total_transactions` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |
| Average Transaction | `avg_ticket_per_user` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |
 
 
From Universal Metric Card detailed:
 
Total Revenue
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Total Transactions
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Average Transaction
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

 
#### **Dashboard Charts (Time Series)**
| Chart | API MetricID | Component | Status | Data Source | Notes |
|-------|--------------|-----------|---------|-------------|--------|
| Revenue Chart | `revenue_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |
| Transactions Chart | `transactions_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |
| Customers Chart | `customers_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |
 
From Timeseries Chart

Revenue Chart
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change on hover: Calculate based on previous year data
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md

Transactions Chart
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change on hover: Calculate based on previous year data
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md
 
Customers Chart
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change on hover: Calculate based on previous year data
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md

### **TAB 2: REVENUE**
#### **Revenue Metrics (Scalar Values)**
| Metric | API MetricID | Component | Status | Data Source | Notes |
|--------|--------------|-----------|---------|-------------|--------|
| Total Revenue | `total_revenue` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation with YoY |
| Average Daily Revenue | `avg_daily_revenue` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation with YoY |
| Average Transaction | `avg_ticket_per_user` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation with YoY |
| **Go For More Metrics (Merchant-Only):** | | | | | |
| Total Go For More | `goformore_amount` | `UniversalMetricCard` | ✅ | API via Redux | **Merchant-only, no competition** |
| Total Rewarded | `rewarded_amount` | `UniversalMetricCard` | ✅ | API via Redux | **Merchant-only, no competition** |
| Total Redeemed | `redeemed_amount` | `UniversalMetricCard` | ✅ | API via Redux | **Merchant-only, no competition** |
 
 
#### **Revenue Charts**
| Chart | API MetricID | Component | Status | Data Source | Notes |
|-------|--------------|-----------|---------|-------------|--------|
| Revenue Trend | `revenue_per_day` | `TimeSeriesChart` | 🔴 | **Mock data fallback** | **Missing API data integration** |
| Revenue Change | `revenue_per_day` | `TimeSeriesChart` | 🔴 | **Mock data fallback** | **Missing API data integration** |
| Revenue by Interests | `converted_customers_by_interest` | `UniversalBarChart` | ✅ | API via Redux | Real revenue data by interest |
| Revenue by Channel | `revenue_by_channel` | `UniversalBreakdownChart` | ✅ | API via Redux | Percentage + absolute values |
 
From Universal Metric Card detailed:
 
Total Revenue
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Average Daily Revenue
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Average Transaction
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

From Universal Metric Card single:

Total Go For More
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Total Rewarded
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Total Redeemed
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

From timeseries chart:

Revenue Trend
Merchant Yes
Competition Yes
Absolute Value: Direct from API (revenue_per_day)
Percent Change on hover: Calculate based on previous period data (day, week, month, quarter, year)
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md --default weekly if number of days at least 14, else daily

Revenue Change
Merchant Yes
Competition Yes
Only show percentage change in y-axis
Percent Change on hover: Calculate based on previous year data  (revenue_per_day)
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md --default weekly if number of days at least 14, else daily

From Universal Bar Chart:

Revenue by Interests
Merchant Yes
Competition Yes
View options: bar, table
Absolute Value: Direct from API
Percentage per category: Calculate based on API data
bar chart: y-axis -> percentages and on hover show both absolute value and percentage
Table: per category show merchant percentage and absolute value, and competition percentage and absolute value

From Universal Breakdown Chart:

Revenue by Channel
Merchant Yes
Competition Yes
View options: pie, stacked bar, table
Absolute Value: Direct from API
Percentage per category: Calculate based on API data
Stacked bar: label shows category and percentage for merchant(left side) and competition (right side), hover tooltip shows category, absolute value and percentage
Pie chart: angle label shows percentage per category for merchant(left side) and competition (right side), color legend, hover tooltip shows category, absolute value and percentage
Table: per category show merchant percentage and absolute value, and competition percentage and absolute value

---

### **TAB 3: DEMOGRAPHICS** (NOT IMPLEMENTED)

#### **Demographics Metrics (Required by REQUIREMENTS.md)**
| Metric | API MetricID | Component | Status | Data Source | Notes |
|--------|--------------|-----------|---------|-------------|--------|
| Total Customers | ❌ Missing | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | **API MetricID not defined** |
| New Customers | ❌ Missing | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | **API MetricID not defined** |
| Returning Customers | ❌ Missing | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | **API MetricID not defined** |
| Top Spenders | ❌ Missing | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | **API MetricID not defined** |
| Loyal Customers | ❌ Missing | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | **API MetricID not defined** |
| At Risk Customers | ❌ Missing | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | **API MetricID not defined** |

**Redux Hook:** ❌ Not implemented - Uses `getTabConfig('demographics')`
**Transformation:** ❌ Not implemented - `demographicsTransform.js` placeholder
**File:** `src/components/demographics/Demographics.jsx:25-57`

#### **Demographics Charts**
| Chart | API MetricID | Component | Status | Data Source | Notes |
|-------|--------------|-----------|---------|-------------|--------|
| Gender Chart | `converted_customers_by_gender` | `UniversalBreakdownChart` | 🔴 | `mockData.demographicsData` | **API integration missing** |
| Age Groups Chart | `converted_customers_by_age` | `UniversalHorizontalBarChart` | 🔴 | `mockData.demographicsData` | **API integration missing** |
| Shopping Frequency | ❌ Missing | `UniversalBarChart` | 🔴 | `mockData.demographicsData` | **No API MetricID defined** |
| Shopping Interests | `converted_customers_by_interest` | `UniversalHorizontalBarChart` | 🔴 | `mockData.demographicsData` | **API integration missing** |

**Critical Missing:**
- Customer segmentation metrics (total, new, returning, etc.)
- Shopping frequency analysis metric  
- No API integration for any demographics charts

---

### **TAB 4: COMPETITION** (NOT IMPLEMENTED)

#### **Competition Metrics**
| Metric | API MetricID | Component | Status | Data Source | Notes |
|--------|--------------|-----------|---------|-------------|--------|
| Revenue (vs Competition) | `total_revenue` + competition | `UniversalMetricCard` | 🔴 | `mockData.competitionMetrics` | **No competition API integration** |
| Transactions (vs Competition) | `total_transactions` + competition | `UniversalMetricCard` | 🔴 | `mockData.competitionMetrics` | **No competition API integration** |
| Avg Transaction (vs Competition) | `avg_ticket_per_user` + competition | `UniversalMetricCard` | 🔴 | `mockData.competitionMetrics` | **No competition API integration** |

**Redux Hook:** ❌ Not implemented - Uses direct mock data import
**Transformation:** ❌ Not implemented - `competitionTransform.js` placeholder
**File:** `src/components/competition/Competition.jsx:46-85`

#### **Competition Charts**
| Chart | API MetricID | Component | Status | Data Source | Notes |
|-------|--------------|-----------|---------|-------------|--------|
| Weekly Timeline | `revenue_per_day` + week aggregation | `UniversalTimelineChart` | 🔴 | `mockData.weeklyTurnoverData` | **Week-over-week calc needed** |
| Monthly Heatmap | `revenue_per_day` + monthly | `UniversalCalendarHeatmap` | 🔴 | Generated mock data | **Daily revenue API integration needed** |

**Critical Missing:**
- Competition comparison API integration
- Week-over-week and month-over-month calculations
- Heatmap data aggregation logic

---

## IMPLEMENTATION PRIORITY

### **Priority 1: Fix Revenue Tab TimeSeriesChart Integration**
- Revenue Trend and Revenue Change charts still use mock data fallback
- Need to pass API data to TimeSeriesChart components
- **File:** `src/components/revenue/Revenue.jsx:196-210`

### **Priority 2: Demographics Tab API Integration**
- Define missing customer segmentation MetricIDs
- Create `useDemographicsData()` hook
- Implement `demographicsTransform.js`

### **Priority 3: Competition Tab Implementation**
- Define competition-specific MetricIDs
- Implement competition data aggregation logic
- Create week-over-week and month-over-month calculations

---

## CRITICAL TECHNICAL SPECIFICATIONS

### **Chart Hover Format Standard**
- **Implemented Format:** "Έμπορος: Value (+X% from last year)"
- **Usage:** All TimeSeriesChart components across Dashboard and Revenue tabs
- **Localization:** Greek format required for production

### **Key File Locations & Technical Details**
- **Metric Filters Configuration:** `src/data/metricFilters.js`
- **Infinite Loop Fix:** `useTabData.js:53` - Removed spread operator from useCallback dependency array
- **Component Separation:** DashboardMetrics.jsx, RevenueMetrics.jsx created for better organization

### **Business Logic Requirements**
- **Go For More Metrics:** Merchant-only, no competition data (NBG loyalty program specifics)
- **Greek Translations:** "Άνδρες"/"Γυναίκες" (Male/Female) required
- **Filter Workflow:** Apply button required - UI updates don't trigger API calls until Apply clicked

### **Critical Bug Fixes Applied (July 2025)**
- **Cache Bypass:** Filters now properly trigger fresh API calls
- **Apply Button Workflow:** Filters only apply when "Apply Filters" button clicked
- **Infinite Loop Prevention:** Stable object references and memoized selectors implemented