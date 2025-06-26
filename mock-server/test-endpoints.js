// Use global fetch (available in Node 18+) or import fetch
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name} - Status: ${response.status}`);
      console.log(`📊 Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ ${name} - Status: ${response.status}`);
      console.log(`📊 Error:`, JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Mock Server Tests...');
  console.log(`🌐 Base URL: ${BASE_URL}`);

  // Test health endpoint
  await testEndpoint('Health Check', `${BASE_URL}/health`);

  // Test analytics status
  await testEndpoint('Analytics Status', `${BASE_URL}/ANALYTICS/STATUS`);

  // Test analytics query with basic metrics
  await testEndpoint('Analytics Query - Basic Metrics', `${BASE_URL}/ANALYTICS/QUERY`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      header: {
        ID: "test-request-id",
        application: "test-application"
      },
      payload: {
        userID: "BANK\\TEST",
        startDate: "2025-01-01",
        endDate: "2025-01-15",
        providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
        metricIDs: ["total_revenue", "total_transactions", "avg_ticket_per_user"],
        filterValues: [],
        merchantId: "52ba3854-a5d4-47bd-9d1a-b789ae139803"
      }
    })
  });

  // Test analytics query with time series
  await testEndpoint('Analytics Query - Time Series', `${BASE_URL}/ANALYTICS/QUERY`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      header: {
        ID: "test-request-id-2",
        application: "test-application"
      },
      payload: {
        userID: "BANK\\TEST",
        startDate: "2025-01-01",
        endDate: "2025-01-15",
        providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
        metricIDs: ["revenue_per_day"],
        filterValues: [],
        merchantId: "52ba3854-a5d4-47bd-9d1a-b789ae139803"
      }
    })
  });

  // Test analytics query with competition comparison
  await testEndpoint('Analytics Query - Competition Comparison', `${BASE_URL}/ANALYTICS/QUERY`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      header: {
        ID: "test-request-id-3",
        application: "test-application"
      },
      payload: {
        userID: "BANK\\TEST",
        startDate: "2025-01-01",
        endDate: "2025-01-15",
        providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
        metricIDs: ["total_revenue"],
        filterValues: [
          {
            providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
            filterId: "data_origin",
            value: "competition_comparison"
          }
        ],
        merchantId: "52ba3854-a5d4-47bd-9d1a-b789ae139803"
      }
    })
  });

  // Test authorization endpoint
  await testEndpoint('Authorization Check', `${BASE_URL}/AUTHORIZATION/CHECKUSERSTATUS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payload: {
        userID: "BANK\\TEST"
      }
    })
  });

  // Test configuration endpoints
  await testEndpoint('Admin Configuration', `${BASE_URL}/CONFIGURATION/ADMIN/GET`);
  await testEndpoint('Merchant Configuration', `${BASE_URL}/CONFIGURATION/MERCHANT/GET`);

  console.log('\n🏁 Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };