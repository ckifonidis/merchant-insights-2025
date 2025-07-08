# CLAUDE.md - Mock Server Guide

## PROJECT OVERVIEW
**Mock Server for NBG Merchant Insights Dashboard**
- **Purpose:** Development API server providing realistic data for frontend testing
- **Tech Stack:** Node.js + Express.js with filter-aware data generation
- **Port:** 3001 (runs alongside main app on port 5174)
- **Features:** Filter integration, realistic delays, comprehensive endpoint coverage

## CURRENT STATUS

### ✅ COMPLETED IMPLEMENTATION (100%)
1. **Core Server Infrastructure** - Express.js with security middleware, CORS, rate limiting
2. **Analytics Endpoint** - Full ANALYTICS/QUERY implementation with filter support
3. **Filter Integration** - Complete filter-aware data generation system
4. **API Compatibility** - Matches production API response format exactly
5. **Development Integration** - Seamlessly integrated with main application workflow

## ARCHITECTURE

### Server Structure
```
mock-server/
├── package.json              # Node.js dependencies and scripts
├── server.js                 # Main Express server with middleware
├── routes/
│   ├── analytics.js          # ✅ ANALYTICS/QUERY endpoint
│   ├── authorization.js      # Auth endpoints (placeholder)
│   └── configuration.js      # Config endpoints (placeholder)
├── utils/
│   ├── dataGenerator.js      # Core metric data generation
│   ├── filterAwareDataGenerator.js  # ✅ Filter-aware data processing
│   └── responseBuilder.js    # API response formatting
└── test-endpoints.js         # Endpoint testing utilities
```

### Key Features

#### **1. Filter-Aware Data Generation**
- **Real Filter Application**: Applies UI filters to generated data realistically
- **Data Reduction**: Simulates how filters reduce dataset size
- **Insufficient Data Handling**: Returns appropriate responses for highly filtered data
- **Competition Data**: Generates comparison data using same filters

#### **2. Production API Compatibility**
- **Request Format**: Matches exact production API request structure
- **Response Format**: Returns data in identical format to production API
- **Error Handling**: Realistic error responses with proper HTTP status codes
- **Execution Time**: Includes simulated processing time in responses

#### **3. Development Integration**
- **Auto-start**: Runs automatically with `npm run dev` command
- **Live Reload**: Restarts automatically on code changes with nodemon
- **CORS Enabled**: Configured for localhost development
- **Request Logging**: Detailed logging for debugging API calls

## FILTER INTEGRATION SYSTEM

### ✅ SUPPORTED FILTERS (All Implemented)
- **Gender**: Male/Female selection with API mapping (m/f)
- **Age Groups**: Generation-based filtering (Gen Z, Millennials, Gen X, Boomers, Silent)
- **Shopping Interests**: Multiple interest selection (SHOPINT1-15)
- **Geographic Location**: Municipality and region-based filtering
- **Channel**: Physical stores vs E-commerce
- **Date Range**: Integrated with timeline functionality
- **Go For More**: Loyalty program participation

### Filter Processing Flow
```
UI Filters → Filter Mapping Service → API Filters → Mock Server → Filtered Data
     ↓              ↓                      ↓             ↓              ↓
{gender:'female'} → [{filterId:'gender',   → Server      → Only Female  → Realistic
                    value:'["f"]'}]        Processing     Data Generated   Reduced Data
```

### API Request Structure
```json
{
  "header": {
    "ID": "unique-request-id",
    "application": "merchant-insights"
  },
  "payload": {
    "userID": "BANK\\username",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "providerId": "provider-uuid",
    "metricIDs": ["metric1", "metric2"],
    "filterValues": [
      { "providerId": "uuid", "filterId": "gender", "value": "[\"f\"]" }
    ],
    "merchantId": "ATTICA"
  }
}
```

### API Response Structure
```json
{
  "payload": {
    "metrics": [
      {
        "metricID": "total_revenue",
        "percentageValue": false,
        "scalarValue": "1234567.89",
        "seriesValues": null,
        "merchantId": "ATTICA"
      },
      {
        "metricID": "revenue_per_day",
        "percentageValue": false,
        "scalarValue": null,
        "seriesValues": [
          {
            "seriesID": "revenue",
            "seriesPoints": [
              { "value1": "60770.80", "value2": "2025-05-27" }
            ]
          }
        ],
        "merchantId": "ATTICA"
      }
    ]
  },
  "exception": null,
  "messages": null,
  "executionTime": 1234.5
}
```

## DEVELOPMENT WORKFLOW

### Setup and Running
```bash
# From project root - starts both mock server and main app
npm run dev

# Start only mock server
cd mock-server
npm start

# Start with live reload for development
cd mock-server
npm run dev
```

### Available Scripts
- `npm start` - Production server start
- `npm run dev` - Development server with nodemon auto-reload
- `npm test` - Run endpoint tests

### Environment Configuration
The mock server is automatically used when:
- `VITE_USE_MOCK_SERVER=true` (default in development)
- Server runs on port 3001
- Main app on port 5174 connects automatically

## SUPPORTED METRICS

### Dashboard Metrics
- `total_revenue` - Scalar merchant revenue with competition comparison
- `total_transactions` - Scalar transaction count with competition
- `avg_ticket_per_user` - Average transaction value
- `revenue_per_day` - Daily revenue time series with competition
- `transactions_per_day` - Daily transaction count time series
- `customers_per_day` - Daily unique customer count time series

