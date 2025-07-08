# CLAUDE.md - Components Guide per tab

/home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md

### **TAB 1: DASHBOARD**
 
#### **Dashboard Metrics (Scalar Values)**
| Metric | API MetricID | Component | Status | Data Source | Notes |
|--------|--------------|-----------|---------|-------------|--------|
| Total Revenue | `total_revenue` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |
| Total Transactions | `total_transactions` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |
| Average Transaction | `avg_ticket_per_user` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation |
 
 
From Universal Metric Card detailed:
 
Total Revenue
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Total Transactions
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Average Transaction
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

 
#### **Dashboard Charts (Time Series)**
| Chart | API MetricID | Component | Status | Data Source | Notes |
|-------|--------------|-----------|---------|-------------|--------|
| Revenue Chart | `revenue_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |
| Transactions Chart | `transactions_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |
| Customers Chart | `customers_per_day` | `TimeSeriesChart` | ✅ | API via Redux | **FIXED: Filter integration working** |
 
From Timeseries Chart

Revenue Chart
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change on hover: Calculate based on previous year data
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md

Transactions Chart
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change on hover: Calculate based on previous year data
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md
 
Customers Chart
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change on hover: Calculate based on previous year data
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md

### **TAB 2: REVENUE**
#### **Revenue Metrics (Scalar Values)**
| Metric | API MetricID | Component | Status | Data Source | Notes |
|--------|--------------|-----------|---------|-------------|--------|
| Total Revenue | `total_revenue` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation with YoY |
| Average Daily Revenue | `avg_daily_revenue` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation with YoY |
| Average Transaction | `avg_ticket_per_user` | `UniversalMetricCard` | ✅ | API via Redux | Full implementation with YoY |
| **Go For More Metrics (Merchant-Only):** | | | | | |
| Total Go For More | `goformore_amount` | `UniversalMetricCard` | ✅ | API via Redux | **Merchant-only, no competition** |
| Total Rewarded | `rewarded_amount` | `UniversalMetricCard` | ✅ | API via Redux | **Merchant-only, no competition** |
| Total Redeemed | `redeemed_amount` | `UniversalMetricCard` | ✅ | API via Redux | **Merchant-only, no competition** |
 
 
#### **Revenue Charts**
| Chart | API MetricID | Component | Status | Data Source | Notes |
|-------|--------------|-----------|---------|-------------|--------|
| Revenue Trend | `revenue_per_day` | `TimeSeriesChart` | 🔴 | **Mock data fallback** | **Missing API data integration** |
| Revenue Change | `revenue_per_day` | `TimeSeriesChart` | 🔴 | **Mock data fallback** | **Missing API data integration** |
| Revenue by Interests | `converted_customers_by_interest` | `UniversalBarChart` | ✅ | API via Redux | Real revenue data by interest |
| Revenue by Channel | `revenue_by_channel` | `UniversalBreakdownChart` | ✅ | API via Redux | Percentage + absolute values |
 
From Universal Metric Card detailed:
 
Total Revenue
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Average Daily Revenue
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Average Transaction
Merchant Yes
Competition Yes
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

From Universal Metric Card single:

Total Go For More
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Total Rewarded
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data
 
Total Redeemed
Merchant Yes
Competition No
Absolute Value: Direct from API
Percent Change: Calculate based on previous year data

From timeseries chart:

Revenue Trend
Merchant Yes
Competition Yes
Absolute Value: Direct from API (revenue_per_day)
Percent Change on hover: Calculate based on previous period data (day, week, month, quarter, year)
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md --default weekly if number of days at least 14, else daily

Revenue Change
Merchant Yes
Competition Yes
Only show percentage change in y-axis
Percent Change on hover: Calculate based on previous year data  (revenue_per_day)
View options: line, bar, table
Aggregation options: daily, weekly, monthly, quarterly, yearly - aggregations become available depending on the number of days of the time range, as explained in /home/aigli/merchant-insights-20205/src/components/ui/CLAUDE.md --default weekly if number of days at least 14, else daily

From Universal Bar Chart:

Revenue by Interests
Merchant Yes
Competition Yes
View options: bar, table
Absolute Value: Direct from API
Percentage per category: Calculate based on API data
bar chart: y-axis -> percentages and on hover show both absolute value and percentage
Table: per category show merchant percentage and absolute value, and competition percentage and absolute value

From Universal Breakdown Chart:

Revenue by Channel
Merchant Yes
Competition Yes
View options: pie, stacked bar, table
Absolute Value: Direct from API
Percentage per category: Calculate based on API data
Stacked bar: label shows category and percentage for merchant(left side) and competition (right side), hover tooltip shows category, absolute value and percentage
Pie chart: angle label shows percentage per category for merchant(left side) and competition (right side), color legend, hover tooltip shows category, absolute value and percentage
Table: per category show merchant percentage and absolute value, and competition percentage and absolute value