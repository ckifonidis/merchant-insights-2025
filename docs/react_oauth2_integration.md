# React Frontend Integration Instructions with OAuth2 Proxy

This document describes how to integrate the React application with the OAuth2 proxy server described in the proxy implementation specifications.

---

## Cookie-Based Authentication Flow

The proxy server will store the encrypted access token in a secure cookie named:

```
nbg_auth_session
```

This cookie indicates whether the user is authenticated.

---

## High-Level Flow

1. **User Visits Any Page**
   - React app checks for the presence of the `nbg_auth_session` cookie.
   - If present → proceed with the API request through the proxy.
   - If not present → request `/login` from the proxy, which redirects to the OAuth2 provider.

2. **Login**
   - `/login` will redirect the user to the OAuth2 Authorization URL.
   - After successful login and callback, the proxy will set the `nbg_auth_session` cookie.

3. **API Requests**
   - All requests to the backend API are made through the proxy (e.g., `fetch('/api/data')`).
   - If the cookie is missing or expired, the proxy will respond with a redirect to `/login`.

4. **401 Handling**
   - If the backend API returns a `401 Unauthorized`, the proxy will clear the cookie and redirect to `/login`.
   - React app will then follow the same authentication flow.

---

## Example React Utility

```javascript
// utils/auth.js

export function hasAuthCookie() {
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('nbg_auth_session='));
}

export async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: send cookies with the request
  });

  // If proxy redirects to login, the browser will follow the redirect automatically
  if (response.redirected) {
    window.location.href = response.url;
    return;
  }

  if (response.status === 401) {
    window.location.href = '/login';
    return;
  }

  return response;
}
```

---

## Example Usage in React

```javascript
import React, { useEffect, useState } from 'react';
import { hasAuthCookie, fetchWithAuth } from './utils/auth';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!hasAuthCookie()) {
      window.location.href = '/login';
      return;
    }

    fetchWithAuth('/api/dashboard-data')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('Error fetching data', err));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

## Key Points
- Always send requests through the proxy, not directly to the backend API.
- Always use `credentials: 'include'` when fetching to ensure cookies are sent.
- Handle redirects by allowing the browser to follow them automatically.
- Use `nbg_auth_session` cookie to determine authentication status.
