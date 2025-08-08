/**
 * Universal Authentication Utilities
 * Handles OAuth2 authentication for all API requests through the proxy server
 */

/**
 * Check authentication status via proxy endpoint
 * This is the definitive way to verify if user is authenticated
 */
export async function checkAuthStatus() {
  try {
    const response = await fetch('/auth/status', {
      credentials: 'include',
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        authenticated: data.authenticated,
        expires_at: data.expires_at,
        scope: data.scope
      };
    }
    
    return { authenticated: false };
  } catch (error) {
    console.error('Auth status check failed:', error);
    return { authenticated: false };
  }
}

/**
 * Universal fetch wrapper with automatic OAuth2 authentication handling
 * Use this for ALL API requests to ensure proper auth handling
 */
export async function fetchWithAuth(url, options = {}) {
  const requestOptions = {
    ...options,
    credentials: 'include', // Always send cookies with requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, requestOptions);

    // Handle 401 Unauthorized responses (authentication required)
    if (response.status === 401) {
      console.log('🔐 401 Unauthorized received, handling authentication...');
      
      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        console.warn('Could not parse 401 response as JSON');
      }

      // Check if this is an OAuth authentication requirement
      if (responseData.requiresLogin || responseData.error === 'Unauthorized') {
        console.log('🔄 Redirecting to OAuth login...');
        
        // Clear any client-side auth state
        localStorage.removeItem('userStatus');
        localStorage.removeItem('authState');
        
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?returnUrl=${returnUrl}`;
        
        // Return null to indicate auth redirect in progress
        return null;
      }
    }

    // Handle other HTTP errors normally
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      
      // Try to get error details from response
      try {
        const errorData = await response.json();
        error.data = errorData;
        error.message = errorData.message || error.message;
      } catch (e) {
        // Response is not JSON, keep original error
      }
      
      throw error;
    }

    return response;
  } catch (error) {
    // Network or other fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🌐 Network error during API request:', error);
      const networkError = new Error('Network error - please check your connection');
      networkError.originalError = error;
      throw networkError;
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Login utility - redirects to OAuth flow
 */
export function login(returnUrl = window.location.pathname + window.location.search) {
  console.log('🔐 Initiating OAuth login flow...');
  
  const loginUrl = new URL('/login', window.location.origin);
  if (returnUrl && returnUrl !== '/') {
    loginUrl.searchParams.set('returnUrl', returnUrl);
  }
  
  console.log('🔄 Redirecting to:', loginUrl.toString());
  window.location.href = loginUrl.toString();
}

/**
 * Logout utility - clears session and redirects
 */
export function logout(returnUrl = '/') {
  console.log('🚪 Initiating logout...');
  
  // Clear client-side state
  localStorage.removeItem('userStatus');
  localStorage.removeItem('authState');
  
  const logoutUrl = new URL('/logout', window.location.origin);
  if (returnUrl && returnUrl !== '/') {
    logoutUrl.searchParams.set('returnUrl', returnUrl);
  }
  
  console.log('🔄 Redirecting to logout:', logoutUrl.toString());
  window.location.href = logoutUrl.toString();
}

/**
 * Helper to make authenticated API calls with automatic retry on auth failure
 */
export async function apiCall(url, options = {}) {
  const response = await fetchWithAuth(url, options);
  
  // If response is null, it means auth redirect is in progress
  if (response === null) {
    throw new Error('Authentication required - redirecting to login');
  }
  
  return response;
}

/**
 * Helper to make authenticated API calls and parse JSON response
 */
export async function apiCallJson(url, options = {}) {
  const response = await apiCall(url, options);
  
  if (!response) {
    return null;
  }
  
  const data = await response.json();
  return data;
}

/**
 * Helper to check if we're currently in the OAuth callback flow
 */
export function isOAuthCallback() {
  return window.location.pathname === '/signin-nbg/' || 
         window.location.search.includes('code=') ||
         window.location.hash.includes('code=');
}

/**
 * Error handler for authentication-related errors
 */
export function handleAuthError(error) {
  console.error('🚨 Authentication error:', error);
  
  if (error.status === 401) {
    console.log('🔐 401 error - triggering login flow');
    login();
    return;
  }
  
  if (error.message?.includes('Authentication required')) {
    console.log('🔐 Auth required error - login already in progress');
    return;
  }
  
  // For other errors, re-throw
  throw error;
}