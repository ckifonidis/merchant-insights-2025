import { useSelector } from 'react-redux';
import { isOAuthCallback } from '../utils/auth.js';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthData,
  selectUserInfo,
  selectUserStatus,
  selectServiceLoading,
  selectServiceError,
  selectIsLoading,
  selectHasError,
  selectCombinedError,
  selectHasServiceAccess,
  selectNeedsSignup,
  selectIsAccessDenied,
  selectIsSessionExpired,
  selectTimeUntilExpiry
} from '../store/slices/authSlice.js';
import type { RootState } from '../store/index';
import type { UserInfo, UserStatus, AuthData } from '../types/auth';

interface AuthStateHook {
  // Authentication state
  isAuthenticated: boolean | null;
  authLoading: boolean;
  authError: string | null;
  authData: AuthData | null;
  userInfo: UserInfo | null;
  
  // User service state
  userStatus: UserStatus;
  serviceLoading: boolean;
  serviceError: string | null;
  
  // Combined state
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
  
  // Session information
  isSessionExpired: boolean;
  timeUntilExpiry: number | null;
  
  // User status checks
  hasServiceAccess: boolean;
  needsSignup: boolean;
  isAccessDenied: boolean;
  
  // Routing decisions
  shouldShowLoading: boolean;
  shouldShowError: boolean;
  shouldRedirectToLogin: boolean;
  shouldShowFirstPage: boolean;
  shouldShowNoAccess: boolean;
  shouldShowDashboard: boolean;
  shouldShowContent: boolean;
}

/**
 * Read-only hook for accessing authentication state
 * Does NOT trigger authentication - only reads from Redux store
 */
export function useAuthState(): AuthStateHook {
  // Basic auth state
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state));
  const authLoading = useSelector((state: RootState) => selectAuthLoading(state));
  const authError = useSelector((state: RootState) => selectAuthError(state));
  const authData = useSelector((state: RootState) => selectAuthData(state));
  const userInfo = useSelector((state: RootState) => selectUserInfo(state));
  
  // Service state
  const userStatus = useSelector((state: RootState) => selectUserStatus(state));
  const serviceLoading = useSelector((state: RootState) => selectServiceLoading(state));
  const serviceError = useSelector((state: RootState) => selectServiceError(state));
  
  // Computed state
  const isLoading = useSelector((state: RootState) => selectIsLoading(state));
  const hasError = useSelector((state: RootState) => selectHasError(state));
  const error = useSelector((state: RootState) => selectCombinedError(state));
  
  // Status checks
  const hasServiceAccess = useSelector((state: RootState) => selectHasServiceAccess(state));
  const needsSignup = useSelector((state: RootState) => selectNeedsSignup(state));
  const isAccessDenied = useSelector((state: RootState) => selectIsAccessDenied(state));
  
  // Session info
  const isSessionExpired = useSelector((state: RootState) => selectIsSessionExpired(state));
  const timeUntilExpiry = useSelector((state: RootState) => selectTimeUntilExpiry(state));
  
  // Routing decisions
  const shouldShowLoading = isLoading;
  const shouldShowError = hasError && !isLoading;
  const shouldRedirectToLogin = !isLoading && !authError && !isAuthenticated && !isOAuthCallback();
  const shouldShowFirstPage = !isLoading && !authError && isAuthenticated && needsSignup;
  const shouldShowNoAccess = !isLoading && !authError && isAuthenticated && isAccessDenied;
  const shouldShowDashboard = !isLoading && !authError && isAuthenticated && hasServiceAccess;
  const shouldShowContent = shouldShowDashboard; // Alias for compatibility
  
  return {
    // Authentication state
    isAuthenticated,
    authLoading,
    authError,
    authData,
    userInfo,
    
    // User service state
    userStatus,
    serviceLoading,
    serviceError,
    
    // Combined state
    isLoading,
    hasError,
    error,
    
    // Session information
    isSessionExpired,
    timeUntilExpiry,
    
    // User status checks
    hasServiceAccess,
    needsSignup,
    isAccessDenied,
    
    // Routing decisions
    shouldShowLoading,
    shouldShowError,
    shouldRedirectToLogin,
    shouldShowFirstPage,
    shouldShowNoAccess,
    shouldShowDashboard,
    shouldShowContent
  };
}

/**
 * Hook for accessing just user info
 */
export function useUserInfo() {
  return useSelector(selectUserInfo);
}

/**
 * Hook for accessing just user status
 */
export function useUserStatus() {
  const userStatus = useSelector(selectUserStatus);
  const serviceLoading = useSelector(selectServiceLoading);
  const serviceError = useSelector(selectServiceError);
  const hasServiceAccess = useSelector(selectHasServiceAccess);
  const needsSignup = useSelector(selectNeedsSignup);
  const isAccessDenied = useSelector(selectIsAccessDenied);
  
  return {
    userStatus,
    isLoading: serviceLoading,
    error: serviceError,
    hasServiceAccess,
    needsSignup,
    isAccessDenied
  };
}

/**
 * Legacy compatibility hooks that use the read-only state
 */
export function useAuthGate() {
  const {
    shouldShowLoading,
    shouldShowError,
    shouldRedirectToLogin,
    shouldShowContent,
    error
  } = useAuthState();
  
  return {
    shouldShowLoading,
    shouldShowError,
    shouldRedirectToLogin,
    shouldShowContent,
    error
  };
}

export function useUserStatusGate(enabled = true) {
  const {
    shouldShowLoading,
    shouldShowError,
    shouldShowFirstPage,
    shouldShowNoAccess,
    shouldShowDashboard,
    error,
    userStatus
  } = useAuthState();
  
  // Only show user status states if enabled (authenticated)
  if (!enabled) {
    return {
      shouldShowLoading: false,
      shouldShowError: false,
      shouldShowFirstPage: false,
      shouldShowNoAccess: false,
      shouldShowDashboard: false,
      error: null,
      userStatus: null
    };
  }
  
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

export function useAuthRequired() {
  const { shouldRedirectToLogin } = useAuthState();
  return shouldRedirectToLogin;
}