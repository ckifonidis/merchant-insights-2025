# Proxy Server Implementation

**Stack:** Node.js, Express.js

---

## Responsibilities

1. Serve the built React application over **HTTPS** using a valid certificate  
   - Self-signed certificate for development  
   - Trusted CA certificate for production  
2. Proxy frontend requests to the backend API, with optional path rewriting  
   - Example: `/api/...` → `backend_api/...`  
3. Expose OAuth2 Authorization Code endpoints  
   - `/login` – Redirect to OAuth2 provider  
   - `/signin-nbg/` – Handle redirect from provider  
   - `/logout` – Clear cookies and redirect to login page  
4. Store the received access token (and optional refresh token) in an **encrypted** cookie with:
   - `HttpOnly`
   - `Secure`
   - `SameSite=Strict`
5. For authenticated requests:
   - Retrieve the auth cookie  
   - Decrypt to get the access token  
   - Add `Authorization: Bearer <access_token>` to the proxied request  
6. On `401 Unauthorized` from the backend:
   - Clear the cookie immediately  
   - Redirect the user to the OAuth2 authorization URL  
7. Serve static frontend files efficiently
   - Enable gzip/brotli compression  
   - Set caching headers for static assets  
8. Keep all sensitive values (e.g., encryption key, OAuth client secret) in **environment variables** — never commit them to source control  

---

## OAuth2 Expected Configuration

```text
authority_url: https://my.nbg.gr/identity
token_url: {{authority_url}}/connect/token
auth_url:  {{authority_url}}/connect/authorize
client_id: E650063E-5086-4D97-93F0-414B6B581C82
client_secret: 31514F5B-D0E2-440B-80AF-7C37E13AEA9A
redirect_url: https://localhost:5443/signin-nbg/
response_type: code id_token
oauth2_nonce: required
```

**State and Nonce Handling**
- Generate a cryptographically-random `state` and `nonce` for each login request.  
- Store them temporarily in a short-lived, secure location (encrypted cookie or server-side in-memory store).  
- Validate both `state` and `nonce` on the callback to mitigate CSRF and replay attacks.  

---

## Application Configuration

```text
proxy_url: https://localhost:5443
backend_api: http://localhost:3000/
cookie_encryption_key: <secure-random-32-bytes>
```

**Environment variables (recommended)**
- `PROXY_URL`
- `BACKEND_API_URL`
- `OAUTH_AUTHORITY_URL`
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`
- `OAUTH_REDIRECT_URI` (https://localhost:5443/signin-nbg/)
- `COOKIE_ENCRYPTION_KEY` (32+ bytes)
- `NODE_ENV` (development|production)

---

## Expected Endpoints

### 1. Static Frontend
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | `GET` | Serves the built React app (`index.html`). |
| `/*` | `GET` | Serves static files for the React app (JS, CSS, images). Fallback to `index.html` for SPA routing. |

---

### 2. OAuth2 Flow
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | `GET` | Starts the OAuth2 authorization code flow. Redirects to `auth_url` with `client_id`, `redirect_uri`, `state`, and `nonce`. |
| `/signin-nbg/` *(redirect_url)* | `GET` | OAuth2 callback handler. Receives `code` and `id_token`, exchanges `code` for an access token at `token_url`, encrypts & stores token(s) in a secure cookie, then redirects user to `/` (or original `state` target). |
| `/logout` | `POST` / `GET` | Clears the auth cookie and redirects to `/login` or to an external logout endpoint if required by the identity provider. |

**Notes for callback:**
- Validate `state` and `nonce`.  
- Verify `id_token` (signature, issuer, audience, expiry) if included.  
- On successful token exchange, persist minimal session metadata if needed (expiry, scopes).

---

### 3. API Proxy
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/*` | `ANY` | Forwards the request to `backend_api` (path rewritten as needed). Before forwarding, attach `Authorization: Bearer <access_token>` taken from the decrypted auth cookie. |
| *(Optional)* `/auth/refresh` | `POST` | If refresh tokens are used, exchange refresh token for a new access token and update the cookie. Return appropriate status to the frontend. |

**Proxy behavior:**
- Preserve original request method, headers (except adapt `Host`/`Authorization`), query, and body.  
- Stream responses back to the client (support large responses).  
- On upstream `401`, invoke session handling (clear cookie + redirect to `/login`).

---

### 4. Error / Session Handling
| Endpoint / Component | Method | Description |
|----------------------|--------|-------------|
| Middleware (global) | — | Intercepts errors and proxy responses: on 401 from backend, clear cookie and redirect to `/login`. Return friendly error pages for 5xx when appropriate. |

---

## Implementation Notes & Recommendations

- **Static Files**: Use `express.static()` with appropriate `maxAge` for cache-control. Implement fallback to `index.html` for SPA routes.  
- **Compression**: Use `compression()` middleware to enable gzip/brotli.  
- **Proxy Library**: Use `http-proxy-middleware` for easy route setup and header manipulation. Configure timeouts and error handlers.  
- **Cookie Encryption**: Use a strong symmetric algorithm (e.g., AES-256-GCM). Rotate keys safely (support multiple keys for decryption during rotation).  
- **Token Storage Details**:
  - Store only tokens (access token, optional refresh token) and minimal metadata (expiry).  
  - Keep cookie size small; if tokens are large, consider server-side session store with a short session id cookie.  
- **Security Flags**: Always set `HttpOnly`, `Secure`, and `SameSite=Strict` on auth cookies. Consider `SameSite=Lax` only if cross-site navigation is required.  
- **CORS**: Proxy removes many CORS complications, but ensure backend CORS is compatible with your architecture (esp. for direct API calls in any other contexts).  
- **Error Handling**: Implement centralized error middleware to log (without tokens) and return sanitized messages to clients.  
- **Environment Separation**: Use different env/configs for development, staging, and production. Keep secrets out of VCS.  
- **Logging & Monitoring**: Log events like login, logout, token-exchange failures, and 401s (avoid logging tokens). Instrument metrics for proxy latency and error rates.  
- **Graceful Shutdown**: Ensure proxy closes active connections and pending token exchanges cleanly on shutdown.

---

## Minimal Endpoint Flow (summary)

1. Client requests `/` → React app served.  
2. If user unauthenticated, frontend triggers `/login`.  
3. `/login` redirects user to `auth_url` with `state` and `nonce`.  
4. Provider redirects to `/signin-nbg/?code=...&state=...` → proxy exchanges code for token at `token_url`.  
5. Proxy stores encrypted token in HttpOnly cookie and redirects user back to app.  
6. Client sends requests to `/api/...` → proxy decrypts cookie, injects `Authorization` header, forwards to `backend_api`.  
7. If backend responds `401` → proxy clears cookie and redirects user to `/login`.

---

## Example Minimal Cookie Payload (encrypted)
```json
{
  "access_token": "<JWT or opaque token>",
  "refresh_token": "<optional>",
  "expires_at": 1712345678,
  "scope": "openid profile api.read"
}
```

Keep the plaintext payload minimal before encryption.

---

## Appendix: Quick Dev Tips

- During local dev with self-signed certs, add the cert to trusted store or use `localhost` development helpers (e.g., mkcert).  
- Keep `redirect_uri` consistent between the app and the identity provider configuration.  
- If using `id_token`, validate it server-side to ensure correct audience/issuer.  
- Prefer short-lived access tokens; rely on refresh token flow (if available) for seamless UX.