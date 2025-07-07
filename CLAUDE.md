# CLAUDE.md - Merchant Insights UI Project Guide

## PROJECT OVERVIEW
**React-based business intelligence dashboard for NBG (National Bank of Greece)**
- **Tech Stack:** React + Vite, Tailwind CSS, Recharts, React Select, React i18next
- **Purpose:** Merchant analytics dashboard with transaction volumes, revenue, customer data, and competitive analysis
- **Multi-language:** English/Greek localization
- **Mobile-First:** Responsive design across all devices

## CURRENT PROJECT STATUS

### ✅ COMPLETED WORK
1. **Core Infrastructure (100%)** - JSON configuration system, component architecture, internationalization
2. **Dashboard Tab (100% + FILTER FIXES)** - All Step 1-2 improvements applied, separate metric components, **working filter integration**
3. **Revenue Tab (100%)** - All Step 1-3 improvements applied, fixed chart layouts, Go For More metrics
4. **Demographics Tab (100%)** - Complete with premium visualizations, 6 customer metrics, 4 advanced charts, Step 4 improvements completed
5. **Competition Tab (100%)** - Custom metrics layout, interactive charts, dual calendar heatmaps
6. **Mobile Experience (100%)** - Fixed filter sidebar, responsive tab navigation, metric card layouts
7. **Filter Integration (100% + CRITICAL FIXES)** - Complete Redux-based filter system with API integration, **fixed cache bypass and Apply button workflow**

### 🎯 PENDING WORK (Priority Order)
1. **Real Data Integration** (LOW - 8-12 hours) - Replace mock data with API calls

### 🚨 KNOWN ISSUES & IMPROVEMENTS NEEDED
**✅ Step 1 - General Improvements (COMPLETED):**
1. ✅ Line charts: Made lines straight instead of curved
2. ✅ Timeline filtering: Implemented data filtering by selected date range
3. ✅ Greek translations: Updated to "Άνδρες"/"Γυναίκες"

**✅ Step 2 - Dashboard Improvements (COMPLETED):**
1. ✅ Chart hover format: Updated to "Έμπορος: Value (+X% from last year)"
2. ✅ Chart titles: Cleaned up chart naming
3. ✅ Metric order: Implemented totalRevenue, totalTransactions, avgTransaction
4. ✅ Individual components: Created separate DashboardMetrics.jsx

**✅ Step 3 - Revenue Improvements (COMPLETED):**
1. ✅ RevenueTrend hover format: Matching dashboard format
2. ✅ Chart controls: Moved to upper right for RevenueByInterests/RevenueByChannel  
3. ✅ RevenueByInterests: Fixed x-axis label overflow
4. ✅ RevenueByChannel: Fixed pie chart, implemented stackedBar
5. ✅ Go For More metrics: Grouped with common title
6. ✅ Revenue metrics: Created separate RevenueMetrics.jsx

**✅ Step 4 - Demographics Improvements (COMPLETED):**
1. ✅ Greek subtitle: "Δημογραφικά και καταναλωτική συμπεριφορά των πελατών"
2. ✅ Gender chart: Update compliance text, add absolute values in table view, replace bars with pie chart
3. ✅ Age group chart: Add absolute values in table view
4. ✅ Shopping interests: Fix table overflow, wrap values
5. ✅ Various chart improvements

**✅ RevenueByChannel Responsiveness (COMPLETED):**
- ✅ Fixed pie chart layout problems on mobile/tablet

**✅ Filter Integration (100% COMPLETE + CRITICAL FIXES APPLIED):**
- ✅ Redux state management with persistence
- ✅ Filter UI components (FilterSidebar) connected to Redux
- ✅ API integration with mock server
- ✅ Filter mapping service (bidirectional UI↔API translation)
- ✅ Filter-aware mock data generation
- ✅ Chart components connected to Redux filter state
- ✅ Active tab refresh optimization
- ✅ End-to-end filter functionality verified
- ✅ **FIXED: Cache bypass for filter changes** - Filters now properly trigger API calls
- ✅ **FIXED: Apply Filters button workflow** - Filters only apply when button is clicked
- ✅ **FIXED: Immediate filter application issue** - UI updates don't trigger API calls until Apply

