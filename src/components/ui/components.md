# Reusable UI Components Documentation

This document provides comprehensive documentation for all reusable components in the `/src/components/ui/` directory, focusing on configuration options and data format requirements.

## Table of Contents

### Charts Components
- [TimeSeriesChart](#timeserieshart)
- [UniversalBarChart](#universalbarchart) 
- [UniversalBreakdownChart](#universalbreakdownchart)
- [UniversalHorizontalBarChart](#universalhorizontalbarchart)
- [UniversalCalendarHeatmap](#universalcalendarheatmap)
- [UniversalTimelineChart](#universaltimelinechart)
- [ChartContainer](#chartcontainer)
- [ChartSelector](#chartselector)
- [ChartTooltip](#charttooltip)
- [ChartTable](#charttable)

### Metrics Components
- [UniversalMetricCard](#universalmetriccard)
- [ChangeIndicator](#changeindicator)

---

## Charts Components

### TimeSeriesChart

**File:** `/src/components/ui/charts/TimeSeriesChart.jsx`

The most complex chart component that handles revenue, transactions, and customer data with multiple chart types and timeline aggregations.

#### Configuration

```javascript
<TimeSeriesChart
  filters={filtersObject}
  dataType="revenue" // 'revenue' | 'transactions' | 'customers'
  title="Chart Title"
  showComparison={true} // Show merchant vs competition
  valueFormatter={(value) => `€${value}`} // Custom formatter
  unit="€" // Unit suffix
  className="additional-classes"
  apiData={apiDataObject} // API data or null for empty state
  yAxisMode="absolute" // 'absolute' | 'percentage_change'
  metricConfig={configObject} // Configuration from tabConfigs.json
/>
```

#### Data Format

**API Data Format (apiData prop):**
```javascript
{
  merchant: [
    {
      date: "2023-01-01",
      value: 1500.50,
      formattedDate: "Jan 1, 2023"
    }
  ],
  competitor: [
    {
      date: "2023-01-01", 
      value: 1200.30,
      formattedDate: "Jan 1, 2023"
    }
  ]
}
```

**Internal Processing:** Data is transformed through `transformApiDataToChartFormat()` and `processTimelineData()` for timeline aggregation.

**Chart Data Output:**
```javascript
[
  {
    date: "Jan 1, 2023",
    merchant: 1500, // Rounded values
    competitor: 1200,
    merchantChange: "+5.2", // Percentage change string
    competitorChange: "-2.1"
  }
]
```

#### Features

- **Chart Types:** Bar charts, line charts, table view
- **Timeline Aggregation:** Daily, weekly, monthly, quarterly, yearly
- **Y-Axis Modes:** Absolute values or percentage change from previous year
- **Data Types:** Revenue (currency), transactions (count), customers (count, no competition)
- **Responsive:** Mobile-optimized with proper touch targets

---

### UniversalBarChart

**File:** `/src/components/ui/charts/UniversalBarChart.jsx`

Bar chart component for categorical data comparison between merchant and competition.

#### Configuration

```javascript
<UniversalBarChart
  data={chartData}
  title="Chart Title"
  merchantColor="#007B85" // Merchant bar color
  competitorColor="#73AA3C" // Competition bar color  
  yAxisLabel="%" // Y-axis label
  showAbsoluteValues={false} // Show absolute values in tooltips
  totalValue={1000} // Total for absolute value calculation
  note="Additional information" // Footer note
  filters={filtersObject}
/>
```

#### Data Format

```javascript
[
  {
    category: "Category Name",
    merchant: 45.2, // Percentage value
    competitor: 38.7 // Percentage value
  }
]
```

#### Features

- **Chart Types:** Bar chart, table view
- **Tooltips:** Percentage + optional absolute values
- **Responsive:** Mobile-optimized with rotated x-axis labels
- **Customizable:** Colors, labels, and total values

---

### UniversalBreakdownChart

**File:** `/src/components/ui/charts/UniversalBreakdownChart.jsx`

Advanced breakdown visualization with multiple chart types for categorical data distribution.

#### Configuration

```javascript
<UniversalBreakdownChart
  data={chartData}
  colors={colorMapping} // Category color mapping
  formatValue={(value) => `${value}%`} // Value formatter
  showAbsoluteValues={true} // Include absolute values
  totalValue={1000} // Total for percentage calculation
  note="Chart description" // Footer note
  formatTooltipValue={(value) => `€${value}`} // Tooltip formatter
/>
```

#### Data Format

```javascript
[
  {
    category: "Category Name", // Or 'key' property
    merchant: 35.5, // Percentage
    competitor: 42.1, // Percentage
    merchantAbsolute: 355, // Optional absolute value
    competitorAbsolute: 421 // Optional absolute value
  }
]
```

**Color Mapping:**
```javascript
{
  "Category Name": "#007B85",
  "Another Category": "#73AA3C"
}
```

#### Features

- **Chart Types:** Stacked bars, pie charts, table view
- **Visualizations:** Side-by-side stacked bars with legends
- **Pie Charts:** Dual pie charts with external labels
- **Responsive:** Mobile-first grid layout
- **Tooltips:** Formatted values with absolute amounts

---

### UniversalHorizontalBarChart

**File:** `/src/components/ui/charts/UniversalHorizontalBarChart.jsx`

Horizontal bar chart for categorical data, optimized for categories with longer names.

#### Configuration

```javascript
<UniversalHorizontalBarChart
  data={chartData}
  title="Chart Title"
  merchantColor="#007B85"
  competitorColor="#73AA3C"
  formatValue={(value) => `${value}%`}
  showComparison={true} // Show competition bars
/>
```

#### Data Format

```javascript
[
  {
    category: "Long Category Name",
    merchant: 65.3,
    competitor: 58.9
  }
]
```

#### Features

- **Orientation:** Horizontal bars for better label readability
- **Chart Types:** Bar chart, table view
- **Responsive:** Optimized spacing for mobile devices

---

### UniversalCalendarHeatmap

**File:** `/src/components/ui/charts/UniversalCalendarHeatmap.jsx`

Calendar-based heatmap visualization for daily data patterns.

#### Configuration

```javascript
<UniversalCalendarHeatmap
  data={heatmapData}
  colors={colorScale} // Color scale object
  formatValue={(value) => `€${value}`} // Value formatter
  dateRange={{ start: startDate, end: endDate }}
  weekStartsOn="monday" // Week start day
/>
```

#### Data Format

```javascript
[
  {
    date: "2023-01-01", // ISO date string
    value: 1250.75, // Numeric value for color scaling
    formattedValue: "€1,250.75" // Optional formatted display
  }
]
```

**Color Scale:**
```javascript
{
  low: "#fee5d9",
  medium: "#fcae91", 
  high: "#fb6a4a",
  highest: "#de2d26"
}
```

#### Features

- **Calendar View:** Month-by-month calendar grid
- **Color Scaling:** Value-based color intensity
- **Navigation:** Month navigation within date range
- **Responsive:** Mobile-optimized calendar cells

---

### UniversalTimelineChart

**File:** `/src/components/ui/charts/UniversalTimelineChart.jsx`

Specialized timeline chart for week-over-week or period-over-period comparisons.

#### Configuration

```javascript
<UniversalTimelineChart
  data={timelineData}
  comparisonData={competitorData} // Optional comparison data
  chartType="line" // 'line' | 'area'
  showComparison={true}
  formatValue={(value) => `${value}%`}
  colorScheme="default" // Color scheme identifier
/>
```

#### Data Format

```javascript
[
  {
    period: "Week 1", // Period label
    value: 5.2, // Percentage change
    absoluteValue: 1250, // Optional absolute value
    date: "2023-01-01" // Reference date
  }
]
```

#### Features

- **Timeline Focus:** Optimized for period-over-period data
- **Area Charts:** Highlighting above/below zero line
- **Comparison:** Side-by-side merchant vs competition

---

### ChartContainer

**File:** `/src/components/ui/charts/ChartContainer.jsx`

Wrapper component providing consistent layout and styling for all charts.

#### Configuration

```javascript
<ChartContainer
  title="Chart Title"
  controls={[<ChartSelector />, <ChartSelector />]} // Control components
  className="additional-classes"
  height={400} // Height in pixels or 'auto'
  showHeader={true} // Show title and controls
  headerClassName="header-classes"
  contentClassName="content-classes"
>
  {/* Chart content */}
</ChartContainer>
```

#### Features

- **Consistent Layout:** Standardized chart wrapper
- **Control Integration:** Flexible control component placement
- **Responsive:** Mobile-optimized header layout

---

### ChartSelector

**File:** `/src/components/ui/charts/ChartSelector.jsx`

Dropdown selector for chart types and timeline options.

#### Configuration

```javascript
<ChartSelector
  type="chartType" // 'chartType' | 'timeline'
  value={currentValue}
  onChange={handleChange}
  dateRange={dateRangeObject} // For timeline selectors
  options={customOptions} // Override default options
/>
```

#### Data Format

**Default Chart Type Options:**
```javascript
[
  { value: 'bars', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'table', label: 'Table' },
  { value: 'pie', label: 'Pie Chart' }
]
```

**Timeline Options (dynamic based on date range):**
```javascript
[
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' }, // Available when ≥14 days
  { value: 'monthly', label: 'Monthly' }, // Available when ≥30 days
  { value: 'quarterly', label: 'Quarterly' }, // Available when ≥90 days
  { value: 'yearly', label: 'Yearly' } // Available when ≥365 days
]
```

---

### ChartTooltip

**File:** `/src/components/ui/charts/ChartTooltip.jsx`

Customizable tooltip component for chart hover interactions.

#### Configuration

```javascript
<ChartTooltip
  currency={true} // Format as currency
  showChange={true} // Show percentage change
  formatter={(value) => `€${value}`} // Custom formatter
  changeFormatter={(change) => `${change}%`} // Change formatter
/>
```

#### Data Format

**Expected Payload:**
```javascript
{
  name: "Series Name",
  value: 1250.75,
  change: 5.2, // Optional percentage change
  color: "#007B85"
}
```

---

### ChartTable

**File:** `/src/components/ui/charts/ChartTable.jsx`

Table view component for chart data with sorting and formatting.

#### Configuration

```javascript
<ChartTable
  data={tableData}
  columns={columnDefinitions}
  currency={true} // Apply currency formatting
  showChange={true} // Include change indicators
  sortable={true} // Enable column sorting
  maxHeight="400px" // Maximum table height
/>
```

#### Data Format

**Column Definitions:**
```javascript
[
  {
    key: 'date',
    label: 'Date',
    render: (value) => value // Custom render function
  },
  {
    key: 'merchant',
    label: 'Merchant',
    render: (value, row) => (
      <div className="flex items-center justify-between">
        <span>{formatCurrency(value)}</span>
        <ChangeIndicator value={row.change} />
      </div>
    )
  }
]
```

---

## Metrics Components

### UniversalMetricCard

**File:** `/src/components/ui/metrics/UniversalMetricCard.jsx`

Central metric display component with multiple variants for different use cases.

#### Configuration

```javascript
<UniversalMetricCard
  variant="single" // 'single' | 'comparison' | 'detailed' | 'competition'
  title="Metric Title"
  subtitle="Additional description"
  icon={<IconComponent />}
  className="additional-classes"
  
  // Single variant props
  value={1250.75}
  change={5.2} // Percentage change
  valueType="currency" // 'currency' | 'number' | 'percentage'
  
  // Comparison variant props
  merchantData={{ value: 1250, change: 5.2, valueType: 'currency' }}
  competitorData={{ value: 980, change: -2.1, valueType: 'currency' }}
  
  // Year-over-year data props (detailed variant)
  metricId="total_revenue"
  currentData={currentYearData}
  previousData={previousYearData}
  
  // Display options
  showIcon={true}
  iconBackground="bg-blue-50"
  layout="horizontal" // 'horizontal' | 'vertical'
  size="medium" // 'small' | 'medium' | 'large'
/>
```

#### Data Format

**Merchant/Competitor Data:**
```javascript
{
  value: 1250.75, // Numeric value
  change: 5.2, // Percentage change (optional)
  valueType: 'currency' // 'currency' | 'number' | 'percentage'
}
```

**Year-over-Year Data (Auto-calculation):**
```javascript
// Current Year Data
{
  total_revenue: { merchant: 150000, competitor: 120000 }
}

// Previous Year Data  
{
  total_revenue: { merchant: 142000, competitor: 125000 }
}
```

#### Variants

**Single Variant:**
- Merchant-only metrics
- Single value with change indicator
- Used for Go For More metrics

**Comparison Variant:**
- Side-by-side merchant vs competition
- Both values with individual change indicators

**Detailed Variant:**
- Dashboard-style layout with icons
- Auto-calculates year-over-year changes
- Uses `prepareMetricCardData()` helper

**Competition Variant:**
- Specialized for competition tab
- "Compared to Last Year" vs "Compared to Competition"
- Includes competitor change detail

---

### ChangeIndicator

**File:** `/src/components/ui/metrics/ChangeIndicator.jsx`

Reusable component for displaying change indicators with arrows and formatting.

#### Configuration

```javascript
<ChangeIndicator
  value={5.2} // Numeric change value
  type="percentage" // 'percentage' | 'currency' | 'number'
  size="sm" // 'xs' | 'sm' | 'md' | 'lg'
  variant="inline" // 'inline' | 'badge' | 'full'
  showIcon={true} // Show directional arrows
  showSign={true} // Show +/- signs
  precision={1} // Decimal places
  className="additional-classes"
/>
```

#### Data Format

**Input Value:**
- Numeric change value (positive, negative, or zero)
- `null` or `undefined` values display as "-"
- `NaN` values are handled gracefully

#### Features

**Variants:**
- **Inline:** Simple text with icon (default)
- **Badge:** Rounded badge with background color
- **Full:** Full-width container with padding

**Sizes:**
- **xs:** Extra small icons and text
- **sm:** Small (default)
- **md:** Medium
- **lg:** Large

**Color Logic:**
- Green: Positive changes
- Red: Negative changes  
- Gray: No change or null values

---

## Common Integration Patterns

### API Data Integration

Most chart components expect data in a standardized format that comes from Redux transformations:

```javascript
// 1. Use tab data hook
const { current, previous, loading } = useDashboardDataWithYearComparison();

// 2. Transform data for charts
const chartData = transformDataForChart(current.revenue_per_day);

// 3. Pass to component
<TimeSeriesChart 
  apiData={chartData}
  dataType="revenue"
  showComparison={true}
/>
```

### Responsive Design

All components follow mobile-first responsive patterns:

```javascript
// Grid layouts
className="grid grid-cols-1 md:grid-cols-2"

// Typography scaling  
className="text-lg md:text-xl"

// Touch targets (minimum 44px)
className="min-h-[44px] min-w-[44px]"
```

### Internationalization

Components support React i18next for translations:

```javascript
const { t } = useTranslation();

// Usage in components
label={t('dashboard.merchant')}
placeholder={t('common.selectOption')}
```

### Data Transformation Helpers

Key utilities for data processing:

- `processTimelineData()` - Timeline aggregation for charts
- `prepareMetricCardData()` - Year-over-year calculations for metrics
- `formatValue()` - Consistent value formatting
- `formatChange()` - Change indicator formatting

This documentation covers all reusable UI components with their complete configuration options and data format requirements for effective integration throughout the application.