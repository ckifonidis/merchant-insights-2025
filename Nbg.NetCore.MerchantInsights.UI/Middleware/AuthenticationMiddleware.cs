namespace Nbg.NetCore.MerchantInsights.UI.Middleware;

public class AuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuthenticationMiddleware> _logger;
    private readonly IConfiguration _configuration;

    public AuthenticationMiddleware(RequestDelegate next, ILogger<AuthenticationMiddleware> logger, IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check if authentication is enabled
        var authEnabled = _configuration.GetValue<bool>("Authentication:Enabled", false);
        
        if (!authEnabled)
        {
            _logger.LogDebug("Authentication is disabled, skipping authentication check");
            await _next(context);
            return;
        }

        // Skip authentication for static files and health checks
        if (ShouldSkipAuthentication(context.Request.Path))
        {
            await _next(context);
            return;
        }

        _logger.LogDebug("Authentication is enabled but not yet implemented");
        
        // TODO: Implement authentication logic here
        // For now, just continue to next middleware
        // In the future, this will:
        // 1. Check for JWT token in Authorization header
        // 2. Validate token
        // 3. Set user context
        // 4. Return 401 Unauthorized if authentication fails
        
        await _next(context);
    }

    private static bool ShouldSkipAuthentication(string path)
    {
        var pathsToSkip = new[]
        {
            "/health",
            "/favicon.ico",
            "/.well-known/",
            "/swagger",
            "/css/",
            "/js/",
            "/images/",
            "/fonts/"
        };

        return pathsToSkip.Any(skipPath => path.StartsWith(skipPath, StringComparison.OrdinalIgnoreCase));
    }
}