**✅ Metric-Specific Filters (100% COMPLETE + PRODUCTION READY):**
- ✅ Configuration system for metric-specific filters (`src/data/metricFilters.js`)
- ✅ Automatic context inference (Revenue tab → revenue data, Demographics tab → customer data)
- ✅ Enhanced analytics service with filter merging logic
- ✅ Updated useTabData hook with metric-specific filter support
- ✅ Redux integration with proper options passing
- ✅ Mock server support for `interest_type` filter
- ✅ **FIXED: Infinite loop prevention** - Stable object references and dependency arrays
- ✅ Zero configuration required in components - fully automatic

**✅ Year-Over-Year Comparison System (100% COMPLETE + PRODUCTION READY):**
- ✅ Date calculation utilities for automatic previous year range generation (`src/utils/dateHelpers.js`)
- ✅ Enhanced analytics service with parallel current + previous year API calls (`fetchTabDataWithYearComparison`)
- ✅ Extended Redux state structure with separate `currentData` and `previousData` storage
- ✅ Memoized year-over-year selectors to prevent unnecessary rerenders
- ✅ Enhanced hooks: `useDashboardDataWithYearComparison`, `useRevenueDataWithYearComparison`, `useCompetitionDataWithYearComparison`
- ✅ Updated transformation functions with `*_previous` pattern support
- ✅ **ACTIVE IMPLEMENTATION** - Dashboard, Revenue, and Competition tabs now use year-over-year hooks
- ✅ **DUAL API CALLS** - Each tab fires two requests: current year + previous year with same filters
- ✅ **PERFORMANCE OPTIMIZED** - Parallel execution, proper caching, deduplication support
- ✅ **FILTER INTEGRATION** - All current filters automatically applied to both year queries

**✅ UniversalMetricCard Automatic YoY Calculation System (100% COMPLETE + PRODUCTION READY):**
- ✅ **Automatic YoY calculation** from current/previous year API data (`src/utils/yearOverYearHelpers.js`)
- ✅ **Smart data extraction** with API metric ID to transformed property mapping
- ✅ **Graceful error handling** - shows "-" for missing/insufficient data
- ✅ **Clean console** - suppresses warnings for expected empty states during loading
- ✅ **Dashboard integration** - all metric cards now auto-calculate and display YoY percentages
- ✅ **Production ready** - works seamlessly with existing year-over-year Redux architecture

## 🚨 INFINITE LOOP PREVENTION

### **Critical Issue Resolved: Redux + useEffect Infinite Loop (FIXED July 2025)**

**Status:** ✅ **COMPLETELY RESOLVED** - App now loads properly with data display  
**Previous Symptoms:** Console flooded with repeated API calls, app becomes unresponsive

**Root Causes:**
1. **Unmemoized selectors returning objects**
2. **Arrays/objects created inside hooks**  
3. **Unstable references in useCallback dependencies**

### **Fixed Patterns:**

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

### **✅ Applied Fixes (July 2025):**
1. **Removed spread operator** `...dependencies` from useCallback dependency array in `useTabData.js:53`
2. **Frozen all metric ID arrays** with `Object.freeze()` to prevent new references
3. **Created stable DEFAULT_OPTIONS** object for hook parameters
4. **Eliminated unstable dependencies** option that was causing new array creation
5. **Result:** App loads properly, data displays correctly, no infinite loops

## KEY ARCHITECTURE PATTERNS

