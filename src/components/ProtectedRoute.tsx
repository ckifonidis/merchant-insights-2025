import React from 'react';
import { useAuthState } from '../hooks/useAuthState.js';
import { login } from '../utils/auth.js';
import FirstPage from './FirstPage.jsx';
import LoadingPage from './LoadingPage.jsx';
import ErrorPage from './ErrorPage.jsx';
import NoAccessPage from './NoAccessPage.jsx';

/**
 * Protected Route Component
 * Handles routing based on authentication state - READ ONLY
 * Does NOT trigger authentication - only reads auth state from Redux
 * Authentication is handled by AuthenticationManager at the app level
 */
export function ProtectedRoute({ children }) {
  // Read authentication state from Redux (read-only)
  const {
    shouldShowLoading,
    shouldShowError,
    shouldRedirectToLogin,
    shouldShowFirstPage,
    shouldShowNoAccess,
    shouldShowDashboard,
    error,
    isAuthenticated
  } = useAuthState();

  // Step 1: Loading (either auth or service loading)
  if (shouldShowLoading) {
    return <LoadingPage />;
  }

  // Step 2: Error state
  if (shouldShowError) {
    return <ErrorPage error={error} onRetry={() => window.location.reload()} />;
  }

  // Step 3: Redirect to OAuth Login if not authenticated
  if (shouldRedirectToLogin) {
    setTimeout(() => login(), 1000);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="text-blue-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            You need to sign in to access this application.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  // Step 4: User needs to sign up for the service
  if (shouldShowFirstPage) {
    return <FirstPage onInterestClick={() => {
      // TODO: Implement signup flow or redirect to enrollment
      console.log('User expressed interest in signing up');
    }} />;
  }

  // Step 5: User access is denied
  if (shouldShowNoAccess) {
    return <NoAccessPage />;
  }

  // Step 6: User is enrolled - show dashboard
  if (shouldShowDashboard) {
    return children;
  }

  // Fallback state (should not normally reach here)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Loading Application
        </h2>
        <p className="text-gray-600">
          Please wait...
        </p>
      </div>
    </div>
  );
}

/**
 * Lightweight Protected Route for components that just need auth check
 * without full loading UI - READ-ONLY, does not trigger authentication
 */
export function RequireAuth({ children, fallback = null }) {
  const { shouldShowContent } = useAuthState();
  
  if (shouldShowContent) {
    return children;
  }
  
  return fallback;
}

export default ProtectedRoute;