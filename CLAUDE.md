# CLAUDE.md - Merchant Insights UI Project Guide

## PROJECT OVERVIEW
**React-based business intelligence dashboard for NBG (National Bank of Greece)**
- **Tech Stack:** React + Vite, Tailwind CSS, Recharts, React Select, React i18next
- **Purpose:** Merchant analytics dashboard with transaction volumes, revenue, customer data, and competitive analysis
- **Multi-language:** English/Greek localization
- **Mobile-First:** Responsive design across all devices

## CURRENT PROJECT STATUS

### ✅ COMPLETED WORK
- **Core Infrastructure** - Complete React + Vite setup with multi-language support
- **Dashboard Tab** - Full API integration with Redux and year-over-year comparison
- **Filter System** - Complete Redux-based filtering with proper cache bypass
- **Mobile Experience** - Responsive design across all devices
- **Year-over-Year System** - Automatic calculation and parallel API query execution

### 🎯 PENDING WORK
1. **Demographics Tab** - No API integration, missing MetricIDs, uses mock data only
2. **Competition Tab** - No API integration, complete implementation needed

### 🔧 CRITICAL SYSTEMS IMPLEMENTED

**Filter Integration Architecture:**
- ✅ Redux-based filtering with proper cache bypass behavior
- ✅ Apply button workflow (filters only apply when button clicked)
- ✅ Bidirectional UI↔API mapping service (`src/data/metricFilters.js`)

**Year-over-Year Comparison System:**
- ✅ Automatic parallel API execution for current + previous year data
- ✅ Memoized selectors and auto-calculation utilities (`src/utils/yearOverYearHelpers.js`)
- ✅ Enhanced hooks: `useDashboardDataWithYearComparison`, `useRevenueDataWithYearComparison`

**Go For More Implementation:**
- ✅ Merchant-only business logic (NBG loyalty program)
- ✅ No competition data generated for `goformore_amount`, `rewarded_amount`, `redeemed_amount`

**Critical Bug Fixes (July 2025):**
- ✅ **Infinite Loop Prevention** - Stable object references and memoized selectors
- ✅ **Cache Bypass Fix** - Fresh API calls when filters change
- ✅ **Apply Button Workflow** - Proper filter application timing

**Technical Specifications:**
- **Chart Hover Format:** "Έμπορος: Value (+X% from last year)"
- **Greek Translations:** "Άνδρες"/"Γυναίκες" (Male/Female)
- **Component Organization:** DashboardMetrics.jsx, RevenueMetrics.jsx created

*See `/src/components/CLAUDE.md` and `/src/components/ui/CLAUDE.md` for detailed technical specifications and implementation guidelines.*


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

## COMPONENT IMPLEMENTATION STATUS

**📊 For detailed component specifications, API mappings, and implementation status by tab:**

### **Component Documentation Structure:**
- **Detailed Specifications:** `/src/components/CLAUDE.md` - Complete component implementation guide with API status
- **Universal Behaviors:** `/src/components/ui/CLAUDE.md` - Common component behavior patterns and critical technical requirements

### **Implementation Summary:**
- **Dashboard Tab:** ✅ **Fully API Integrated** - All metrics use Redux with year-over-year comparison
- **Revenue Tab:** ✅ **Fully API Integrated** - All metrics and charts use Redux with year-over-year comparison
- **Demographics Tab:** 🔴 **Not Implemented** - No API integration, missing MetricIDs, uses mock data
- **Competition Tab:** 🔴 **Not Implemented** - No API integration, uses mock data exclusively

### **Critical Next Steps:**
1. **Implement Demographics:** Define missing MetricIDs, create Redux hooks, build transformations
2. **Build Competition Tab:** Implement competition API integration and aggregation logic

**Reference:** See component files above for detailed implementation specifications, missing MetricIDs, technical requirements, and architectural insights.

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