# Comprehensive OAuth2 Implementation Guide: C# Backend + React Frontend

## Table of Contents
1. [C# Backend Implementation](#part-1-c-backend-implementation)
2. [React Frontend Implementation](#part-2-react-frontend-implementation)
3. [Authentication Flow](#part-3-authentication-flow-between-c-and-react)
4. [Security Best Practices](#part-4-security-best-practices)
5. [Complete Example Implementation](#part-5-complete-example-implementation)

## Part 1: C# Backend Implementation

### 1.1 NuGet Packages Required

```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.OpenIdConnect" Version="8.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.0" />
<PackageReference Include="Microsoft.Identity.Web" Version="2.15.2" />
```

### 1.2 Configuration Setup

**appsettings.json:**
```json
{
  "OAuth2": {
    "Authority": "https://your-oauth-provider.com",
    "ClientId": "your-client-id",
    "ClientSecret": "your-client-secret",
    "Scopes": ["openid", "profile", "email"],
    "ResponseType": "code",
    "RedirectUri": "https://your-app.com/auth/callback",
    "PostLogoutRedirectUri": "https://your-app.com",
    "CookieName": "YourAppAuth"
  },
  "Jwt": {
    "Key": "your-super-secret-key-at-least-256-bits",
    "Issuer": "your-app-issuer",
    "Audience": "your-app-audience",
    "ExpiryMinutes": 60
  }
}
```

### 1.3 Configuration Models

```csharp
public class OAuth2Config
{
    public string Authority { get; set; }
    public string ClientId { get; set; }
    public string ClientSecret { get; set; }
    public string[] Scopes { get; set; }
    public string ResponseType { get; set; }
    public string RedirectUri { get; set; }
    public string PostLogoutRedirectUri { get; set; }
    public string CookieName { get; set; }
}

public class JwtConfig
{
    public string Key { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public int ExpiryMinutes { get; set; }
}
```

### 1.4 Authentication Services

**IJwtTokenService.cs:**
```csharp
public interface IJwtTokenService
{
    string GenerateToken(ClaimsPrincipal user);
    ClaimsPrincipal ValidateToken(string token);
    bool IsTokenValid(string token);
}
```

**JwtTokenService.cs:**
```csharp
public class JwtTokenService : IJwtTokenService
{
    private readonly JwtConfig _jwtConfig;
    private readonly ILogger<JwtTokenService> _logger;

    public JwtTokenService(IOptions<JwtConfig> jwtConfig, ILogger<JwtTokenService> logger)
    {
        _jwtConfig = jwtConfig.Value;
        _logger = logger;
    }

    public string GenerateToken(ClaimsPrincipal user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtConfig.Key);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.FindFirst("sub")?.Value ?? ""),
            new(ClaimTypes.Name, user.FindFirst("name")?.Value ?? ""),
            new(ClaimTypes.Email, user.FindFirst("email")?.Value ?? ""),
            new("preferred_username", user.FindFirst("preferred_username")?.Value ?? "")
        };

        // Add role claims
        claims.AddRange(user.FindAll("role").Select(c => new Claim(ClaimTypes.Role, c.Value)));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpiryMinutes),
            Issuer = _jwtConfig.Issuer,
            Audience = _jwtConfig.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public ClaimsPrincipal ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtConfig.Key);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtConfig.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtConfig.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token validation failed");
            return null;
        }
    }

    public bool IsTokenValid(string token)
    {
        return ValidateToken(token) != null;
    }
}
```

### 1.5 Authentication Controllers

**AuthController.cs:**
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IJwtTokenService jwtTokenService, ILogger<AuthController> logger)
    {
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    [HttpGet("login")]
    public IActionResult Login(string returnUrl = "/")
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action("Callback", new { returnUrl })
        };
        
        return Challenge(properties, "OpenIdConnect");
    }

    [HttpGet("callback")]
    public async Task<IActionResult> Callback(string returnUrl = "/")
    {
        var result = await HttpContext.AuthenticateAsync("Cookies");
        
        if (!result.Succeeded)
        {
            return BadRequest("Authentication failed");
        }

        var token = _jwtTokenService.GenerateToken(result.Principal);
        
        // Set secure cookie with JWT
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(60)
        };
        
        Response.Cookies.Append("AuthToken", token, cookieOptions);
        
        return LocalRedirect(returnUrl);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        Response.Cookies.Delete("AuthToken");
        await HttpContext.SignOutAsync("Cookies");
        await HttpContext.SignOutAsync("OpenIdConnect");
        
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("user")]
    [Authorize]
    public IActionResult GetUser()
    {
        var user = new
        {
            Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Name = User.FindFirst(ClaimTypes.Name)?.Value,
            Email = User.FindFirst(ClaimTypes.Email)?.Value,
            Username = User.FindFirst("preferred_username")?.Value,
            Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray()
        };

        return Ok(user);
    }
}
```

### 1.6 Startup Configuration

**Program.cs (or Startup.cs):**
```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Configuration
    services.Configure<OAuth2Config>(Configuration.GetSection("OAuth2"));
    services.Configure<JwtConfig>(Configuration.GetSection("Jwt"));

    // Authentication Services
    services.AddScoped<IJwtTokenService, JwtTokenService>();

    // Authentication Setup
    services.AddAuthentication(options =>
    {
        options.DefaultScheme = "Cookies";
        options.DefaultChallengeScheme = "OpenIdConnect";
    })
    .AddCookie("Cookies", options =>
    {
        options.LoginPath = "/api/auth/login";
        options.LogoutPath = "/api/auth/logout";
        options.AccessDeniedPath = "/api/auth/access-denied";
    })
    .AddOpenIdConnect("OpenIdConnect", options =>
    {
        var oauth2Config = Configuration.GetSection("OAuth2").Get<OAuth2Config>();
        
        options.Authority = oauth2Config.Authority;
        options.ClientId = oauth2Config.ClientId;
        options.ClientSecret = oauth2Config.ClientSecret;
        options.ResponseType = oauth2Config.ResponseType;
        options.CallbackPath = "/auth/callback";
        options.SignedOutCallbackPath = "/auth/signout-callback";
        
        options.Scope.Clear();
        foreach (var scope in oauth2Config.Scopes)
        {
            options.Scope.Add(scope);
        }
        
        options.SaveTokens = true;
        options.GetClaimsFromUserInfoEndpoint = true;
    })
    .AddJwtBearer("Bearer", options =>
    {
        var jwtConfig = Configuration.GetSection("Jwt").Get<JwtConfig>();
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtConfig.Key)),
            ValidateIssuer = true,
            ValidIssuer = jwtConfig.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtConfig.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        
        // Custom token retrieval from cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("AuthToken"))
                {
                    context.Token = context.Request.Cookies["AuthToken"];
                }
                return Task.CompletedTask;
            }
        };
    });

    services.AddAuthorization();
    services.AddControllers();
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseHttpsRedirection();
    app.UseRouting();
    
    app.UseAuthentication();
    app.UseAuthorization();
    
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

