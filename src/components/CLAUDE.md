# CLAUDE.md - Components Architecture & Implementation Guide

**Comprehensive component architecture documentation for the NBG Business Insights dashboard system with established patterns, implementation status, and technical specifications.**

---

## 📋 TABLE OF CONTENTS

1. [Component Architecture Overview](#component-architecture-overview)
2. [Established Patterns](#established-patterns)
3. [Implementation Status by Tab](#implementation-status-by-tab)
4. [Universal Component Specifications](#universal-component-specifications)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Technical Standards](#technical-standards)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Critical Bug Fixes & Prevention](#critical-bug-fixes--prevention)

---

## 🏗️ COMPONENT ARCHITECTURE OVERVIEW

### **Design Philosophy**
The component system follows a **two-tier architecture** with clear separation of concerns:

- **🎯 Bespoke Components** - Configuration-focused, tab-specific wrappers
- **🔧 Universal Components** - Data-processing, reusable UI components

### **Core Principles**
1. **Configuration over Logic** - Bespoke components define "what" and "how to format"
2. **Reusability over Duplication** - Universal components handle "how to get data" and "how to process"
3. **Store Integration** - Raw absolute values from API, calculations in components
4. **Consistent Formatting** - 2 decimal places for percentages, proper currency formatting
5. **Performance Optimization** - Memoized selectors, stable references, infinite loop prevention

---

## 🎯 ESTABLISHED PATTERNS

### **Pattern 1: Bespoke → Universal Component Pattern**

**✅ GOLD STANDARD EXAMPLE:**
```
RevenueByChannelChart (Bespoke)
├── metricId="revenue_by_channel"
├── colors={{ 'Physical Store': '#007B85', 'E-commerce': '#7BB3C0' }}
├── formatValue={(value) => `${value}%`}
├── formatTooltipValue={(absoluteValue) => currencyFormat(absoluteValue)}
└── UniversalBreakdownChart (Universal)
    ├── Store Integration: state.data.metrics.revenue_by_channel
    ├── Data Processing: Raw values → Percentage calculation
    ├── Display Logic: Pie/Stacked/Table views
    └── Output: "32.67% (€445,609)" with 2 decimal precision
```

### **Pattern 2: Store Data Structure**
```
state.data.metrics.{metricId}: {
  merchant: {
    current: { physical: 445608.57, ecommerce: 917900.67 },    // Raw absolute values
    previous: { physical: 268791.86, ecommerce: 826816.62 }    // Year-over-year data
  },
  competitor: {
    current: { physical: 311309.57, ecommerce: 1260374.36 },
    previous: { physical: 764219.97, ecommerce: 647449.29 }
  }
}
```

### **Pattern 3: Tab-Specific Data Fetching**
```
Tab Component → useTabDataNormalized() → API Call → Store Population → Component Display
     ↓                    ↓                 ↓            ↓                    ↓
Revenue.jsx → useRevenueDataNormalized() → metricIDs → Redux Store → Chart Components
```

### **Pattern 4: MetricId-Driven Universal Components**
- **Input:** `metricId="revenue_by_channel"`
- **Processing:** Store selector → Raw data extraction → Percentage calculation
- **Output:** Formatted display with both percentage and absolute values

---

## 📊 IMPLEMENTATION STATUS BY TAB

### **Status Legend**
- ✅ **Fully Implemented** - API integrated with proper transformations and established patterns
- 🟡 **Partially Implemented** - Some API integration, may have fallbacks or incomplete features
- 🔴 **Not Implemented** - Using mock data or missing API integration
- ❌ **Missing** - Required but not implemented at all

---

### **TAB 1: DASHBOARD** ✅ **FULLY IMPLEMENTED**

#### **Metrics (Scalar Values)**
| Metric | MetricID | Component Pattern | Status | Notes |
|--------|----------|-------------------|--------|--------|
| Total Revenue | `total_revenue` | Bespoke → UniversalMetricCard | ✅ | Full API integration with YoY |
| Total Transactions | `total_transactions` | Bespoke → UniversalMetricCard | ✅ | Full API integration with YoY |
| Average Transaction | `avg_ticket_per_user` | Bespoke → UniversalMetricCard | ✅ | Full API integration with YoY |

#### **Charts (Time Series)**
| Chart | MetricID | Component Pattern | Status | Notes |
|-------|----------|-------------------|--------|--------|
| Revenue Chart | `revenue_per_day` | Bespoke → TimeSeriesChart | ✅ | Multi-view, aggregation, YoY hover |
| Transactions Chart | `transactions_per_day` | Bespoke → TimeSeriesChart | ✅ | Multi-view, aggregation, YoY hover |
| Customers Chart | `customers_per_day` | Bespoke → TimeSeriesChart | ✅ | Merchant-only, no competition |

#### **Features**
- **Year-over-Year Comparison:** ✅ Automatic parallel API execution
- **Filter Integration:** ✅ Redux-based with apply button workflow
- **Responsive Design:** ✅ Mobile-first with proper breakpoints
- **Localization:** ✅ Greek/English with proper currency formatting

---

### **TAB 2: REVENUE** 🟡 **PARTIALLY IMPLEMENTED**

#### **Metrics (Scalar Values)**
| Metric | MetricID | Component Pattern | Status | Notes |
|--------|----------|-------------------|--------|--------|
| Total Revenue | `total_revenue` | Bespoke → UniversalMetricCard | ✅ | Full API integration with YoY |
| Average Daily Revenue | `avg_daily_revenue` | Bespoke → UniversalMetricCard | ✅ | Full API integration with YoY |
| Average Transaction | `avg_ticket_per_user` | Bespoke → UniversalMetricCard | ✅ | Full API integration with YoY |
| **Go For More Metrics:** | | | | **Merchant-only (NBG loyalty program)** |
| Total Go For More | `goformore_amount` | Bespoke → UniversalMetricCard | ✅ | Merchant-only, no competition |
| Total Rewarded | `rewarded_amount` | Bespoke → UniversalMetricCard | ✅ | Merchant-only, no competition |
| Total Redeemed | `redeemed_amount` | Bespoke → UniversalMetricCard | ✅ | Merchant-only, no competition |

#### **Charts**
| Chart | MetricID | Component Pattern | Status | Notes |
|-------|----------|-------------------|--------|--------|
| Revenue Trend | `revenue_per_day` | TimeSeriesChart | 🔴 | **Needs API integration** |
| Revenue Change | `revenue_per_day` | TimeSeriesChart | 🔴 | **Needs API integration** |
| Revenue by Interests | `converted_customers_by_interest` | Bespoke → UniversalBarChart | ✅ | **FIXED: New pattern implemented** |
| Revenue by Channel | `revenue_by_channel` | Bespoke → UniversalBreakdownChart | ✅ | **FIXED: New pattern implemented** |

#### **Critical Improvements Made**
- **Pattern Alignment:** ✅ RevenueByChannelChart and RevenueByInterestsChart converted to bespoke pattern
- **Store Integration:** ✅ Raw absolute values with component-level percentage calculation
- **Universal Component Enhancement:** ✅ UniversalBarChart and UniversalBreakdownChart support metricId
- **Shopping Interest Labels:** ✅ SHOPINT1-15 mapped to human-readable names

---

### **TAB 3: DEMOGRAPHICS** 🔴 **NOT IMPLEMENTED**

#### **Missing Metrics**
| Metric | Required MetricID | Status | Priority |
|--------|-------------------|--------|----------|
| Total Customers | `total_customers` | ❌ Missing | High |
| New Customers | `new_customers` | ❌ Missing | High |
| Returning Customers | `returning_customers` | ❌ Missing | High |
| Top Spenders | `top_spenders` | ❌ Missing | Medium |
| Loyal Customers | `loyal_customers` | ❌ Missing | Medium |
| At Risk Customers | `at_risk_customers` | ❌ Missing | Medium |

#### **Missing Charts**
| Chart | Required MetricID | Component Pattern | Status |
|-------|-------------------|-------------------|--------|
| Gender Breakdown | `converted_customers_by_gender` | Bespoke → UniversalBreakdownChart | 🔴 Missing API |
| Age Groups | `converted_customers_by_age` | Bespoke → UniversalBarChart | 🔴 Missing API |
| Shopping Frequency | `shopping_frequency` | Bespoke → UniversalBarChart | ❌ MetricID undefined |
| Shopping Interests | `converted_customers_by_interest` | Bespoke → UniversalBarChart | 🔴 Missing API |

#### **Implementation Requirements**
- **Redux Hook:** Create `useDemographicsDataNormalized()`
- **API Integration:** Define missing customer segmentation MetricIDs
- **Component Conversion:** Apply bespoke → universal pattern
- **Data Transformation:** Implement customer analytics processing

---

### **TAB 4: COMPETITION** 🔴 **NOT IMPLEMENTED**

#### **Missing Metrics**
| Metric | MetricID | Component Pattern | Status | Notes |
|--------|----------|-------------------|--------|--------|
| Revenue vs Competition | `total_revenue` | Bespoke → UniversalMetricCard | 🔴 Competition variant | Special competition formatting |
| Transactions vs Competition | `total_transactions` | Bespoke → UniversalMetricCard | 🔴 Competition variant | Merchant vs competition % |
| Avg Transaction vs Competition | `avg_ticket_per_user` | Bespoke → UniversalMetricCard | 🔴 Competition variant | Competitor change detail |

#### **Missing Charts**
| Chart | MetricID | Component Pattern | Status | Notes |
|-------|----------|-------------------|--------|--------|
| Weekly Timeline | `revenue_per_day` | Bespoke → UniversalTimelineChart | 🔴 Missing | Week-over-week calculations |
| Monthly Heatmap | `revenue_per_day` | Bespoke → UniversalCalendarHeatmap | 🔴 Missing | Calendar-based revenue display |

#### **Implementation Requirements**
- **Competition Layout:** Header: "Competition Analytics", Subtitle: "Comparison with Competition"
- **Metric Cards:** THREE ROWS with special competition formatting
- **Redux Hook:** Create `useCompetitionDataNormalized()`
- **Calculation Logic:** Week-over-week, month-over-month percentage changes
- **Chart Integration:** Interactive line charts with area highlighting

---

## 🔧 UNIVERSAL COMPONENT SPECIFICATIONS

### **UniversalMetricCard**

#### **Variants**
- **`single`** - Merchant only, single value with YoY change
- **`detailed`** - Merchant + Competition, side-by-side with YoY changes
- **`comparison`** - Merchant + Competition + Competition comparison percentage
- **`competition`** - Special competition layout with merchant vs competition and competitor change detail

#### **Required Props**
- **`metricId`** - ALWAYS REQUIRED, connects to Redux store
- **`variant`** - Determines layout and data display pattern
- **`title`** - Display title for the metric
- **`icon`** - Icon component for visual identification

#### **Data Flow**
```
metricId → createMetricSelector(metricId) → store.data.metrics[metricId] → calculateYoYChange() → Display
```

### **UniversalBreakdownChart**

#### **Supported Views**
- **Pie Charts** - Side-by-side merchant/competition with outside labels
- **Stacked Bars** - Horizontal bars with category percentages and absolute values
- **Table View** - Detailed breakdown with percentages and absolute values

#### **MetricId Integration**
- **Input:** `metricId="revenue_by_channel"`
- **Processing:** Raw store data → Percentage calculation → Category mapping
- **Output:** `[{category, merchant, competitor, merchantAbsolute, competitorAbsolute}]`

#### **Formatting Standards**
- **Percentages:** 2 decimal places (32.67%)
- **Tooltips:** "32.67% (€445,609)" format
- **Currency:** Greek locale formatting

### **UniversalBarChart**

#### **Supported Views**
- **Bar Chart** - Multi-category comparison with merchant/competition bars
- **Table View** - Detailed breakdown with percentages and absolute values

#### **Special Features**
- **Shopping Interest Labels:** SHOPINT1-15 mapped to human-readable names
- **Category Sorting:** By total revenue (merchant + competitor)
- **Category Limiting:** `maxCategories` prop for top N display
- **Label Truncation:** Long category names truncated with ellipsis

#### **MetricId Integration**
- **Input:** `metricId="converted_customers_by_interest"`
- **Processing:** Raw interest data → Label mapping → Percentage calculation → Sorting
- **Output:** Top categories with proper labels and formatting

### **TimeSeriesChart**

#### **Features**
- **Multi-View:** Line, Bar, Table display options
- **Aggregation:** Daily, Weekly, Monthly, Quarterly, Yearly based on date range
- **Year-over-Year:** Hover tooltips show percentage change from previous year
- **Responsive:** Mobile-optimized with proper touch targets

#### **Aggregation Logic**
- **Weekly:** Available when ≥14 days selected
- **Monthly:** Available when ≥30 days selected  
- **Quarterly:** Available when ≥90 days selected
- **Yearly:** Available when ≥365 days selected

---

## 🔄 DATA FLOW ARCHITECTURE

### **Tab Navigation Data Fetching**
```
1. User clicks tab → Component mounts
2. useTabDataNormalized() hook activates
3. useTabData(tabName, metricIDs) triggers
4. performFetch() → API call with metric IDs
5. Redux store populated → Components display data
```

### **Filter Application Flow**
```
1. User selects filters → UI state updates
2. User clicks "Apply Filters" → Convert UI → API format
3. filtersChanged: true → Bypass 30-second cache
4. Fresh API call → New filtered data
5. Store updated → Components re-render
```

### **Year-over-Year Data Flow**
```
1. API Request: Parallel calls for current + previous year
2. Store Structure: {current: {...}, previous: {...}}
3. Component Calculation: ((current - previous) / previous) * 100
4. Display: "Value (+X% from last year)" format
```

### **MetricId-Driven Component Flow**
```
Bespoke Component:
metricId="revenue_by_channel" → 

Universal Component:
selectRawMetricData(metricId) → 
store.data.metrics.revenue_by_channel → 
Raw Data: {physical: 445608.57, ecommerce: 917900.67} →
Calculate Percentages: (445608.57 / total) * 100 = 32.67% →
Format Display: "32.67% (€445,609)"
```

---

## 📏 TECHNICAL STANDARDS

### **Data Format Standards**
- **Store Values:** Raw absolute values from API response
- **Percentage Precision:** Always 2 decimal places (32.67%)
- **Currency Formatting:** Greek locale with € symbol
- **Date Formatting:** Localized based on selected language
- **Tooltip Format:** "Percentage (Absolute Value)" pattern

### **Component Naming Conventions**
- **Bespoke Components:** `{TabName}{MetricName}Chart/Metric`
- **Universal Components:** `Universal{ComponentType}`
- **Hook Naming:** `use{TabName}DataNormalized()`
- **Selector Naming:** `select{DataType}` with memoization

### **File Organization**
```
src/components/
├── dashboard/
│   ├── Dashboard.jsx                    # Tab component
│   ├── metrics/                         # Bespoke metric components
│   └── charts/                          # Bespoke chart components
├── revenue/
│   ├── Revenue.jsx                      # Tab component  
│   ├── metrics/                         # Bespoke metric components
│   └── charts/                          # Bespoke chart components
├── ui/
│   ├── charts/                          # Universal chart components
│   ├── metrics/                         # Universal metric components
│   └── components/                      # Shared UI components
```

### **Redux Integration Standards**
- **Store Structure:** Normalized with raw absolute values
- **Selectors:** Always use `createSelector` for object returns
- **Loading States:** Component-specific and global loading management
- **Error Handling:** Graceful degradation with error state display

---

## 📋 IMPLEMENTATION GUIDELINES

### **Creating New Bespoke Components**

#### **Step 1: Define Component Structure**
```
const NewMetricChart = ({ title }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <UniversalComponentType
        metricId="api_metric_id"
        // Configuration props only
        colors={{ ... }}
        formatValue={(value) => `${value}%`}
        formatTooltipValue={(absoluteValue) => formatCurrency(absoluteValue)}
      />
    </div>
  );
};
```

#### **Step 2: Enhance Universal Component**
- Add metricId prop support
- Implement store integration with memoized selectors
- Add data processing logic for specific metric type
- Ensure loading and error state handling

#### **Step 3: Integration Points**
- Add to tab's metric IDs array in hook
- Include in tab component JSX
- Test with real API data and filters
- Verify responsive design and localization

### **Performance Optimization Checklist**
- ✅ Use `createSelector` for all object-returning selectors
- ✅ Define arrays/objects as constants outside components
- ✅ Memoize complex calculations with `useMemo`
- ✅ Stable dependencies in `useCallback` and `useEffect`
- ✅ Monitor console for repeated API calls during development

### **Testing Checklist**
- ✅ Desktop and mobile responsiveness
- ✅ English/Greek language switching
- ✅ Filter application and data refresh
- ✅ Loading and error states
- ✅ Year-over-year data display
- ✅ Chart interaction and tooltip formatting

---

## 🚨 CRITICAL BUG FIXES & PREVENTION

### **Infinite Loop Prevention (RESOLVED July 2025)**

#### **Root Causes Identified**
1. **Unstable Selector References** - Selectors creating new objects every render
2. **Dynamic Array Creation** - Arrays created inside hook functions
3. **Spread Operator Dependencies** - `...dependencies` in useCallback arrays
4. **Unmemoized Object Dependencies** - Objects passed to useCallback without memoization

#### **Solutions Applied**
```
✅ FIXED: createSelector for all object-returning selectors
✅ FIXED: Constants defined outside components (Object.freeze())
✅ FIXED: Removed spread operator from useCallback dependencies
✅ FIXED: Stable DEFAULT_OPTIONS object for hook parameters
✅ RESULT: App loads properly, data displays correctly, no infinite loops
```

### **Filter Integration Issues (RESOLVED July 2025)**

#### **Problems Solved**
1. **Cache Bypass Issue** - 30-second cache returning old data instead of fresh filtered data
2. **Immediate Filter Application** - Filters applying on selection instead of button click
3. **UI State Separation** - Filter selections triggering API calls without Apply button

#### **Solutions Applied**
```
✅ FIXED: hasFiltersChanged check in cache logic
✅ FIXED: Apply button workflow - filters only apply when button clicked  
✅ FIXED: UI state updates without API calls until Apply button pressed
✅ RESULT: Proper filter workflow with fresh data on filter changes
```

### **Component Pattern Issues (RESOLVED)**

#### **Problems Solved**
1. **Missing MetricId Props** - UniversalMetricCard components without required metricId
2. **Inconsistent Data Flow** - Some components using selectors, others using direct data
3. **Percentage Calculation Placement** - Calculations in wrong component layer

#### **Solutions Applied**
```
✅ FIXED: All UniversalMetricCard components require metricId
✅ FIXED: Consistent bespoke → universal pattern across all charts
✅ FIXED: Store contains raw values, components calculate percentages
✅ RESULT: Clean separation of concerns and consistent data flow
```

---

## 🎯 CURRENT IMPLEMENTATION PRIORITIES

### **Priority 1: Complete Revenue Tab**
- Fix Revenue Trend and Revenue Change TimeSeriesChart integration
- Ensure all revenue charts use API data exclusively
- Remove any remaining mock data dependencies

### **Priority 2: Implement Demographics Tab**
- Define missing customer segmentation MetricIDs
- Create `useDemographicsDataNormalized()` hook
- Convert all demographics components to bespoke → universal pattern
- Implement proper API transformations

### **Priority 3: Implement Competition Tab**
- Define competition-specific MetricIDs and calculations
- Create `useCompetitionDataNormalized()` hook  
- Implement week-over-week and month-over-month calculations
- Build special competition metric card layouts

### **Priority 4: Enhanced Features**
- Advanced chart interactions and customizations
- Additional aggregation options for TimeSeriesChart
- Extended filter capabilities
- Performance optimizations for large datasets

---

**This documentation represents the current state and established patterns for the NBG Business Insights component system. All new development should follow these patterns and standards for consistency and maintainability.**