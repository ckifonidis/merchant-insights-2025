We need to integrate with the rest of the metrics.

Heres how we are going to do it:

Step 1 You request the sample request response for the tab and wait for me.
Step 2 I provide you with the request repsonse in api_samples/{tab} directory.
Step 3 You evaluate the request response for completeness and correctness. Request clarifications as needed.
Step 4 For the metrics covered, proceed to implementation for mock server and client.
Step 5 Once done you give me control to test it. I report any issues back.
Step 6 Once done, you update this document with the progress.


# METRICS API INTEGRATION ANALYSIS

## Overview

This document provides a comprehensive analysis of API integration requirements for each tab in the NBG Merchant Insights Dashboard. It identifies missing MetricIDs, required request/response samples, and implementation gaps discovered through detailed agent analysis.

## Implementation Status Summary

| Tab | API Integration | Missing Components | Priority |
|-----|----------------|-------------------|----------|
| **Dashboard** | ✅ **100% Complete** | None | ✅ Production Ready |
| **Revenue** | 🟡 **50% Complete** | Breakdown charts, static metrics | 🔴 High Priority |
| **Demographics** | 🟡 **70% Complete** | Customer count metrics | 🟡 Medium Priority |
| **Competition** | 🔴 **0% Complete** | All components | 🟡 Medium Priority |

---

## TAB 1: DASHBOARD - ✅ COMPLETE

### Implementation Status
**✅ 100% API Integrated** - Production ready with full filter support

### Required MetricIDs (All Implemented)
```javascript
const DASHBOARD_METRIC_IDS = [
  'total_revenue',         // ✅ Scalar metric
  'total_transactions',    // ✅ Scalar metric  
  'avg_ticket_per_user',   // ✅ Scalar metric
  'revenue_per_day',       // ✅ Time series metric
  'transactions_per_day',  // ✅ Time series metric
  'customers_per_day'      // ✅ Time series metric
];
```

### Component Breakdown
- **3 UniversalMetricCard components** - Using API data via Redux
- **3 TimeSeriesChart components** - Using API data with competition comparison
- **Filter Integration** - Complete Redux-based filter system
- **Performance** - Only refreshes when Dashboard tab is active

### API Request Format (Working)
```json
{
  "header": {
    "ID": "analytics-1635789123456",
    "application": "merchant-insights-ui"
  },
  "payload": {
    "userID": "BANK\\E82629",
    "startDate": "2025-01-01", 
    "endDate": "2025-01-31",
    "providerId": "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
    "metricIDs": [
      "total_revenue", "total_transactions", "avg_ticket_per_user",
      "revenue_per_day", "transactions_per_day", "customers_per_day"
    ],
    "filterValues": [
      {
        "providerId": "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
        "filterId": "gender",
        "value": "[\"f\"]"
      }
    ],
    "merchantId": "52ba3854-a5d4-47bd-9d1a-b789ae139803"
  }
}
```

### No Action Required
Dashboard tab is fully implemented and production-ready.

---

## TAB 2: REVENUE - 🟡 50% COMPLETE

### Implementation Status
**🟡 Partial API Integration** - Time series charts working, metrics and breakdowns still using static data

### Current API Integration
**✅ Working (50%)**:
- TimeSeriesChart components using `useTimeSeriesData('revenue')` hook
- Revenue trend and change charts connected to API

**❌ Missing (50%)**:
- Revenue metrics still reading from `tabConfigs.json` (lines 27-101)
- Breakdown charts using `mockData.js` imports (lines 126-187)

### Required MetricIDs

#### ✅ Currently Defined
```javascript
const REVENUE_METRIC_IDS = [
  'total_revenue',        // ✅ Supported by mock server
  'rewarded_amount',      // ✅ Supported by mock server  
  'redeemed_amount',      // ✅ Supported by mock server
  'revenue_per_day'       // ✅ Supported by mock server
];
```

