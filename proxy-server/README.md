# NBG Merchant Insights Proxy Server

A secure HTTPS proxy server with OAuth2 authentication for the NBG Merchant Insights UI application.

**Available Implementations:**
- **Node.js**: Express-based proxy server (in `node/` directory)
- **.NET Core 8**: ASP.NET Core-based proxy server (in `csharp/` directory)

## Features

- 🔒 **Unified SSL Certificates** - Smart certificate management with seamless switching between implementations
- 🔐 **OAuth2 Integration** - Full authorization code flow with NBG Identity Server
- 🍪 **Encrypted Cookies** - AES-256-GCM encryption for secure token storage
- 🔄 **API Proxy** - Seamless proxying to backend API with automatic token injection
- 📱 **SPA Support** - Static file serving with client-side routing fallback
- 🚀 **Production Ready** - Comprehensive error handling and security headers
- ⚖️ **Technology Choice** - Choose between Node.js or .NET Core based on your preferences

## Quick Start

Choose your preferred implementation:

### 🟢 Node.js Implementation

#### Prerequisites
- Node.js 18+ 
- OpenSSL (for certificate generation)
- Backend API running on the configured port

#### Installation
```bash
# Install dependencies
cd proxy-server/node
npm install

# SSL certificates are automatically managed by start.sh
# Uses .NET Core development certificates when available, 
# falls back to OpenSSL generation otherwise

# Copy and configure environment
cp .env.example .env
# Edit .env with your specific configuration
```

#### Running
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 🔵 .NET Core 8 Implementation

#### Prerequisites
- .NET Core 8 SDK
- Backend API running on the configured port

#### Installation
```bash
# Navigate to .NET Core implementation
cd proxy-server/csharp/MerchantInsightsProxy

# Restore dependencies
dotnet restore
```

#### Configuration
Create `appsettings.Development.json` for local development:
```json
{
  "Proxy": {
    "Port": "5443",
    "ProxyUrl": "https://localhost:5443",
    "BackendApiUrl": "http://localhost:3001"
  },
  "OAuth": {
    "Enabled": true,
    "ClientId": "your-client-id",
    "ClientSecret": "your-client-secret"
  },
  "Security": {
    "CookieEncryptionKey": "your-32-byte-encryption-key-here-12345",
    "SessionSecret": "your-session-secret-here"
  }
}
```

#### Running
```bash
# Development
dotnet run

# Production
dotnet run --configuration Release
```

### Configuration

Edit `.env` file with your settings:

```env
# Server Configuration
NODE_ENV=development
PROXY_PORT=5443
PROXY_URL=https://localhost:5443

# Backend API
BACKEND_API_URL=http://localhost:3000/

# OAuth2 Configuration
OAUTH_AUTHORITY_URL=https://my.nbg.gr/identity
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=https://localhost:5443/signin-nbg/

# Security
COOKIE_ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_SECRET=your-session-secret-here

# Feature Flags
NBG_OAUTH_ENABLED=true
```

### Running

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## 🔒 SSL Certificate Management

Both Node.js and .NET Core implementations use **unified certificate management** for seamless switching:

### **Smart Certificate Strategy**
1. **Primary**: .NET Core development certificates (when available)
2. **Fallback**: OpenSSL self-signed certificates

### **Seamless Switching**
- **With .NET installed**: Both implementations use identical .NET certificates
- **Without .NET**: Node.js falls back to OpenSSL certificates  
- **Transition detection**: Automatic warnings when certificate source changes

### **When Browser Cache Clearing is Needed**
✅ **Required**: Switching between OpenSSL ↔ .NET certificate sources  
❌ **NOT required**: Switching between Node.js ↔ .NET implementations (same certificates)

**Cache Clearing Steps:**
- **Chrome**: Settings → Privacy → Clear browsing data → Cookies and other site data
- **Firefox**: Settings → Privacy → Certificates → View Certificates → Delete localhost
- **Safari**: Keychain Access → System → Delete localhost certificates

## Architecture

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves React application |
| `/health` | GET | Health check endpoint |
| `/login` | GET | Initiates OAuth2 flow |
| `/signin-nbg/` | GET | OAuth2 callback handler |
| `/logout` | GET/POST | Clears auth and redirects |
| `/auth/status` | GET | Returns authentication status |
| `/userinfo` | GET | OpenID Connect user information (protected) |
| `/api/*` | ANY | Proxies to backend with auth |

### Security Features

- **Encrypted Cookies**: All auth tokens stored with AES-256-GCM
- **CSRF Protection**: State/nonce validation in OAuth flow
- **Security Headers**: Comprehensive HTTP security headers
- **Token Injection**: Automatic Bearer token injection for API calls
- **Session Management**: Automatic cleanup and expiration handling

### OAuth2 Flow

