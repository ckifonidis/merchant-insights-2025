const express = require('express');
const router = express.Router();
const { buildSuccessResponse, buildErrorResponse } = require('../utils/responseBuilder');

// POST /AUTHORIZATION/CHECKUSERSTATUS
router.post('/CHECKUSERSTATUS', (req, res) => {
  try {
    console.log('🔐 Authorization check received');
    
    const { header, payload } = req.body;
    
    // Simulate user authorization check
    const mockUserStatus = {
      isAuthorized: true,
      userId: payload?.userID || 'BANK\\E82629',
      permissions: [
        'ANALYTICS_READ',
        'DASHBOARD_ACCESS',
        'REPORTS_GENERATE'
      ],
      merchantAccess: [
        '52ba3854-a5d4-47bd-9d1a-b789ae139803'
      ],
      sessionExpiry: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours from now
    };

    console.log('✅ User authorized successfully');
    
    res.status(200).json(buildSuccessResponse([mockUserStatus]));
    
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(500).json(
      buildErrorResponse('Failed to check user authorization', 'AUTH_ERROR')
    );
  }
});

module.exports = router;