#### ❌ Missing from API Schema
```javascript
// Add to apiSchema.js:
'revenue_by_shopping_interests',  // Breakdown by SHOPINT1-15
'revenue_by_channel',            // Physical vs E-commerce split
'avg_daily_revenue',             // Used in tabConfigs.json
'go_for_more_revenue',           // Go For More specific metrics
'go_for_more_rewarded',          // Points/cashback rewarded
'go_for_more_redeemed'           // Points/cashback redeemed
```

### Required Request Samples

#### 1. Revenue Breakdown by Shopping Interests
**File**: `api_samples/revenue_breakdown_interests.json`
```json
{
  "header": {
    "ID": "analytics-1736003234567",
    "application": "merchant-insights-ui"
  },
  "payload": {
    "userID": "BANK\\test",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31", 
    "providerId": "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
    "metricIDs": ["revenue_by_shopping_interests"],
    "metricParameters": {
      "groupBy": "shopping_interest",
      "includeCompetition": true
    },
    "filterValues": [],
    "merchantId": "test-merchant"
  }
}
```

**Expected Response:**
```json
{
  "payload": {
    "metrics": [
      {
        "metricID": "revenue_by_shopping_interests",
        "seriesValues": [{
          "seriesID": "revenue",
          "seriesPoints": [
            {"value1": "125000.50", "value2": "SHOPINT1"},
            {"value1": "98000.25", "value2": "SHOPINT2"},
            {"value1": "87500.75", "value2": "SHOPINT3"}
          ]
        }],
        "merchantId": "ATTICA"
      },
      {
        "metricID": "revenue_by_shopping_interests", 
        "seriesValues": [{
          "seriesID": "revenue",
          "seriesPoints": [
            {"value1": "156000.75", "value2": "SHOPINT1"},
            {"value1": "120000.50", "value2": "SHOPINT2"}
          ]
        }],
        "merchantId": "competition"
      }
    ]
  }
}
```

#### 2. Revenue Breakdown by Channel
**File**: `api_samples/revenue_breakdown_channel.json`
```json
{
  "payload": {
    "metricIDs": ["revenue_by_channel"],
    "metricParameters": {
      "channels": ["physical", "ecommerce"],
      "includeCompetition": true
    }
  }
}
```

**Expected Response:**
```json
{
  "payload": {
    "metrics": [
      {
        "metricID": "revenue_by_channel",
        "seriesValues": [{
          "seriesID": "revenue", 
          "seriesPoints": [
            {"value1": "65.0", "value2": "physical"},
            {"value1": "35.0", "value2": "ecommerce"}
          ]
        }],
        "merchantId": "ATTICA"
      }
    ]
  }
}
```

### Implementation Required

#### **High Priority (4-6 hours)**:
1. **Add `useRevenueData()` hook call** to Revenue.jsx component (line 27)
2. **Create revenue transformation function** in `src/services/transformations/revenueTransform.js`
3. **Replace tabConfigs.json usage** with API data for metrics

#### **Medium Priority (4-6 hours)**:
1. **Implement `revenue_by_shopping_interests`** API endpoint in mock server
2. **Implement `revenue_by_channel`** API endpoint in mock server
3. **Create breakdown data hooks** and integration

#### **Low Priority (2-3 hours)**:
1. **Enhance mock server** with breakdown metrics generation
2. **Add Go For More specific** API metrics
3. **Update API schema** with new metric definitions

---

## TAB 3: DEMOGRAPHICS - 🟡 70% COMPLETE

### Implementation Status
**🟡 Mostly API Integrated** - Chart breakdowns working, customer count metrics missing

### Current API Integration
**✅ Working (70%)**:
- Gender breakdown chart (`converted_customers_by_gender`)
- Age group breakdown chart (`converted_customers_by_age`) 
- Shopping interests breakdown chart (`converted_customers_by_interest`)

