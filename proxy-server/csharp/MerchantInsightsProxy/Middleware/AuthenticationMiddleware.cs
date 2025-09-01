using Microsoft.Extensions.Options;
using MerchantInsightsProxy.Configuration;
using MerchantInsightsProxy.Services;
using MerchantInsightsProxy.Models;

namespace MerchantInsightsProxy.Middleware;

public class AuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly CookieEncryptionService _cookieEncryption;
    private readonly OAuthConfiguration _oauthConfig;
    private readonly ILogger<AuthenticationMiddleware> _logger;
    
    public AuthenticationMiddleware(
        RequestDelegate next,
        CookieEncryptionService cookieEncryption,
        IOptions<OAuthConfiguration> oauthConfig,
        ILogger<AuthenticationMiddleware> logger)
    {
        _next = next;
        _cookieEncryption = cookieEncryption;
        _oauthConfig = oauthConfig.Value;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        var requestId = context.Items["RequestId"]?.ToString() ?? "unknown";
        
        // Extract and validate auth token from cookie
        ExtractAuthToken(context);
        
        await _next(context);
    }
    
    private void ExtractAuthToken(HttpContext context)
    {
        try
        {
            if (!context.Request.Cookies.TryGetValue("nbg_auth", out var authCookie) || string.IsNullOrEmpty(authCookie))
            {
                SetUnauthenticated(context);
                return;
            }
            
            var tokenData = _cookieEncryption.DecryptSimple<AuthTokenData>(authCookie);
            
            // Check if token is expired
            if (tokenData.ExpiresAt.HasValue && DateTimeOffset.UtcNow.ToUnixTimeSeconds() > tokenData.ExpiresAt.Value)
            {
                _logger.LogInformation("Auth token expired, clearing cookie");
                ClearAuthCookie(context);
                SetUnauthenticated(context);
                return;
            }
            
            // Set authentication context
            context.Items["AuthToken"] = tokenData.AccessToken;
            context.Items["TokenData"] = tokenData;
            context.Items["IsAuthenticated"] = true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Auth token extraction failed: {Message}", ex.Message);
            ClearAuthCookie(context);
            SetUnauthenticated(context);
        }
    }
    
    private static void SetUnauthenticated(HttpContext context)
    {
        context.Items["AuthToken"] = null;
        context.Items["TokenData"] = null;
        context.Items["IsAuthenticated"] = false;
    }
    
    private static void ClearAuthCookie(HttpContext context)
    {
        context.Response.Cookies.Delete("nbg_auth", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict
        });
    }
    
    public static void SetAuthCookie(HttpContext context, AuthTokenData tokenData, CookieEncryptionService cookieEncryption)
    {
        try
        {
            var encryptedToken = cookieEncryption.EncryptSimple(tokenData);
            
            context.Response.Cookies.Append("nbg_auth", encryptedToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                MaxAge = TimeSpan.FromHours(24) // 24 hours
            });
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to set auth cookie", ex);
        }
    }
    
    public static bool RequireAuthentication(HttpContext context, OAuthConfiguration oauthConfig)
    {
        if (!oauthConfig.Enabled)
        {
            return true; // Skip auth if OAuth is disabled
        }
        
        var isAuthenticated = context.Items["IsAuthenticated"] as bool? ?? false;
        
        if (!isAuthenticated)
        {
            // For API requests, return 401 instead of redirect
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                var errorResponse = """{"error": "Unauthorized", "message": "Authentication required", "requiresLogin": true}""";
                context.Response.WriteAsync(errorResponse);
                return false;
            }
            
            // For browser requests, redirect to login
            context.Response.Redirect("/login");
            return false;
        }
        
        return true;
    }
}