1. User visits protected route → redirect to `/login`
2. `/login` generates state/nonce → redirect to NBG Identity Server
3. User authenticates → redirect to `/signin-nbg/` with code
4. Proxy exchanges code for tokens → encrypts and stores in cookie
5. User redirected to original destination
6. Subsequent API calls automatically include Bearer token

### UserInfo Endpoint Behavior

Both proxy implementations provide consistent `/userinfo` endpoint behavior:

**Response Priority**:
1. **Primary**: Call OAuth provider's userinfo endpoint with access token
2. **Fallback**: Decode ID token if OAuth provider call fails  
3. **Last Resort**: Return minimal user info with guaranteed fields

**Critical Requirements**:
- The `/userinfo` endpoint **must** return `preferred_username` field
- React frontend depends on this field to proceed with authentication flow
- OAuth provider call returns rich user data including `preferred_username`
- Fallback mechanisms ensure the field is never null

**Expected Response Structure**:
```json
{
  "sub": "user-id",
  "preferred_username": "USERNAME", 
  "name": "User Name",
  "email": "user@example.com",
  // ... additional provider-specific fields
}
```

## Development

### Project Structure

```
proxy-server/
├── server.js              # Main server entry point
├── routes/
│   └── oauth.js           # OAuth2 endpoints
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── proxy.js           # API proxy configuration
│   └── static.js          # Static file serving
├── utils/
│   ├── config.js          # Configuration management
│   ├── crypto.js          # Encryption utilities
│   └── generate-certs.js  # SSL certificate generation
└── certs/                 # SSL certificates (generated)
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Runtime environment |
| `PROXY_PORT` | 5443 | HTTPS port |
| `PROXY_URL` | https://localhost:5443 | Full proxy URL |
| `BACKEND_API_URL` | http://localhost:3000/ | Backend API endpoint |
| `OAUTH_AUTHORITY_URL` | https://my.nbg.gr/identity | OAuth authority |
| `OAUTH_CLIENT_ID` | - | OAuth client ID |
| `OAUTH_CLIENT_SECRET` | - | OAuth client secret |
| `OAUTH_REDIRECT_URI` | https://localhost:5443/signin-nbg/ | OAuth callback |
| `COOKIE_ENCRYPTION_KEY` | - | 32+ character encryption key |
| `SESSION_SECRET` | - | Session signing secret |
| `NBG_OAUTH_ENABLED` | true | Enable/disable OAuth |

### Building the React App

Before starting the proxy server, ensure the React application is built:

```bash
# From the main project directory
npm run build

# The proxy server will serve files from /dist
```

## Production Deployment

### SSL Certificates

Replace self-signed certificates with trusted CA certificates:

```bash
# Place your production certificates in proxy-server/certs/
cp your-domain.key certs/localhost-key.pem
cp your-domain.crt certs/localhost.pem
```

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PROXY_PORT=443
PROXY_URL=https://your-domain.com
NBG_OAUTH_ENABLED=true

# Use strong random keys
COOKIE_ENCRYPTION_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
```

### Process Management

Use PM2 or similar for production process management:

```bash
npm install -g pm2
pm2 start server.js --name nbg-proxy
pm2 startup
pm2 save
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   ```bash
   npm run generate-certs
   ```

2. **Missing React Build**
   ```bash
   # From main project directory
   npm run build
   ```

3. **OAuth Configuration Issues**
   - Verify `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET`
   - Ensure `OAUTH_REDIRECT_URI` matches NBG configuration
   - Check `OAUTH_AUTHORITY_URL` is accessible

4. **Backend Connection Issues**
   - Verify `BACKEND_API_URL` is correct
   - Ensure backend is running and accessible
   - Check network connectivity and firewall rules

5. **Frontend Loading Issues**
   - **Symptom**: App stuck on "Loading Application" screen
   - **Cause**: `/userinfo` endpoint not returning `preferred_username`
   - **Solution**: Verify OAuth provider userinfo endpoint is accessible
   - **Debug**: Check network logs for `/userinfo` response structure

### Logs

The proxy server provides detailed logging:

```bash
# Request tracking
[req-id] GET /api/analytics/query - 127.0.0.1
[req-id] Proxying GET /api/analytics/query to http://localhost:3000/analytics/query
[req-id] Backend responded with 200

# OAuth flow
Redirecting to OAuth provider: https://my.nbg.gr/identity/connect/authorize...
OAuth authentication successful, redirecting to: /

# Error logging
[req-id] Proxy error: ECONNREFUSED
[req-id] Auth token extraction failed: Decryption failed
```

## Security Considerations

- Change default encryption keys in production
- Use trusted SSL certificates for production
- Regularly rotate OAuth client secrets
- Monitor and log authentication events
- Implement rate limiting for production use
- Use environment variables for all secrets
- Enable security headers and CSP policies

## License

Internal NBG project - All rights reserved.