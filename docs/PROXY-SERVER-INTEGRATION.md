# NBG Proxy Server Integration Guide

This guide explains how to integrate and use the OAuth2 HTTPS proxy server with the NBG Merchant Insights UI.

## Quick Start

### 1. Setup the Proxy Server

```bash
# Setup proxy server dependencies and certificates
npm run proxy:setup

# Copy environment configuration
cp proxy-server/.env.example proxy-server/.env
```

### 2. Configure Environment

Edit `proxy-server/.env` with your specific settings:

```env
# Required: OAuth2 Configuration
OAUTH_CLIENT_ID=your-actual-client-id
OAUTH_CLIENT_SECRET=your-actual-client-secret
OAUTH_REDIRECT_URI=https://localhost:5443/signin-nbg/

# Required: Security Keys (generate strong random keys)
COOKIE_ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret

# Optional: Backend API (if different from default)
BACKEND_API_URL=http://your-backend-api:3000/

# Optional: Disable OAuth for development
NBG_OAUTH_ENABLED=false
```

### 3. Build and Run

```bash
# Build React app and start proxy server
npm run proxy

# Or for development with auto-reload
npm run proxy:dev

# Test the proxy server
npm run proxy:test
```

The proxy server will be available at `https://localhost:5443`

## Architecture

### Request Flow

```
Browser → HTTPS Proxy (5443) → Backend API (3000)
   ↓           ↓                      ↓
User Auth → OAuth2 Flow → Bearer Token → API Response
```

### Directory Structure

```
nbg-business-insights/
├── dist/                    # Built React app (served by proxy)
├── src/                     # React source code
├── mock-server/             # Development API server
└── proxy-server/            # Production HTTPS proxy
    ├── server.js           # Main server
    ├── routes/oauth.js     # OAuth2 endpoints
    ├── middleware/         # Auth, proxy, static middleware
    ├── utils/              # Config, crypto, certificates
    └── certs/              # SSL certificates
```

## OAuth2 Integration

### Authentication Flow

1. **User visits app** → `https://localhost:5443/`
2. **Check auth status** → Cookie contains valid token?
3. **If not authenticated** → Redirect to `/login`
4. **OAuth2 flow** → NBG Identity Server authentication
5. **Token received** → Encrypted and stored in secure cookie
6. **API requests** → Automatic Bearer token injection

### Frontend Integration

The proxy server is transparent to your React application. No code changes needed:

```javascript
// Your existing API calls work unchanged
const response = await fetch('/api/analytics/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

// Proxy automatically adds: Authorization: Bearer <token>
```

### Logout Integration

Add logout functionality to your React app:

```javascript
// Logout handler
const handleLogout = () => {
  window.location.href = '/logout';
};
```

## Development vs Production

### Development Mode

```bash
# Use mock server for API (port 3001)
npm run dev

# Use proxy server with OAuth disabled
NBG_OAUTH_ENABLED=false npm run proxy:dev
```

### Production Mode

```bash
# Build and deploy with proxy server
npm run proxy
```

### Environment Differences

| Feature | Development | Production |
|---------|-------------|------------|
| **SSL** | Self-signed certificates | Trusted CA certificates |
| **OAuth** | Can be disabled | Always enabled |
| **API** | Mock server or real API | Real backend API |
| **Compression** | Enabled | Enabled |
| **Logging** | Verbose | Production-level |

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NBG_OAUTH_ENABLED` | Enable OAuth2 flow | `true` |
| `PROXY_PORT` | HTTPS port | `5443` |
| `BACKEND_API_URL` | Backend API endpoint | `http://localhost:3000/` |
| `NODE_ENV` | Environment mode | `development` |

### Security Configuration

```env
# Generate secure keys
COOKIE_ENCRYPTION_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# OAuth2 settings (from NBG)
OAUTH_AUTHORITY_URL=https://my.nbg.gr/identity
OAUTH_CLIENT_ID=E650063E-5086-4D97-93F0-414B6B581C82
OAUTH_CLIENT_SECRET=31514F5B-D0E2-440B-80AF-7C37E13AEA9A
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run proxy:setup` | Install dependencies and generate certificates |
| `npm run proxy` | Build React app and start production proxy |
| `npm run proxy:dev` | Start proxy in development mode |
| `npm run proxy:test` | Test proxy server endpoints |

## Endpoints

### Application Endpoints

- `GET /` - React application
- `GET /health` - Health check
- `GET /auth/status` - Authentication status

### OAuth2 Endpoints

- `GET /login` - Start OAuth2 flow
- `GET /signin-nbg/` - OAuth2 callback
- `GET|POST /logout` - Clear auth and logout

### API Proxy

- `ANY /api/*` - Proxied to backend with auth

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   ```bash
   npm run proxy:setup
   ```

2. **OAuth Configuration**
   - Verify client ID/secret with NBG
   - Check redirect URI matches exactly
   - Ensure authority URL is accessible

3. **Backend Connection**
   - Verify `BACKEND_API_URL` is correct
   - Check backend server is running
   - Review proxy logs for connection errors

4. **Authentication Loops**
   - Clear browser cookies
   - Check token expiration
   - Verify encryption key consistency

### Debug Mode

Enable detailed logging:

```bash
NODE_ENV=development npm run proxy:dev
```

### Test Connectivity

```bash
# Test proxy server
npm run proxy:test

# Test OAuth endpoints
curl -k https://localhost:5443/health
curl -k https://localhost:5443/auth/status
```

## Production Deployment

### SSL Certificates

Replace development certificates:

```bash
# Production certificates
cp your-domain.key proxy-server/certs/localhost-key.pem
cp your-domain.crt proxy-server/certs/localhost.pem
```

### Environment Setup

```bash
# Production environment
NODE_ENV=production
PROXY_PORT=443
PROXY_URL=https://your-domain.com
NBG_OAUTH_ENABLED=true
```

### Process Management

Use PM2 for production:

```bash
# Install PM2
npm install -g pm2

# Start proxy server
cd proxy-server
pm2 start server.js --name nbg-proxy

# Auto-startup
pm2 startup
pm2 save
```

## Security Considerations

- **Encryption Keys**: Use strong, unique keys for each environment
- **SSL Certificates**: Use trusted CA certificates in production
- **OAuth Secrets**: Keep client secrets secure and rotate regularly
- **HTTPS Only**: Never serve the application over HTTP
- **Cookie Security**: HttpOnly, Secure, SameSite=Strict flags enabled
- **Headers**: Comprehensive security headers implemented

## Support

For issues or questions:

1. Check the proxy server logs
2. Verify environment configuration
3. Test with the provided test script
4. Review the OAuth2 flow in browser dev tools

The proxy server provides detailed logging to help diagnose issues.