### File Structure
```
src/
├── components/
│   ├── dashboard/           # Dashboard tab components ✅
│   │   ├── Dashboard.jsx
│   │   └── DashboardMetrics.jsx
│   ├── revenue/            # Revenue tab components ✅
│   │   ├── Revenue.jsx
│   │   ├── RevenueMetrics.jsx
│   │   └── GoForMoreMetricCard.jsx
│   ├── demographics/       # Demographics tab ✅
│   │   └── Demographics.jsx
│   ├── competition/        # Competition tab ✅
│   │   ├── Competition.jsx
│   │   └── CompetitionMetrics.jsx
│   ├── charts/            # Reusable chart components
│   ├── layout/            # Navigation, sidebar, etc.
│   └── ui/                # Shared UI components
├── data/
│   ├── tabConfigs.json    # 🔥 METRIC CONFIGURATIONS
│   ├── metricFilters.js   # ✅ Metric-specific filters configuration
│   └── mockData.js        # Sample data
├── locales/               # Translations (en.json, gr.json)
├── services/              # API service layer (CREATED)
│   ├── analyticsService.js
│   ├── filterMappingService.js  # ✅ Bidirectional filter mapping
│   └── transformations/
├── store/                 # Redux store (CREATED)
│   └── slices/
│       └── filtersSlice.js  # ✅ Advanced filter state management
├── utils/                 # Helpers, formatters
│   ├── timelineHelpers.js  # Timeline data processing
│   └── configHelpers.jsx   # Icons, formatting
```

### Chart Component Pattern
```jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { BarChart, ... } from 'recharts';
import { mockDataSource } from '../../data/mockData';

const ChartComponent = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');
  const [timeline, setTimeline] = useState('weekly');
  
  // Data processing logic
  // Chart rendering logic
  // Return JSX with responsive controls
};
```

### Responsive Design Pattern
- **Mobile-first:** Base styles for mobile, `md:` for desktop
- **Grid:** `grid-cols-1 md:grid-cols-2`
- **Typography:** `text-lg md:text-xl`
- **Controls:** Stack vertically on mobile, horizontal on desktop

### Configuration-Driven Metrics
- **Metrics:** Defined in `src/data/tabConfigs.json`
- **Translations:** `src/locales/en.json` & `src/locales/gr.json`
- **Icons:** Mapped in `src/utils/configHelpers.jsx`

## DESIGN SYSTEM

### Colors
- **Primary:** Blue (`#007B85`, `bg-blue-600`, `text-blue-500`)
- **Success:** Green (`#73AA3C`, `text-green-600`)
- **Error:** Red (`text-red-600`)
- **Neutral:** Gray shades

### Spacing
- **Container:** `max-w-7xl mx-auto px-4`
- **Cards:** `p-3` (compact), `p-4` (normal)
- **Gaps:** `gap-3` (tight), `gap-4` (normal), `gap-6` (loose)

### Typography
- **Titles:** `text-lg font-medium`
- **Values:** `text-lg md:text-xl font-bold`
- **Labels:** `text-xs font-medium text-gray-700`

### Responsive Breakpoints
- **Mobile:** `< 768px`
- **Desktop:** `≥ 768px` (use `md:` prefix)

## CRITICAL GUIDELINES

### ✅ DO:
- Use `.jsx` extensions in imports: `import Chart from './Chart.jsx'`
- Test on mobile viewport (390px iPhone 14 Pro)
- Use `grid-cols-1 md:grid-cols-2` pattern
- Add new metrics to `tabConfigs.json`
- Add translations to both `en.json` AND `gr.json`
- Define icons in `configHelpers.jsx`
- Follow existing chart patterns from Revenue tab
- Include responsive controls and proper tooltips
- Support multiple chart types (bars, line, table, pie)
- Use existing mock data from `src/data/mockData.js`
- Use Greek locale currency formatting
- **Use `createSelector` for Redux selectors that return objects**
- **Define arrays/objects as constants outside components**
- **Memoize complex dependencies in useCallback/useEffect**

### ❌ DON'T:
- Omit file extensions - causes Vite resolution errors
- Force horizontal layouts on mobile
- Hardcode metric data in components
- Create charts without mobile responsiveness
- Hardcode data values in components
- **Create arrays/objects inside useCallback dependencies** - causes infinite loops
- **Use unmemoized selectors that return objects** - causes infinite rerenders
- **Define metric arrays inside hook functions** - creates new references every render

## MOCK DATA AVAILABLE
- `customerMetrics` - Demographics metrics
- `demographicsData` - Age, gender, interests, frequency
- `generateTimeSeriesData()` - Time-based data
- `revenueByInterests` - Shopping interests breakdown
- `revenueByChannel` - Channel distribution

