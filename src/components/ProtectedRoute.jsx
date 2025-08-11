import React from 'react';
import { useAuthGate } from '../hooks/useAuth.js';
import { useUserStatusGate } from '../hooks/useUserStatus.js';
import { login } from '../utils/auth.js';
import FirstPage from './FirstPage.jsx';
import LoadingPage from './LoadingPage.jsx';
import ErrorPage from './ErrorPage.jsx';
import NoAccessPage from './NoAccessPage.jsx';

/**
 * Protected Route Component
 * Handles authentication verification and renders appropriate UI based on auth state
 */
export function ProtectedRoute({ children }) {
  const {
    shouldShowLoading: authLoading,
    shouldShowError: authError,
    shouldRedirectToLogin,
    shouldShowContent: isAuthenticated,
    error: authErrorDetails
  } = useAuthGate();

  const {
    shouldShowLoading: userStatusLoading,
    shouldShowError: userStatusError,
    shouldShowFirstPage,
    shouldShowNoAccess,
    shouldShowDashboard,
    error: userStatusErrorDetails
  } = useUserStatusGate(isAuthenticated); // Only check user status if OAuth succeeded

  // Step 1: OAuth Authentication Loading
  if (authLoading) {
    return <LoadingPage />;
  }

  // Step 2: OAuth Authentication Error
  if (authError) {
    return <ErrorPage error={authErrorDetails} onRetry={() => window.location.reload()} />;
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

  // Step 4: If OAuth authenticated, check user service enrollment
  if (isAuthenticated) {
    // User Status Loading (checking service enrollment)
    if (userStatusLoading) {
      return <LoadingPage />;
    }

    // User Status Error (service enrollment check failed)
    if (userStatusError) {
      return <ErrorPage error={userStatusErrorDetails} onRetry={() => window.location.reload()} />;
    }

    // User needs to sign up for the service
    if (shouldShowFirstPage) {
      return <FirstPage onInterestClick={() => {
        // TODO: Implement signup flow or redirect to enrollment
        console.log('User expressed interest in signing up');
      }} />;
    }

    // User access is denied
    if (shouldShowNoAccess) {
      return <NoAccessPage />;
    }

    // User is enrolled - show dashboard
    if (shouldShowDashboard) {
      return children;
    }
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
 * without full loading UI
 */
export function RequireAuth({ children, fallback = null }) {
  const { shouldShowContent } = useAuthGate();
  
  if (shouldShowContent) {
    return children;
  }
  
  return fallback;
}

export default ProtectedRoute;