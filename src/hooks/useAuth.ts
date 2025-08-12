import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus, fetchUserInfo, isOAuthCallback } from '../utils/auth.js';
import { checkUserStatus } from '../services/userService.js';
import { fetchUserConfig, fetchAllMerchantDetails } from '../store/slices/userConfigSlice.js';
import { setUserID } from '../store/slices/filtersSlice.js';
import {
  setAuthLoading,
  setAuthError,
  setAuthenticated,
  setAuthData,
  setUserInfo,
  setServiceLoading,
  setServiceError,
  setUserStatus,
  setAuthenticating,
  selectIsAuthenticating,
  updateAuthState
} from '../store/slices/authSlice.js';
import { useAuthState } from './useAuthState.js';
import type { RootState, AppDispatch } from '../store/index';
import type { AuthStateHook } from './useAuthState';

interface UseAuthOptions {
  checkUserService?: boolean;
  enableAutoRefresh?: boolean;
}

interface UseAuthReturn extends AuthStateHook {
  refreshAuth: () => Promise<AuthStateHook>;
  refreshUserStatus: () => Promise<void>;
}

/**
 * Primary authentication hook - ONLY for AuthenticationManager
 * Triggers authentication logic and updates Redux state
 * All other components should use useAuthState() or other read-only hooks
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { 
    checkUserService = true, // Whether to check user service enrollment after OAuth
    enableAutoRefresh = true // Whether to enable automatic status checking
  } = options;
  
  console.log('🎯 useAuth hook - Initializing authentication at app startup');
  
  const dispatch = useDispatch<AppDispatch>();
  
  // Check if already authenticating to prevent multiple executions
  const isAuthenticating = useSelector((state: RootState) => selectIsAuthenticating(state));
  
  // Get auth state from Redux (read-only)
  const authState = useAuthState();

  useEffect(() => {
    if (!enableAutoRefresh) return;
    
    // Prevent multiple simultaneous authentications
    if (isAuthenticating) {
      console.log('🔄 useAuth hook - Already authenticating, skipping...');
      return;
    }
    
    const verifyAuth = async () => {
      try {
        dispatch(setAuthenticating(true));
        dispatch(setAuthLoading(true));
        dispatch(setAuthError(null));
        
        // Skip auth check if we're in the OAuth callback flow
        if (isOAuthCallback()) {
          console.log('🔄 OAuth callback detected, skipping auth check');
          dispatch(setAuthLoading(false));
          dispatch(setAuthenticating(false));
          return;
        }
        
        console.log('🔍 useAuth hook - Verifying authentication status...');
        const authResult = await checkAuthStatus();
        
        console.log('✅ Auth verification result:', {
          authenticated: authResult.authenticated,
          expires_at: authResult.expires_at,
          scope: authResult.scope
        });
        
        dispatch(setAuthenticated(authResult.authenticated));
        dispatch(setAuthData(authResult));
        
        if (authResult.authenticated) {
          console.log('🎉 User is authenticated, fetching user info...');
          
          // Fetch user information after successful authentication
          try {
            const userInfoData = await fetchUserInfo();
            dispatch(setUserInfo(userInfoData));
            
            if (userInfoData) {
              console.log('✅ User info fetched successfully');
              
              // Check user service enrollment if enabled
              if (checkUserService && userInfoData.preferred_username) {
                await checkUserServiceStatus(userInfoData.preferred_username);
              }
            } else {
              console.warn('⚠️ User info could not be fetched');
            }
          } catch (userInfoError) {
            console.error('❌ Failed to fetch user info:', userInfoError);
            // Don't fail the entire auth flow if userinfo fails
          }
        } else {
          console.log('🔐 User is not authenticated');
          dispatch(setUserInfo(null));
          dispatch(setUserStatus(null));
        }
        
      } catch (err) {
        console.error('❌ Auth verification failed:', err);
        dispatch(setAuthError(err));
        dispatch(setAuthenticated(false));
        dispatch(setAuthData(null));
      } finally {
        dispatch(setAuthLoading(false));
        dispatch(setAuthenticating(false));
      }
    };

    verifyAuth();
  }, [enableAutoRefresh, isAuthenticating, dispatch, checkUserService]);

  /**
   * Check user service enrollment status
   */
  const checkUserServiceStatus = async (userId: string): Promise<void> => {
    try {
      dispatch(setServiceLoading(true));
      dispatch(setServiceError(null));
      
      console.log('🔍 Checking user service enrollment status for:', userId);
      
      // Update filters context with the real userID
      dispatch(setUserID(userId));
      
      const response = await checkUserStatus(userId);
      
      if (response && response.payload && response.payload.status) {
        const status = response.payload.status;
        console.log('✅ User status check result:', status);
        dispatch(setUserStatus(status));
        
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
      dispatch(setServiceError(err));
      dispatch(setUserStatus(null));
    } finally {
      dispatch(setServiceLoading(false));
    }
  };

  /**
   * Manually refresh authentication and user status
   */
  const refreshAuth = async (): Promise<AuthStateHook> => {
    console.log('🔄 Manually refreshing auth status...');
    
    // Prevent refresh if already authenticating
    if (isAuthenticating) {
      console.log('⚠️ Already authenticating, skipping refresh');
      return;
    }
    
    try {
      dispatch(setAuthenticating(true));
      dispatch(setAuthError(null));
      dispatch(setServiceError(null));
      
      const authResult = await checkAuthStatus();
      dispatch(setAuthenticated(authResult.authenticated));
      dispatch(setAuthData(authResult));
      
      if (authResult.authenticated) {
        // Fetch user information after successful authentication
        try {
          const userInfoData = await fetchUserInfo();
          dispatch(setUserInfo(userInfoData));
          
          // Check user service enrollment if enabled
          if (checkUserService && userInfoData?.preferred_username) {
            await checkUserServiceStatus(userInfoData.preferred_username);
          }
        } catch (userInfoError) {
          console.error('❌ Failed to refresh user info:', userInfoError);
          // Don't fail the entire refresh if userinfo fails
        }
      } else {
        dispatch(setUserInfo(null));
        dispatch(setUserStatus(null));
      }
      
      console.log('✅ Auth refresh complete');
      
      return authState;
    } catch (err) {
      console.error('❌ Auth refresh failed:', err);
      dispatch(setAuthError(err));
      dispatch(setAuthenticated(false));
      dispatch(setAuthData(null));
      dispatch(setUserInfo(null));
      dispatch(setUserStatus(null));
      throw err;
    } finally {
      dispatch(setAuthenticating(false));
    }
  };

  // Return the auth state with actions
  return {
    ...authState,
    refreshAuth,
    refreshUserStatus: () => {
      if (authState.userInfo?.preferred_username) {
        return checkUserServiceStatus(authState.userInfo.preferred_username);
      }
      throw new Error('No user ID available for status refresh');
    }
  };
}

// Legacy compatibility exports - all read-only now
export { useAuthGate, useUserStatusGate, useAuthRequired, useUserStatus } from './useAuthState.js';