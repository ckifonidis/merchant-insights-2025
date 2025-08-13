# CLAUDE.md - Merchant Insights Dashboard Architecture Guide

**React business intelligence dashboard for NBG (National Bank of Greece) - Complete implementation guide with authentication, data flow, and architectural patterns**

---

## 📋 PROJECT OVERVIEW

**Tech Stack:** React + TypeScript, Vite, Tailwind CSS, Recharts, Redux Toolkit, React i18next  
**Purpose:** Merchant analytics dashboard with transaction volumes, revenue, customer data, and competitive analysis  
**Architecture:** Smart/Presentational component pattern with MetricId-driven data flow  
**Authentication:** OAuth2 + JWT with proxy-based session management  
**Multi-language:** English/Greek localization with NBG branding  

---

## 🔐 AUTHENTICATION SYSTEM ARCHITECTURE

### **Authentication Flow Overview**

The authentication system uses a **multi-layer approach** combining OAuth2, JWT tokens, and user service enrollment:

```
OAuth2 Flow → JWT Token → User Service Check → Dashboard Access
```

### **1. Authentication Manager (App-Level)**

**Component:** `AuthenticationManager.tsx`  
**Purpose:** Single initialization point for authentication at app startup

```tsx
// Runs EXACTLY ONCE when app starts
<AuthenticationManager>
  <App />
</AuthenticationManager>
```

**Key Responsibilities:**
- ✅ Initialize authentication on app startup
- ✅ Handle OAuth callback flow detection  
- ✅ Fetch user info from OpenID Connect
- ✅ Check user service enrollment status
- ✅ Load user configuration and merchant details
- ✅ Does NOT re-render based on auth state changes

### **2. Authentication Utilities (`utils/auth.ts`)**

**Core Functions:**
- `checkAuthStatus()` - Verify authentication via `/auth/status`
- `fetchUserInfo()` - Get user details from `/userinfo` endpoint
- `fetchWithAuth(url, options)` - Universal fetch wrapper with auto-auth handling
- `login(returnUrl)` - Redirect to OAuth login flow
- `logout(returnUrl)` - Clear session and redirect
- `handleAuthError(error)` - Auto-redirect on 401 errors

**Auto-Authentication Features:**
- ✅ Automatic 401 handling with login redirect
- ✅ Request timeout management (2 minute default)
- ✅ Network error detection and recovery
- ✅ Session persistence with cookies
- ✅ Return URL preservation

### **3. Auth State Management (Redux)**

**Store Structure:**
```typescript
state.auth = {
  // OAuth Authentication State
  isAuthenticated: boolean | null,  // null = loading
  authLoading: boolean,
  authError: string | null,
  authData: AuthData | null,        // Token expiry, scope
  userInfo: UserInfo | null,        // OpenID Connect user details
  
  // Service Enrollment State
  userStatus: 'signedup' | 'notsigned' | 'noaccess' | null,
  serviceLoading: boolean,
  serviceError: string | null,
  
  // Control State
  isAuthenticating: boolean,
  lastUpdated: string | null
}
```

**Auth Flow Stages:**
1. **OAuth Authentication** - JWT token validation
2. **User Info Fetch** - OpenID Connect profile
3. **Service Enrollment Check** - NBG service access verification  
4. **User Configuration Load** - Merchant IDs and preferences
5. **Merchant Details Fetch** - Business information

### **4. Protected Route System**

**Component:** `ProtectedRoute.tsx`  
**Pattern:** Read-only authentication state consumer

```tsx
// Route Protection Logic
const {
  shouldShowLoading,      // Auth or service loading
  shouldShowError,        // Auth/service errors  
  shouldRedirectToLogin,  // Not authenticated
  shouldShowFirstPage,    // Needs service signup
  shouldShowNoAccess,     // Access denied
  shouldShowDashboard     // Full access granted
} = useAuthState();
```