### Revenue Metrics
- `avg_daily_revenue` - Average daily revenue with competition comparison
- `goformore_amount` - **Merchant-only** Go For More loyalty program total
- `rewarded_amount` - **Merchant-only** Total loyalty rewards issued
- `redeemed_amount` - **Merchant-only** Total loyalty rewards redeemed
- `rewarded_points` - **Merchant-only** Total points rewarded
- `redeemed_points` - **Merchant-only** Total points redeemed
- `converted_customers_by_interest` - Revenue breakdown by shopping interests
- `revenue_by_channel` - Revenue distribution by channel (physical vs e-commerce)

### Demographics Metrics
- `converted_customers_by_age` - Age group breakdown
- `converted_customers_by_gender` - Gender distribution
- `converted_customers_by_interest` - Shopping interest analysis

### Competition Metrics
- Same metrics as merchant with `merchantId: "competition"`
- Automatically generated with realistic competitive data
- Responds to same filters as merchant data
- **Exception**: Go For More metrics are merchant-only (no competition data generated)

## GO FOR MORE MERCHANT-ONLY IMPLEMENTATION

### Business Logic
Go For More is NBG's loyalty program and only applies to merchants, not competition. The mock server correctly implements this business rule:

#### **Merchant-Only Metrics**
- `goformore_amount` - Only returns merchant data
- `rewarded_amount` - Only returns merchant data  
- `redeemed_amount` - Only returns merchant data
- `rewarded_points` - Only returns merchant data
- `redeemed_points` - Only returns merchant data

#### **API Optimization**
```json
// Request with Go For More metrics
{
  "payload": {
    "metricIDs": ["total_revenue", "goformore_amount", "rewarded_amount"]
  }
}

// Response - Notice fewer metrics returned (4 instead of 6)
{
  "payload": {
    "metrics": [
      {"metricID": "total_revenue", "merchantId": "ATTICA"},
      {"metricID": "total_revenue", "merchantId": "competition"},
      {"metricID": "goformore_amount", "merchantId": "ATTICA"},
      {"metricID": "rewarded_amount", "merchantId": "ATTICA"}
    ]
  }
}
```

#### **Technical Implementation**
- Analytics route checks `merchantOnlyMetrics` array
- Skips competition data generation for Go For More metrics
- Reduces API response size and processing time
- Maintains filter integration for merchant data

## TESTING AND VALIDATION

### Endpoint Testing
```bash
# Health check
curl http://localhost:3001/health

# Analytics query test
curl -X POST http://localhost:3001/ANALYTICS/QUERY \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "metricIDs": ["total_revenue", "total_transactions"],
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    }
  }'
```

### Filter Testing
```bash
# Test gender filter
curl -X POST http://localhost:3001/ANALYTICS/QUERY \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "metricIDs": ["total_revenue"],
      "filterValues": [
        { "filterId": "gender", "value": "[\"f\"]" }
      ]
    }
  }'
```

## INTEGRATION WITH MAIN APPLICATION

### Data Flow
```
Main App → Analytics Service → Mock Server → Filter Processing → Data Generation → Response
    ↑                                                                                    ↓
Redux Store ← Data Transformation ← Service Layer ← JSON Response ← Filtered Data ←─────┘
```

### Key Integration Points
1. **Analytics Service** (`src/services/analyticsService.js`) - Makes HTTP requests
2. **Filter Mapping** (`src/services/filterMappingService.js`) - Converts UI filters to API format
3. **Data Hooks** (`src/hooks/useTabData.js`) - Manages API calls per tab
4. **Redux Store** (`src/store/slices/filtersSlice.js`) - Global filter state

## PERFORMANCE CHARACTERISTICS

### Response Times
- **Base Delay**: 500-1500ms random delay to simulate real API
- **Processing Time**: Realistic execution time included in responses
- **Rate Limiting**: 1000 requests per 15 minutes per IP

### Data Generation
- **Realistic Values**: Revenue ranges, transaction counts, customer numbers
- **Date Consistency**: Proper time series generation within date ranges
- **Filter Impact**: Realistic data reduction when filters applied
- **Competition Data**: Algorithmically generated competitive scenarios

## TROUBLESHOOTING

### Common Issues
1. **Port Conflicts**: Ensure port 3001 is available
2. **CORS Errors**: Server configured for localhost:5174 and 127.0.0.1:5174
3. **Filter Not Applied**: Check filter mapping service conversion
4. **Missing Data**: Verify metricIDs match supported metrics

### Debug Logging
Server provides detailed logging:
- 🔍 Request details with timestamps
- 📊 Payload analysis and metric processing
- ✅ Successful response generation
- ❌ Error conditions with stack traces

### Health Monitoring
- **Health Endpoint**: `GET /health` returns server status
- **Uptime Tracking**: Server uptime included in health response
- **Error Handling**: Graceful error responses with proper HTTP codes

## FUTURE ENHANCEMENTS

### Planned Improvements
1. **Real API Integration** - Replace mock server with production endpoints
2. **Advanced Filtering** - Additional filter types and combinations
3. **Data Persistence** - Optional data storage for consistent sessions
4. **Performance Metrics** - Enhanced monitoring and analytics

### Migration Path
- Mock server designed for easy removal
- Service layer abstracts API details
- Environment variables control API endpoint
- No breaking changes required for production deployment

## SUCCESS CRITERIA

✅ **Complete API Compatibility** - Matches production API exactly  
✅ **Filter Integration** - All UI filters properly applied to data  
✅ **Development Efficiency** - No dependency on backend availability  
✅ **Realistic Testing** - Data generation mirrors production scenarios  
✅ **Performance Simulation** - Network delays and processing times  
✅ **Error Handling** - Graceful failure scenarios and edge cases  

The mock server provides a complete development environment enabling frontend development without backend dependencies while ensuring seamless transition to production APIs.