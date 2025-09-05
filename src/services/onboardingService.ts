import { apiCall } from '../utils/auth';
import type {
  GetEmailRequest,
  GetEmailResponse,
  SubmitSignupFormRequest,
  SubmitSignupFormResponse,
  CheckSubmissionRequest,
  CheckSubmissionResponse,
  OnboardingServiceParams,
  SubmissionStatus
} from '../types/onboarding';

/**
 * Onboarding Service - API integration for new user signup flow
 * Uses existing auth utilities for authenticated requests
 */

/**
 * Generate a GUID for request IDs (consistent with existing services)
 */
const generateGUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Create request header (consistent with existing API patterns)
 */
const createRequestHeader = () => ({
  ID: generateGUID(),
  application: '76A9FF99-64F9-4F72-9629-305CBE047902'
});

/**
 * Get user email address from userID
 * @param userID - User identifier
 * @returns Promise with user email address
 */
export const getUserEmail = async (userID: string): Promise<{ emailAddress: string }> => {
  if (!userID) {
    throw new Error('userID is required for email fetch');
  }

  const requestBody: GetEmailRequest = {
    header: createRequestHeader(),
    payload: {
      userID
    }
  };

  try {
    console.log('📧 Fetching user email for:', userID);

    const response = await apiCall('/api/onboarding/get-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response) {
      throw new Error('No response received from email fetch');
    }

    const data: GetEmailResponse = await response.json();

    if (data.exception) {
      throw new Error(data.exception.message || 'Failed to fetch user email');
    }

    const emailAddress = data.payload?.companyDetails?.emailAddress;
    if (!emailAddress) {
      throw new Error('Email address not found in response');
    }

    console.log('✅ User email retrieved successfully');
    return { emailAddress };

  } catch (error) {
    console.error('❌ User email fetch failed:', error);
    throw error;
  }
};

/**
 * Submit signup form with user details
 * @param params - Signup form parameters
 * @returns Promise that resolves on successful submission
 */
export const submitSignupForm = async (params: OnboardingServiceParams): Promise<void> => {
  const { userID, merchantEmail, otherBankMIDs, extraData } = params;

  if (!userID || !merchantEmail) {
    throw new Error('userID and merchantEmail are required for signup submission');
  }

  const requestBody: SubmitSignupFormRequest = {
    header: createRequestHeader(),
    payload: {
      userID,
      merchantEmail,
      otherBankMIDs: otherBankMIDs || [],
      extraData: extraData || null
    }
  };

  try {
    console.log('📝 Submitting signup form for:', { userID, merchantEmail, otherBankMIDsCount: otherBankMIDs?.length || 0 });

    const response = await apiCall('/api/onboarding/submitSignupForm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response) {
      throw new Error('No response received from signup submission');
    }

    const data: SubmitSignupFormResponse = await response.json();

    if (data.exception) {
      throw new Error(data.exception.message || 'Failed to submit signup form');
    }

    console.log('✅ Signup form submitted successfully');

  } catch (error) {
    console.error('❌ Signup form submission failed:', error);
    throw error;
  }
};

/**
 * Check if user has already submitted signup form
 * @param userID - User identifier
 * @returns Promise with submission status
 */
export const checkSubmissionStatus = async (userID: string): Promise<SubmissionStatus> => {
  if (!userID) {
    throw new Error('userID is required for submission status check');
  }

  const requestBody: CheckSubmissionRequest = {
    header: createRequestHeader(),
    payload: {
      userID
    }
  };

  try {
    console.log('🔍 Checking submission status for:', userID);

    const response = await apiCall('/api/onboarding/checkIfSubmitted', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response) {
      throw new Error('No response received from submission status check');
    }

    const data: CheckSubmissionResponse = await response.json();

    if (data.exception) {
      throw new Error(data.exception.message || 'Failed to check submission status');
    }

    const { submittedBySameUserId, submittedByOtherUserId } = data.payload;

    // Calculate if user can proceed with signup
    const canProceed = !submittedBySameUserId && !submittedByOtherUserId;

    const status: SubmissionStatus = {
      submittedBySameUserId,
      submittedByOtherUserId,
      canProceed
    };

    console.log('✅ Submission status checked:', status);
    return status;

  } catch (error) {
    console.error('❌ Submission status check failed:', error);
    throw error;
  }
};

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate merchant IDs format
 * @param merchantIDs - Array of merchant ID strings
 * @returns boolean indicating if all merchant IDs are valid
 */
export const validateMerchantIDs = (merchantIDs: string[]): boolean => {
  if (!Array.isArray(merchantIDs)) return false;
  
  // Allow empty array (optional field)
  if (merchantIDs.length === 0) return true;
  
  // Check each merchant ID is non-empty string
  return merchantIDs.every(id => typeof id === 'string' && id.trim().length > 0);
};