**❌ Missing (30%)**:
- 6 customer count metrics using `tabConfigs.json` (lines 25-57)
- Shopping frequency chart using `mockData.demographicsData` (lines 114-126)

### Required MetricIDs

#### ✅ Currently Defined
```javascript
const DEMOGRAPHICS_METRIC_IDS = [
  'converted_customers_by_age',      // ✅ Working
  'converted_customers_by_gender',   // ✅ Working
  'converted_customers_by_interest'  // ✅ Working
];
```

#### ❌ Missing from API Schema
```javascript
// Customer Count/Segmentation Metrics - Add to apiSchema.js:
'total_customers',           // Total customer count
'new_customers',             // Customers who haven't made transaction in previous year
'returning_customers',       // Customers who have made transaction in previous year
'top_spenders',             // Customers in top 20% of spending
'loyal_customers',          // Customers with regular purchases (RFM scoring)
'at_risk_customers',        // Customers with high past activity but recent inactivity

// Customer Behavior Analytics:
'customers_by_frequency',    // Shopping frequency breakdown (1, 2, 3, 4-10, 10+ transactions)
'customers_by_geographic',   // Geographic customer distribution
'customer_lifetime_value',   // CLV analysis
'customer_retention_rate'    // Retention metrics
```

### Required Request Samples

#### 1. Customer Count Metrics
**File**: `api_samples/demographics_customer_metrics.json`
```json
{
  "header": {
    "ID": "analytics-demographics-metrics",
    "application": "merchant-insights-ui"
  },
  "payload": {
    "userID": "BANK\\test",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31", 
    "providerId": "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
    "metricIDs": [
      "total_customers",
      "new_customers",
      "returning_customers", 
      "top_spenders",
      "loyal_customers",
      "at_risk_customers"
    ],
    "filterValues": [],
    "merchantId": "test-merchant"
  }
}
```

**Expected Response:**
```json
{
  "payload": {
    "metrics": [
      {
        "metricID": "total_customers",
        "percentageValue": false,
        "scalarValue": "12456",
        "seriesValues": null,
        "merchantId": "ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ"
      },
      {
        "metricID": "new_customers", 
        "percentageValue": false,
        "scalarValue": "2345",
        "seriesValues": null,
        "merchantId": "ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ"
      },
      {
        "metricID": "returning_customers",
        "percentageValue": false, 
        "scalarValue": "8765",
        "seriesValues": null,
        "merchantId": "ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ"
      }
    ]
  }
}
```

#### 2. Customer Frequency Behavior
**File**: `api_samples/demographics_frequency_analysis.json`
```json
{
  "payload": {
    "metricIDs": ["customers_by_frequency"],
    "filterValues": [],
    "merchantId": "test-merchant"
  }
}
```

**Expected Response:**
```json
{
  "payload": {
    "metrics": [
      {
        "metricID": "customers_by_frequency",
        "seriesValues": [
          {
            "seriesID": "customers",
            "seriesPoints": [
              { "value1": "3120", "value2": "1_transaction" },
              { "value1": "2491", "value2": "2_transactions" },
              { "value1": "1868", "value2": "3_transactions" },
              { "value1": "3737", "value2": "4_to_10_transactions" },
              { "value1": "1246", "value2": "10_plus_transactions" }
            ]
          }
        ],
        "merchantId": "ΓΕΝΙΚΗ ΕΜΠΟΡΙΚΗ ΑΕ"
      },
      {
        "metricID": "customers_by_frequency", 
        "seriesValues": [
          {
            "seriesID": "customers",
            "seriesPoints": [
              { "value1": "7800", "value2": "1_transaction" },
              { "value1": "5720", "value2": "2_transactions" }
            ]
          }
        ],
        "merchantId": "competition"
      }
    ]
  }
}
```

### Implementation Required

