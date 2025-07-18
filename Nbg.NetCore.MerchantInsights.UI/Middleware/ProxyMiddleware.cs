using Nbg.NetCore.MerchantInsights.UI.Services;

namespace Nbg.NetCore.MerchantInsights.UI.Middleware;

public class ProxyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ProxyMiddleware> _logger;
    private readonly IConfiguration _configuration;

    public ProxyMiddleware(RequestDelegate next, ILogger<ProxyMiddleware> logger, IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context, IProxyService proxyService)
    {
        var request = context.Request;
        
        // Check if this is an API request
        if (!request.Path.StartsWithSegments("/api"))
        {
            await _next(context);
            return;
        }

        // Forward full path including /api prefix to target server
        var targetPath = request.Path.Value!; // Keep full path including "/api"
        var queryString = request.QueryString.HasValue ? request.QueryString.Value : string.Empty;
        var mockServerUrl = _configuration.GetValue<string>("ProxySettings:MockServerUrl", "http://localhost:3001");
        var targetUrl = $"{mockServerUrl}{targetPath}{queryString}";

        _logger.LogInformation("Proxying {Method} {OriginalPath} -> {TargetUrl}", 
            request.Method, request.Path, targetUrl);

        try
        {
            // Forward the request
            var response = await proxyService.ForwardRequestAsync(context, targetUrl);
            
            // Copy response status
            context.Response.StatusCode = (int)response.StatusCode;
            
            // Copy response headers
            foreach (var header in response.Headers)
            {
                context.Response.Headers.TryAdd(header.Key, header.Value.ToArray());
            }
            
            // Copy content headers
            if (response.Content.Headers != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    context.Response.Headers.TryAdd(header.Key, header.Value.ToArray());
                }
            }
            
            // Copy response content
            if (response.Content != null)
            {
                await response.Content.CopyToAsync(context.Response.Body);
            }
            
            _logger.LogDebug("Successfully proxied request with status {StatusCode}", response.StatusCode);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to proxy request to mock server");
            context.Response.StatusCode = 502; // Bad Gateway
            await context.Response.WriteAsync("Failed to connect to backend service");
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogError(ex, "Request to mock server timed out");
            context.Response.StatusCode = 504; // Gateway Timeout
            await context.Response.WriteAsync("Backend service timeout");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while proxying request");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsync("Internal server error");
        }
    }
}