**Route Decision Matrix:**
```
Loading State → LoadingPage
Error State → ErrorPage  
Not Authenticated → Login Redirect
Authenticated + Not Signed Up → FirstPage (signup flow)
Authenticated + No Access → NoAccessPage
Authenticated + Signed Up → Dashboard
```

### **5. Authentication Hooks**

**Primary Hook:** `useAuthState()` - Read-only auth state access

```tsx
const {
  isAuthenticated,
  userInfo,
  userStatus,
  shouldShowDashboard,
  hasServiceAccess,
  isSessionExpired,
  timeUntilExpiry
} = useAuthState();
```

**Specialized Hooks:**
- `useUserInfo()` - User profile access
- `useUserStatus()` - Service enrollment status
- `useAuthRequired()` - Simple auth check

### **6. User Service Integration**

**Service Endpoints:**
- `/api/authorization/checkUserStatus` - Check service enrollment
- `/api/CONFIGURATION/ADMIN/GET` - Admin configuration
- `/api/CONFIGURATION/MERCHANT/GET` - Merchant details

**Enrollment Status:**
- `signedup` - Full access to dashboard
- `notsigned` - Show signup flow  
- `noaccess` - Access denied

---

## 🏗️ COMPONENT ARCHITECTURE

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

**Architecture Flow:**
1. **Tab Level**: Pure configuration - passes props to containers
2. **Smart Container**: Handles Redux, data processing, business logic  
3. **Presentational Component**: Pure UI rendering with no dependencies

### **Smart Container Responsibilities**
- **Redux Store Connection**: Via `useSelector` with `createMetricSelector(metricId)`
- **Data Processing**: YoY calculations, error handling, loading states
- **Business Logic**: Data transformations, formatting rules
- **State Management**: Loading/error states, data freshness
- **Type Safety**: Full TypeScript interfaces and validation

### **Presentational Component Responsibilities**
- **Pure UI Rendering**: No store dependencies, no business logic
- **Prop-Based Display**: All data received as props
- **Responsive Design**: Mobile-first layout patterns
- **Accessibility**: ARIA labels, keyboard navigation
- **CSS Classes**: Tailwind-based styling with design system

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
      <GenericTimeSeriesChartContainer
        title={t('dashboard.dailyRevenue')}
        metricId="revenue_per_day"
        showCompetitor={true}
        formatValue={formatCurrency}
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

### **2. Smart/Presentational Separation**

**CORRECT Pattern** (Established standard):
```
Tab.tsx → GenericContainer.tsx → PresentationalComponent.tsx → DOM
```

**Container Layer:**
- ✅ Redux connections (`useSelector`)
- ✅ Data processing and transformation
- ✅ Loading/error state management
- ✅ Business logic implementation

**Presentational Layer:**
- ✅ Pure UI components with no dependencies
- ✅ Prop-driven rendering
- ✅ Reusable across different contexts
- ✅ Easy to test and maintain

### **3. TypeScript-First Development**

All new components **MUST** follow TypeScript patterns:

```tsx
// Smart Container Example
interface GenericMetricContainerProps {
  title: string;
  metricId: string;
  valueType: ValueType;
  icon: React.ReactNode;
  variant?: MetricVariant;
}

// Presentational Component Example  
interface PresentationalMetricCardProps {
  merchantData: MetricData;
  competitorData: MetricData;
  valueType: ValueType;
  isLoading: boolean;
  error: string | null;
}
```

---

## 🔄 DATA FLOW ARCHITECTURE

### **1. MetricId-Driven System**

Every component is driven by a `metricId` string that maps directly to API endpoints:

```tsx
// Centralized Metric Definitions (apiSchema.ts)
export const METRICS = {
  SCALAR: {
    TOTAL_REVENUE: 'total_revenue',
    TOTAL_TRANSACTIONS: 'total_transactions',
    AVG_TICKET_PER_USER: 'avg_ticket_per_user'
  },
  TIME_SERIES: {
    REVENUE_PER_DAY: 'revenue_per_day',
    TRANSACTIONS_PER_DAY: 'transactions_per_day'
  },
  CATEGORICAL: {
    CONVERTED_CUSTOMERS_BY_GENDER: 'converted_customers_by_gender'
  }
};

// Component Usage
<GenericMetricContainer metricId="total_revenue" />
<GenericTimeSeriesChartContainer metricId="revenue_per_day" />
```

