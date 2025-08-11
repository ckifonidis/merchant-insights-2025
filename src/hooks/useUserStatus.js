import { useState, useEffect } from 'react';
import { checkUserStatus } from '../services/userService.js';

/**
 * Custom hook for checking user service enrollment status
 * Determines if authenticated user has access to Business Insights service
 * 
 * @param {boolean} enabled - Whether to check user status (default: true)
 * Returns user status: "signedup", "notsignedup", or "noaccess"
 */
export function useUserStatus(enabled = true) {
  const [userStatus, setUserStatus] = useState(null); // null = loading
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Checking user service enrollment status...');
        const response = await checkUserStatus();
        
        if (response && response.payload && response.payload.status) {
          const status = response.payload.status;
          console.log('✅ User status check result:', status);
          setUserStatus(status);
        } else {
          throw new Error('Invalid user status response format');
        }
        
      } catch (err) {
        console.error('❌ User status check failed:', err);
        setError(err);
        setUserStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [enabled]);

  /**
   * Manually refresh user status
   * Useful after user signs up for the service
   */
  const refreshUserStatus = async () => {
    console.log('🔄 Manually refreshing user status...');
    
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await checkUserStatus();
      
      if (response && response.payload && response.payload.status) {
        const status = response.payload.status;
        console.log('✅ User status refresh complete:', status);
        setUserStatus(status);
        return status;
      } else {
        throw new Error('Invalid user status response format');
      }
      
    } catch (err) {
      console.error('❌ User status refresh failed:', err);
      setError(err);
      setUserStatus(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has service access
   */
  const hasServiceAccess = () => {
    return userStatus === 'signedup';
  };

  /**
   * Check if user needs to sign up
   */
  const needsSignup = () => {
    return userStatus === 'notsignedup';
  };

  /**
   * Check if user access is denied
   */
  const isAccessDenied = () => {
    return userStatus === 'noaccess';
  };

  return {
    // Service enrollment state
    userStatus,
    isLoading,
    error,
    
    // Status checks
    hasServiceAccess: hasServiceAccess(),
    needsSignup: needsSignup(),
    isAccessDenied: isAccessDenied(),
    
    // Actions
    refreshUserStatus
  };
}

/**
 * Hook that combines user status with routing decisions
 * Returns what UI component should be displayed based on user status
 * 
 * @param {boolean} enabled - Whether to check user status (only after OAuth succeeds)
 */
export function useUserStatusGate(enabled = true) {
  const { userStatus, isLoading, error, hasServiceAccess, needsSignup, isAccessDenied } = useUserStatus(enabled);
  
  const shouldShowLoading = isLoading;
  const shouldShowError = error && !isLoading;
  const shouldShowFirstPage = !isLoading && !error && needsSignup;
  const shouldShowNoAccess = !isLoading && !error && isAccessDenied;
  const shouldShowDashboard = !isLoading && !error && hasServiceAccess;
  
  return {
    shouldShowLoading,
    shouldShowError,
    shouldShowFirstPage,
    shouldShowNoAccess,
    shouldShowDashboard,
    error,
    userStatus
  };
}

export default useUserStatus;