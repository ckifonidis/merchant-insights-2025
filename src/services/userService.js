import { apiCall } from '../utils/auth.js';
import { API_ENDPOINTS } from '../data/apiSchema.js';

/**
 * User Service - Handles user enrollment and service access checks
 * Separate from analytics - focuses on user subscription/access status
 */

/**
 * Generate a GUID for request IDs
 */
const generateGUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Check if authenticated user is enrolled in Business Insights service
 * @param {string} userID - The user ID from NBG identity system
 * @returns {Promise<Object>} Response with user status: "signedup", "notsignedup", or "noaccess"
 */
export const checkUserStatus = async (userID = 'XANDRH004400003') => {
  const requestBody = {
    header: {
      ID: generateGUID(),
      application: 'merchant-insights-ui'
    },
    payload: {
      userID
    }
  };
  
  try {
    console.log('🔍 Checking user service enrollment for:', userID);
    
    const response = await apiCall(API_ENDPOINTS.AUTHORIZATION_CHECK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response) {
      throw new Error('No response received from user status check');
    }

    const data = await response.json();
    
    console.log('✅ User status response:', {
      status: data.payload?.status,
      requestId: requestBody.header.ID
    });

    return data;
    
  } catch (error) {
    console.error('❌ User status check failed:', error);
    throw error;
  }
};

/**
 * User Service class for managing user enrollment operations
 */
class UserService {
  constructor() {
    this.defaultUserID = 'XANDRH004400003';
  }

  /**
   * Check user enrollment status
   */
  async checkStatus(userID = this.defaultUserID) {
    return checkUserStatus(userID);
  }

  /**
   * Get user enrollment status only (without full response)
   */
  async getStatus(userID = this.defaultUserID) {
    try {
      const response = await this.checkStatus(userID);
      return response.payload?.status || null;
    } catch (error) {
      console.error('Failed to get user status:', error);
      return null;
    }
  }

  /**
   * Check if user has service access
   */
  async hasAccess(userID = this.defaultUserID) {
    const status = await this.getStatus(userID);
    return status === 'signedup';
  }

  /**
   * Check if user needs to sign up
   */
  async needsSignup(userID = this.defaultUserID) {
    const status = await this.getStatus(userID);
    return status === 'notsignedup';
  }

  /**
   * Check if user access is denied
   */
  async isAccessDenied(userID = this.defaultUserID) {
    const status = await this.getStatus(userID);
    return status === 'noaccess';
  }
}

// Export singleton instance
export const userService = new UserService();

export default userService;