#### **Phase 1: Customer Metrics API Integration**
1. **Add Missing MetricIDs** to `src/data/apiSchema.js`
2. **Update DEMOGRAPHICS_METRIC_IDS** in `src/hooks/useTabData.js`:
```javascript
const DEMOGRAPHICS_METRIC_IDS = [
  // Existing (working)
  'converted_customers_by_age',
  'converted_customers_by_gender', 
  'converted_customers_by_interest',
  // Add customer count metrics
  'total_customers', 'new_customers', 'returning_customers',
  'top_spenders', 'loyal_customers', 'at_risk_customers',
  // Add customer behavior
  'customers_by_frequency'
];
```

#### **Phase 2: Component Integration**
1. **Remove Static Data Dependencies** from Demographics.jsx lines 25-57
2. **Connect Customer Metrics to API** - Replace static config with Redux data
3. **Replace Mock Shopping Frequency** with API data
4. **Add Demographics Transformation** function

---

## TAB 4: COMPETITION - 🔴 0% COMPLETE

### Implementation Status
**🔴 No API Integration** - All components using static mock data

### Current Data Sources
- `competitionMetrics` from mockData.js (static comparison data)
- `weeklyTurnoverData` from mockData.js (weekly percentage changes)
- Generated mock data in UniversalCalendarHeatmap component

### Required Competition-Specific MetricIDs

#### ❌ All Missing from API Schema
```javascript
// Add to apiSchema.js:
'weekly_turnover_comparison',    // Week-over-week percentage changes
'daily_revenue_comparison',      // Daily revenue for calendar heatmap
'monthly_revenue_comparison',    // Monthly aggregations

// Enhanced existing metrics with competition data:
'total_revenue',                 // With competition comparison and YoY changes
'total_transactions',            // With competition comparison and YoY changes
'avg_ticket_per_user'           // With competition comparison and YoY changes
```

### Required Request Samples

#### 1. Competition Metrics with Year-over-Year Analysis
**File**: `api_samples/competition_metrics.json`
```json
{
  "header": {
    "ID": "competition-metrics-001",
    "application": "merchant-insights"
  },
  "payload": {
    "userID": "BANK\\merchant_user",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "providerId": "provider-uuid",
    "metricIDs": [
      "total_revenue",
      "total_transactions", 
      "avg_ticket_per_user"
    ],
    "filterValues": [
      { "providerId": "uuid", "filterId": "gender", "value": "[\"f\"]" }
    ],
    "merchantId": "ATTICA",
    "includeComparison": true,
    "comparisonType": "year_over_year"
  }
}
```

**Expected Response:**
```json
{
  "payload": {
    "analyticsData": [
      {
        "metricID": "total_revenue",
        "merchantId": "ATTICA",
        "scalarValue": {
          "value": "12.5",           // Merchant YoY change %
          "comparisonValue": "-15.9", // Merchant vs competition %
          "competitorChange": "5.8"   // Competition YoY change %
        }
      }
    ]
  }
}
```

#### 2. Weekly Turnover Analysis
**File**: `api_samples/competition_weekly_analysis.json`
```json
{
  "payload": {
    "metricIDs": ["weekly_turnover_comparison"],
    "aggregation": "weekly",
    "comparisonType": "year_over_year",
    "includeComparison": true
  }
}
```

**Expected Response:**
```json
{
  "payload": {
    "analyticsData": [
      {
        "metricID": "weekly_turnover_comparison",
        "seriesValues": [
          {
            "seriesID": "merchant_weekly",
            "seriesPoints": [
              { "x": "2024-01-01", "y": "5.2" },
              { "x": "2024-01-08", "y": "7.8" }
            ]
          },
          {
            "seriesID": "competition_weekly", 
            "seriesPoints": [
              { "x": "2024-01-01", "y": "3.8" },
              { "x": "2024-01-08", "y": "5.2" }
            ]
          }
        ]
      }
    ]
  }
}
```