### **2. Enhanced Redux Store Structure**

```typescript
state.data = {
  metrics: {
    total_revenue: {
      merchant: {
        current: 1250000,     // Raw absolute value from API
        previous: 1087000     // Previous year for YoY calculation
      },
      competitor: {
        current: 980000,
        previous: 895000
      }
    }
  },
  meta: {
    lastUpdated: { total_revenue: '2025-01-13T10:30:00Z' },
    freshness: { total_revenue: 'fresh' | 'stale' | 'error' },
    sources: { total_revenue: 'analytics_api' },
    dateRanges: {
      current: { startDate: '2025-01-01', endDate: '2025-01-13' },
      previous: { startDate: '2024-01-01', endDate: '2024-01-13' }
    },
    validation: {
      hasValidCurrentData: boolean,
      missingMetrics: string[],
      incompletePeriods: string[]
    }
  },
  loading: {
    metrics: boolean,
    yearOverYear: boolean,
    specificMetrics: { [metricId]: boolean }
  },
  errors: {
    metrics: string | null,
    specificMetrics: { [metricId]: string }
  }
}
```

### **3. Enhanced Selector System**

```typescript
// Metric Selector Factory
export const createMetricSelector = (metricId: string) => 
  createSelector(
    [selectAllMetrics],
    (metrics) => metrics[metricId] || null
  );

// Data Quality Selectors
export const createHasValidDataSelector = (metricId: string) => 
  createSelector(
    [createMetricSelector(metricId), selectDataMeta],
    (metric, meta) => {
      if (!metric) return false;
      const freshness = meta.freshness?.[metricId];
      return freshness !== 'error' && (metric.merchant || metric.competitor);
    }
  );

// Performance Selectors
export const selectMetricsSummary = createSelector(
  [selectAllMetrics, selectDataMeta],
  (metrics, meta) => ({
    totalMetrics: Object.keys(metrics).length,
    freshMetrics: Object.values(meta.freshness || {}).filter(f => f === 'fresh').length,
    staleMetrics: Object.values(meta.freshness || {}).filter(f => f === 'stale').length,
    errorMetrics: Object.values(meta.freshness || {}).filter(f => f === 'error').length
  })
);
```

### **4. API Integration & Data Normalization**

**Service Architecture:**
```
AnalyticsService → API Call → Response Normalizer → Redux Store → Component
```

**Key Services:**
- `analyticsService.ts` - API request handling with auth
- `userService.ts` - User enrollment and configuration
- `filterService.ts` - Filter management and validation
- `normalization/` - Data transformation layer

**Data Normalizers:**
- `scalarNormalizer.ts` - Single value metrics
- `timeSeriesNormalizer.ts` - Chart data transformation  
- `categoricalNormalizer.ts` - Breakdown data processing
- `apiNormalizer.ts` - Universal API response handling

---

## 🗃️ TYPE SYSTEM CONSOLIDATION

### **Recent Consolidation: apiConfig.ts → apiSchema.ts**

**Problem Solved:**
- ✅ Eliminated duplicate filter definitions
- ✅ Consolidated API interfaces into single source
- ✅ Removed redundant type definitions
- ✅ Established `filters.ts` as filter type authority

**Consolidated Types in `apiSchema.ts`:**
```typescript
// API Request Types
export interface APIRequestParams { ... }
export interface AnalyticsRequestConfig { ... }
export interface MetricConfig { ... }

// Data Structure Types  
export interface EntityData { ... }
export interface MetricData { ... }
export interface NormalizedMetricData { ... }

// Chart Data Types
export interface TimeSeriesDataPoint { ... }
export interface ChartDataPoint { ... }
export interface CategoryDataPoint { ... }

// Formatting Types
export interface FormatConfig { ... }
export interface MetricDisplayConfig { ... }
```

