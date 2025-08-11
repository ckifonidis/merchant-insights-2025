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
    
    const { header, payload } = req.body;
    
    if (!payload) {
      return res.status(400).json(
        buildErrorResponse('Request payload is required', 'INVALID_REQUEST')
      );
    }
    
    const { metricIDs, filterValues, startDate, endDate, merchantId, userID } = payload;
    
    console.log('🔍 Analytics request for userID:', userID);

    // Validate request
    if (!metricIDs || !Array.isArray(metricIDs) || metricIDs.length === 0) {
      return res.status(400).json(
        buildErrorResponse('metricIDs is required and must be a non-empty array', 'INVALID_REQUEST')
      );
    }

    // Generate metrics data with filter awareness
    let allMetrics = [];
    
    metricIDs.forEach(metricID => {
      // List of merchant-only metrics (Go For More and loyalty program metrics)
      const merchantOnlyMetrics = [
        'goformore_amount',
        'rewarded_amount', 
        'redeemed_amount',
        'rewarded_points',
        'redeemed_points'
      ];
      
      // Generate merchant data with filters
      const merchantData = generateFilterAwareMetric(metricID, {
        filterValues,
        startDate,
        endDate,
        merchantId: 'ATTICA',
        isCompetition: false
      });
      
      allMetrics.push(merchantData);
      
      // Only generate competition data for non-merchant-only metrics
      if (!merchantOnlyMetrics.includes(metricID)) {
        const competitionData = generateFilterAwareMetric(metricID, {
          filterValues,
          startDate,
          endDate,
          merchantId: 'competition',
          isCompetition: true
        });
        
        allMetrics.push(competitionData);
      }
    });

    // Build and send response
    const response = buildSuccessResponse(allMetrics);
    res.status(200).json(response);
    
  } catch (error) {
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
      'total_customers',
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