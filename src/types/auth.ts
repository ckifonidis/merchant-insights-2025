/**
 * Authentication and User Type Definitions
 */

// User authentication status
export type UserStatus = 'signedup' | 'notsigned' | 'noaccess' | null;

// OAuth authentication data
export interface AuthData {
  authenticated: boolean;
  expires_at?: number;
  scope?: string | null;
}

// User information from OAuth provider
export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  hasPreferredUsername?: boolean;
}

// User service enrollment status response
export interface UserStatusResponse {
  status: UserStatus;
  requestId: string;
}

// User configuration response
export interface UserConfiguration {
  hasUserPreferences: boolean;
  userId: string;
  merchantCount: number;
  merchantIds?: string[];
  requestId: string;
}

// Merchant details
export interface MerchantDetails {
  merchantId: string;
  merchantName: string;
  requestId: string;
}

// Authentication state
export interface AuthState {
  // OAuth Authentication State
  isAuthenticated: boolean | null;
  authLoading: boolean;
  authError: string | null;
  authData: AuthData | null;
  userInfo: UserInfo | null;
  
  // User Service Enrollment State  
  userStatus: UserStatus;
  serviceLoading: boolean;
  serviceError: string | null;
  
  // Execution control
  isAuthenticating: boolean;
  lastUpdated: string | null;
}

// User configuration state
export interface UserConfigState {
  // User configuration data
  userConfig: UserConfiguration | null;
  userConfigLoading: boolean;
  userConfigError: string | null;
  
  // Merchant details
  merchants: Record<string, MerchantDetails>;
  merchantsLoading: boolean;
  merchantsError: string | null;
  
  // Derived data
  userId: string | null;
  primaryMerchant: MerchantDetails | null;
}