**Import Pattern:**
```typescript
// CORRECT: Single import source
import { MetricData, EntityData, ChartDataPoint } from '../types/apiSchema';

// WRONG: Multiple import sources (eliminated)
import { MetricData } from '../types/apiConfig';
import { FilterValue } from '../types/api';
```

### **Filter Type Hierarchy**

**Source of Truth:** `filters.ts`
```typescript
// Basic filter types (authoritative)
export type ChannelOption = 'all' | 'physical' | 'ecommerce';
export type GenderOption = 'a' | 'm' | 'f';
export type AgeGroupOption = 'generation_z' | 'millennials' | 'generation_x' | 'baby_boomers';

// UI filter state
export interface UIFilters {
  dateRange: UIDateRange;
  channel: ChannelOption;
  gender: GenderOption;
  ageGroups: AgeGroupOption[];
  // ...
}
```

**API Schema Integration:**
```typescript
// apiSchema.ts imports from filters.ts
import type { ChannelOption, GenderOption, AgeGroupOption } from './filters';

export type ChannelValue = ChannelOption;  // Alias for API usage
export type GenderValue = GenderOption;    // Alias for API usage
```

---

## 📊 COMPONENT IMPLEMENTATION STATUS

### **Dashboard Tab ✅ GOLD STANDARD**

**Architecture:** Smart/Presentational with Generic Containers  
**TypeScript:** ✅ Fully migrated  
**Data Flow:** MetricId-driven with enhanced selectors  
**Authentication:** ✅ Full integration  

**Components:**
- ✅ All metrics use `GenericMetricContainer` → `PresentationalMetricCard`
- ✅ All charts use `GenericTimeSeriesChartContainer` → `PresentationalTimeSeriesChart`  
- ✅ Calendar heatmaps use `GenericCalendarHeatmapContainer` → `PresentationalCalendarHeatmap`

### **Calendar Heatmap Refactor ✅ COMPLETED**

**Before (Anti-pattern):**
```
GenericCalendarHeatmapContainer → UniversalCalendarHeatmap (with Redux connections)
```

**After (Correct pattern):**
```
GenericCalendarHeatmapContainer (Redux + processing) → PresentationalCalendarHeatmap (pure UI)
```

**Architectural Fixes:**
- ✅ Moved Redux connections to container layer
- ✅ Created pure presentational component
- ✅ Proper TypeScript interfaces
- ✅ Enhanced prop-based data flow

### **Revenue Tab 🔴 REQUIRES ALIGNMENT**

**Current Issues:**
- Creates unnecessary wrapper components
- Uses `UniversalMetricCard` instead of generic containers
- Missing TypeScript migration
- Violates configuration-only principle

### **Demographics Tab 🔴 REQUIRES ALIGNMENT**

**Current Issues:**
- No Generic Container usage
- Custom hooks instead of normalized data hooks
- Missing TypeScript types
- No MetricId-driven architecture

### **Competition Tab 🔴 REQUIRES ALIGNMENT**

**Current Issues:**
- Custom metric and chart components
- No Generic Container pattern
- Special competition-specific logic hardcoded
- Missing data integration

---

## 🛠️ GENERIC CONTAINER SPECIFICATIONS

### **GenericMetricContainer.tsx**

**Purpose:** Smart container for all scalar metric display

```tsx
interface GenericMetricContainerProps {
  title: string;           // Display title from translations
  metricId: string;        // API metric identifier  
  valueType: ValueType;    // 'currency' | 'number' | 'percentage'
  icon: React.ReactNode;   // Icon component
  variant?: MetricVariant; // 'single' | 'detailed' | 'comparison'
}
```

