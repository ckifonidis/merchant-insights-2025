import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuthStatus, fetchUserInfo, isOAuthCallback } from '../utils/auth';
import { checkUserStatus } from '../services/userService';
import { fetchUserConfig, fetchAllMerchantDetails } from '../store/slices/userConfigSlice';
import { setUserID } from '../store/slices/filtersSlice';
import {
  setAuthLoading,
  setAuthError,
  setAuthenticated,
  setAuthData,
  setUserInfo,
  setServiceLoading,
  setServiceError,
  setUserStatus,
  setAuthenticating
} from '../store/slices/authSlice';
import { AppDispatch } from '../store/index';

/**
 * Authentication Manager Component
 * 
 * This component is responsible for initializing authentication at the app level.
 * It runs authentication logic EXACTLY ONCE when the app starts.
 * 
 * Key responsibilities:
 * - Initialize authentication on app startup
 * - Handle OAuth flow if needed
 * - Does NOT re-render based on auth state changes
 * - Does NOT render any UI - just manages auth state
 */
interface AuthenticationManagerProps {
  children: React.ReactNode;
}

export function AuthenticationManager({ children }: AuthenticationManagerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const authInitialized = useRef<boolean>(false);

  useEffect(() => {
    // Ensure authentication runs exactly once per app lifecycle
    if (authInitialized.current) {
      console.log('🔄 AuthenticationManager - Already initialized, skipping...');
      return;
    }

    console.log('🎯 AuthenticationManager - Initializing authentication at app startup');
    authInitialized.current = true;

    const initializeAuth = async (): Promise<void> => {
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
        
        console.log('🔍 AuthenticationManager - Verifying authentication status...');
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
          
          try {
            const userInfoData = await fetchUserInfo();
            dispatch(setUserInfo(userInfoData));
            
            if (userInfoData) {
              console.log('✅ User info fetched successfully');
              
              // Check user service enrollment
              if (userInfoData.preferred_username) {
                await checkUserServiceStatus(userInfoData.preferred_username);
              }
            } else {
              console.warn('⚠️ User info could not be fetched');
            }
          } catch (userInfoError) {
            console.error('❌ Failed to fetch user info:', userInfoError);
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
                }
              } else {
                console.log('ℹ️ No merchant IDs found in user configuration');
              }
            } catch (configError) {
              console.error('❌ Failed to load user configuration:', configError);
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

    initializeAuth().catch((error) => {
      console.error('🚨 Authentication initialization failed:', error);
      dispatch(setAuthError('Failed to initialize authentication'));
      dispatch(setAuthLoading(false));
      dispatch(setAuthenticating(false));
    });
  }, [dispatch]); // Complete dependency tracking

  // This component doesn't render any UI
  // It just manages authentication state and passes children through
  return children;
}

export default AuthenticationManager;