## DEVELOPMENT WORKFLOW

### Setup
```bash
# Main Application
npm install
npm run dev  # Opens on http://localhost:5174 (includes mock server on port 3001)

# Development with Mock Server
npm run dev          # Starts both app and mock server
npm run dev:app-only # Starts only the main app
npm run mock-server  # Starts only the mock server
```

### Testing Checklist
1. **Desktop Testing:** All chart types, controls, interactions
2. **Mobile Testing:** Chrome DevTools + actual mobile device  
3. **Language Testing:** Switch between English/Greek
4. **Responsive Testing:** Resize browser window
5. **Touch Targets:** Minimum 44px on mobile
6. **Filter Testing:** Sidebar filter interactions
7. **Chart Responsiveness:** Pie chart layouts on mobile/tablet

## FILTER INTEGRATION ARCHITECTURE

### ✅ COMPLETED FILTER SYSTEM (100% Complete + Critical Fixes Applied)

#### **Core Architecture**
- **Redux State Management**: Dual filter state (UI + API formats) with persistence
- **Filter Mapping Service**: Bidirectional transformations between UI and API
- **8 Filter Types**: Date range, channel, gender, age groups, location, Go For More, interests, stores
- **Responsive UI**: Mobile slide-over + desktop sidebar with React Select
- **API Integration**: Filter-aware data processing with realistic filtering
- **Proper Apply Button Workflow**: Filters only apply when "Apply Filters" button is clicked
- **Cache Bypass Logic**: API cache is bypassed when filters change to ensure fresh filtered data

#### **Data Flow (Fixed Implementation)**
```
FilterSidebar → UI State → Apply Button → API Conversion → Cache Bypass → Fresh API Call → Charts
     ↓            ↓           ↓              ↓                ↓              ↓            ↓
Select Filters → Store UI → Click Apply → Convert to API → Skip Cache → Filter Data → Display
```

#### **Critical Fixes Applied (July 2025)**
1. **Cache Bypass Issue Fixed**: Analytics slice now bypasses 30-second cache when `filtersChanged: true`
2. **Apply Button Workflow Fixed**: `updateUIFilters` no longer triggers immediate API calls
3. **Filter Application Timing**: API conversion only happens when "Apply Filters" is clicked

#### **✅ COMPLETED IMPLEMENTATION**

**1. Filter Mapping Service** (`src/services/filterMappingService.js`)
- **UI to API Translation:** Converts user-friendly filter values to API format
- **Bidirectional Mapping:** Supports both UI→API and API→UI conversion for persistence
- **Data Validation:** Checks dataset size and creates "insufficient data" placeholders
- **Filter Application:** Applies combined filters with proper precedence

**2. Enhanced Redux Filter Management** (`src/store/slices/filtersSlice.js`)
- **Persistent Filters:** Saves/loads filter state from localStorage across sessions
- **UI Filter State:** Manages user-friendly filter values separately from API format
- **Automatic Translation:** Converts UI filters to API format when applied
- **Change Tracking:** Monitors filter changes to trigger data refreshes

**3. Updated FilterSidebar** (`src/components/layout/FilterSidebar.jsx`)
- **Redux Integration:** Connected to Redux instead of local state
- **Real-time Updates:** Changes reflected immediately in Redux store
- **Persistence:** Filter selections saved automatically to localStorage

**4. Smart Data Refresh** (`src/hooks/useTabData.js`)
- **Active Tab Only:** Refreshes data only for the currently active tab
- **Filter Change Detection:** Automatically refreshes when filters are applied
- **Performance Optimized:** Prevents unnecessary API calls

### API Integration
- **Global state management** ✅ Already implemented with Redux
- **One API call per tab** ✅ Architecture ready
- **Service layer transformation** ✅ Analytics service implemented
- **Filter integration** ✅ Ready for production API

## NEXT IMMEDIATE ACTIONS

1. **Real API integration** - Replace mock server with production endpoints (8-12 hours)

## FILTER INTEGRATION STATUS

