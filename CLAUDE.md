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
2. **Dashboard Tab (100%)** - All Step 1-2 improvements applied, separate metric components
3. **Revenue Tab (100%)** - All Step 1-3 improvements applied, fixed chart layouts, Go For More metrics
4. **Demographics Tab (100%)** - Complete with premium visualizations, 6 customer metrics, 4 advanced charts, Step 4 improvements completed
5. **Competition Tab (100%)** - Custom metrics layout, interactive charts, dual calendar heatmaps
6. **Mobile Experience (100%)** - Fixed filter sidebar, responsive tab navigation, metric card layouts
7. **Filter Integration (100%)** - Complete Redux-based filter system with API integration, UI components, mock server support, end-to-end functionality

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

**✅ Filter Integration (100% COMPLETE):**
- ✅ Redux state management with persistence
- ✅ Filter UI components (FilterSidebar) connected to Redux
- ✅ API integration with mock server
- ✅ Filter mapping service (bidirectional UI↔API translation)
- ✅ Filter-aware mock data generation
- ✅ Chart components connected to Redux filter state
- ✅ Active tab refresh optimization
- ✅ End-to-end filter functionality verified

## 🚨 INFINITE LOOP PREVENTION

### **Critical Issue Resolved: Redux + useEffect Infinite Loop**

**Symptoms:** Console flooded with repeated API calls, app becomes unresponsive

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
npm run dev  # Opens on http://localhost:5174

# Mock Server (separate terminal)
cd mock-server
npm install
npm start  # Runs on port 3001
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

### ✅ COMPLETED FILTER SYSTEM (100% Complete)

#### **Core Architecture**
- **Redux State Management**: Dual filter state (UI + API formats) with persistence
- **Filter Mapping Service**: Bidirectional transformations between UI and API
- **8 Filter Types**: Date range, channel, gender, age groups, location, Go For More, interests, stores
- **Responsive UI**: Mobile slide-over + desktop sidebar with React Select
- **Mock Server Integration**: Filter-aware data generation with realistic filtering
- **Automated Testing**: Complete test suite with request/response validation

#### **Data Flow (Currently Implemented)**
```
FilterSidebar → Redux Store → useTabData Hook → Analytics Service → Mock Server → Charts
     ↓              ↓              ↓                    ↓               ↓          ↓
  Apply Filters → Store State → Pass Filters → Transform Filters → Filter Data → Display
```

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

**5. Enhanced Mock Server** (`mock-server/utils/filterAwareDataGenerator.js`)
- **Filter-Aware Data Generation:** Applies filters to mock data realistically
- **Realistic Reduction:** Simulates how filters reduce datasets
- **API Format Compatibility:** Generates data matching real API response format
- **Insufficient Data Handling:** Returns appropriate responses for highly filtered data

### Future API Integration
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

### ✅ **Filter Behavior (All Implemented)**
- **Filter Precedence:** Combined (all filters applied together)
- **Partial Data Handling:** Shows "insufficient data" placeholders when needed
- **Competition Data:** Uses same filters as merchant data for comparison
- **Performance:** Only refreshes currently active tab
- **Persistence:** Filters saved across browser sessions
- **Default Behavior:** No filters = all data (current behavior)

### ✅ **Testing Verified**
- ✅ Filter mapping service works correctly
- ✅ Redux state management functions properly
- ✅ Mock server applies filters to generated data
- ✅ API responses reflect filtered results accurately
- ✅ Gender filter test: Only returns female data when filter applied
- ✅ Both merchant and competition data respect the same filters
- ✅ End-to-end filter functionality confirmed

## DOCUMENTATION STRUCTURE

### Primary Files:
- **CLAUDE.md** - Main project guide (THIS FILE)
- **README.md** - Project readme
- **REQUIREMENTS.md** - Original UI requirements and specifications
- **ARCHITECTURE.md** - Technical implementation plan
- **API_PLANNING.md** - API integration strategy
- **CURRENT_ISSUES.md** - Step-by-step improvement tasks

### Reference Files:
- **competition_instructions.md** - Detailed Competition tab requirements
- **migration_plan.md** - Future migration considerations
- **mock_server_setup.md** - Development server setup
- **request_responses.txt** - API testing data

## KEY FILES TO REFERENCE
- `src/data/tabConfigs.json` - Metric configurations
- `src/data/mockData.js` - All mock data
- `src/locales/en.json` & `gr.json` - Translations
- `src/utils/configHelpers.jsx` - Icons and utilities
- `src/App.jsx` - Main routing with tab management
- Revenue Tab components - Gold standard implementation examples
- `src/store/slices/filtersSlice.js` - ✅ Complete filter state management with persistence
- `src/services/filterMappingService.js` - ✅ Bidirectional filter transformations
- `src/components/layout/FilterSidebar.jsx` - ✅ Redux-connected filter UI
- `src/hooks/useTabData.js` - ✅ Smart data refresh with filter integration
- `mock-server/utils/filterAwareDataGenerator.js` - ✅ Filter-aware mock data generation
- `mock-server/routes/analytics.js` - ✅ Enhanced analytics endpoint with filter support

## SUCCESS CRITERIA
- Mobile-responsive design on all components
- Consistent chart patterns across tabs
- Proper internationalization
- Interactive controls and filtering
- Professional tooltips and formatting
- Error handling and loading states

The foundation is solid, patterns are established. Follow the Revenue tab implementation as the gold standard for all new development.