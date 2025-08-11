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

// POST /CONFIGURATION/USER/GET
router.post('/USER/GET', (req, res) => {
  try {
    console.log('👤 User configuration requested');
    
    const { payload } = req.body;
    const userId = payload?.userId;
    
    if (!userId) {
      return res.status(400).json(
        buildErrorResponse('userId is required in payload', 'INVALID_REQUEST')
      );
    }
    
    console.log('🔍 Fetching user configuration for:', userId);
    
    const mockUserConfiguration = {
      userPreferences: {
        userId: userId,
        merchantIds: [
          "766dba61-1cd8-49b5-944e-bc537a0c6b9c"
        ],
        analyticsMetricVisualizationPreferences: [
          {
            providerId: "753a0a2f-4163-4ecb-b376-17addf3db951",
            metricVisualizationPreferencesList: []
          },
          {
            providerId: "56f9cf99-3727-4f2f-bf1c-58dc532ebaf5",
            metricVisualizationPreferencesList: [
              {
                id: "rewarded_points",
                displayName: null,
                visualizationFormat: "Integer"
              },
              {
                id: "rewarded_amount",
                displayName: null,
                visualizationFormat: "Currency"
              },
              {
                id: "redeemed_points",
                displayName: null,
                visualizationFormat: "Integer"
              },
              {
                id: "redeemed_amount",
                displayName: null,
                visualizationFormat: "Currency"
              },
              {
                id: "total_transactions",
                displayName: null,
                visualizationFormat: "Integer"
              },
              {
                id: "avg_ticket_per_user",
                displayName: null,
                visualizationFormat: "Currency"
              },
              {
                id: "total_reach",
                displayName: null,
                visualizationFormat: "Integer"
              },
              {
                id: "conversion_rate",
                displayName: null,
                visualizationFormat: "Percentage"
              },
              {
                id: "converted_customers_by_activity",
                displayName: null,
                visualizationFormat: "PieChart"
              },
              {
                id: "converted_customers_by_interest",
                displayName: null,
                visualizationFormat: "BarChart"
              },
              {
                id: "converted_customers_by_age",
                displayName: null,
                visualizationFormat: "BarChart"
              },
              {
                id: "converted_customers_by_gender",
                displayName: null,
                visualizationFormat: "Heatmap"
              },
              {
                id: "revenue_per_day",
                displayName: null,
                visualizationFormat: "Heatmap"
              },
              {
                id: "transactions_per_day",
                displayName: null,
                visualizationFormat: "Heatmap"
              },
              {
                id: "customers_per_day",
                displayName: null,
                visualizationFormat: "LineChart"
              },
              {
                id: "transactions_by_geo",
                displayName: null,
                visualizationFormat: "Geo_Heatmap"
              }
            ]
          }
        ]
      }
    };

    console.log('✅ User configuration returned:', {
      userId: mockUserConfiguration.userPreferences.userId,
      merchantCount: mockUserConfiguration.userPreferences.merchantIds.length,
      preferenceCount: mockUserConfiguration.userPreferences.analyticsMetricVisualizationPreferences.length
    });
    
    res.status(200).json({
      payload: mockUserConfiguration,
      exception: null,
      messages: null,
      executionTime: Math.random() * 500 + 100 // 100-600ms delay
    });
    
  } catch (error) {
    console.error('❌ User configuration error:', error);
    res.status(500).json(
      buildErrorResponse('Failed to get user configuration', 'CONFIG_ERROR')
    );
  }
});

module.exports = router;