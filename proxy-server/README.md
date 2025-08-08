# NBG Merchant Insights Proxy Server

A secure HTTPS proxy server with OAuth2 authentication for the NBG Merchant Insights UI application.

## Features

- 🔒 **HTTPS/SSL** - Secure communication with self-signed certificates for development
- 🔐 **OAuth2 Integration** - Full authorization code flow with NBG Identity Server
- 🍪 **Encrypted Cookies** - AES-256-GCM encryption for secure token storage
- 🔄 **API Proxy** - Seamless proxying to backend API with automatic token injection
- 📱 **SPA Support** - Static file serving with client-side routing fallback
- 🚀 **Production Ready** - Comprehensive error handling and security headers

## Quick Start

### Prerequisites

- Node.js 18+ 
- OpenSSL (for certificate generation)
- Backend API running on the configured port

### Installation

```bash
# Install dependencies
cd proxy-server
npm install

# Generate SSL certificates
npm run generate-certs

# Copy and configure environment
cp .env.example .env
# Edit .env with your specific configuration
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