## Part 2: React Frontend Implementation

### 2.1 Required Dependencies

```bash
npm install axios react-router-dom @types/react-router-dom
npm install --save-dev @types/node
```

### 2.2 Authentication Context

**contexts/AuthContext.tsx:**
```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on client side
      setUser(null);
      window.location.href = '/';
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 2.3 Authentication Service

**services/authService.ts:**
```typescript
import { apiClient } from './apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  roles: string[];
}

class AuthService {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/user');
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  }

  async refreshToken(): Promise<boolean> {
    try {
      // Check if current token is still valid
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  isTokenExpired(): boolean {
    // Since we're using HTTP-only cookies, we can't directly check token expiration
    // This will be handled by the API returning 401 when token expires
    return false;
  }
}

export const authService = new AuthService();
```

### 2.4 API Client with Interceptors

**services/apiClient.ts:**
```typescript
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '',
      timeout: 10000,
      withCredentials: true, // Important for sending cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any custom headers or modify config here
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or user not authenticated
          console.warn('Authentication failed - redirecting to login');
          window.location.href = '/api/auth/login';
          return Promise.reject(error);
        }

        if (error.response?.status === 403) {
          // User doesn't have permission
          console.error('Access forbidden');
          window.location.href = '/forbidden';
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  // HTTP methods
  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
```

### 2.5 Protected Route Component

**components/ProtectedRoute.tsx:**
```typescript
import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = <div>Access Denied</div>
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2>Authentication Required</h2>
        <p>Please log in to access this page.</p>
        <button onClick={() => window.location.href = '/api/auth/login'}>
          Login
        </button>
      </div>
    );
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
```

### 2.6 Login Component

**components/Login.tsx:**
```typescript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <h2>Already Logged In</h2>
        <p>You are already authenticated.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Login Required</h2>
      <p>Please log in to access the application.</p>
      <button onClick={login}>
        Login with OAuth2
      </button>
    </div>
  );
};
```

### 2.7 User Profile Component

**components/UserProfile.tsx:**
```typescript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div>
      <h3>User Profile</h3>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};
