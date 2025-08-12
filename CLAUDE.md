# CLAUDE.md - Merchant Insights Dashboard Architecture Guide

**React business intelligence dashboard for NBG (National Bank of Greece) - Complete implementation guide based on established Dashboard tab patterns**

---

## 📋 PROJECT OVERVIEW

**Tech Stack:** React + TypeScript, Vite, Tailwind CSS, Recharts, Redux Toolkit, React i18next  
**Purpose:** Merchant analytics dashboard with transaction volumes, revenue, customer data, and competitive analysis  
**Architecture:** Smart/Presentational component pattern with MetricId-driven data flow  
**Multi-language:** English/Greek localization with NBG branding  

---

## 🏗️ COMPONENT ARCHITECTURE (Based on Dashboard Implementation)

### **Core Pattern: Configuration-Only Tabs → Smart Containers → Presentational Components**

The Dashboard tab establishes the gold standard architecture based on **configuration over composition**:

```tsx
// Dashboard Tab: Direct container configuration (NO intermediate components)
<GenericMetricContainer
  title={t('dashboard.totalRevenue')}
  metricId="total_revenue"
  valueType="currency"
  icon={<RevenueIcon />}
/>
```

This flows through the architecture:
1. **Tab Level**: Pure configuration - passes props to containers
2. **Smart Container**: Handles Redux, data processing, business logic  
3. **Presentational Component**: Pure UI rendering with no dependencies

### **Configuration vs Composition Anti-Pattern**

```tsx
// ✅ CORRECT (Dashboard Pattern): Direct container configuration
<GenericMetricContainer
  title={t('dashboard.totalRevenue')}
  metricId="total_revenue"
  valueType="currency"
  icon={<RevenueIcon />}
/>

// ❌ WRONG (Revenue Pattern): Unnecessary wrapper components
<TotalRevenueMetric title={t('revenue.totalRevenue')} />
// TotalRevenueMetric.jsx just wraps UniversalMetricCard - adds no value
```

### **Smart Container Responsibilities**
- **Redux Store Connection**: Via `useSelector` with `createMetricSelector(metricId)`
- **Data Processing**: YoY calculations, error handling, loading states
- **Business Logic**: Data transformations, formatting rules
- **State Management**: Loading/error states, data freshness

### **Presentational Component Responsibilities**
- **Pure UI Rendering**: No store dependencies, no business logic
- **Prop-Based Display**: All data received as props
- **Responsive Design**: Mobile-first layout patterns
- **Accessibility**: ARIA labels, keyboard navigation

---

## 📐 ARCHITECTURAL PRINCIPLES

### **1. Configuration Over Composition**

Dashboard tab demonstrates the **configuration-only** approach:

```tsx
// Dashboard.tsx - Pure configuration, no wrapper components
const Dashboard = ({ filters }) => {
  return (
    <div>
      <GenericMetricContainer
        title={t('dashboard.totalRevenue')}
        metricId="total_revenue"
        valueType="currency"
        icon={<RevenueIcon />}
      />
      <GenericMetricContainer
        title={t('dashboard.totalTransactions')}
        metricId="total_transactions" 
        valueType="number"
        icon={<TransactionIcon />}
      />
    </div>
  );
};
```

**Benefits:**
- **Simplicity**: No intermediate files to maintain
- **Clarity**: Direct mapping between requirements and implementation
- **Flexibility**: Easy to modify configurations inline
- **Consistency**: All metrics use identical container pattern

### **2. Component Layer Elimination**

**Anti-Pattern** (Revenue tab current state):
```
Revenue.jsx → TotalRevenueMetric.jsx → UniversalMetricCard.jsx → DOM
```

**Correct Pattern** (Dashboard established):
```
Dashboard.tsx → GenericMetricContainer.tsx → PresentationalMetricCard.tsx → DOM
```

The wrapper component layer (`TotalRevenueMetric.jsx`) adds no value and should be eliminated.

### **3. Smart/Presentational Separation**

