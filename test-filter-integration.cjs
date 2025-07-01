/**
 * Test Filter Integration
 * This script tests the filter integration by making requests to the mock server
 */

const fetch = require('cross-fetch');

const MOCK_SERVER_URL = 'http://localhost:3001';

async function testFilterIntegration() {
  console.log('🧪 Testing Filter Integration...\n');

  // Test 1: No filters (baseline)
  console.log('1️⃣ Testing baseline request (no filters)...');
  const baselineRequest = {
    header: { ID: "test-baseline", application: "test" },
    payload: {
      userID: "BANK\\test",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
      metricIDs: ["converted_customers_by_gender", "total_transactions"],
      filterValues: []
    }
  };

  try {
    const baselineResponse = await fetch(`${MOCK_SERVER_URL}/ANALYTICS/QUERY`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(baselineRequest)
    });
    
    const baselineData = await baselineResponse.json();
    console.log('✅ Baseline request successful');
    
    const baselineGenderData = baselineData.payload.metrics.find(m => 
      m.metricID === 'converted_customers_by_gender' && m.merchantId !== 'competition'
    );
    
    if (baselineGenderData && baselineGenderData.seriesValues) {
      console.log('📊 Baseline gender data:', 
        baselineGenderData.seriesValues[0].seriesPoints.map(p => `${p.value2}: ${p.value1}`).join(', ')
      );
    }

    // Test 2: With gender filter
    console.log('\n2️⃣ Testing gender filter (female only)...');
    const genderFilterRequest = {
      ...baselineRequest,
      payload: {
        ...baselineRequest.payload,
        filterValues: [
          {
            providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
            filterId: "gender",
            value: "[\"f\"]"
          }
        ]
      }
    };

    const genderResponse = await fetch(`${MOCK_SERVER_URL}/ANALYTICS/QUERY`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genderFilterRequest)
    });
    
    const genderData = await genderResponse.json();
    console.log('✅ Gender filter request successful');
    
    const filteredGenderData = genderData.payload.metrics.find(m => 
      m.metricID === 'converted_customers_by_gender' && m.merchantId !== 'competition'
    );
    
    if (filteredGenderData && filteredGenderData.seriesValues) {
      console.log('📊 Filtered gender data:', 
        filteredGenderData.seriesValues[0].seriesPoints.map(p => `${p.value2}: ${p.value1}`).join(', ')
      );
      
      // Verify only female data is returned
      const hasOnlyFemale = filteredGenderData.seriesValues[0].seriesPoints.every(p => p.value2 === 'f');
      console.log(hasOnlyFemale ? '✅ Filter applied correctly - only female data returned' : '❌ Filter not applied - multiple genders found');
    }

    // Test 3: Multiple filters
    console.log('\n3️⃣ Testing multiple filters (female + shopping interests)...');
    const multiFilterRequest = {
      ...baselineRequest,
      payload: {
        ...baselineRequest.payload,
        metricIDs: ["converted_customers_by_interest", "total_transactions"],
        filterValues: [
          {
            providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
            filterId: "gender",
            value: "[\"f\"]"
          },
          {
            providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
            filterId: "shopping_interests",
            value: "[\"SHOPINT1\", \"SHOPINT3\"]"
          }
        ]
      }
    };

    const multiResponse = await fetch(`${MOCK_SERVER_URL}/ANALYTICS/QUERY`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(multiFilterRequest)
    });
    
    const multiData = await multiResponse.json();
    console.log('✅ Multiple filters request successful');
    
    const filteredInterestData = multiData.payload.metrics.find(m => 
      m.metricID === 'converted_customers_by_interest' && m.merchantId !== 'competition'
    );
    
    if (filteredInterestData && filteredInterestData.seriesValues) {
      const interests = filteredInterestData.seriesValues[0].seriesPoints.map(p => p.value2);
      console.log('📊 Filtered interests:', interests.join(', '));
      
      const hasOnlySelectedInterests = interests.every(interest => 
        ['SHOPINT1', 'SHOPINT3', '', 'other_category'].includes(interest)
      );
      console.log(hasOnlySelectedInterests ? '✅ Interest filter applied correctly' : '❌ Interest filter not applied properly');
    }

    console.log('\n🎉 Filter integration tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if fetch is available (for environments without it)
if (typeof fetch === 'undefined') {
  console.log('Installing cross-fetch...');
  require('child_process').execSync('npm install cross-fetch', { stdio: 'inherit' });
  console.log('Please run the test again.');
} else {
  testFilterIntegration();
}