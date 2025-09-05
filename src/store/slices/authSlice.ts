import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthData, UserInfo, UserStatus } from '../../types/auth';
import type { SignupStep, SubmissionStatus } from '../../types/onboarding';
import { RootState } from '../index';

/**
 * Redux slice for global authentication state
 * Single source of truth for all auth-related data
 */
const initialState: AuthState = {
  // OAuth Authentication State
  isAuthenticated: null, // null = loading, true = authenticated, false = not authenticated
  authLoading: true,
  authError: null,
  authData: null,
  userInfo: null,
  
  // User Service Enrollment State  
  userStatus: null, // null = loading, 'signedup', 'notsigned', 'noaccess'
  serviceLoading: false,
  serviceError: null,
  
  // Signup/Onboarding State (simplified)
  signupLoading: false,
  signupError: null,
  signupSuccess: false,
  userEmail: null,
  submissionStatus: null,
  signupStep: 'idle',
  
  // Execution control
  isAuthenticating: false,
  lastUpdated: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // OAuth Authentication Actions
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.authError = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setAuthData: (state, action: PayloadAction<AuthData | null>) => {
      state.authData = action.payload;
    },
    setUserInfo: (state, action: PayloadAction<UserInfo | null>) => {
      state.userInfo = action.payload;
    },
    
    // User Service Actions
    setServiceLoading: (state, action: PayloadAction<boolean>) => {
      state.serviceLoading = action.payload;
    },
    setServiceError: (state, action: PayloadAction<string | null>) => {
      state.serviceError = action.payload;
    },
    setUserStatus: (state, action: PayloadAction<UserStatus>) => {
      state.userStatus = action.payload;
    },
    
    // Signup/Onboarding Actions (simplified)
    setSignupLoading: (state, action: PayloadAction<boolean>) => {
      state.signupLoading = action.payload;
    },
    setSignupError: (state, action: PayloadAction<string | null>) => {
      state.signupError = action.payload;
    },
    setSignupSuccess: (state, action: PayloadAction<boolean>) => {
      state.signupSuccess = action.payload;
    },
    setUserEmail: (state, action: PayloadAction<string | null>) => {
      state.userEmail = action.payload;
    },
    setSubmissionStatus: (state, action: PayloadAction<SubmissionStatus | null>) => {
      state.submissionStatus = action.payload;
    },
    setSignupStep: (state, action: PayloadAction<SignupStep>) => {
      state.signupStep = action.payload;
    },
    
    // Control Actions
    setAuthenticating: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticating = action.payload;
    },
    updateLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
    
    // Reset Actions
    resetAuthState: (state) => {
      state.isAuthenticated = null;
      state.authLoading = true;
      state.authError = null;
      state.authData = null;
      state.userInfo = null;
      state.userStatus = null;
      state.serviceLoading = false;
      state.serviceError = null;
      state.isAuthenticating = false;
    },
    resetSignupState: (state) => {
      state.signupLoading = false;
      state.signupError = null;
      state.signupSuccess = false;
      state.userEmail = null;
      state.submissionStatus = null;
      state.signupStep = 'idle';
    },
    
    // Bulk update for efficiency
    updateAuthState: (state, action) => {
      Object.assign(state, action.payload);
      state.lastUpdated = new Date().toISOString();
    }
  }
});

// Export actions
export const {
  setAuthLoading,
  setAuthError,
  setAuthenticated,
  setAuthData,
  setUserInfo,
  setServiceLoading,
  setServiceError,
  setUserStatus,
  setSignupLoading,
  setSignupError,
  setSignupSuccess,
  setUserEmail,
  setSubmissionStatus,
  setSignupStep,
  setAuthenticating,
  updateLastUpdated,
  resetAuthState,
  resetSignupState,
  updateAuthState
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: RootState): boolean | null => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState): boolean => state.auth.authLoading;
export const selectAuthError = (state: RootState): string | null => state.auth.authError;
export const selectAuthData = (state: RootState): AuthData | null => state.auth.authData;
export const selectUserInfo = (state: RootState): UserInfo | null => state.auth.userInfo;
export const selectUserStatus = (state: RootState): UserStatus => state.auth.userStatus;
export const selectServiceLoading = (state: RootState): boolean => state.auth.serviceLoading;
export const selectServiceError = (state: RootState): string | null => state.auth.serviceError;
export const selectIsAuthenticating = (state: RootState): boolean => state.auth.isAuthenticating;

// Computed selectors
export const selectIsLoading = (state: RootState): boolean => 
  state.auth.authLoading || state.auth.serviceLoading;

export const selectHasError = (state: RootState): boolean => 
  !!(state.auth.authError || state.auth.serviceError);

export const selectCombinedError = (state: RootState): string | null => 
  state.auth.authError || state.auth.serviceError;

// Auth status checks
export const selectHasServiceAccess = (state: RootState): boolean => 
  state.auth.userStatus === 'signedup';

export const selectNeedsSignup = (state: RootState): boolean => 
  state.auth.userStatus === 'notsigned';

export const selectIsAccessDenied = (state: RootState): boolean => 
  state.auth.userStatus === 'noaccess';

// Session information
export const selectIsSessionExpired = (state: RootState): boolean => {
  const authData = state.auth.authData;
  if (!authData || !authData.expires_at) return false;
  return Math.floor(Date.now() / 1000) >= authData.expires_at;
};

export const selectTimeUntilExpiry = (state: RootState): number | null => {
  const authData = state.auth.authData;
  if (!authData || !authData.expires_at) return null;
  return Math.max(0, authData.expires_at - Math.floor(Date.now() / 1000));
};

// Signup/Onboarding selectors
export const selectSignupLoading = (state: RootState): boolean => state.auth.signupLoading;
export const selectSignupError = (state: RootState): string | null => state.auth.signupError;
export const selectSignupSuccess = (state: RootState): boolean => state.auth.signupSuccess;
export const selectUserEmail = (state: RootState): string | null => state.auth.userEmail;
export const selectSubmissionStatus = (state: RootState) => state.auth.submissionStatus;
export const selectSignupStep = (state: RootState) => state.auth.signupStep;

// Computed signup selectors
export const selectCanSubmitSignup = (state: RootState): boolean => {
  const status = state.auth.submissionStatus;
  return status ? status.canProceed : false;
};

export const selectShouldShowSignupForm = (state: RootState): boolean => {
  return state.auth.userStatus === 'notsigned' && state.auth.signupStep === 'form';
};

export default authSlice.reducer;