Maintained at the **container level**, not component level:
- **Smart**: `GenericMetricContainer` handles Redux, business logic
- **Presentational**: `PresentationalMetricCard` handles pure UI
- **Configuration**: Tab handles props and configuration only

---

## 🔄 DATA FLOW ARCHITECTURE

### **1. MetricId-Driven System**

Every component is driven by a `metricId` string that maps directly to API endpoints:

```tsx
// Component Configuration
const DASHBOARD_METRICS = [
  'total_revenue',
  'total_transactions', 
  'avg_ticket_per_user',
  'revenue_per_day',
  'transactions_per_day',
  'customers_per_day'
];

// Hook Usage
const { data, isLoading, error } = useDashboardData();

// Smart Container Props
<GenericMetricContainer metricId="total_revenue" />
```

### **2. Redux Store Structure**

```typescript
state.data.metrics = {
  total_revenue: {
    merchant: {
      current: 1250000,      // Raw absolute value from API
      previous: 1087000      // Previous year for YoY calculation
    },
    competitor: {
      current: 980000,
      previous: 895000
    }
  }
}
```

### **3. Generic Selector Pattern**

```typescript
// Selector Factory (works with any metricId)
export const createMetricSelector = (metricId: string) => 
  createSelector(
    [selectAllMetrics],
    (metrics) => metrics[metricId] || null
  );

// YoY Calculation Selector
export const createYoYChangeSelector = (metricId: string, entity: 'merchant' | 'competitor') =>
  createSelector(
    [createCurrentDataSelector(metricId, entity), createPreviousDataSelector(metricId, entity)],
    (current, previous) => {
      if (!current || !previous) return null;
      return ((current - previous) / previous) * 100;
    }
  );
```

### **4. Data Fetching Flow**

```
Tab Mount → useDashboardData() → fetchMetricsDataWithYearComparison() → API Call → Store Update → Component Re-render
```

---

## 📊 IMPLEMENTATION STATUS BY TAB

### **Dashboard Tab ✅ GOLD STANDARD**

**Architecture:** Smart/Presentational with Generic Containers  
**TypeScript:** ✅ Fully migrated  
**Data Flow:** MetricId-driven with Redux selectors  
**Components:** All use Generic Containers  

**Metrics (Scalar Values):**
- `total_revenue` → GenericMetricContainer → PresentationalMetricCard ✅
- `total_transactions` → GenericMetricContainer → PresentationalMetricCard ✅  
- `avg_ticket_per_user` → GenericMetricContainer → PresentationalMetricCard ✅

**Charts (Time Series):**
- `revenue_per_day` → GenericTimeSeriesChartContainer → PresentationalTimeSeriesChart ✅
- `transactions_per_day` → GenericTimeSeriesChartContainer → PresentationalTimeSeriesChart ✅
- `customers_per_day` → GenericTimeSeriesChartContainer → PresentationalTimeSeriesChart ✅

**Features:**
- ✅ Automatic year-over-year comparison
- ✅ Filter integration with Redux
- ✅ Mobile-responsive design  
- ✅ Error handling and loading states
- ✅ TypeScript type safety

---

### **Revenue Tab 🔴 NOT ALIGNED**

**Current Status:** Violates configuration-only architecture with unnecessary wrapper components

**Major Architectural Issues:**
- Creates wrapper components (`TotalRevenueMetric`, `AvgDailyRevenueMetric`, etc.) instead of direct container configuration
- Uses `UniversalMetricCard` instead of `GenericMetricContainer` (violates smart/presentational separation)
- Adds unnecessary component composition layer that Dashboard eliminates
- 6 wrapper files that add no value - just pass props to `UniversalMetricCard`

**Configuration vs Composition Violation:**
```jsx
// Current (WRONG): Creates wrapper components  
<TotalRevenueMetric title={t('revenue.totalRevenue')} />
<AvgDailyRevenueMetric title={t('revenue.avgDailyRevenue')} />

// Should be (CORRECT): Direct container configuration
<GenericMetricContainer title={t('revenue.totalRevenue')} metricId="total_revenue" />
<GenericMetricContainer title={t('revenue.avgDailyRevenue')} metricId="avg_daily_revenue" />
```

