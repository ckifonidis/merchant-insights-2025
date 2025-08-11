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
 * @param {string} userID - The user ID from NBG identity system (REQUIRED)
 * @returns {Promise<Object>} Response with user status: "signedup", "notsignedup", or "noaccess"
 */
export const checkUserStatus = async (userID) => {
  if (!userID) {
    throw new Error('userID is required for user status check');
  }
  const requestBody = {
    header: {
      ID: generateGUID(),
      application: '76A9FF99-64F9-4F72-9629-305CBE047902'
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
 * Fetch user configuration (preferences, merchant IDs, etc.)
 * Called when user status is "signedup" to get user setup data
 */
export const fetchUserConfiguration = async (userID) => {
  if (!userID) {
    throw new Error('userID is required for user configuration fetch');
  }
  const requestBody = {
    header: {
      ID: generateGUID(),
      application: '76A9FF99-64F9-4F72-9629-305CBE047902'
    },
    payload: {
      userId: userID
    }
  };
  
  try {
    console.log('🔍 Fetching user configuration for:', userID);
    
    const response = await apiCall('/api/configuration/user/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response) {
      throw new Error('No response received from user configuration');
    }

    const data = await response.json();
    
    console.log('✅ User configuration response:', {
      hasUserPreferences: !!data.payload?.userPreferences,
      userId: data.payload?.userPreferences?.userId,
      merchantCount: data.payload?.userPreferences?.merchantIds?.length || 0,
      requestId: requestBody.header.ID
    });

    return data;
    
  } catch (error) {
    console.error('❌ User configuration fetch failed:', error);
    throw error;
  }
};

/**
 * User Service class for managing user enrollment operations
 */
class UserService {
  /**
   * Check user enrollment status
   */
  async checkStatus(userID) {
    if (!userID) {
      throw new Error('userID is required for user status check');
    }
    return checkUserStatus(userID);
  }

  /**
   * Get user enrollment status only (without full response)
   */
  async getStatus(userID) {
    if (!userID) {
      throw new Error('userID is required for user status check');
    }
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
  async hasAccess(userID) {
    const status = await this.getStatus(userID);
    return status === 'signedup';
  }

  /**
   * Check if user needs to sign up
   */
  async needsSignup(userID) {
    const status = await this.getStatus(userID);
    return status === 'notsignedup';
  }

  /**
   * Check if user access is denied
   */
  async isAccessDenied(userID) {
    const status = await this.getStatus(userID);
    return status === 'noaccess';
  }

  /**
   * Fetch user configuration
   */
  async fetchConfiguration(userID) {
    if (!userID) {
      throw new Error('userID is required for user configuration fetch');
    }
    return fetchUserConfiguration(userID);
  }

  /**
   * Get user preferences from configuration
   */
  async getUserPreferences(userID) {
    if (!userID) {
      throw new Error('userID is required for user configuration fetch');
    }
    try {
      const response = await this.fetchConfiguration(userID);
      return response.payload?.userPreferences || null;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }
}

// Export singleton instance
export const userService = new UserService();

export default userService;