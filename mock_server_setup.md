# Mock Server Setup Instructions

## Overview
This document provides step-by-step instructions for setting up a dedicated mock server to replace the current inline mock logic in the analytics service. The mock server will provide realistic API responses matching the production API structure.

## Current State Analysis

### Existing Mock Implementation
- **Location**: `src/services/analyticsService.js` (Lines 74-423)
- **Toggle**: Hard-coded `USE_REAL_API: false` flag (Line 22)
- **Data Generation**: Comprehensive mock data generation for all metric types
- **Legacy Mock Data**: `src/data/mockData.js` (still used by some components)

### Problems with Current Approach
1. **Inline Logic**: Mock logic mixed with real API service code
2. **Hard-coded Toggle**: No environment-based switching
3. **Component Inconsistency**: Some components use service, others use legacy mock data
4. **Maintenance Overhead**: Mock logic embedded in production code

## Mock Server Architecture

### Recommended Technology Stack
- **Framework**: Express.js with JSON Server or MSW (Mock Service Worker)
- **Port**: 3001 (to avoid conflict with main app on 3000)
- **Data**: JSON files with realistic metric responses
- **Middleware**: CORS, logging, request validation

### Server Structure
```
mock-server/
├── package.json
├── server.js
├── routes/
│   ├── analytics.js
│   ├── authorization.js
│   └── configuration.js
├── data/
│   ├── metrics/
│   │   ├── loyalty.json
│   │   ├── transactions.json
│   │   ├── timeSeries.json
│   │   └── demographics.json
│   └── responses/
│       ├── analytics-responses.json
│       └── auth-responses.json
├── middleware/
│   ├── cors.js
│   ├── logger.js
│   └── validator.js
└── utils/
    ├── dataGenerator.js
    └── responseBuilder.js
```

## Implementation Steps

### Step 1: Create Mock Server Project

```bash
# Create mock server directory
mkdir mock-server
cd mock-server

# Initialize npm project
npm init -y

# Install dependencies
npm install express cors morgan helmet express-rate-limit
npm install --save-dev nodemon concurrently
```

### Step 2: Create Server Configuration

**File**: `mock-server/package.json`
```json
{
  "name": "merchant-insights-mock-server",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test-endpoints.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "concurrently": "^8.2.2"
  }
}
```

### Step 3: Create Main Server File

**File**: `mock-server/server.js`
```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/authorization');
const configRoutes = require('./routes/configuration');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add delay to simulate real API
app.use((req, res, next) => {
  const delay = Math.random() * 1000 + 500; // 500-1500ms delay
  setTimeout(next, delay);
});

// Routes
app.use('/ANALYTICS', analyticsRoutes);
app.use('/AUTHORIZATION', authRoutes);
app.use('/CONFIGURATION', configRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    exception: {
      message: 'Internal server error',
      code: 'MOCK_SERVER_ERROR'
    },
    executionTime: Math.random() * 1000
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    exception: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
```

### Step 4: Create Analytics Route Handler

**File**: `mock-server/routes/analytics.js`
```javascript
const express = require('express');
const router = express.Router();
const { generateMetricResponse } = require('../utils/dataGenerator');
const { buildResponse } = require('../utils/responseBuilder');

// POST /ANALYTICS/QUERY
router.post('/QUERY', (req, res) => {
  try {
    const { payload } = req.body;
    const { metricIDs, filterValues, startDate, endDate, merchantId } = payload;

    // Validate request
    if (!metricIDs || !Array.isArray(metricIDs) || metricIDs.length === 0) {
      return res.status(400).json({
        exception: {
          message: 'metricIDs is required and must be a non-empty array',
          code: 'INVALID_REQUEST'
        }
      });
    }

    // Generate metrics data
    const metrics = metricIDs.map(metricID => 
      generateMetricResponse(metricID, {
        filterValues,
        startDate,
        endDate,
        merchantId
      })
    );

    // Build response
    const response = buildResponse({
      metrics,
      executionTime: Math.random() * 2000 + 500
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Analytics query error:', error);
    res.status(500).json({
      exception: {
        message: 'Failed to process analytics query',
        code: 'PROCESSING_ERROR'
      },
      executionTime: Math.random() * 1000
    });
  }
});

module.exports = router;
```

### Step 5: Create Data Generation Utilities

