const express = require('express');
const router = express.Router();
const { buildSuccessResponse, buildErrorResponse } = require('../utils/responseBuilder');

// POST /authorization/checkUserStatus
router.post('/checkUserStatus', (req, res) => {
  try {
    console.log('🔐 Authorization check received');
    
    const { header, payload } = req.body;
    const userID = payload?.userID;
    
    console.log('🔍 Checking authorization for userID:', userID);
    
    // Mock user status - return 50-50 random between "signedup" and "notsigned"
    const userStatus = Math.random() < 0.5 ? "signedup" : "notsigned";
    
    const response = {
      payload: {
        status: userStatus
      },
      exception: null,
      messages: null,
      executionTime: Math.random() * 200 + 50 // 50-250ms
    };

    console.log('✅ User status check:', userStatus);
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(500).json(
      buildErrorResponse('Failed to check user authorization', 'AUTH_ERROR')
    );
  }
});

module.exports = router;