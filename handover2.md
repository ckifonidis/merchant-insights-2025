# 🚀 Merchant Insights UI - Agent Handover Document

## 📋 PROJECT STATUS OVERVIEW

**Current State:** Revenue Tab Completed ✅  
**Next Priority:** Demographics Tab Implementation  
**Project:** React-based business intelligence dashboard for NBG (National Bank of Greece)  
**Tech Stack:** React + Vite, Tailwind CSS, Recharts, React Select, React i18next  

---

## ✅ COMPLETED WORK

### **1. Mobile Layout Fixes (CRITICAL ISSUES RESOLVED)**
- **Filter Sidebar:** Fixed full-width mobile layout, X button now visible
- **Tab Navigation:** Implemented responsive dropdown for mobile (< 768px)
  - Desktop: Horizontal tabs
  - Mobile: Dropdown with current tab + down arrow
  - Auto-close after selection, click-outside functionality
- **Metric Cards:** Fixed cramped mobile layout with responsive grid (`grid-cols-1 md:grid-cols-2`)

### **2. Dashboard Tab (95% Complete)**
- All core functionality working
- Mobile-responsive design
- Metric cards with merchant vs competitor data
- Interactive charts with filters

### **3. Revenue Tab (100% Complete)**
**Files Created/Modified:**
- `src/components/revenue/Revenue.jsx` - Main component
- `src/components/charts/RevenueTrendChart.jsx` - Trend analysis
- `src/components/charts/RevenueChangeChart.jsx` - Percentage change chart
- `src/components/charts/RevenueByInterestsChart.jsx` - Shopping interests breakdown
- `src/components/charts/RevenueByChannelChart.jsx` - Channel analysis
- `src/App.jsx` - Added routing
- `src/locales/en.json` & `src/locales/gr.json` - Updated translations

**Features Implemented:**
- 4 fully functional charts with mock data
- Interactive controls (chart types, timelines)
- Responsive design (mobile-first)
- Professional tooltips and formatting
- Currency formatting (Greek locale)
- Internationalization support

---

## 🎯 NEXT PRIORITIES

### **1. Demographics Tab (HIGH PRIORITY - 6-8 hours)**
**Requirements from `instructions.md`:**
- Customer-focused metrics and visualizations
- Age groups, gender, location analytics
- New charts needed: Pie charts, demographic breakdowns
- 6 metric cards: Total customers, New customers, Returning customers, Top spenders, Loyal customers, At risk customers

**Files to Create:**
- `src/components/demographics/Demographics.jsx`
- `src/components/charts/CustomerDemographicsChart.jsx` (already exists - needs review)
- `src/components/charts/AgeGroupChart.jsx`
- `src/components/charts/GenderChart.jsx`
- `src/components/charts/LocationChart.jsx`

**Mock Data Available:**
- `customerMetrics` - Already configured in `src/data/mockData.js`
- `demographicsData` - Gender, age groups, shopping frequency, interests
- Demographics metrics already in `src/data/tabConfigs.json`

### **2. Competition Tab (MEDIUM PRIORITY - 6-8 hours)**
- Market comparison features
- Competitive positioning charts
- Market share visualizations

### **3. Filter Integration (HIGH PRIORITY - 4-6 hours)**
- Make charts respond to sidebar filters
- Update chart data based on selected filters
- Key files: All chart components in `src/components/charts/`

---

## 🏗️ ARCHITECTURE & PATTERNS

### **File Structure**
```
src/
├── components/
│   ├── dashboard/           # Dashboard tab components
│   ├── revenue/            # Revenue tab components ✅
│   ├── demographics/       # Demographics tab (TO CREATE)
│   ├── charts/            # Reusable chart components
│   ├── layout/            # Navigation, sidebar, etc.
│   └── ui/                # Shared UI components
├── data/
│   ├── tabConfigs.json    # 🔥 METRIC CONFIGURATIONS
│   └── mockData.js        # Sample data
├── locales/               # Translations (en.json, gr.json)
└── utils/                 # Helpers, formatters
```

### **Key Patterns to Follow**

**1. Chart Component Pattern:**
```jsx
// Standard chart component structure
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

**2. Responsive Design Pattern:**
- Mobile-first: Base styles for mobile, `md:` for desktop
- Grid: `grid-cols-1 md:grid-cols-2`
- Typography: `text-lg md:text-xl`
- Controls: Stack vertically on mobile, horizontal on desktop

**3. Configuration-Driven Metrics:**
- All metrics defined in `src/data/tabConfigs.json`
- Translations in `src/locales/en.json` & `src/locales/gr.json`
- Icons mapped in `src/utils/configHelpers.jsx`

---

## 🎨 DESIGN SYSTEM

### **Colors**
- **Primary:** Blue (`#007B85`, `bg-blue-600`, `text-blue-500`)
- **Success:** Green (`#73AA3C`, `text-green-600`)
- **Error:** Red (`text-red-600`)
- **Neutral:** Gray shades