#### 3. Calendar Heatmap Data
**File**: `api_samples/competition_heatmap.json`
```json
{
  "payload": {
    "metricIDs": ["daily_revenue_comparison"],
    "aggregation": "daily",
    "includeComparison": true
  }
}
```

**Expected Response:**
```json
{
  "payload": {
    "analyticsData": [
      {
        "metricID": "daily_revenue_comparison",
        "seriesValues": [
          {
            "seriesID": "merchant_daily",
            "seriesPoints": [
              { "x": "2024-01-01", "y": "8543.21" },
              { "x": "2024-01-02", "y": "7234.12" }
            ]
          },
          {
            "seriesID": "competition_daily",
            "seriesPoints": [
              { "x": "2024-01-01", "y": "9876.54" },
              { "x": "2024-01-02", "y": "8765.43" }
            ]
          }
        ]
      }
    ]
  }
}
```

### Competition-Specific Requirements

#### **Key Differences from Standard Metrics:**
1. **Dual Data Generation**: Every request generates both merchant and competition data
2. **Sector Comparison**: Competition data represents sector averages, not individual competitors
3. **Consistent Filtering**: Same filters applied to both datasets
4. **Triple Percentage Calculations**:
   - Merchant change vs last year
   - Competition change vs last year  
   - Merchant performance vs competition
5. **Calendar Aggregations**: Daily data aggregated for both merchant and competition

### Implementation Required

#### **Phase 1: API Schema Enhancement**
1. **Add Competition MetricIDs** to `src/data/apiSchema.js`
2. **Create Competition Data Generator** in mock server
3. **Implement Percentage Change Calculations**

#### **Phase 2: Component Integration**
1. **Replace Mock Data Imports** in Competition.jsx
2. **Connect to Redux State** via `useCompetitionData()` hook
3. **Create Competition Transformation** function

#### **Phase 3: Advanced Features**
1. **Week-over-week calculations** for timeline chart
2. **Calendar heatmap aggregation** logic
3. **Filter application** to competition datasets

---

## CRITICAL MISSING ELEMENTS SUMMARY

### **Missing API MetricIDs (Must Add to Schema)**
```javascript
// Revenue Tab
'revenue_by_shopping_interests',
'revenue_by_channel',
'go_for_more_revenue',
'go_for_more_rewarded',
'go_for_more_redeemed',

// Demographics Tab  
'total_customers',
'new_customers', 
'returning_customers',
'top_spenders',
'loyal_customers',
'at_risk_customers',
'customers_by_frequency',

// Competition Tab
'weekly_turnover_comparison',
'daily_revenue_comparison'
```

### **Missing Request/Response Samples**
1. **`api_samples/revenue_breakdown_interests.json`** + response
2. **`api_samples/revenue_breakdown_channel.json`** + response
3. **`api_samples/demographics_customer_metrics.json`** + response
4. **`api_samples/demographics_frequency_analysis.json`** + response
5. **`api_samples/competition_metrics.json`** + response
6. **`api_samples/competition_weekly_analysis.json`** + response
7. **`api_samples/competition_heatmap.json`** + response

### **Missing Transformation Functions**
1. **`src/services/transformations/revenueTransform.js`** (placeholder exists)
2. **`src/services/transformations/demographicsTransform.js`** (placeholder exists)
3. **`src/services/transformations/competitionTransform.js`** (placeholder exists)

### **Implementation Priority**
1. **High Priority**: Revenue tab completion (business critical metrics)
2. **Medium Priority**: Demographics customer metrics (user engagement insights)
3. **Medium Priority**: Competition analysis (competitive intelligence)

## CONCLUSION

The Dashboard tab serves as the gold standard implementation pattern. The remaining tabs need:
- **12 new MetricIDs** added to API schema
- **7 request/response sample files** created
- **3 transformation functions** implemented
- **Component integration** to replace static data sources

Total estimated effort: **16-20 hours** to complete full API integration across all tabs.