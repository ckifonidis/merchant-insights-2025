using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MerchantInsightsProxy.Configuration;
using MerchantInsightsProxy.Services;
using MerchantInsightsProxy.Middleware;

namespace MerchantInsightsProxy.Controllers;

[ApiController]
[Route("api")]
public class ApiController : ControllerBase
{
    private readonly ProxyService _proxyService;
    private readonly OAuthConfiguration _oauthConfig;
    private readonly ILogger<ApiController> _logger;
    
    public ApiController(
        ProxyService proxyService,
        IOptions<OAuthConfiguration> oauthConfig,
        ILogger<ApiController> logger)
    {
        _proxyService = proxyService;
        _oauthConfig = oauthConfig.Value;
        _logger = logger;
    }
    
    [HttpGet("{**path}")]
    [HttpPost("{**path}")]
    [HttpPut("{**path}")]
    [HttpDelete("{**path}")]
    [HttpPatch("{**path}")]
    [HttpOptions("{**path}")]
    public async Task<IActionResult> ProxyRequest(string path)
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        
        // Require authentication for API requests
        if (!AuthenticationMiddleware.RequireAuthentication(HttpContext, _oauthConfig))
        {
            return Unauthorized();
        }
        
        try
        {
            // Get auth token from context
            var authToken = HttpContext.Items["AuthToken"] as string;
            
            // Proxy the request
            var response = await _proxyService.ProxyRequest(Request, authToken);
            
            // Copy response headers (excluding some that should not be copied)
            foreach (var header in response.Headers)
            {
                if (ShouldCopyResponseHeader(header.Key))
                {
                    Response.Headers.TryAdd(header.Key, header.Value.ToArray());
                }
            }
            
            // Copy content headers
            if (response.Content?.Headers != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    if (ShouldCopyResponseHeader(header.Key))
                    {
                        Response.Headers.TryAdd(header.Key, header.Value.ToArray());
                    }
                }
            }
            
            // Set status code
            Response.StatusCode = (int)response.StatusCode;
            
            // Copy response body
            if (response.Content != null)
            {
                var content = await response.Content.ReadAsByteArrayAsync();
                return new FileContentResult(content, response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream");
            }
            
            return StatusCode((int)response.StatusCode);
        }
        catch (UnauthorizedAccessException)
        {
            _logger.LogWarning("[{RequestId}] Unauthorized access attempt to API path: {Path}", requestId, path);
            return Unauthorized(new { error = "Unauthorized", message = "Authentication required", redirect = "/login" });
        }
        catch (TimeoutException ex)
        {
            _logger.LogError(ex, "[{RequestId}] Request timeout for API path: {Path}", requestId, path);
            return StatusCode(504, new { error = "Gateway Timeout", message = "Backend request timed out" });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "[{RequestId}] HTTP request failed for API path: {Path}", requestId, path);
            return StatusCode(502, new { error = "Bad Gateway", message = "Backend service unavailable" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Proxy request failed for API path: {Path}", requestId, path);
            return StatusCode(500, new { error = "Internal Server Error", message = "Proxy request failed" });
        }
    }
    
    private static bool ShouldCopyResponseHeader(string headerName)
    {
        // Headers we should not copy from the backend response
        var excludedHeaders = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Transfer-Encoding",
            "Connection",
            "Server",
            "Date", // Let ASP.NET Core set this
            "Content-Length" // Will be set automatically
        };
        
        return !excludedHeaders.Contains(headerName);
    }
}