**Data Processing:**
1. Connects to Redux via `createMetricSelector(metricId)`
2. Calculates YoY percentages via `createYoYChangeSelector(metricId)`
3. Handles loading/error states with enhanced selectors
4. Validates data freshness and quality
5. Passes processed data to `PresentationalMetricCard`

### **GenericTimeSeriesChartContainer.tsx**

**Purpose:** Smart container for all time-based chart data

```tsx
interface GenericTimeSeriesChartContainerProps {
  title: string;
  metricId: string;
  selector: (state: RootState) => any;
  formatValue: (value: number) => string;
  showCompetitor: boolean;
  merchantLabel: string;
  hasCompetitorData: boolean;
  yAxisMode?: 'absolute' | 'percentage';
}
```

### **GenericCalendarHeatmapContainer.tsx** ✅ **RECENTLY REFACTORED**

**Purpose:** Smart container for calendar heatmap visualization

```tsx
interface GenericCalendarHeatmapContainerProps {
  title: string;
  metricId: string;
  valueLabel?: string;
  showMerchantAndCompetition?: boolean;
  dateRange?: { start: Date; end: Date } | null;
}
```

**Refactoring Pattern Applied:**
- ✅ Moved Redux connections from presentational component to container
- ✅ Created proper TypeScript interfaces
- ✅ Established clear data transformation layer
- ✅ Pure presentational component with no store dependencies

---

## 🎯 IMPLEMENTATION PATTERNS & BEST PRACTICES

### **Creating New Components (Dashboard Pattern)**

**Step 1: Direct Container Configuration**
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

**Step 2: Add MetricId to Schema**
```typescript
// src/types/apiSchema.ts
export const METRICS = {
  SCALAR: {
    // ... existing metrics
    NEW_METRIC: 'new_metric_id'
  }
};
```

**Step 3: Update Data Hooks**
```typescript
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

### **Authentication Integration**

**Hook Usage:**
```tsx
const YourComponent = () => {
  const { shouldShowDashboard, userInfo } = useAuthState();
  
  if (!shouldShowDashboard) {
    return null; // ProtectedRoute handles auth states
  }
  
  return <div>Welcome, {userInfo?.name}</div>;
};
```

**API Calls:**
```tsx
// Use authenticated fetch wrapper
const response = await apiCallJson('/api/ANALYTICS/QUERY', {
  method: 'POST',
  body: JSON.stringify(requestData)
});
```

### **TypeScript Refactoring Checklist**

1. **Convert Extensions**: `.jsx` → `.tsx`
2. **Add Interfaces**: Component props, data structures  
3. **Type Redux State**: Store access and selectors
4. **Type API Responses**: Request/response interfaces
5. **Type Component Props**: Full prop definitions
6. **Import Consolidation**: Use `apiSchema.ts` as primary source

### **Performance Optimization**

1. **Memoized Selectors**: Use `createSelector` for complex computations
2. **Stable References**: Define constants outside components
3. **Proper Dependencies**: Careful `useCallback`/`useEffect` dependencies
4. **Container Reuse**: Prefer generic containers over custom components
5. **Data Freshness**: Use validation selectors to avoid stale data

---

## 📏 TECHNICAL STANDARDS

### **File Organization**
```
src/
├── components/
│   ├── dashboard/
│   │   └── Dashboard.tsx              # Tab (TypeScript)
│   ├── containers/                    # Smart containers
│   │   ├── GenericMetricContainer.tsx
│   │   ├── GenericTimeSeriesChartContainer.tsx
│   │   └── GenericCalendarHeatmapContainer.tsx
│   ├── ui/                            # Presentational
│   │   ├── metrics/
│   │   │   └── PresentationalMetricCard.tsx
│   │   └── charts/
│   │       ├── PresentationalTimeSeriesChart.tsx
│   │       └── PresentationalCalendarHeatmap.tsx
│   ├── AuthenticationManager.tsx       # App-level auth
│   └── ProtectedRoute.tsx             # Route protection
├── types/
│   ├── apiSchema.ts                   # Consolidated API types
│   ├── filters.ts                     # Filter type authority
│   ├── auth.ts                        # Authentication types
│   └── components.ts                  # Component interfaces
├── store/
│   ├── slices/
│   │   ├── authSlice.ts              # Authentication state
│   │   ├── dataSlice.ts              # Metrics data
│   │   └── filtersSlice.ts           # Filter state
│   └── selectors/
│       └── dataSelectors.ts          # Enhanced selectors
├── utils/
│   ├── auth.ts                       # Authentication utilities
│   └── metricFilters.ts              # Filter management
└── services/
    ├── analyticsService.ts           # API integration
    ├── userService.ts                # User management
    └── normalization/                # Data processing
        ├── apiNormalizer.ts
        ├── scalarNormalizer.ts
        ├── timeSeriesNormalizer.ts
        └── categoricalNormalizer.ts
