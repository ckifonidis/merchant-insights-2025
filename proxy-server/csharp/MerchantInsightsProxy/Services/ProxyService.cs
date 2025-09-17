using Microsoft.Extensions.Options;
using MerchantInsightsProxy.Configuration;
using System.Text;

namespace MerchantInsightsProxy.Services;

public class ProxyService
{
    private readonly HttpClient _httpClient;
    private readonly ProxyConfiguration _proxyConfig;
    private readonly ILogger<ProxyService> _logger;
    
    public ProxyService(HttpClient httpClient, IOptions<ProxyConfiguration> proxyConfig, ILogger<ProxyService> logger)
    {
        _httpClient = httpClient;
        _proxyConfig = proxyConfig.Value;
        _logger = logger;
        
        // Configure HttpClient
        _httpClient.Timeout = TimeSpan.FromMinutes(2); // 2 minute timeout like Node.js version
    }
    
    public async Task<HttpResponseMessage> ProxyRequest(HttpRequest request, string? authToken = null)
    {
        var requestId = request.HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        
        try
        {
            // Build target URL
            var targetPath = request.Path.ToString();
            if (targetPath.StartsWith("/api/"))
            {
                targetPath = targetPath[4..]; // Remove /api prefix
            }
            
            var targetUrl = $"{_proxyConfig.BackendApiUrl.TrimEnd('/')}{targetPath}{request.QueryString}";
            
            _logger.LogInformation("[{RequestId}] Proxying {Method} {Path} to {TargetUrl}",
                requestId, request.Method, request.Path, targetUrl);

            // Log incoming request headers
            _logger.LogInformation("[{RequestId}] === INCOMING REQUEST HEADERS ===", requestId);
            foreach (var header in request.Headers)
            {
                var headerValue = string.Join(", ", header.Value);
                _logger.LogInformation("[{RequestId}] {HeaderName}: {HeaderValue}", requestId, header.Key, headerValue);
            }

            // Create the proxy request
            var proxyRequest = new HttpRequestMessage(new HttpMethod(request.Method), targetUrl);

            // Copy headers (excluding some host-specific headers)
            foreach (var header in request.Headers)
            {
                if (ShouldCopyHeader(header.Key))
                {
                    proxyRequest.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }

            // Add Authorization header if we have a token
            if (!string.IsNullOrEmpty(authToken))
            {
                proxyRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authToken);
                _logger.LogInformation("[{RequestId}] Added Authorization header: Bearer {TokenPrefix}...", requestId, authToken[..Math.Min(10, authToken.Length)]);
            }
            else
            {
                _logger.LogWarning("[{RequestId}] No auth token available for request", requestId);
            }

            // Log outgoing request headers
            _logger.LogInformation("[{RequestId}] === OUTGOING REQUEST HEADERS ===", requestId);
            foreach (var header in proxyRequest.Headers)
            {
                var headerValue = string.Join(", ", header.Value);
                _logger.LogInformation("[{RequestId}] {HeaderName}: {HeaderValue}", requestId, header.Key, headerValue);
            }
            
            // Copy request body for POST/PUT/PATCH requests
            if (request.ContentLength > 0 &&
                (request.Method == "POST" || request.Method == "PUT" || request.Method == "PATCH"))
            {
                var bodyContent = new byte[request.ContentLength.Value];
                await request.Body.ReadExactlyAsync(bodyContent, 0, (int)request.ContentLength.Value);
                proxyRequest.Content = new ByteArrayContent(bodyContent);

                // Log request body content
                _logger.LogInformation("[{RequestId}] === REQUEST BODY ===", requestId);
                _logger.LogInformation("[{RequestId}] Content-Type: {ContentType}", requestId, request.ContentType ?? "not specified");
                _logger.LogInformation("[{RequestId}] Content-Length: {ContentLength}", requestId, request.ContentLength);

                // Log body content as string (for JSON/text content)
                if (!string.IsNullOrEmpty(request.ContentType) &&
                    (request.ContentType.Contains("application/json") ||
                     request.ContentType.Contains("text/") ||
                     request.ContentType.Contains("application/x-www-form-urlencoded")))
                {
                    var bodyText = Encoding.UTF8.GetString(bodyContent);
                    _logger.LogInformation("[{RequestId}] Body content: {BodyContent}", requestId, bodyText);
                }
                else
                {
                    _logger.LogInformation("[{RequestId}] Body content: [Binary data - {Size} bytes]", requestId, bodyContent.Length);
                }

                if (!string.IsNullOrEmpty(request.ContentType))
                {
                    proxyRequest.Content.Headers.ContentType =
                        System.Net.Http.Headers.MediaTypeHeaderValue.Parse(request.ContentType);
                }
            }
            else
            {
                _logger.LogInformation("[{RequestId}] No request body content", requestId);
            }
            
            // Send the request
            var response = await _httpClient.SendAsync(proxyRequest);
            
            _logger.LogInformation("[{RequestId}] Backend responded with {StatusCode}", 
                requestId, (int)response.StatusCode);
            
            return response;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "[{RequestId}] HTTP request failed: {Message}", requestId, ex.Message);
            throw;
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogError(ex, "[{RequestId}] Request timeout", requestId);
            throw new TimeoutException("Backend request timed out", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Proxy request failed: {Message}", requestId, ex.Message);
            throw;
        }
    }
    
    private static bool ShouldCopyHeader(string headerName)
    {
        // Headers we should not copy to the backend request
        var excludedHeaders = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Host",
            "Connection",
            "Transfer-Encoding",
            "Content-Length", // Will be set automatically
            "Authorization", // We handle this separately
            "Cookie", // Don't forward cookies to backend
            "X-Request-ID" // We might want to generate our own
        };
        
        return !excludedHeaders.Contains(headerName);
    }
}