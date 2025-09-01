# NBG Merchant Insights Proxy Server (.NET Core 8)

ASP.NET Core 8 implementation of the OAuth2 authentication proxy server for the NBG Merchant Insights UI application.

## Features

- 🔒 **HTTPS/SSL** - Self-signed certificates for development, production certificates supported
- 🔐 **OAuth2 Integration** - Complete authorization code flow with NBG Identity Server
- 🍪 **AES-256-GCM Encryption** - Secure authentication cookie storage
- 🔄 **API Proxying** - Transparent backend API forwarding with token injection
- 📱 **SPA Hosting** - Static file serving with client-side routing fallback
- ⚡ **High Performance** - .NET Core 8 performance optimizations
- 🛡️ **Security Headers** - Comprehensive HTTP security headers
- 📝 **Structured Logging** - Request tracking and error logging

## Prerequisites

- .NET Core 8 SDK
- Backend API running on the configured port
- SSL certificates (auto-generated for development)

## Quick Start

### 1. Navigate to the .NET Core Implementation

```bash
cd proxy-server/csharp/MerchantInsightsProxy
```

### 2. Install Dependencies

```bash
dotnet restore
```

### 3. Configure Application

Update `appsettings.Development.json` with your configuration:

```json
{
  "Proxy": {
    "Port": "5443",
    "ProxyUrl": "https://localhost:5443",
    "BackendApiUrl": "http://localhost:3001"
  },
  "OAuth": {
    "Enabled": true,
    "AuthorityUrl": "https://my.nbg.gr/identity",
    "ClientId": "your-client-id",
    "ClientSecret": "your-client-secret",
    "RedirectUri": "https://localhost:5443/signin-nbg/"
  },
  "Security": {
    "CookieEncryptionKey": "your-32-character-encryption-key-here",
    "SessionSecret": "your-session-secret-here"
  }
}
```

### 4. Build and Run

```bash
# Development
dotnet run

# Production
dotnet run --configuration Release
```

The server will start at `https://localhost:5443`

## Configuration

### Application Settings Structure

The application uses the standard .NET Core configuration system with these sections:

#### Proxy Configuration
```json
{
  "Proxy": {
    "Port": "5443",                           // HTTPS port
    "ProxyUrl": "https://localhost:5443",     // Full proxy URL
    "BackendApiUrl": "http://localhost:3001", // Backend API endpoint
    "SslCertPath": "../certs/localhost.pem",  // SSL certificate path
    "SslKeyPath": "../certs/localhost-key.pem" // SSL key path
  }
}
```

#### OAuth2 Configuration
```json
{
  "OAuth": {
    "Enabled": true,                                      // Enable/disable OAuth
    "AuthorityUrl": "https://my.nbg.gr/identity",        // OAuth authority
    "ClientId": "your-client-id",                         // OAuth client ID
    "ClientSecret": "your-client-secret",                 // OAuth client secret
    "RedirectUri": "https://localhost:5443/signin-nbg/",  // OAuth callback
    "Scope": "promotion-engine-api-v1 openid"             // OAuth scope
  }
}
```

#### Security Configuration
```json
{
  "Security": {
    "CookieEncryptionKey": "your-32-character-key",  // Cookie encryption key (32+ chars)
    "SessionSecret": "your-session-secret"           // Session secret (16+ chars)
  }
}
```

### Environment Variables

You can override configuration using environment variables:

```bash
export Proxy__Port=5443
export Proxy__BackendApiUrl=http://api.internal:3001
export OAuth__ClientId=your-production-client-id
export OAuth__ClientSecret=your-production-client-secret
export Security__CookieEncryptionKey=your-production-encryption-key
```

## Architecture

### Project Structure

```
MerchantInsightsProxy/
├── Program.cs                    # Main entry point and configuration
├── Controllers/
│   ├── OAuthController.cs        # OAuth2 endpoints (/login, /signin-nbg, etc.)
│   └── ApiController.cs          # API proxy endpoints (/api/*)
├── Middleware/
│   └── AuthenticationMiddleware.cs # Token extraction and validation
├── Services/
│   ├── CookieEncryptionService.cs # AES-256-GCM encryption
│   ├── ProxyService.cs           # HTTP request proxying
│   └── OAuthSessionService.cs    # OAuth session management
├── Configuration/
│   ├── ProxyConfiguration.cs     # Proxy settings model
│   ├── OAuthConfiguration.cs     # OAuth settings model
│   └── SecurityConfiguration.cs  # Security settings model
├── Models/
│   └── AuthTokenData.cs          # Authentication data models
└── appsettings.json              # Configuration files
```

