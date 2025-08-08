# React Frontend Integration with OAuth2 Proxy

This document describes how to integrate the React application with the OAuth2 proxy server.

---

## Authentication Architecture

### Cookie-Based Session Management

The proxy server stores encrypted access tokens in a secure HttpOnly cookie named:

```
nbg_auth
```

⚠️ **Important**: This cookie is `HttpOnly` and cannot be accessed via JavaScript for security reasons.

### Authentication Flow

1. **Initial Check**: React app calls `/auth/status` to check authentication
2. **Unauthenticated**: API returns 401 → Frontend redirects to `/login`
3. **OAuth Flow**: `/login` → NBG OAuth → `/signin-nbg/` → Cookie set → Redirect to app
4. **Authenticated**: All `/api/*` requests include Bearer token automatically
5. **Token Expired**: Backend 401 → Proxy clears cookie → Frontend handles 401

---

## React Integration Implementation

### 1. Authentication Utilities

```javascript
// src/utils/auth.js

/**
 * Check authentication status via proxy endpoint
 * This is more reliable than checking cookies client-side
 */
export async function checkAuthStatus() {
  try {
    const response = await fetch('/auth/status', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    }
    
    return false;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return false;
  }
}

/**
 * Enhanced fetch with automatic auth handling
 */
export async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Always send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  // Handle 401 responses (authentication required)
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    
    if (data.requiresLogin) {
      // Clear any client-side auth state
      localStorage.removeItem('userStatus');
      
      // Redirect to login
      window.location.href = '/login';
      return null;
    }
  }

  // Handle other HTTP errors
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.response = response;
    throw error;
  }

  return response;
}

/**
 * Login utility - redirects to OAuth flow
 */
export function login(returnUrl = window.location.pathname) {
  const loginUrl = new URL('/login', window.location.origin);
  if (returnUrl !== '/') {
    loginUrl.searchParams.set('returnUrl', returnUrl);
  }
  window.location.href = loginUrl.toString();
}

/**
 * Logout utility
 */
export function logout(returnUrl = '/') {
  const logoutUrl = new URL('/logout', window.location.origin);
  if (returnUrl !== '/') {
    logoutUrl.searchParams.set('returnUrl', returnUrl);
  }
  window.location.href = logoutUrl.toString();
}
```

### 2. Authentication Hook

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { checkAuthStatus } from '../utils/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const authenticated = await checkAuthStatus();
        setIsAuthenticated(authenticated);
        
      } catch (err) {
        console.error('Auth verification failed:', err);
        setError(err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  return { isAuthenticated, isLoading, error };
}
```

### 3. Protected Route Component

```javascript
// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { login } from '../utils/auth';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">Unable to verify authentication status</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login
    login();
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return children;
}
```

### 4. Updated App Component

```javascript
// src/App.jsx
import React from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <ProtectedRoute>
      <div className="App">
        <Dashboard />
      </div>
    </ProtectedRoute>
  );
}

export default App;
```

### 5. API Service Integration

```javascript
// src/services/analyticsService.js
import { fetchWithAuth } from '../utils/auth';

export class AnalyticsService {
  
  async checkUserStatus(userID = 'XANDRH004400003') {
    const requestBody = {
      header: {
        ID: this.generateGUID(),
        application: 'merchant-insights-ui'
      },
      payload: { userID }
    };

    const response = await fetchWithAuth('/api/authorization/checkUserStatus', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    if (!response) return null; // 401 handled by fetchWithAuth
    
    return await response.json();
  }

  async fetchTabData(tabName, metricIDs, filters, options = {}) {
    const request = this.buildAnalyticsRequest(metricIDs, filters, options);
    
    const response = await fetchWithAuth('/api/analytics/query', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    if (!response) return null; // 401 handled by fetchWithAuth
    
    return await response.json();
  }

  // ... other methods
}
```

---

## Key Differences from Original Instructions

### ✅ **Corrections Made:**

1. **Cookie Name**: Changed from `nbg_auth_session` to `nbg_auth` (actual implementation)
2. **Authentication Check**: Use `/auth/status` endpoint instead of client-side cookie checking
3. **401 Handling**: Handle JSON 401 responses instead of redirects for API calls
4. **Security**: Account for HttpOnly cookies that can't be accessed via JavaScript
5. **Error Handling**: Comprehensive error handling for network and auth failures
6. **Loading States**: Proper loading states during authentication checks
7. **Return URLs**: Support for returning to original page after login

### ⚠️ **Critical Points:**

- **Always use `credentials: 'include'`** in fetch requests
- **Never check authentication via client-side cookie parsing** (HttpOnly cookies)
- **Handle 401 responses as JSON**, not redirects for API calls
- **Use the `/auth/status` endpoint** for reliable authentication checking
- **Implement proper loading states** during authentication verification

---

## Environment Configuration

```javascript
// vite.config.js or similar
export default {
  server: {
    proxy: {
      '/api': 'https://localhost:5443',
      '/auth': 'https://localhost:5443',
      '/login': 'https://localhost:5443',
      '/logout': 'https://localhost:5443'
    }
  }
}
```

This ensures all authentication-related requests go through the proxy server during development.