# NBG Merchant Insights UI - .NET Core 8 Proxy Server

This is a .NET Core 8 application that serves as a proxy server for the NBG Merchant Insights React application.

## Features

- **API Proxy**: Forwards `/api/*` requests to the mock server (Node.js)
- **Static File Serving**: Serves the React application build files
- **Authentication Middleware**: Placeholder for future JWT authentication
- **Environment Configurations**: Support for Development, QA, and Production environments
- **Health Check**: Simple health check endpoint
- **CORS Support**: Configured for React development server

## Architecture

```
React App (Port 5174) → .NET Core 8 Proxy (Port 5000) → Mock Server (Port 3001)
```

### Request Flow

1. React app makes API calls to `http://localhost:5000/api/*`
2. .NET proxy removes `/api` prefix and forwards to `http://localhost:3001/*`
3. Mock server processes the request and returns response
4. .NET proxy forwards response back to React app

## Quick Start

### Prerequisites

- .NET 8.0 SDK
- Node.js (for the mock server)

### Running the Application

1. **Start the mock server** (from project root):
```bash
cd mock-server
npm start
```

2. **Build the React app** (from project root):
```bash
npm run build
```

3. **Run the .NET proxy server**:
```bash
cd Nbg.NetCore.MerchantInsights.UI
dotnet run
```

4. **Access the application**:
   - Main app: http://localhost:5000
   - Health check: http://localhost:5000/health
   - Swagger UI: http://localhost:5000/swagger (Development only)

## Configuration

### Environment Settings

The application supports three environments with different configurations:

#### Development (`appsettings.Development.json`)
- Authentication: Disabled
- Mock server: `http://localhost:3001`
- Detailed logging enabled

#### QA (`appsettings.QA.json`)
- Authentication: Enabled
- Mock server: `http://qa-mock-server:3001`
- Moderate logging

#### Production (`appsettings.Production.json`)
- Authentication: Enabled
- Analytics service: `http://prod-analytics-service:8080`
- Minimal logging

### Key Configuration Options

```json
{
  "ProxySettings": {
    "MockServerUrl": "http://localhost:3001",
    "Timeout": 30
  },
  "Authentication": {
    "Enabled": false,
    "JwtSettings": {
      "SecretKey": "your-secret-key",
      "Issuer": "NBG.MerchantInsights",
      "Audience": "NBG.MerchantInsights.UI",
      "ExpirationMinutes": 480
    }
  }
}
```

## API Endpoints

### Proxied Endpoints

All requests to `/api/*` are forwarded to the mock server:

- `POST /api/ANALYTICS/QUERY` → `http://localhost:3001/ANALYTICS/QUERY`
- `POST /api/authorization/checkUserStatus` → `http://localhost:3001/authorization/checkUserStatus`
- `POST /api/CONFIGURATION/ADMIN/GET` → `http://localhost:3001/CONFIGURATION/ADMIN/GET`
- `POST /api/CONFIGURATION/MERCHANT/GET` → `http://localhost:3001/CONFIGURATION/MERCHANT/GET`

### Direct Endpoints

- `GET /health` - Health check endpoint
- `GET /swagger` - API documentation (Development only)

## Development

### Project Structure

```
Nbg.NetCore.MerchantInsights.UI/
├── Controllers/
│   └── HealthController.cs
├── Middleware/
│   ├── AuthenticationMiddleware.cs
│   └── ProxyMiddleware.cs
├── Services/
│   ├── IProxyService.cs
│   └── ProxyService.cs
├── Properties/
│   └── launchSettings.json
├── appsettings.json
├── appsettings.Development.json
├── appsettings.QA.json
├── appsettings.Production.json
├── Program.cs
└── Nbg.NetCore.MerchantInsights.UI.csproj
```

### Adding Features

1. **Authentication**: Implement JWT validation in `AuthenticationMiddleware.cs`
2. **Additional Middleware**: Add to the pipeline in `Program.cs`
3. **New Services**: Register in DI container in `Program.cs`
4. **Environment Variables**: Override settings in deployment configurations

## Deployment

### Docker Support

Create a `Dockerfile` for containerized deployment:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Nbg.NetCore.MerchantInsights.UI.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Nbg.NetCore.MerchantInsights.UI.dll"]
```

### Environment Variables

For production deployment, set these environment variables:

- `ASPNETCORE_ENVIRONMENT=Production`
- `ProxySettings__MockServerUrl=http://your-analytics-service:8080`
- `Authentication__JwtSettings__SecretKey=your-production-secret`

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Mock server is not running or unreachable
2. **504 Gateway Timeout**: Mock server response time exceeds configured timeout
3. **CORS Errors**: Check CORS policy in `Program.cs`
4. **Static Files Not Found**: Ensure React build files are in `../dist` directory

### Logging

Enable detailed logging by setting log level in `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Nbg.NetCore.MerchantInsights.UI": "Debug"
    }
  }
}
```

## Future Enhancements

- [ ] JWT Authentication implementation
- [ ] Request/Response caching
- [ ] Rate limiting
- [ ] Request metrics and monitoring
- [ ] Docker containerization
- [ ] CI/CD pipeline integration