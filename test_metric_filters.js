/**
 * Test Script for Metric-Specific Filters
 * Run this to verify the implementation is working correctly
 */

import { 
  getMetricFiltersForContext, 
  validateMetricFilters, 
  convertMetricFiltersToAPI 
} from './src/data/metricFilters.js';

console.log('🧪 Testing Metric-Specific Filters Implementation\n');

// Test 1: Revenue context
console.log('📊 Test 1: Revenue Tab Context');
const revenueFilters = getMetricFiltersForContext('converted_customers_by_interest', 'revenue');
console.log('Revenue context filters:', revenueFilters);
console.log('Expected: { interest_type: "revenue" }\n');

// Test 2: Demographics context
console.log('👥 Test 2: Demographics Tab Context');
const demographicsFilters = getMetricFiltersForContext('converted_customers_by_interest', 'demographics');
console.log('Demographics context filters:', demographicsFilters);
console.log('Expected: { interest_type: "customers" }\n');

// Test 3: Validation
console.log('✅ Test 3: Filter Validation');
const validationResult = validateMetricFilters('converted_customers_by_interest', { interest_type: 'revenue' });
console.log('Validation result:', validationResult);
console.log('Expected: { valid: true }\n');

// Test 4: Invalid validation
console.log('❌ Test 4: Invalid Filter Validation');
const invalidValidation = validateMetricFilters('converted_customers_by_interest', { interest_type: 'invalid' });
console.log('Invalid validation result:', invalidValidation);
console.log('Expected: { valid: false, error: "..." }\n');

// Test 5: API conversion
console.log('🔄 Test 5: API Format Conversion');
const apiFilters = convertMetricFiltersToAPI({
  'converted_customers_by_interest': { interest_type: 'revenue' }
});
console.log('API format filters:', apiFilters);
console.log('Expected: [{ providerId: "...", filterId: "interest_type", value: "revenue" }]\n');

// Test 6: Unknown metric
console.log('❓ Test 6: Unknown Metric');
const unknownMetric = getMetricFiltersForContext('unknown_metric', 'revenue');
console.log('Unknown metric filters:', unknownMetric);
console.log('Expected: {}\n');

console.log('✅ Metric-specific filters test completed!');
console.log('\nTo test in browser:');
console.log('1. Open Developer Console');
console.log('2. Navigate to Revenue tab');
console.log('3. Look for: "🎯 Auto-generated metric-specific filters"');
console.log('4. Should see: interest_type: "revenue"');
console.log('\nTo test Demographics tab:');
console.log('1. Navigate to Demographics tab'); 
console.log('2. Should see: interest_type: "customers"');