**Required Changes:**
1. **Eliminate wrapper components** - Replace with direct `GenericMetricContainer` configuration
2. **Delete unnecessary files** - Remove all `/metrics/*.jsx` wrapper components  
3. **Replace UniversalMetricCard** - Use `GenericMetricContainer` for proper smart/presentational separation
4. **Complete TypeScript migration** - Convert to `.tsx` with proper interfaces

---

### **Demographics Tab 🔴 NOT ALIGNED**

**Current Status:** Uses old component patterns, no Generic Containers

**Major Issues:**
- No Generic Container usage
- Custom hooks instead of normalized data hooks
- Missing TypeScript types
- No MetricId-driven architecture

**Required Changes:**
1. Replace all custom components with Generic Containers
2. Implement `useDemographicsData()` hook following Dashboard pattern
3. Add TypeScript interfaces
4. Migrate to MetricId-driven data flow

---

### **Competition Tab 🔴 NOT ALIGNED**

**Current Status:** Custom implementation, not following established patterns

**Major Issues:**
- Custom metric and chart components
- No Generic Container pattern
- Special competition-specific logic hardcoded in components
- Missing data integration

**Required Changes:**
1. Create competition-specific container variants
2. Implement competition data hooks
3. Align with MetricId system
4. Add TypeScript support

---

## 🛠️ GENERIC CONTAINER SPECIFICATIONS

### **GenericMetricContainer**

**Purpose:** Smart container for all scalar metric display (revenue, transactions, etc.)

```tsx
interface GenericMetricContainerProps {
  title: string;           // Display title from translations
  metricId: string;        // API metric identifier  
  valueType: ValueType;    // 'currency' | 'number' | 'percentage'
  icon: React.ReactNode;   // Icon component
  variant?: MetricVariant; // 'single' | 'detailed' | 'comparison' | 'competition'
}
```

**Data Processing:**
1. Connects to Redux store via `createMetricSelector(metricId)`
2. Calculates YoY percentages via `createYoYChangeSelector(metricId)`
3. Handles loading/error states
4. Passes processed data to `PresentationalMetricCard`

### **GenericTimeSeriesChartContainer**  

**Purpose:** Smart container for all time-based chart data (daily revenue, transactions, etc.)

```tsx
interface GenericTimeSeriesChartContainerProps {
  title: string;
  metricId: string;
  selector: (state: any) => any;     // Redux selector function
  formatValue: (value: number) => string;
  showCompetitor: boolean;
  merchantLabel: string;
  hasCompetitorData: boolean;
  filters?: Filters;
}
```

**Data Processing:**
1. Fetches time series data via provided selector
2. Transforms raw API data to chart format
3. Handles timeline aggregation (daily → weekly → monthly)
4. Calculates YoY percentages for each time period
5. Passes chart-ready data to `PresentationalTimeSeriesChart`

---

## 🎯 IMPLEMENTATION GUIDELINES

### **Creating New Components (Follow Dashboard Pattern)**

**Step 1: Direct Container Configuration (NOT wrapper components)**
```tsx
// ✅ CORRECT: Direct container configuration in tab
<GenericMetricContainer
  title={t('metrics.newMetric')}
  metricId="new_metric_id"
  valueType="currency"
  icon={<NewMetricIcon />}
/>

// ❌ WRONG: Creating wrapper components
const NewMetricComponent = ({ title }) => (
  <GenericMetricContainer metricId="new_metric_id" title={title} />
);
```

**Key Principle: Configuration Over Composition**
- Tabs should directly configure containers with props
- Avoid creating intermediate wrapper components
- Each metric = one `GenericMetricContainer` configuration, not a new component file

