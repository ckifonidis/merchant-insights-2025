Instructions for the Competition tab

You need to follow the look and feel of all other tabs.

The filter sidebar will be the same as in all other tabs.

## Header and Title
- Title: "Competition Analytics" (not "Metrics Dashboard")
- Subtitle: "Comparison with Competition for the selected time period"

## Competition Definition
Competition refers to the whole business sector of the merchant (not individual competitors), i.e., if the merchant is a coffee shop, the competition are all the coffee shops in the area.

## Metrics Section
We start with three sets of metrics displayed in THREE ROWS (not columns):

1. **Revenue**: Revenue growth/decline compared to last year for merchant and competition + comparison with competition
2. **Transactions**: Number of transactions growth/decline compared to last year for merchant and competition + comparison with competition
3. **Average Transaction Amount**: Average Amount per transaction growth/decline compared to last year for merchant + comparison with competition along with the absolute values for average amount for merchant and competition

### Metrics Layout (Three Rows):
Each metric card should have:
- **Left side**: "Compared to last year" showing merchant percentage change vs last year (reuse percentageChange calculation from Dashboard's ComparisonMetricCard)
- **Right side**: "Compared to competition" showing:
  - **Top**: Merchant vs Competition percentage difference
  - **Bottom**: "Competitor Change" showing competition vs last year percentage

### Colored Arrows:
In the percentage changes, show colored arrows (up and green or down and red) indicating growth or decline (positive or negative percentage).

## WeeklyTurnoverChart Requirements
The WeeklyTurnoverChart.jsx needs to be completely rewritten as an interactive chart:

### Layout:
- **Side by side**: Merchant chart (left) and Competition chart (right)
- **Chart type**: Interactive line charts with area highlighting (using Recharts, not static SVG)

### Data and Axes:
- **Y-axis**: Percentage change values
- **X-axis**: Custom based on date range selection - show first day of each week in the selected period
- **Data**: Show percentage change in revenue for each week vs same week last year

### Interactive Features:
- **Hover tooltips**: Show week date and percentage change
- **Single percentage value**: Show only one percentage value on hover (not separate for merchant and competition)
- **Black font**: Use black font color in tooltips for better readability

### Area Highlighting:
- **Green areas**: Light green highlighting above the 0% line when values are positive
- **Red areas**: Light red highlighting below the 0% line when values are negative
- **Reference line**: Dashed line at 0%
- **Single line**: Only one line per chart connecting all data points

### Technical Implementation:
- Use ComposedChart with separate Area components for positive/negative highlighting
- Use single Line component for the main data line
- Remove stroke from Area components to prevent multiple lines
- Round percentage values to 2 decimal places in tooltips

### Removed Elements:
- Remove the explanatory text paragraph that was below the chart

## MonthlyTurnoverHeatmap Requirements
The MonthlyTurnoverHeatmap.jsx needs significant updates:

### Layout:
- **Two calendar heatmaps**: Side by side (merchant and competition)
- **Responsive**: Side-by-side on desktop, stacked on mobile

### Calendar Configuration:
- **Week start**: Start weeks with ΔΕΥ (Monday) instead of ΚΥΡ (Sunday)
- **Day numbers**: All day numbers should be displayed in WHITE font with font-medium weight

### Date Range Restrictions:
- **Navigation**: Scrollable calendar should only allow navigation within the selected date range
- **Highlighting**: Only days within the selected date range should be highlighted with colors
- **Disabled navigation**: Previous/Next month buttons should be disabled when outside the allowed range

### Color Scaling:
- **Better diverging red-to-green scale**: Improved gradient from red (low) to green (high)
- **Red scale**: Light red to dark red for low revenue (below median)
- **Green scale**: Light green to dark green for high revenue (above median)
- **Gray**: Light gray (#f3f4f6) for days outside selected period or without data
- **Unified scaling**: Same color scale for both merchant and competition calendars

### Legend:
Update legend to show the new color scale:
- Χαμηλός (Low) - Dark red
- Μέτριος (Medium) - Light red
- Εκτός Περιόδου (Out of Period) - Gray
- Καλός (Good) - Light green
- Υψηλός (High) - Dark green

### Technical Implementation:
- Use Monday-first week calculation for proper calendar layout
- Implement date range validation for navigation
- Apply consistent white text styling to all day numbers
- Use improved color calculation algorithm for better visual distinction