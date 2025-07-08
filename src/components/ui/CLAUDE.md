# CLAUDE.md - Components Guide
 
## Universal Breakdown
Two categories, values for merchant and competition (if included)
One button on the top right if multi view enabled (pie, stacked bar, table) - configurable per metric shown
Show percentage per category or also absolute values (for merchant and competition)- configurable per metric shown for absolute values for competition
Absolute values -> direct API data
Percentages -> for merchant and for competition

## Timeseries
One bar per X axis value when merchant only
Two bars per x axis value when competition included
One button on the top right if multi view enabled (line, bar, table) - configurable per metric shown
One button on the top right if agreggation is enabled (daily, weekly, montly, quarterly, yearly)
Depending on the agreggation selected, transformation must take place:
daily -> direct api data
weekly, monthly, quarterly, yearly  -> group by week, month, quarter, year
agreggation are available based on the range of the date filter. for example, if 10 days are selected, weekly, monthly, quarterly, yearly  are not available:
Weekly becomes available when at least 14 days are selected
Monthly becomes available when at least 30 days are selected
Quarterly becomes available when at least 90 days are selected
Yearly becomes available when at least 365 days are selected
For y-axis, we either show absolute values or the percentage change from previous year - configurable per metric shown
On hover, when x-axis shows absolute values we show date value, merchant/competition, absolute values and percentage change from previous year or previous time period (week, month, quarter) - configurable per metric shown
On hover, when x-axis shows percentage change from previous year we show date value, merchant/competition and the percentage change from previous year

## Universal Bar Chart
More than two categories, values for merchant and competition (if included)
One button on the top right if multi view enabled (bar, table) - configurable per metric shown
Show percentage per category or also absolute values (for merchant and competition)- configurable per metric shown for absolute values for competition
Absolute values -> direct API data
Percentages -> for merchant and for competition

## Universal Metric Card
### Detailed
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

### Single
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

### Comparison
Merchant Yes
Competition Yes
Percent Change for merchant: Calculate based on previous year data
Percent Change compared with competition: Calculate  based on merchant and competition current data
Percent Change for competition: Calculate based on previous year data