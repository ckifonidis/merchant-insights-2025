const express = require('express');
const router = express.Router();

// In-memory storage for signup submissions during session
const submittedUsers = new Set();

// Mock user emails - in real implementation this would come from user database
const userEmails = {
  'XANDRH004400003': 'CREEPYMAIL01@GMAIL.COM',
  'BANK\\testuser': 'testuser@nbg.gr',
  'BANK\\merchant1': 'merchant1@business.com',
  'BANK\\merchant2': 'merchant2@company.gr',
  // Add preferred_username format that might come from OAuth
  'testuser': 'testuser@nbg.gr',
  'merchant1': 'merchant1@business.com',
  'john.doe': 'john.doe@nbg.gr'
};

// POST /onboarding/get-email
router.post('/get-email', (req, res) => {
  try {
    console.log('📧 Get user email request received');
    
    const { header, payload } = req.body;
    const userID = payload?.userID;
    
    if (!userID) {
      return res.status(400).json({
        payload: null,
        exception: {
          message: 'userID is required',
          code: 'VALIDATION_ERROR'
        },
        messages: null,
        executionTime: Math.random() * 100 + 50
      });
    }
    
    console.log('🔍 Fetching email for userID:', userID);
    
    // Get email for user (or generate one if not in mock data)
    let emailAddress = userEmails[userID];
    if (!emailAddress) {
      // Generate a mock email based on userID
      const username = userID.includes('\\') ? userID.split('\\')[1] : userID;
      emailAddress = `${username}@example.com`.toLowerCase();
    }
    
    // Log the lookup for debugging
    console.log('📧 Email lookup for userID:', userID, '→', emailAddress);
    
    const response = {
      payload: {
        companyDetails: {
          emailAddress: emailAddress
        }
      },
      exception: null,
      messages: null,
      executionTime: Math.random() * 300 + 100 // 100-400ms
    };

    console.log('✅ Email retrieved:', emailAddress);
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Get email error:', error);
    res.status(500).json({
      payload: null,
      exception: {
        message: 'Failed to retrieve user email',
        code: 'EMAIL_FETCH_ERROR'
      },
      messages: null,
      executionTime: Math.random() * 200 + 100
    });
  }
});

// POST /onboarding/submitSignupForm
router.post('/submitSignupForm', (req, res) => {
  try {
    console.log('📝 Submit signup form request received');
    
    const { header, payload } = req.body;
    const { userID, merchantEmail, otherBankMIDs, extraData } = payload || {};
    
    if (!userID || !merchantEmail) {
      return res.status(400).json({
        payload: null,
        exception: {
          message: 'userID and merchantEmail are required',
          code: 'VALIDATION_ERROR'
        },
        messages: null,
        executionTime: Math.random() * 100 + 50
      });
    }
    
    console.log('🔍 Processing signup for:', { userID, merchantEmail, otherBankMIDsCount: otherBankMIDs?.length || 0 });
    
    // Check if user already submitted
    if (submittedUsers.has(userID)) {
      return res.status(409).json({
        payload: null,
        exception: {
          message: 'User has already submitted a signup form',
          code: 'ALREADY_SUBMITTED'
        },
        messages: null,
        executionTime: Math.random() * 200 + 100
      });
    }
    
    // Simulate email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(merchantEmail)) {
      return res.status(400).json({
        payload: null,
        exception: {
          message: 'Invalid email address format',
          code: 'INVALID_EMAIL'
        },
        messages: null,
        executionTime: Math.random() * 100 + 50
      });
    }
    
    // Store the submission
    submittedUsers.add(userID);
    
    // Simulate successful submission
    const response = {
      payload: {},
      exception: null,
      messages: null,
      executionTime: Math.random() * 1000 + 500 // 500-1500ms
    };

    console.log('✅ Signup form submitted successfully for:', userID);
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Submit signup form error:', error);
    res.status(500).json({
      payload: null,
      exception: {
        message: 'Failed to submit signup form',
        code: 'SUBMISSION_ERROR'
      },
      messages: null,
      executionTime: Math.random() * 200 + 100
    });
  }
});

// POST /onboarding/checkIfSubmitted
router.post('/checkIfSubmitted', (req, res) => {
  try {
    console.log('🔍 Check submission status request received');
    
    const { header, payload } = req.body;
    const userID = payload?.userID;
    
    if (!userID) {
      return res.status(400).json({
        payload: null,
        exception: {
          message: 'userID is required',
          code: 'VALIDATION_ERROR'
        },
        messages: null,
        executionTime: Math.random() * 100 + 50
      });
    }
    
    console.log('🔍 Checking submission status for userID:', userID);
    
    // Check if this user has submitted
    const submittedBySameUserId = submittedUsers.has(userID);
    
    // Simulate random chance that someone else submitted with same details
    const submittedByOtherUserId = Math.random() < 0.05; // 5% chance
    
    const response = {
      payload: {
        submittedBySameUserId,
        submittedByOtherUserId
      },
      exception: null,
      messages: null,
      executionTime: Math.random() * 200 + 50 // 50-250ms
    };

    console.log('✅ Submission status:', { submittedBySameUserId, submittedByOtherUserId });
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Check submission error:', error);
    res.status(500).json({
      payload: null,
      exception: {
        message: 'Failed to check submission status',
        code: 'CHECK_STATUS_ERROR'
      },
      messages: null,
      executionTime: Math.random() * 200 + 100
    });
  }
});

module.exports = router;