### **Spacing**
- **Container:** `max-w-7xl mx-auto px-4`
- **Cards:** `p-3` (compact), `p-4` (normal)
- **Gaps:** `gap-3` (tight), `gap-4` (normal), `gap-6` (loose)

### **Typography**
- **Titles:** `text-lg font-medium`
- **Values:** `text-lg md:text-xl font-bold`
- **Labels:** `text-xs font-medium text-gray-700`

### **Responsive Breakpoints**
- **Mobile:** `< 768px`
- **Desktop:** `≥ 768px` (use `md:` prefix)

---

## 🚨 CRITICAL GOTCHAS & GUIDELINES

### **1. File Extensions**
- ✅ **DO:** Use `.jsx` extensions in imports: `import Chart from './Chart.jsx'`
- ❌ **DON'T:** Omit extensions - causes Vite resolution errors

### **2. Mobile-First Responsive Design**
- ✅ **DO:** Always test on mobile viewport (390px iPhone 14 Pro)
- ✅ **DO:** Use `grid-cols-1 md:grid-cols-2` pattern
- ✅ **DO:** Stack controls vertically on mobile
- ❌ **DON'T:** Force horizontal layouts on mobile

### **3. Configuration System**
- ✅ **DO:** Add new metrics to `tabConfigs.json`
- ✅ **DO:** Add translations to both `en.json` AND `gr.json`
- ✅ **DO:** Define icons in `configHelpers.jsx`
- ❌ **DON'T:** Hardcode metric data in components

### **4. Chart Implementation**
- ✅ **DO:** Use existing chart patterns from Revenue tab
- ✅ **DO:** Include responsive controls (React Select dropdowns)
- ✅ **DO:** Add proper tooltips with currency/percentage formatting
- ✅ **DO:** Support multiple chart types (bars, line, table, pie)
- ❌ **DON'T:** Create charts without mobile responsiveness

### **5. Mock Data Usage**
- ✅ **DO:** Use existing mock data from `src/data/mockData.js`
- ✅ **DO:** Process data for different timelines (weekly, monthly, quarterly)
- ✅ **DO:** Use Greek locale currency formatting
- ❌ **DON'T:** Hardcode data values in components

---

## 🛠️ DEVELOPMENT WORKFLOW

### **Setup**
```bash
npm install
npm run dev  # Opens on http://localhost:5174
```

### **Testing Checklist**
1. **Desktop Testing:** All chart types, controls, interactions
2. **Mobile Testing:** Chrome DevTools + actual mobile device
3. **Language Testing:** Switch between English/Greek
4. **Responsive Testing:** Resize browser window
5. **Touch Targets:** Minimum 44px on mobile

### **Common Commands**
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Preview:** `npm run preview`

---

## 📞 QUICK REFERENCE

### **Key Files to Know**
- `src/data/tabConfigs.json` - Metric configurations
- `src/data/mockData.js` - All mock data
- `src/locales/en.json` & `gr.json` - Translations
- `src/utils/configHelpers.jsx` - Icons and utilities
- `src/App.jsx` - Main routing

### **Existing Chart Examples**
- **Revenue Tab:** `src/components/charts/Revenue*.jsx` - Perfect examples
- **Dashboard Tab:** `src/components/charts/TransactionsChart.jsx` - Reference pattern

### **Mock Data Available**
- `customerMetrics` - Demographics metrics
- `demographicsData` - Age, gender, interests, frequency
- `generateTimeSeriesData()` - Time-based data
- `revenueByInterests` - Shopping interests breakdown
- `revenueByChannel` - Channel distribution

---

## 🎯 SUCCESS CRITERIA

**For Demographics Tab:**
- [ ] 6 metric cards displaying properly
- [ ] 4+ demographic charts with mock data
- [ ] Mobile-responsive design
- [ ] Interactive controls (chart types, filters)
- [ ] Proper internationalization
- [ ] Consistent with Revenue tab patterns

**For Competition Tab:**
- [ ] Market comparison visualizations
- [ ] Competitive positioning charts
- [ ] Market share analysis

**For Filter Integration:**
- [ ] Charts respond to sidebar filters
- [ ] Data updates based on filter selections
- [ ] Smooth user experience

---

## 💡 TIPS FOR SUCCESS

1. **Follow Revenue Tab Patterns:** It's the gold standard implementation
2. **Test Mobile Early:** Don't wait until the end
3. **Use Existing Mock Data:** It's comprehensive and realistic
4. **Check Translations:** Both languages must work
5. **Responsive Controls:** Always stack on mobile
6. **Currency Formatting:** Use Greek locale consistently

---

**🚀 Ready to continue! The foundation is solid, patterns are established, and the next agent has everything needed to implement the Demographics tab successfully.**