**Step 2: Add MetricId to Schema**
```typescript
// src/data/apiSchema.ts
export const METRIC_IDS = {
  // ... existing metrics
  NEW_METRIC: 'new_metric_id'
};
```

**Step 3: Update Tab Data Hook**
```typescript
// src/hooks/useNormalizedData.ts
export const useTabData = () => {
  const metrics = [
    'existing_metric',
    'new_metric_id'  // Add new metric
  ];
  
  return useMetricData(metrics, { 
    autoFetch: true, 
    yearOverYear: true 
  });
};
```

### **TypeScript Migration Checklist**

1. **Convert .jsx to .tsx**: Change file extensions
2. **Add Interface Definitions**: Props, data structures
3. **Type Redux Selectors**: Proper typing for store access
4. **Type Hook Returns**: Ensure type safety for data hooks
5. **Type Component Props**: Full prop interface definitions

### **Performance Best Practices**

1. **Use createSelector**: Always memoize selectors that return objects
2. **Stable References**: Define constants outside components
3. **Proper Dependencies**: Memoize useCallback/useEffect dependencies
4. **Generic Containers**: Reuse containers instead of creating custom ones

---

## 📏 TECHNICAL STANDARDS

### **File Organization**
```
src/components/
├── dashboard/
│   └── Dashboard.tsx              # Tab component (TypeScript)
├── revenue/  
│   └── Revenue.jsx               # Tab component (needs TS migration)
├── containers/                   # Smart containers
│   ├── GenericMetricContainer.tsx
│   └── GenericTimeSeriesChartContainer.tsx
└── ui/                          # Presentational components
    ├── metrics/
    │   └── PresentationalMetricCard.tsx
    └── charts/
        └── PresentationalTimeSeriesChart.tsx
```

### **Naming Conventions**
- **Smart Containers:** `Generic{ComponentType}Container`
- **Presentational:** `Presentational{ComponentType}`
- **Tab Components:** `{TabName}.tsx`
- **Hooks:** `use{TabName}Data()`
- **Selectors:** `create{DataType}Selector`

### **Data Format Standards**
- **Store Values:** Raw absolute values from API
- **Percentage Precision:** 2 decimal places (15.67%)
- **Currency Formatting:** Greek locale (€1,250,000.00)
- **YoY Display:** "+15.3% from last year" format

---

## 🚀 NEXT STEPS - TAB ALIGNMENT PLAN

### **Phase 1: Revenue Tab Alignment**
1. **Eliminate wrapper components** - Replace all wrapper components with direct `GenericMetricContainer` configuration in Revenue.tsx
2. **Delete unnecessary files** - Remove `/metrics/TotalRevenueMetric.jsx`, `/metrics/AvgDailyRevenueMetric.jsx`, etc.
3. **Replace UniversalMetricCard** - Use `GenericMetricContainer` → `PresentationalMetricCard` pattern
4. **Complete TypeScript migration** - Convert Revenue.jsx → Revenue.tsx with proper interfaces
5. **Test configuration-only approach** - Verify direct container configuration works like Dashboard

### **Phase 2: Demographics Tab Implementation**  
1. Replace all custom components with Generic Containers
2. Implement proper `useDemographicsData()` hook
3. Add missing MetricIds to API schema
4. Full TypeScript implementation

### **Phase 3: Competition Tab Implementation**
1. Create competition-specific container variants or Generic Container configurations
2. Implement competition data integration
3. Align with established MetricId patterns
4. Add comprehensive TypeScript support

### **Success Criteria**
- All tabs use **configuration-only** approach - direct `GenericMetricContainer` setup
- **No wrapper components** - eliminate unnecessary abstraction layers
- All tabs follow `GenericMetricContainer` → `PresentationalMetricCard` pattern
- All tabs fully TypeScript migrated  
- Consistent MetricId-driven data flow
- No custom data fetching outside of established hooks
- Configuration over composition principle maintained across all tabs

---

This guide represents the actual implementation patterns established in the Dashboard tab and serves as the blueprint for aligning all other tabs with this proven architecture.