```

### 2.8 Main App Component

**App.tsx:**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { UserProfile } from './components/UserProfile';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <nav>
            <UserProfile />
          </nav>
          
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <div>Admin Panel</div>
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Part 3: Authentication Flow Between C# and React

### 3.1 Complete Authentication Flow Diagram

```
1. User accesses React app → Not authenticated
2. React redirects to /api/auth/login
3. C# Backend redirects to OAuth2 Provider (e.g., Azure AD, Google, etc.)
4. User authenticates with OAuth2 Provider
5. OAuth2 Provider redirects back to /api/auth/callback
6. C# Backend:
   - Validates authorization code
   - Exchanges code for access token
   - Retrieves user claims
   - Generates internal JWT token
   - Sets secure HTTP-only cookie
7. C# redirects user back to React app
8. React app calls /api/auth/user to get user info
9. Subsequent API calls include cookie automatically
10. C# middleware validates JWT from cookie on each request
```

### 3.2 Sequence Diagram Implementation

**Step-by-step Flow:**

```typescript
// 1. Initial App Load - React Side
useEffect(() => {
  checkAuth(); // This calls /api/auth/user
}, []);

// 2. If user not authenticated, show login
const login = () => {
  window.location.href = '/api/auth/login'; // Redirect to C# endpoint
};

// 3. C# handles OAuth2 flow and sets cookie
[HttpGet("callback")]
public async Task<IActionResult> Callback(string returnUrl = "/")
{
    var result = await HttpContext.AuthenticateAsync("Cookies");
    var token = _jwtTokenService.GenerateToken(result.Principal);
    
    Response.Cookies.Append("AuthToken", token, cookieOptions);
    return LocalRedirect(returnUrl); // Back to React
}

// 4. React gets user info after redirect
const checkAuth = async () => {
  try {
    const userData = await authService.getCurrentUser(); // /api/auth/user
    setUser(userData);
  } catch (error) {
    setUser(null);
  }
};
```

### 3.3 Cookie and Token Management

**C# Backend - Secure Cookie Setup:**
```csharp
var cookieOptions = new CookieOptions
{
    HttpOnly = true,           // Prevents XSS attacks
    Secure = true,            // HTTPS only
    SameSite = SameSiteMode.Strict, // CSRF protection
    Expires = DateTime.UtcNow.AddMinutes(60),
    Path = "/"
};