### ✅ **Supported Filters (All Implemented)**
- **Gender:** Male/Female selection with proper API mapping (m/f)
- **Age Groups:** Generation-based filtering (Gen Z, Millennials, Gen X, Boomers, Silent)
- **Shopping Interests:** Multiple interest selection (SHOPINT1-15)
- **Geographic Location:** Municipality and region-based filtering
- **Channel:** Physical stores vs E-commerce
- **Date Range:** Integrated with existing timeline functionality

### ✅ **Filter Behavior (All Implemented + Fixed)**
- **Apply Button Workflow:** Filters only apply when "Apply Filters" button is clicked
- **UI vs API State:** Filter selections update UI immediately, API calls only on Apply
- **Cache Bypass:** Fresh API calls made when filters are applied (bypasses 30-second cache)
- **Filter Precedence:** Combined (all filters applied together)
- **Partial Data Handling:** Shows "insufficient data" placeholders when needed
- **Competition Data:** Uses same filters as merchant data for comparison
- **Performance:** Only refreshes currently active tab
- **Persistence:** Filters saved across browser sessions
- **Default Behavior:** No filters = all data (current behavior)

### ✅ **Testing Verified + Recent Fixes**
- ✅ Filter mapping service works correctly
- ✅ Redux state management functions properly
- ✅ Mock server applies filters to generated data
- ✅ API responses reflect filtered results accurately
- ✅ Gender filter test: Only returns female data when filter applied
- ✅ Both merchant and competition data respect the same filters
- ✅ End-to-end filter functionality confirmed
- ✅ **FIXED (July 2025): Apply Filters button workflow** - Verified filters only trigger API calls when button is clicked
- ✅ **FIXED (July 2025): Cache bypass logic** - Verified fresh API calls with filter changes
- ✅ **FIXED (July 2025): UI state separation** - Filter selections update UI without triggering API until Apply

### 🚨 **CRITICAL BUG FIXES APPLIED (July 2025)**

#### **Issue 1: Cache Bypass Problem**
- **Problem:** 30-second cache in `analyticsSlice.js` was returning old data instead of making fresh API calls with new filters
- **Root Cause:** Cache logic didn't check if filters had changed
- **Fix Applied:** Added `hasFiltersChanged` check to cache logic in `fetchTabData` thunk
- **File Modified:** `src/store/slices/analyticsSlice.js:27-42`
- **Result:** Fresh API calls now made when filters are applied

#### **Issue 2: Immediate Filter Application**  
- **Problem:** Filters were applying immediately on selection instead of waiting for "Apply Filters" button
- **Root Cause:** `updateUIFilters` action was setting `filtersChanged: true` and converting to API format immediately
- **Fix Applied:** Removed immediate API conversion and `filtersChanged` flag from `updateUIFilters`
- **File Modified:** `src/store/slices/filtersSlice.js:251-272`
- **Result:** Filters now only apply when "Apply Filters" button is clicked

#### **Current Working Behavior:**
1. **Select filter values** → UI updates only, no API calls
2. **Click "Apply Filters"** → Convert to API format, set `filtersChanged: true`, bypass cache, make fresh API call
3. **Data refreshes** with filtered results

## DOCUMENTATION STRUCTURE

