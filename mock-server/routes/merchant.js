const express = require('express');
const router = express.Router();
const { buildSuccessResponse, buildErrorResponse } = require('../utils/responseBuilder');

// POST /merchant/get - Get merchant details by ID
router.post('/get', (req, res) => {
  try {
    console.log('🔍 Merchant details requested');
    
    const { payload } = req.body;
    const userId = payload?.userId;
    const merchantId = payload?.id;
    
    if (!userId) {
      return res.status(400).json(
        buildErrorResponse('userId is required in payload', 'INVALID_REQUEST')
      );
    }
    
    if (!merchantId) {
      return res.status(400).json(
        buildErrorResponse('merchant id is required in payload', 'INVALID_REQUEST')
      );
    }
    
    console.log('🔍 Fetching merchant details for:', { userId, merchantId });
    
    // Mock merchant data - in real scenario this would be fetched from database
    const merchantDatabase = {
      "766dba61-1cd8-49b5-944e-bc537a0c6b9c": {
        id: "766dba61-1cd8-49b5-944e-bc537a0c6b9c",
        name: "DUMMY",
        logo: null,
        customerCode: "1219540340"
      },
      "52ba3854-a5d4-47bd-9d1a-b789ae139803": {
        id: "52ba3854-a5d4-47bd-9d1a-b789ae139803",
        name: "ATTICA",
        logo: null,
        customerCode: "1234567890"
      },
      "test-merchant-123": {
        id: "test-merchant-123",
        name: "Test Store",
        logo: null,
        customerCode: "9876543210"
      }
    };
    
    const merchant = merchantDatabase[merchantId];
    
    if (!merchant) {
      console.log(`❌ Merchant not found: ${merchantId}`);
      return res.status(404).json(
        buildErrorResponse('Merchant not found', 'MERCHANT_NOT_FOUND')
      );
    }
    
    console.log('✅ Merchant details returned:', {
      merchantId: merchant.id,
      merchantName: merchant.name,
      customerCode: merchant.customerCode
    });
    
    res.status(200).json({
      payload: {
        merchant: merchant
      },
      exception: null,
      messages: null,
      executionTime: Math.random() * 200 + 50 // 50-250ms delay
    });
    
  } catch (error) {
    console.error('❌ Merchant details error:', error);
    res.status(500).json(
      buildErrorResponse('Failed to get merchant details', 'MERCHANT_ERROR')
    );
  }
});

module.exports = router;