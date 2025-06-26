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
4. **Demographics Tab (100%)** - Complete with premium visualizations, 6 customer metrics, 4 advanced charts
5. **Competition Tab (100%)** - Custom metrics layout, interactive charts, dual calendar heatmaps
6. **Mobile Experience (100%)** - Fixed filter sidebar, responsive tab navigation, metric card layouts

### 🎯 PENDING WORK (Priority Order)
1. **Step 4 Demographics Improvements** (HIGH - 2-3 hours) - Chart type positioning, table absolute values, pie chart for gender
2. **Filter Integration** (HIGH - 4-6 hours) - Make charts respond to sidebar filters
3. **RevenueByChannel Responsiveness** (HIGH - 1 hour) - Fix pie chart mobile layout
4. **Real Data Integration** (LOW - 8-12 hours) - Replace mock data with API calls

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

**🔄 Step 4 - Demographics Improvements (PENDING):**
1. Greek subtitle: "Δημογραφικά και καταναλωτική συμπεριφορά των πελατών"
2. Gender chart: Update compliance text, add absolute values in table view, replace bars with pie chart
3. Age group chart: Add absolute values in table view
4. Shopping interests: Fix table overflow, wrap values
5. Various chart improvements

**🚨 Critical Issues:**
- **RevenueByChannel Responsiveness** - Pie chart layout problems on mobile/tablet
- **Filter Integration** - Charts don't respond to sidebar filter changes

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
│   └── transformations/
├── store/                 # Redux store (CREATED)
│   └── slices/
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

## API INTEGRATION PLANNING

### Future Architecture
- **Global state management** with Redux/Context
- **One API call per tab** with all required MetricIDs
- **Tab-level loading states** and error handling
- **Service layer transformation** before storing in global state
- **Graceful error handling** for partial failures

### Data Flow (Future)
```
Tab Component → Service Layer → Global State → Component Props
     ↓              ↓              ↓              ↓
 Request Data → Transform Data → Store Data → Display Data
```

## NEXT IMMEDIATE ACTIONS

1. **Complete Step 4 Demographics improvements** from CURRENT_ISSUES.md
2. **Fix RevenueByChannel responsiveness** - Critical mobile layout issue
3. **Implement filter integration** across all charts
4. **Plan API integration** following ARCHITECTURE.md

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
- `src/App.jsx` - Main routing
- Revenue Tab components - Gold standard implementation examples

## SUCCESS CRITERIA
- Mobile-responsive design on all components
- Consistent chart patterns across tabs
- Proper internationalization
- Interactive controls and filtering
- Professional tooltips and formatting
- Error handling and loading states

The foundation is solid, patterns are established. Follow the Revenue tab implementation as the gold standard for all new development.