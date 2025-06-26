const express = require('express');
const router = express.Router();
const { buildSuccessResponse, buildErrorResponse } = require('../utils/responseBuilder');

// GET /CONFIGURATION/ADMIN/GET
router.get('/ADMIN/GET', (req, res) => {
  try {
    console.log('⚙️ Admin configuration requested');
    
    const mockAdminConfig = {
      apiVersion: '1.0.0',
      supportedProviders: [
        {
          id: '56f9cf99-3727-4f2f-bf1c-58dc532ebaf5',
          name: 'Post Promotion Analytics',
          description: 'Analytics provider for post-promotion campaign data'
        },
        {
          id: '79706006-ed8a-426d-88a8-c574acb92f26',
          name: 'Audience Filtering',
          description: 'Provider for audience segmentation and filtering'
        }
      ],
      systemLimits: {
        maxMetricsPerRequest: 10,
        maxDateRangeDays: 365,
        requestTimeoutMs: 30000
      },
      featureFlags: {
        competitionComparison: true,
        demographicAnalysis: true,
        geographicAnalysis: true,
        realTimeData: false
      }
    };

    console.log('✅ Admin configuration returned');
    
    res.status(200).json(buildSuccessResponse([mockAdminConfig]));
    
  } catch (error) {
    console.error('❌ Admin configuration error:', error);
    res.status(500).json(
      buildErrorResponse('Failed to get admin configuration', 'CONFIG_ERROR')
    );
  }
});

// GET /CONFIGURATION/MERCHANT/GET
router.get('/MERCHANT/GET', (req, res) => {
  try {
    console.log('🏪 Merchant configuration requested');
    
    const mockMerchantConfig = {
      merchantId: '52ba3854-a5d4-47bd-9d1a-b789ae139803',
      merchantName: 'ATTICA',
      allowedMetrics: [
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
        'converted_customers_by_interest'
      ],
      dataRetentionDays: 730,
      competitionDataEnabled: true,
      demographicsEnabled: true,
      loyaltyProgramEnabled: true,
      subscriptionTier: 'Premium',
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Merchant configuration returned');
    
    res.status(200).json(buildSuccessResponse([mockMerchantConfig]));
    
  } catch (error) {
    console.error('❌ Merchant configuration error:', error);
    res.status(500).json(
      buildErrorResponse('Failed to get merchant configuration', 'CONFIG_ERROR')
    );
  }
});

module.exports = router;