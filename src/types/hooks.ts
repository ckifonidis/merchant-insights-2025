/**
 * Custom Hook Type Definitions
 */

import { MetricId, ProcessedMetricData, RawMetricData } from './analytics';
import { AuthState, UserInfo, UserStatus } from './auth';

// Hook return types for data fetching
export interface UseMetricDataReturn {
  data: RawMetricData | Record<string, RawMetricData> | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => void;
  refetch: () => void;
}

// Options for useMetricData hook
export interface UseMetricDataOptions {
  autoFetch?: boolean;
  yearOverYear?: boolean;
  selector?: 'raw' | 'card' | 'timeSeries' | 'categorical';
  [key: string]: any;
}

// Dashboard data hook return type
export interface UseDashboardDataReturn extends UseMetricDataReturn {
  data: Record<string, RawMetricData>;
}

// Revenue data hook return type
export interface UseRevenueDataReturn extends UseMetricDataReturn {
  data: Record<string, RawMetricData>;
}

// Auth hook return type
export interface UseAuthReturn extends AuthState {
  refreshAuth: () => Promise<AuthState>;
  refreshUserStatus: () => Promise<void>;
}

// Auth state hook return type (read-only)
export interface UseAuthStateReturn {
  // Auth state flags
  shouldShowLoading: boolean;
  shouldShowError: boolean;
  shouldRedirectToLogin: boolean;
  shouldShowFirstPage: boolean;
  shouldShowNoAccess: boolean;
  shouldShowDashboard: boolean;
  shouldShowContent: boolean;
  
  // Raw state
  isAuthenticated: boolean | null;
  authLoading: boolean;
  serviceLoading: boolean;
  userStatus: UserStatus;
  error: string | null;
  userInfo: UserInfo | null;
}

// User info hook return type
export interface UseUserInfoReturn extends UserInfo {}

// Responsive hook return type
export interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

// Hook options for authentication
export interface UseAuthOptions {
  checkUserService?: boolean;
  enableAutoRefresh?: boolean;
}