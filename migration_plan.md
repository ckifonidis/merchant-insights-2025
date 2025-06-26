# Component Migration to Analytics Service

## Problem Identified
The mock server is working perfectly, but **no components are using the analytics service**. All components still load data from static files:
- `src/data/mockData.js` 
- `src/data/tabConfigs.json`

## Migration Strategy

### Phase 1: Dashboard Component (Priority 1)
**File**: `src/components/dashboard/Dashboard.jsx`

**Current Issue**: Lines 21-52 use `getTabConfig('dashboard')` for static data
**Solution**: Replace with analytics service calls

### Phase 2: TimeSeriesChart Component (Priority 1) 
**File**: `src/components/ui/charts/TimeSeriesChart.jsx`

**Current Issue**: Lines 31-35 use `generateTimeSeriesData()` for mock data
**Solution**: Use analytics service based on `dataType` prop

### Phase 3: Other Tab Components (Priority 2)
- Revenue component (static data on lines 28-101, 130-187)
- Demographics component (static data on lines 26-57, 67-171) 
- Competition component (static data on lines 46-100)

### Phase 4: Configuration Migration (Priority 3)
- Update `configHelpers.jsx` to use analytics service for merchant info
- Migrate from static `tabConfigs.json` to API-driven configuration

## Implementation Plan

### Step 1: Create Data Hooks
Create reusable hooks for each data type:
- `useDashboardMetrics(filters)`
- `useTimeSeriesData(metricID, filters)`  
- `useRevenueMetrics(filters)`
- etc.

### Step 2: Migrate Dashboard Component
Replace static data loading with analytics service calls.

### Step 3: Migrate TimeSeriesChart
Update to fetch data based on `dataType` prop instead of generating mock data.

### Step 4: Test Integration
Verify requests are reaching the mock server and data displays correctly.

### Step 5: Migrate Remaining Components
Apply same pattern to Revenue, Demographics, and Competition components.

## Expected Result
After migration:
- Components will make real API calls to the mock server
- Data will be dynamic and realistic
- Environment switching will work (mock server vs real API)
- Development experience will match production behavior