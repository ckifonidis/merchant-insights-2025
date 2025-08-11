import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkUserStatus } from '../services/userService.js';
import { fetchUserConfig, fetchAllMerchantDetails } from '../store/slices/userConfigSlice.js';
import { setUserID } from '../store/slices/filtersSlice.js';
import { useAuth } from './useAuth.js';

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
  const dispatch = useDispatch();
  const { userInfo } = useAuth();

  useEffect(() => {
    if (!enabled || !userInfo?.preferred_username) {
      setIsLoading(false);
      return;
    }
    
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userId = userInfo.preferred_username;
        console.log('🔍 Checking user service enrollment status for:', userId);
        
        // Update filters context with the real userID
        dispatch(setUserID(userId));
        
        const response = await checkUserStatus(userId);
        
        if (response && response.payload && response.payload.status) {
          const status = response.payload.status;
          console.log('✅ User status check result:', status);
          setUserStatus(status);
          
          // If user is signed up, fetch their configuration and merchant details
          if (status === 'signedup') {
            console.log('🔍 User is signed up, fetching user configuration...');
            try {
              const userConfig = await dispatch(fetchUserConfig(userId)).unwrap();
              console.log('✅ User configuration loaded successfully');
              
              // If user has merchant IDs, fetch merchant details
              if (userConfig?.merchantIds?.length > 0) {
                console.log(`🔍 Fetching details for ${userConfig.merchantIds.length} merchants...`);
                try {
                  await dispatch(fetchAllMerchantDetails({ 
                    userID: userId, 
                    merchantIds: userConfig.merchantIds 
                  })).unwrap();
                  console.log('✅ Merchant details loaded successfully');
                } catch (merchantError) {
                  console.error('❌ Failed to load merchant details:', merchantError);
                  // Don't fail the entire flow if merchant details fail
                }
              } else {
                console.log('ℹ️ No merchant IDs found in user configuration');
              }
            } catch (configError) {
              console.error('❌ Failed to load user configuration:', configError);
              // Don't fail the entire flow if config fails - user can still access the app
            }
          }
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
  }, [enabled, dispatch, userInfo?.preferred_username]);

  /**
   * Manually refresh user status
   * Useful after user signs up for the service
   */
  const refreshUserStatus = async () => {
    if (!userInfo?.preferred_username) {
      throw new Error('No user ID available for status refresh');
    }
    
    console.log('🔄 Manually refreshing user status...');
    
    try {
      setError(null);
      setIsLoading(true);
      
      const userId = userInfo.preferred_username;
      
      // Update filters context with the real userID
      dispatch(setUserID(userId));
      
      const response = await checkUserStatus(userId);
      
      if (response && response.payload && response.payload.status) {
        const status = response.payload.status;
        console.log('✅ User status refresh complete:', status);
        setUserStatus(status);
        
        // If user is signed up, fetch their configuration and merchant details
        if (status === 'signedup') {
          console.log('🔍 User is signed up, fetching user configuration...');
          try {
            const userConfig = await dispatch(fetchUserConfig(userId)).unwrap();
            console.log('✅ User configuration loaded successfully');
            
            // If user has merchant IDs, fetch merchant details
            if (userConfig?.merchantIds?.length > 0) {
              console.log(`🔍 Fetching details for ${userConfig.merchantIds.length} merchants...`);
              try {
                await dispatch(fetchAllMerchantDetails({ 
                  userID: userId, 
                  merchantIds: userConfig.merchantIds 
                })).unwrap();
                console.log('✅ Merchant details loaded successfully');
              } catch (merchantError) {
                console.error('❌ Failed to load merchant details:', merchantError);
                // Don't fail the entire flow if merchant details fail
              }
            } else {
              console.log('ℹ️ No merchant IDs found in user configuration');
            }
          } catch (configError) {
            console.error('❌ Failed to load user configuration:', configError);
            // Don't fail the entire flow if config fails
          }
        }
        
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