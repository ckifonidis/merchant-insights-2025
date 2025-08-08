import React from 'react';
import { useAuthGate } from '../hooks/useAuth.js';
import { login } from '../utils/auth.js';

/**
 * Protected Route Component
 * Handles authentication verification and renders appropriate UI based on auth state
 */
export function ProtectedRoute({ children }) {
  const {
    shouldShowLoading,
    shouldShowError,
    shouldRedirectToLogin,
    shouldShowContent,
    error
  } = useAuthGate();

  // Show loading state while verifying authentication
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Checking Authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your login status...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if authentication verification failed
  if (shouldShowError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to verify your authentication status. This might be due to a network issue or server problem.
          </p>
          <div className="text-sm text-gray-500 mb-6 p-3 bg-gray-100 rounded">
            Error: {error?.message || 'Unknown authentication error'}
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry Authentication
            </button>
            <button 
              onClick={() => login()} 
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required
  if (shouldRedirectToLogin) {
    // Show a brief message before redirect
    setTimeout(() => {
      login();
    }, 1000);

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

  // Show the protected content if authenticated
  if (shouldShowContent) {
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