```

### **Naming Conventions**
- **Smart Containers:** `Generic{ComponentType}Container`
- **Presentational:** `Presentational{ComponentType}`
- **Authentication:** `Auth{Purpose}` / `use{Auth}State`
- **Hooks:** `use{TabName}Data()` / `use{Feature}State()`
- **Selectors:** `create{DataType}Selector` / `select{Feature}`
- **Services:** `{domain}Service.ts`

### **Data Standards**
- **Store Values:** Raw absolute values from API
- **Percentage Precision:** 2 decimal places (15.67%)
- **Currency Formatting:** Greek locale (€1,250,000.00)
- **Date Format:** ISO 8601 strings
- **Authentication:** JWT tokens with automatic refresh

---

## 🚀 ARCHITECTURAL ROADMAP

### **Phase 1: Complete Current Refactors**
1. ✅ **Calendar Heatmap Refactor** - COMPLETED
2. ✅ **Type System Consolidation** - COMPLETED  
3. ✅ **Enhanced Data Selectors** - COMPLETED

### **Phase 2: Tab Alignment (In Progress)**
1. **Revenue Tab**: Eliminate wrapper components, use Generic Containers
2. **Demographics Tab**: Implement Generic Container pattern
3. **Competition Tab**: Align with MetricId system

### **Phase 3: Advanced Features**
1. **Performance Monitoring**: Add metrics freshness indicators
2. **Error Recovery**: Enhanced error handling and retry logic
3. **Caching Strategy**: Implement smart data caching
4. **Testing Framework**: Component and integration test suite

### **Success Criteria**
- ✅ All tabs use configuration-only approach
- ✅ No wrapper components or unnecessary abstractions  
- ✅ Full TypeScript coverage across codebase
- ✅ Consistent authentication integration
- ✅ Enhanced data quality validation
- ✅ Smart/presentational separation maintained
- ✅ MetricId-driven data flow throughout

---

## 🔧 TROUBLESHOOTING & DEBUGGING

### **Authentication Issues**
```bash
# Check auth status
curl -b cookies.txt /auth/status

# Debug user info
curl -b cookies.txt /userinfo

# Monitor auth errors in Redux DevTools
state.auth.authError
state.auth.serviceError
```

### **Data Flow Issues**
```typescript
// Debug metric data availability
const metricData = useSelector(createMetricSelector('total_revenue'));
const isValid = useSelector(createHasValidDataSelector('total_revenue'));
const summary = useSelector(selectMetricsSummary);
```

### **Component Testing**
```tsx
// Test smart container in isolation
<Provider store={testStore}>
  <GenericMetricContainer metricId="test_metric" />
</Provider>

// Test presentational component
<PresentationalMetricCard 
  merchantData={{ value: 1000, change: 15.5 }}
  isLoading={false}
  error={null}
/>
```

---

This guide represents the complete architectural implementation of the NBG Merchant Insights Dashboard, including authentication, data flow, component patterns, and recent refactoring work. All future development should follow these established patterns and principles.