### Documentation Structure:
- **CLAUDE.md** - Main comprehensive project guide (THIS FILE)
- **README.md** - Project overview and quick start guide
- **mock-server/CLAUDE.md** - Mock server documentation and setup
- **archive/** - Historical planning documents and implemented fixes

### Other Reference Files:
- **METRICS_API_INTEGRATION.md** - Complete API integration analysis by tab
- **mock_server_setup.md** - Redirect to mock-server documentation
- **migration_plan.md** - Future migration considerations  
- **request_responses.txt** - API testing data

**Note:** All key specifications, requirements, competition instructions, and metric mappings have been consolidated into this comprehensive guide.

## KEY FILES TO REFERENCE
- `src/data/tabConfigs.json` - Metric configurations
- `src/data/metricFilters.js` - ✅ Metric-specific filters configuration system
- `src/data/mockData.js` - All mock data
- `src/locales/en.json` & `gr.json` - Translations
- `src/utils/configHelpers.jsx` - Icons and utilities
- `src/App.jsx` - Main routing with tab management
- Revenue Tab components - Gold standard implementation examples
- `src/store/slices/filtersSlice.js` - ✅ Complete filter state management with persistence
- `src/services/filterMappingService.js` - ✅ Bidirectional filter transformations
- `src/services/analyticsService.js` - ✅ Enhanced with metric-specific filter support
- `src/components/layout/FilterSidebar.jsx` - ✅ Redux-connected filter UI
- `src/hooks/useTabData.js` - ✅ Smart data refresh with filter integration + infinite loop fixes + year-over-year hooks
- `src/utils/dateHelpers.js` - ✅ Date calculation utilities for year-over-year comparison
- `src/utils/yearOverYearHelpers.js` - ✅ **NEW:** YoY calculation utilities and automatic data extraction
- `src/components/ui/metrics/UniversalMetricCard.jsx` - ✅ **ENHANCED:** Auto-calculating metric cards with YoY percentages

## COMPREHENSIVE METRIC MAPPING & IMPLEMENTATION STATUS

### **📊 CRITICAL REFERENCE: Chart Components ↔ API Metrics Mapping**

This section provides the definitive mapping of all chart components to their required metrics, current implementation status, and data sources. **Essential for API integration work.**

#### **Legend:**
- ✅ **Fully Implemented** - API integrated with proper transformations
- 🟡 **Partially Implemented** - Some API integration, fallbacks to mock data
- 🔴 **Not Implemented** - Using mock data/config only
- ❌ **Missing** - Required but not implemented at all

---

### **TAB 1: DASHBOARD IMPLEMENTATION STATUS**

#### **Dashboard Metrics (Scalar Values)**
| Metric | API MetricID | Component | Status | Data Source | Notes |
|--------|--------------|-----------|---------|-------------|--------|
| Total Revenue | `total_revenue` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |
| Total Transactions | `total_transactions` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |
| Average Transaction | `avg_ticket_per_user` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |

**Redux Hook:** `useDashboardData()` → `useTabData('dashboard', DASHBOARD_METRIC_IDS)`
**Transformation:** `dashboardTransform.js` ✅ Implemented
**File:** `src/components/dashboard/Dashboard.jsx:44-85`

#### **Dashboard Charts (Time Series)**
| Chart | API MetricID | Component | Status | Data Source | Notes |
|-------|--------------|-----------|---------|-------------|--------|
| Revenue Chart | `revenue_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |
| Transactions Chart | `transactions_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |
| Customers Chart | `customers_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |

**FIXED (July 2025):** Cache bypass issue resolved - charts now receive fresh filtered data when Apply Filters is clicked
**File:** `src/components/ui/charts/TimeSeriesChart.jsx:94-98` - Fallback logic remains for error handling

---

### **TAB 2: REVENUE IMPLEMENTATION STATUS**

#### **Revenue Metrics (Scalar Values)**
| Metric | API MetricID | Component | Status | Data Source | Notes |
|--------|--------------|-----------|---------|-------------|--------|
| Total Revenue | `total_revenue` | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | Static config data |
| Average Daily Revenue | N/A | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | Static config data |
| Average Transaction | `avg_ticket_per_user` | `UniversalMetricCard` | 🔴 | `tabConfigs.json` | Static config data |
| **Go For More Metrics:** | | | | | |
| Total Revenue (GFM) | `rewarded_amount` | `GoForMoreMetricCard` | 🔴 | `tabConfigs.json` | **Missing API mapping** |
| Total Rewarded | `rewarded_amount` | `GoForMoreMetricCard` | 🔴 | `tabConfigs.json` | **Missing API mapping** |
| Total Redeemed | `redeemed_amount` | `GoForMoreMetricCard` | 🔴 | `tabConfigs.json` | **Missing API mapping** |

**Redux Hook:** ❌ Not implemented - Uses `getTabConfig('revenue')`
**Transformation:** ❌ Not implemented - `revenueTransform.js` placeholder
**File:** `src/components/revenue/Revenue.jsx:28-101`

#### **Revenue Charts**
| Chart | API MetricID | Component | Status | Data Source | Notes |
|-------|--------------|-----------|---------|-------------|--------|
| Revenue Trend | `revenue_per_day` | `TimeSeriesChart` | 🔴 | Mock fallback | No API integration |
| Revenue Change | `revenue_per_day` | `TimeSeriesChart` | 🔴 | Mock fallback | Year-over-year calc needed |
| Revenue by Interests | ❌ Missing | `UniversalBreakdownChart` | 🔴 | `mockData.revenueByInterests` | **No API MetricID defined** |
| Revenue by Channel | ❌ Missing | `UniversalBreakdownChart` | 🔴 | `mockData.revenueByChannel` | **No API MetricID defined** |

**Critical Missing:** 
- Revenue breakdown metrics not defined in API schema
- Go For More specific MetricIDs not implemented
- No transformation layer for revenue data

---

### **TAB 3: DEMOGRAPHICS IMPLEMENTATION STATUS**

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

### **TAB 4: COMPETITION IMPLEMENTATION STATUS**

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

### **🔍 COMPONENT-LEVEL ANALYSIS**

#### **Universal Chart Components Data Requirements**

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

### **🚨 CRITICAL IMPLEMENTATION GAPS**

#### **1. Missing API MetricIDs**
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

#### **2. Missing Transformation Functions**
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

#### **3. Missing Redux Integration**
- Revenue Tab: Still uses `getTabConfig()` instead of `useTabData()`
- Demographics Tab: Still uses `getTabConfig()` instead of `useTabData()`
- Competition Tab: No hook integration at all

#### **4. Mock Data Dependencies**
- **File:** `src/data/mockData.js` - Still imported by 3/4 tabs
- **File:** `src/data/tabConfigs.json` - Still used by Revenue + Demographics
- **Issue:** Static data blocks API integration

---

### **📈 IMPLEMENTATION PRIORITY MATRIX**

#### **Priority 1: Complete Dashboard Tab**
- Fix TimeSeriesChart API data flow (remove mock fallback)
- Ensure all dashboard charts use API data exclusively

#### **Priority 2: Revenue Tab API Integration**
```javascript
// Required implementations:
1. Create `useRevenueData()` hook with API calls
2. Implement `revenueTransform.js` transformation
3. Define missing MetricIDs: revenue_by_interests, revenue_by_channel
4. Replace tabConfigs.json usage with API data
5. Replace mockData imports with transformed API data
```

#### **Priority 3: Demographics Tab API Integration**  
```javascript
// Required implementations:
1. Define missing customer segmentation MetricIDs
2. Create `useDemographicsData()` hook
3. Implement `demographicsTransform.js`
4. Replace tabConfigs.json and mockData dependencies
```

#### **Priority 4: Competition Tab Implementation**
```javascript
// Required implementations:
1. Define competition-specific MetricIDs
2. Implement competition data aggregation logic
3. Create week-over-week and month-over-month calculations
4. Build competition transformation layer
```

---

### **💡 ARCHITECTURAL INSIGHTS**

#### **What's Working Well:**
- Redux filter integration architecture ✅
- Analytics service abstraction layer ✅
- Dashboard tab API pattern ✅
- Component prop structure ✅
- **Year-over-year comparison system** ✅
- **Parallel API query execution** ✅
- **Memoized Redux selectors** ✅

#### **What Needs Fixing:**
- **75% of metrics still use mock data** 🔴
- **Missing transformation functions** 🔴  
- **API MetricID gaps** 🔴
- **TimeSeriesChart fallback pattern** 🔴

#### **Development Pattern for Full API Integration:**
1. **Define MetricIDs** in API schema
2. **Create transformation functions** in `/src/services/transformations/`
3. **Replace imports** from `tabConfigs.json` and `mockData.js`
4. **Use `useTabDataWithYearComparison()` hooks** for API integration with year-over-year data
5. **Test filter integration** with real API data
6. **Utilize year-over-year data** in component UI for comparison metrics

#### **Year-Over-Year Data Usage Pattern:**
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

This mapping serves as the definitive reference for completing API integration across all tabs with year-over-year comparison capabilities.

## COMPETITION TAB TECHNICAL SPECIFICATIONS

### **Key Requirements from competition_instructions.md**

#### **Competition Definition**
Competition refers to the **whole business sector** of the merchant (not individual competitors). If the merchant is a coffee shop, the competition are all coffee shops in the area.

#### **Layout Requirements**
- **Header:** "Competition Analytics" (not "Metrics Dashboard")
- **Subtitle:** "Comparison with Competition for the selected time period"  
- **Metrics Layout:** THREE ROWS (not columns)

#### **Metric Cards Structure**
Each metric card should have:
- **Left side:** "Compared to last year" showing merchant percentage change vs last year
- **Right side:** "Compared to competition" showing:
  - **Top:** Merchant vs Competition percentage difference
  - **Bottom:** "Competitor Change" showing competition vs last year percentage

#### **WeeklyTurnoverChart Requirements**
- **Layout:** Side by side - Merchant chart (left) and Competition chart (right)
- **Chart Type:** Interactive line charts with area highlighting (using Recharts)
- **Data:** Percentage change in revenue for each week vs same week last year
- **Area Highlighting:**
  - Green areas: Light green above 0% line (positive values)
  - Red areas: Light red below 0% line (negative values)
  - Reference line: Dashed line at 0%

#### **MonthlyTurnoverHeatmap Requirements**
- **Layout:** Two calendar heatmaps side by side (merchant and competition)
- **Week Start:** Monday instead of Sunday
- **Day Numbers:** White font with font-medium weight
- **Date Range:** Only allow navigation within selected date range
- **Color Scaling:** Improved red-to-green scale for revenue values
- **Legend:** χαμηλός (Low) - Dark red, Μέτριος (Medium) - Light red, etc.

## ORIGINAL UI REQUIREMENTS REFERENCE

### **Core Application Structure (from REQUIREMENTS.md)**
- **4 Tabs:** Dashboard, Revenue, Customer Demographics, Competition
- **Header:** NBG logo (top left), Language switcher + Merchant name (top right)
- **Filter Sidebar:** Date range, Channel, Demographics, Go For More, Shopping Interests

### **Filter Specifications**
- **Date Range:** Calendar form, default latest month to today (starting 1/1/23)
- **Channel:** E-commerce, Physical stores (dropdown - single selection)
- **Gender:** All, Male, Female (dropdown - single selection)
- **Age Groups:** Generation Z (18-24), Millennials (25-40), Generation X (41-56), Baby Boomers (57-75), Silent Generation (76-96)
- **Go For More:** Only available if merchant participates (Yes/No)
- **Shopping Interests:** 15 categories (multiple selection)
- **Customer Location:** Greek regions, regional units, municipalities (hierarchical)

### **Chart Customization Options**
- **Chart Types:** Default bars, else line, table, pie (where applicable)
- **Timeline:** Default daily, else monthly, weekly, yearly
- **Hover Format:** Show date/period, merchant/competition label, value, percentage change with colored arrows

### **Responsive Design Requirements**
- **Mobile-first approach** with proper touch targets (minimum 44px)
- **Responsive grid:** `grid-cols-1 md:grid-cols-2` pattern
- **Filter sidebar:** Mobile slide-over, desktop sidebar

### **Compliance Requirements**
- **Customer data:** No competitor customer data shown (compliance requirement)
- **Data privacy:** Proper handling of merchant vs competition data separation

### **Internationalization Requirements**
- **Languages:** English and Greek with proper translations
- **Currency:** Greek locale formatting for all monetary values
- **Date formats:** Localized date display based on selected language

## SUCCESS CRITERIA
- Mobile-responsive design on all components
- Consistent chart patterns across tabs
- Proper internationalization
- Interactive controls and filtering
- Professional tooltips and formatting
- Error handling and loading states

The foundation is solid, patterns are established. Follow the Revenue tab implementation as the gold standard for all new development.