Response.Cookies.Append("AuthToken", token, cookieOptions);
```

**React Frontend - Automatic Cookie Handling:**
```typescript
// Axios automatically sends cookies with withCredentials: true
const client = axios.create({
  withCredentials: true, // This sends HTTP-only cookies
  baseURL: '/api'
});
```

## Part 4: Security Best Practices

### 4.1 Backend Security Measures

**1. Secure JWT Configuration:**
```csharp
public class JwtSecurityConfig
{
    public static TokenValidationParameters GetValidationParameters(JwtConfig config)
    {
        return new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.Key)),
            ValidateIssuer = true,
            ValidIssuer = config.Issuer,
            ValidateAudience = true,
            ValidAudience = config.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero, // Remove default 5-minute tolerance
            RequireExpirationTime = true,
            RequireSignedTokens = true
        };
    }
}
```

**2. Rate Limiting Middleware:**
```csharp
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly int _maxRequests = 100; // per minute

    public async Task InvokeAsync(HttpContext context)
    {
        var clientId = GetClientIdentifier(context);
        var key = $"rate_limit_{clientId}";
        
        if (_cache.TryGetValue(key, out int requestCount))
        {
            if (requestCount >= _maxRequests)
            {
                context.Response.StatusCode = 429; // Too Many Requests
                return;
            }
            _cache.Set(key, requestCount + 1, TimeSpan.FromMinutes(1));
        }
        else
        {
            _cache.Set(key, 1, TimeSpan.FromMinutes(1));
        }

        await _next(context);
    }
}
```

**3. CORS Configuration:**
```csharp
services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .WithOrigins("https://yourdomain.com") // Specific origins only
            .AllowCredentials() // Required for cookies
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
```

### 4.2 Frontend Security Measures

**1. Content Security Policy:**
```typescript
// Add to your HTML head or configure in server
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://your-api.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`;
```

**2. XSS Protection in React:**
```typescript
// Always sanitize user input
import DOMPurify from 'dompurify';

const SafeUserContent: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};

// Validate and sanitize form inputs
const validateInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

**3. Environment Variables Security:**
```typescript
// .env files - NEVER commit secrets
REACT_APP_API_URL=https://your-api.com
# Don't put secrets in REACT_APP_ variables - they're exposed to client!

// Use a config service instead
class ConfigService {
  static getApiUrl(): string {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }
  
  // Get sensitive config from server endpoint instead
  static async getClientConfig() {
    const response = await fetch('/api/config');
    return response.json();
  }
}
```

### 4.3 Token Management Security

**1. Automatic Token Refresh:**
```csharp
// C# Backend - Sliding expiration
public class TokenRefreshMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Cookies.TryGetValue("AuthToken", out var token))
        {
            var principal = _jwtService.ValidateToken(token);
            if (principal != null)
            {
                var exp = principal.FindFirst("exp")?.Value;
                if (long.TryParse(exp, out var expTime))
                {
                    var expDateTime = DateTimeOffset.FromUnixTimeSeconds(expTime);
                    if (expDateTime.Subtract(DateTime.UtcNow).TotalMinutes < 15)
                    {
                        // Refresh token if expires in 15 minutes
                        var newToken = _jwtService.GenerateToken(principal);
                        SetSecureCookie(context.Response, "AuthToken", newToken);
                    }
                }
            }
        }
        
        await _next(context);
    }
}
```

**2. React Token Validation:**
```typescript
// React - Periodic auth check
useEffect(() => {
  const checkAuthStatus = async () => {
    try {
      await authService.getCurrentUser();
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Check every 5 minutes
  const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

### 4.4 Production Security Checklist

**Backend:**
- ✅ Use HTTPS everywhere
- ✅ Secure JWT signing keys (256+ bits)
- ✅ HTTP-only cookies for token storage
- ✅ CORS configured with specific origins
- ✅ Rate limiting implemented
- ✅ Input validation and sanitization
- ✅ Audit logging for auth events
- ✅ Regular security updates

**Frontend:**
- ✅ Content Security Policy configured
- ✅ No sensitive data in localStorage/sessionStorage
- ✅ XSS protection (input sanitization)
- ✅ Environment variables properly managed
- ✅ HTTPS enforcement
- ✅ Dependency vulnerability scanning
- ✅ Bundle analysis for exposed secrets

## Part 5: Complete Example Implementation

### 5.1 Docker Configuration

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:80
    volumes:
      - ./appsettings.Production.json:/app/appsettings.Production.json

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

### 5.2 Complete Testing Examples

**Backend Tests (AuthControllerTests.cs):**
```csharp
[TestClass]
public class AuthControllerTests
{
    private Mock<IJwtTokenService> _mockJwtService;
    private AuthController _controller;

