import { useState, useEffect } from 'react';
import { checkAuthStatus, isOAuthCallback } from '../utils/auth.js';

/**
 * Custom hook for managing authentication state
 * Provides authentication status, loading state, and error handling
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Skip auth check if we're in the OAuth callback flow
        if (isOAuthCallback()) {
          console.log('🔄 OAuth callback detected, skipping auth check');
          setIsLoading(false);
          return;
        }
        
        console.log('🔍 Verifying authentication status...');
        const authResult = await checkAuthStatus();
        
        console.log('✅ Auth verification result:', {
          authenticated: authResult.authenticated,
          expires_at: authResult.expires_at,
          scope: authResult.scope
        });
        
        setIsAuthenticated(authResult.authenticated);
        setAuthData(authResult);
        
        if (authResult.authenticated) {
          console.log('🎉 User is authenticated');
        } else {
          console.log('🔐 User is not authenticated');
        }
        
      } catch (err) {
        console.error('❌ Auth verification failed:', err);
        setError(err);
        setIsAuthenticated(false);
        setAuthData(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  /**
   * Manually refresh authentication status
   * Useful after login/logout or when auth state might have changed
   */
  const refreshAuth = async () => {
    console.log('🔄 Manually refreshing auth status...');
    
    try {
      setError(null);
      
      const authResult = await checkAuthStatus();
      setIsAuthenticated(authResult.authenticated);
      setAuthData(authResult);
      
      console.log('✅ Auth refresh complete:', {
        authenticated: authResult.authenticated
      });
      
      return authResult;
    } catch (err) {
      console.error('❌ Auth refresh failed:', err);
      setError(err);
      setIsAuthenticated(false);
      setAuthData(null);
      throw err;
    }
  };

  /**
   * Check if the current session is expired
   */
  const isSessionExpired = () => {
    if (!authData || !authData.expires_at) {
      return false; // No expiry info available
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = authData.expires_at;
    
    return now >= expiresAt;
  };

  /**
   * Get time until session expires (in seconds)
   */
  const getTimeUntilExpiry = () => {
    if (!authData || !authData.expires_at) {
      return null;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = authData.expires_at;
    
    return Math.max(0, expiresAt - now);
  };

  return {
    // Authentication state
    isAuthenticated,
    isLoading,
    error,
    authData,
    
    // Session information
    isSessionExpired: isSessionExpired(),
    timeUntilExpiry: getTimeUntilExpiry(),
    
    // Actions
    refreshAuth
  };
}

/**
 * Hook specifically for checking if authentication is required
 * Returns true if user should be redirected to login
 */
export function useAuthRequired() {
  const { isAuthenticated, isLoading, error } = useAuth();
  
  // Don't require auth if we're still loading
  if (isLoading) {
    return false;
  }
  
  // Don't require auth if there's an error (let error boundary handle it)
  if (error) {
    return false;
  }
  
  // Skip auth requirement if we're in OAuth callback
  if (isOAuthCallback()) {
    return false;
  }
  
  // Require auth if user is not authenticated
  return !isAuthenticated;
}

/**
 * Hook for components that need to wait for auth verification
 * before rendering content
 */
export function useAuthGate() {
  const { isAuthenticated, isLoading, error } = useAuth();
  
  const shouldShowLoading = isLoading && !isOAuthCallback();
  const shouldShowError = error && !isLoading;
  const shouldRedirectToLogin = !isLoading && !error && !isAuthenticated && !isOAuthCallback();
  const shouldShowContent = !isLoading && !error && isAuthenticated;
  
  return {
    shouldShowLoading,
    shouldShowError,
    shouldRedirectToLogin,
    shouldShowContent,
    error
  };
}