**File**: `mock-server/utils/dataGenerator.js`
```javascript
const { METRIC_IDS } = require('../data/constants');

function generateMetricResponse(metricID, options = {}) {
  const { startDate, endDate, merchantId } = options;
  
  // Base metric structure
  const baseMetric = {
    metricID,
    percentageValue: false,
    scalarValue: null,
    seriesValues: null,
    merchantId: merchantId === 'competition' ? 'competition' : 'ATTICA'
  };

  // Generate data based on metric type
  switch (metricID) {
    case 'total_revenue':
      return {
        ...baseMetric,
        scalarValue: (Math.random() * 2000000 + 1000000).toFixed(2)
      };
      
    case 'total_transactions':
      return {
        ...baseMetric,
        scalarValue: Math.floor(Math.random() * 50000 + 20000).toString()
      };
      
    case 'avg_ticket_per_user':
      return {
        ...baseMetric,
        scalarValue: (Math.random() * 100 + 30).toFixed(2)
      };
      
    case 'revenue_per_day':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'revenue',
          seriesPoints: generateDailyPoints(startDate, endDate, 'revenue')
        }]
      };
      
    case 'transactions_per_day':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'transactions',
          seriesPoints: generateDailyPoints(startDate, endDate, 'transactions')
        }]
      };
      
    case 'customers_per_day':
      return {
        ...baseMetric,
        seriesValues: [{
          seriesID: 'customers',
          seriesPoints: generateDailyPoints(startDate, endDate, 'customers')
        }]
      };
      
    default:
      return {
        ...baseMetric,
        scalarValue: (Math.random() * 1000).toFixed(2)
      };
  }
}

function generateDailyPoints(startDate, endDate, type) {
  const points = [];
  const start = new Date(startDate || '2025-01-01');
  const end = new Date(endDate || '2025-01-31');
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    let value;
    
    switch (type) {
      case 'revenue':
        value = (Math.random() * 150000 + 50000).toFixed(2);
        break;
      case 'transactions':
        value = Math.floor(Math.random() * 1000 + 100).toString();
        break;
      case 'customers':
        value = Math.floor(Math.random() * 500 + 50).toString();
        break;
      default:
        value = Math.random() * 1000;
    }
    
    points.push({
      value1: value,
      value2: dateStr
    });
  }
  
  return points;
}

module.exports = {
  generateMetricResponse,
  generateDailyPoints
};
```

### Step 6: Update Main Application Configuration

**File**: `.env.local` (create in project root)
```env
# API Configuration
VITE_USE_MOCK_SERVER=true
VITE_MOCK_SERVER_URL=http://localhost:3001
VITE_API_BASE_URL=https://production-api.example.com

# Development flags
VITE_DEBUG_API=true
```

**File**: `.env.production` (create in project root)
```env
# Production API Configuration
VITE_USE_MOCK_SERVER=false
VITE_API_BASE_URL=https://production-api.example.com
VITE_DEBUG_API=false
```

### Step 7: Update Analytics Service

**File**: `src/services/analyticsService.js` (Replace existing configuration)
```javascript
// Remove lines 20-25 and replace with:
const API_CONFIG = {
  USE_MOCK_SERVER: import.meta.env.VITE_USE_MOCK_SERVER === 'true',
  MOCK_SERVER_URL: import.meta.env.VITE_MOCK_SERVER_URL || 'http://localhost:3001',
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  TIMEOUT: 30000,
  DEBUG: import.meta.env.VITE_DEBUG_API === 'true'
};

// Update the URL building logic:
const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.USE_MOCK_SERVER 
    ? API_CONFIG.MOCK_SERVER_URL 
    : API_CONFIG.BASE_URL;
  return `${baseUrl}${endpoint}`;
};
```

### Step 8: Update Package.json Scripts

**File**: `package.json` (main project)
```json
{
  "scripts": {
    "dev": "concurrently \"npm run mock-server\" \"vite\"",
    "dev:app-only": "vite",
    "dev:api-only": "cd mock-server && npm run dev",
    "mock-server": "cd mock-server && npm run dev",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Usage Instructions

### Development with Mock Server

1. **Start both services**:
   ```bash
   npm run dev
   ```
   This starts both the mock server (port 3001) and the main app (port 3000).

2. **Start only the app** (if mock server is already running):
   ```bash
   npm run dev:app-only
   ```

3. **Start only mock server**:
   ```bash
   npm run mock-server
   ```

### Production with Real API

1. **Set environment variables**:
   ```bash
   export VITE_USE_MOCK_SERVER=false
   export VITE_API_BASE_URL=https://your-production-api.com
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   npm run preview
   ```

## Code Cleanup Tasks

### Remove Existing Mock Logic

1. **Remove from analyticsService.js**:
   - Lines 74-423 (entire `_mockResponse` and `_generateMetricData` methods)
   - Update `queryAnalytics` method to only call real API or mock server

2. **Deprecate mockData.js**:
   - Move file to `src/data/legacy/mockData.js`
   - Update components to use `analyticsService` instead

3. **Update Component Imports**:
   - Replace direct mock data imports with service calls
   - Migrate components from static data to API service

### Environment Configuration

1. **Create environment files** (`.env.local`, `.env.production`)
2. **Update Vite configuration** for environment variable handling
3. **Add environment validation** in service initialization

## Testing the Mock Server

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test analytics query
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

### Automated Testing
Create test script in `mock-server/test-endpoints.js` to validate all endpoints return expected response formats.

## Benefits of This Approach

1. **Clean Separation**: Mock logic completely separated from production code
2. **Environment-Driven**: Easy switching between mock and real APIs
3. **Realistic Testing**: Mock server provides network delays and realistic responses
4. **Development Speed**: No dependency on backend availability
5. **Team Collaboration**: Frontend and backend teams can work independently
6. **Production Ready**: Clean production builds without mock code

## Next Steps

1. Implement the mock server following these instructions
2. Remove inline mock logic from the analytics service
3. Update components to use the analytics service
4. Test the full flow with both mock server and real API configurations
5. Document API endpoint specifications for backend team alignment