    [TestInitialize]
    public void Setup()
    {
        _mockJwtService = new Mock<IJwtTokenService>();
        _controller = new AuthController(_mockJwtService.Object, Mock.Of<ILogger<AuthController>>());
    }

    [TestMethod]
    public async Task Callback_ValidAuthentication_ReturnsRedirect()
    {
        // Arrange
        var claims = new[]
        {
            new Claim("sub", "123"),
            new Claim("name", "Test User"),
            new Claim("email", "test@example.com")
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        
        _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<ClaimsPrincipal>()))
                      .Returns("test-jwt-token");

        // Mock HttpContext
        var httpContext = new DefaultHttpContext();
        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = httpContext
        };

        // Act
        var result = await _controller.Callback("/dashboard");

        // Assert
        Assert.IsInstanceOfType(result, typeof(LocalRedirectResult));
        var redirectResult = (LocalRedirectResult)result;
        Assert.AreEqual("/dashboard", redirectResult.Url);
    }
}
```

**Frontend Tests (AuthContext.test.tsx):**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

// Mock the auth service
jest.mock('../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

const TestComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;
  return <div>Authenticated as {user?.name}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockAuthService.getCurrentUser.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show authenticated user when logged in', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      roles: ['user']
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Authenticated as John Doe')).toBeInTheDocument();
    });
  });
});
```

### 5.3 Deployment Scripts

**Backend Dockerfile:**
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["YourApp.csproj", "."]
RUN dotnet restore "YourApp.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "YourApp.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "YourApp.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "YourApp.dll"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 5.4 Environment Configuration

**Production appsettings.json:**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "OAuth2": {
    "Authority": "https://your-oauth-provider.com",
    "ClientId": "${OAUTH_CLIENT_ID}",
    "ClientSecret": "${OAUTH_CLIENT_SECRET}",
    "Scopes": ["openid", "profile", "email"],
    "ResponseType": "code",
    "RedirectUri": "https://yourapp.com/auth/callback",
    "PostLogoutRedirectUri": "https://yourapp.com",
    "CookieName": "YourAppAuth"
  },
  "Jwt": {
    "Key": "${JWT_SECRET_KEY}",
    "Issuer": "https://yourapp.com",
    "Audience": "https://yourapp.com",
    "ExpiryMinutes": 60
  },
  "AllowedHosts": "yourapp.com"
}
```

**React Environment Variables (.env.production):**
```bash
REACT_APP_API_URL=https://yourapp.com
GENERATE_SOURCEMAP=false
```

## Summary

This comprehensive guide provides a complete OAuth2 implementation for C# backend and React frontend with:

### ✅ **Backend Features**
- OAuth2/OpenID Connect integration
- JWT token generation and validation
- Secure HTTP-only cookie management
- Role-based authorization
- Token refresh mechanism
- Rate limiting and security middleware

### ✅ **Frontend Features**
- React Context for authentication state
- Automatic cookie-based authentication
- Protected routes with role checking
- HTTP interceptors for API calls
- Error handling and redirects

### ✅ **Security Implementation**
- HTTPS enforcement
- CORS configuration
- XSS protection
- CSRF prevention via SameSite cookies
- Content Security Policy
- Input validation and sanitization

### ✅ **Production Ready**
- Docker containerization
- Environment configuration
- Testing examples
- Deployment scripts
- Performance considerations

The implementation uses secure HTTP-only cookies to prevent XSS attacks while maintaining seamless user experience across page refreshes. The authentication flow is fully integrated between the C# backend handling OAuth2 negotiation and the React frontend managing user state.