### Request Pipeline

1. **Request Logging** - Log incoming requests with unique IDs
2. **Security Headers** - Add comprehensive security headers
3. **CORS** - Configure cross-origin resource sharing
4. **Authentication Middleware** - Extract and validate tokens
5. **Controller Routing** - Route to appropriate controller
6. **API Proxy** - Forward authenticated requests to backend
7. **Static Files** - Serve React SPA for unmatched routes

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and status |
| `/login` | GET | Initiate OAuth2 flow |
| `/signin-nbg` | GET | OAuth2 callback handler |
| `/logout` | GET/POST | Clear auth and redirect |
| `/auth/status` | GET | Authentication status |
| `/userinfo` | GET | User profile (protected) |
| `/api/{**path}` | ANY | API proxy (protected) |
| `/{**path}` | GET | SPA fallback |

## Security Features

### AES-256-GCM Encryption

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Management**: 32-byte keys from configuration
- **Nonce**: 12-byte random nonce per encryption
- **Authentication**: 16-byte authentication tag
- **Format**: `nonce:tag:ciphertext` (hex-encoded)

### OAuth2 Security

- **CSRF Protection**: State parameter validation
- **Session Management**: Time-limited OAuth sessions (10 minutes)
- **Secure Cookies**: HttpOnly, Secure, SameSite=Strict
- **Token Validation**: Automatic token expiry handling

### HTTP Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Development

### Building

```bash
# Build for development
dotnet build

# Build for production
dotnet build --configuration Release
```

### Testing

```bash
# Run unit tests (if available)
dotnet test

# Manual testing
curl -k https://localhost:5443/health
```

### Debugging

Enable detailed logging in `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "MerchantInsightsProxy": "Debug"
    }
  }
}
```

## Production Deployment

### SSL Certificates

Replace self-signed certificates with production certificates:

```bash
# Place production certificates in shared certs directory
cp production.crt ../certs/localhost.pem
cp production.key ../certs/localhost-key.pem
```

### Environment Configuration

```bash
# Production appsettings.json
{
  "Proxy": {
    "Port": "443",
    "ProxyUrl": "https://yourdomain.com"
  },
  "OAuth": {
    "AuthorityUrl": "https://production-identity.nbg.gr"
  }
}
```

### Container Deployment

Create a `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY bin/Release/net8.0/ .
EXPOSE 5443
ENTRYPOINT ["dotnet", "MerchantInsightsProxy.dll"]
```

### Process Management

Use systemd for Linux deployment:

```ini
[Unit]
Description=NBG Merchant Insights Proxy (.NET Core 8)

[Service]
Type=notify
ExecStart=/usr/bin/dotnet /app/MerchantInsightsProxy.dll
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Check certificate paths in configuration
   - Ensure certificates exist and are readable
   - Verify certificate format (PEM)

2. **OAuth Configuration**
   - Verify client ID and secret
   - Check redirect URI matches OAuth provider
   - Ensure authority URL is accessible

3. **Backend Connection**
   - Verify backend API URL
   - Check network connectivity
   - Review proxy service logs

### Logs

The application provides structured logging with request IDs:

```
[12:34:56 INF] [req-abc123] GET /api/analytics - 127.0.0.1
[12:34:56 INF] [req-abc123] Proxying GET /analytics to http://localhost:3001/analytics
[12:34:56 INF] [req-abc123] Backend responded with 200
```

### Performance Monitoring

Enable performance counters in production:

```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.AspNetCore.HttpLogging": "Information"
    }
  }
}
```

## Comparison with Node.js Implementation

| Feature | .NET Core 8 | Node.js |
|---------|-------------|---------|
| **Performance** | Higher throughput | Good performance |
| **Memory Usage** | Lower memory usage | Higher memory usage |
| **Configuration** | appsettings.json | .env files |
| **Dependency Injection** | Built-in DI container | Manual setup |
| **Security** | Built-in data protection | Custom crypto implementation |
| **Debugging** | Visual Studio support | Node.js debugging tools |
| **Deployment** | Self-contained or framework-dependent | Node.js runtime required |

Both implementations provide identical functionality and can be used interchangeably based on your technology preferences and infrastructure requirements.

## License

Internal NBG project - All rights reserved.