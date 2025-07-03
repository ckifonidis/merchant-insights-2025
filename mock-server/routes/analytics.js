const express = require('express');
const router = express.Router();
const { 
  generateMetricResponse, 
  generateResponseWithBothMerchantAndCompetition,
  hasCompetitionFilter 
} = require('../utils/dataGenerator');
const { 
  generateFilterAwareMetric,
  parseFilterValues 
} = require('../utils/filterAwareDataGenerator');
const { buildSuccessResponse, buildErrorResponse } = require('../utils/responseBuilder');

// POST /ANALYTICS/QUERY
router.post('/QUERY', (req, res) => {
  try {
    console.log(`📊 Analytics query received:`, JSON.stringify(req.body, null, 2));
    
    const { header, payload } = req.body;
    
    if (!payload) {
      return res.status(400).json(
        buildErrorResponse('Request payload is required', 'INVALID_REQUEST')
      );
    }
    
    const { metricIDs, filterValues, startDate, endDate, merchantId } = payload;

    // Validate request
    if (!metricIDs || !Array.isArray(metricIDs) || metricIDs.length === 0) {
      return res.status(400).json(
        buildErrorResponse('metricIDs is required and must be a non-empty array', 'INVALID_REQUEST')
      );
    }

    // Always generate both merchant and competition data (like production API)
    console.log(`🔍 Processing ${metricIDs.length} metrics with ${filterValues?.length || 0} filters`);
    
    if (filterValues && filterValues.length > 0) {
      console.log(`🎯 Active filters:`, filterValues.map(f => `${f.filterId}=${f.value}`));
    }

    // Generate metrics data with filter awareness
    let allMetrics = [];
    
    metricIDs.forEach(metricID => {
      // Generate merchant data with filters
      const merchantData = generateFilterAwareMetric(metricID, {
        filterValues,
        startDate,
        endDate,
        merchantId: 'ATTICA',
        isCompetition: false
      });
      
      // Generate competition data with same filters
      const competitionData = generateFilterAwareMetric(metricID, {
        filterValues,
        startDate,
        endDate,
        merchantId: 'competition',
        isCompetition: true
      });
      
      allMetrics.push(merchantData, competitionData);
    });

    console.log(`✅ Generated ${allMetrics.length} metric responses`);

    // Build and send response
    const response = buildSuccessResponse(allMetrics);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Analytics query error:', error);
    res.status(500).json(
      buildErrorResponse('Failed to process analytics query', 'PROCESSING_ERROR')
    );
  }
});

// GET /ANALYTICS/STATUS (for debugging)
router.get('/STATUS', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Analytics Mock API',
    version: '1.0.0',
    supportedMetrics: [
      'total_revenue',
      'total_transactions', 
      'avg_ticket_per_user',
      'rewarded_amount',
      'redeemed_amount',
      'rewarded_points',
      'redeemed_points',
      'revenue_per_day',
      'transactions_per_day',
      'customers_per_day',
      'converted_customers_by_age',
      'converted_customers_by_gender',
      'converted_customers_by_interest',
      'revenue_by_channel'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;