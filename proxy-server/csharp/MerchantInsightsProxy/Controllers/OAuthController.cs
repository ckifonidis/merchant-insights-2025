using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text;
using MerchantInsightsProxy.Configuration;
using MerchantInsightsProxy.Services;
using MerchantInsightsProxy.Models;
using MerchantInsightsProxy.Middleware;

namespace MerchantInsightsProxy.Controllers;

[ApiController]
[Route("/")]
public class OAuthController : ControllerBase
{
    private readonly OAuthConfiguration _oauthConfig;
    private readonly OAuthSessionService _sessionService;
    private readonly CookieEncryptionService _cookieEncryption;
    private readonly HttpClient _httpClient;
    private readonly ILogger<OAuthController> _logger;
    
    public OAuthController(
        IOptions<OAuthConfiguration> oauthConfig,
        OAuthSessionService sessionService,
        CookieEncryptionService cookieEncryption,
        HttpClient httpClient,
        ILogger<OAuthController> logger)
    {
        _oauthConfig = oauthConfig.Value;
        _sessionService = sessionService;
        _cookieEncryption = cookieEncryption;
        _httpClient = httpClient;
        _logger = logger;
    }
    
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { 
            status = "healthy", 
            timestamp = DateTimeOffset.UtcNow,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        });
    }
    
    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl = null)
    {
        if (!_oauthConfig.Enabled)
        {
            return StatusCode(503, new { error = "OAuth disabled", message = "OAuth2 authentication is currently disabled" });
        }
        
        try
        {
            var sessionId = _sessionService.CreateSession(returnUrl);
            var session = _sessionService.GetSession(sessionId);
            
            if (session == null)
            {
                return BadRequest(new { error = "Failed to create session" });
            }
            
            // Build authorization URL
            var authUrl = new UriBuilder(_oauthConfig.AuthUrl);
            var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
            query["client_id"] = _oauthConfig.ClientId;
            query["redirect_uri"] = _oauthConfig.RedirectUri;
            query["response_type"] = "code id_token";
            query["scope"] = _oauthConfig.Scope;
            query["state"] = $"{sessionId}:{session.State}";
            query["nonce"] = session.Nonce;
            authUrl.Query = query.ToString();
            
            _logger.LogInformation("Redirecting to OAuth provider: {AuthUrl}", authUrl.ToString());
            return Redirect(authUrl.ToString());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login initiation failed");
            return StatusCode(500, new { error = "Login failed", message = "Failed to initiate OAuth2 flow" });
        }
    }
    
    [HttpGet("signin-nbg")]
    public async Task<IActionResult> SignInCallback(
        [FromQuery] string? code = null,
        [FromQuery] string? state = null,
        [FromQuery] string? id_token = null,
        [FromQuery] string? error = null)
    {
        if (!_oauthConfig.Enabled)
        {
            return StatusCode(503, new { error = "OAuth disabled", message = "OAuth2 authentication is currently disabled" });
        }
        
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        
        _logger.LogInformation("[{RequestId}] OAuth callback received: hasCode={HasCode}, hasState={HasState}, hasIdToken={HasIdToken}, hasError={HasError}",
            requestId, !string.IsNullOrEmpty(code), !string.IsNullOrEmpty(state), !string.IsNullOrEmpty(id_token), !string.IsNullOrEmpty(error));
        
        // If no query parameters, serve fragment handler page
        if (string.IsNullOrEmpty(code) && string.IsNullOrEmpty(state) && string.IsNullOrEmpty(error))
        {
            _logger.LogInformation("[{RequestId}] No query parameters found, serving fragment handler page", requestId);
            return Content(GetFragmentHandlerHtml(), "text/html");
        }
        
        // Handle OAuth errors
        if (!string.IsNullOrEmpty(error))
        {
            _logger.LogError("[{RequestId}] OAuth callback error: {Error}", requestId, error);
            return Redirect("/login?error=oauth_error");
        }
        
        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
        {
            _logger.LogError("[{RequestId}] Missing code or state in OAuth callback", requestId);
            return Redirect("/login?error=invalid_callback");
        }
        
        try
        {
            // Parse state
            var stateParts = state.Split(':');
            if (stateParts.Length != 2)
            {
                _logger.LogError("[{RequestId}] Invalid state format", requestId);
                return Redirect("/login?error=invalid_state");
            }
            
            var sessionId = stateParts[0];
            var expectedState = stateParts[1];
            
            // Validate state
            if (!_sessionService.ValidateAndRemoveSession(sessionId, expectedState))
            {
                _logger.LogError("[{RequestId}] State validation failed", requestId);
                return Redirect("/login?error=state_mismatch");
            }
            
            var session = _sessionService.GetSession(sessionId);
            var originalUrl = session?.OriginalUrl ?? "/";
            
            // Exchange authorization code for access token
            _logger.LogInformation("[{RequestId}] Exchanging authorization code for access token", requestId);
            
            var tokenResponse = await ExchangeCodeForTokens(code, requestId);
            if (tokenResponse == null)
            {
                return Redirect("/login?error=token_exchange_failed");
            }
            
            // Prepare token data for storage
            var authData = new AuthTokenData
            {
                AccessToken = tokenResponse.access_token,
                RefreshToken = tokenResponse.refresh_token,
                IdToken = tokenResponse.id_token ?? id_token,
                ExpiresAt = tokenResponse.expires_in.HasValue 
                    ? DateTimeOffset.UtcNow.ToUnixTimeSeconds() + tokenResponse.expires_in.Value 
                    : null,
                Scope = tokenResponse.scope ?? _oauthConfig.Scope
            };
            
            // Store encrypted token in cookie
            AuthenticationMiddleware.SetAuthCookie(HttpContext, authData, _cookieEncryption);
            
            _logger.LogInformation("[{RequestId}] OAuth authentication successful, redirecting to: {OriginalUrl}", requestId, originalUrl);
            return Redirect(originalUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] OAuth callback processing failed", requestId);
            return Redirect("/login?error=callback_failed");
        }
    }
    
    [HttpGet("logout")]
    [HttpPost("logout")]
    public IActionResult Logout([FromQuery] string? returnUrl = null)
    {
        Response.Cookies.Delete("nbg_auth", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict
        });
        
        var logoutUrl = returnUrl ?? "/login";
        _logger.LogInformation("User logged out, redirecting to: {LogoutUrl}", logoutUrl);
        return Redirect(logoutUrl);
    }
    
    [HttpGet("auth/status")]
    public IActionResult AuthStatus()
    {
        var isAuthenticated = HttpContext.Items["IsAuthenticated"] as bool? ?? false;
        
        if (isAuthenticated)
        {
            var tokenData = HttpContext.Items["TokenData"] as AuthTokenData;
            return Ok(new
            {
                authenticated = true,
                expires_at = tokenData?.ExpiresAt,
                scope = tokenData?.Scope
            });
        }
        
        return Ok(new { authenticated = false });
    }
    
    [HttpGet("userinfo")]
    public async Task<IActionResult> UserInfo()
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        
        if (!AuthenticationMiddleware.RequireAuthentication(HttpContext, _oauthConfig))
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Access token is required" });
        }
        
        var tokenData = HttpContext.Items["TokenData"] as AuthTokenData;
        if (tokenData?.AccessToken == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Access token is required" });
        }
        
        _logger.LogInformation("[{RequestId}] UserInfo request from authenticated user", requestId);
        
        try
        {
            // Primary: Call OAuth provider's userinfo endpoint first (like Node.js)
            var userInfoFromProvider = await FetchUserInfoFromProvider(tokenData.AccessToken, requestId);
            if (userInfoFromProvider != null)
            {
                return Ok(userInfoFromProvider);
            }
            
            // Fallback: If OAuth provider fails, try to decode ID token
            if (!string.IsNullOrEmpty(tokenData.IdToken))
            {
                var userInfo = DecodeIdToken(tokenData.IdToken, requestId);
                if (userInfo != null)
                {
                    return Ok(userInfo);
                }
            }
            
            // Last resort: Return minimal user info
            return Ok(new
            {
                sub = "unknown",
                name = "Unknown User",
                preferred_username = "user",
                authenticated = true,
                token_expires_at = tokenData.ExpiresAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] UserInfo endpoint error", requestId);
            return StatusCode(500, new { error = "server_error", error_description = "Failed to retrieve user information" });
        }
    }
    
    private async Task<TokenResponse?> ExchangeCodeForTokens(string code, string requestId)
    {
        try
        {
            var tokenRequest = new List<KeyValuePair<string, string>>
            {
                new("grant_type", "authorization_code"),
                new("client_id", _oauthConfig.ClientId),
                new("client_secret", _oauthConfig.ClientSecret),
                new("code", code),
                new("redirect_uri", _oauthConfig.RedirectUri)
            };
            
            var content = new FormUrlEncodedContent(tokenRequest);
            
            _logger.LogInformation("[{RequestId}] Token exchange request to: {TokenUrl}", requestId, _oauthConfig.TokenUrl);
            
            var response = await _httpClient.PostAsync(_oauthConfig.TokenUrl, content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("[{RequestId}] Token exchange failed: {StatusCode} {Response}", requestId, response.StatusCode, responseContent);
                return null;
            }
            
            var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseContent);
            _logger.LogInformation("[{RequestId}] Token exchange successful", requestId);
            
            return tokenResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Token exchange exception", requestId);
            return null;
        }
    }
    
    private UserInfo? DecodeIdToken(string idToken, string requestId)
    {
        try
        {
            var parts = idToken.Split('.');
            if (parts.Length != 3) return null;
            
            var payload = parts[1];
            // Add padding if needed
            while (payload.Length % 4 != 0)
            {
                payload += "=";
            }
            
            var jsonBytes = Convert.FromBase64String(payload);
            var json = Encoding.UTF8.GetString(jsonBytes);
            var userInfo = JsonSerializer.Deserialize<UserInfo>(json);
            
            _logger.LogInformation("[{RequestId}] UserInfo extracted from ID token: sub={Sub}, name={Name}", 
                requestId, userInfo?.sub, userInfo?.name);
            
            return userInfo;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[{RequestId}] Failed to decode ID token", requestId);
            return null;
        }
    }
    
    private async Task<UserInfo?> FetchUserInfoFromProvider(string accessToken, string requestId)
    {
        try
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            
            var response = await _httpClient.GetAsync(_oauthConfig.UserInfoUrl);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[{RequestId}] UserInfo endpoint returned: {StatusCode}", requestId, response.StatusCode);
                return null;
            }
            
            var json = await response.Content.ReadAsStringAsync();
            
            // Deserialize to strongly-typed UserInfo with all NBG claims
            var userInfo = JsonSerializer.Deserialize<UserInfo>(json);
            _logger.LogInformation("[{RequestId}] UserInfo fetched from OAuth provider: sub={Sub}, preferred_username={PreferredUsername}, role={Role}", 
                requestId, userInfo?.sub, userInfo?.preferred_username, userInfo?.role);
            
            return userInfo;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[{RequestId}] Failed to fetch userinfo from OAuth provider", requestId);
            return null;
        }
    }
    
    private static string GetFragmentHandlerHtml()
    {
        return """
<!DOCTYPE html>
<html>
<head>
    <title>Processing OAuth Response...</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .spinner { display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007B85; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <h2>Processing OAuth Response...</h2>
    <div class="spinner"></div>
    <p>Please wait while we complete your authentication.</p>
    
    <script>
        const fragment = window.location.hash.substring(1);
        
        console.log('Fragment handler:', {
            fullUrl: window.location.href,
            fragment: fragment,
            hasFragment: !!fragment
        });
        
        if (fragment && fragment.length > 0) {
            const params = new URLSearchParams(fragment);
            const code = params.get('code');
            const state = params.get('state');
            
            console.log('Parsed fragment parameters:', {
                hasCode: !!code,
                hasState: !!state,
                codeLength: code ? code.length : 0
            });
            
            if (code && state) {
                const newUrl = window.location.pathname + '?' + fragment;
                console.log('Redirecting to:', newUrl);
                window.location.replace(newUrl);
            } else {
                console.error('Missing required OAuth parameters in fragment');
                setTimeout(() => {
                    window.location.href = '/login?error=missing_oauth_params';
                }, 2000);
            }
        } else {
            console.error('No OAuth response data found in URL fragment');
            setTimeout(() => {
                window.location.href = '/login?error=no_response_data';
            }, 2000);
        }
    </script>
</body>
</html>
""";
    }
}