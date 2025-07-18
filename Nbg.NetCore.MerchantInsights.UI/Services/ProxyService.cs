using System.Text;

namespace Nbg.NetCore.MerchantInsights.UI.Services;

public class ProxyService : IProxyService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ProxyService> _logger;
    private readonly IConfiguration _configuration;

    public ProxyService(HttpClient httpClient, ILogger<ProxyService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;
        
        // Configure timeout
        var timeout = _configuration.GetValue<int>("ProxySettings:Timeout", 30);
        _httpClient.Timeout = TimeSpan.FromSeconds(timeout);
    }

    public async Task<HttpResponseMessage> ForwardRequestAsync(HttpContext context, string targetUrl)
    {
        var request = context.Request;
        
        _logger.LogDebug("Forwarding {Method} {Path} to {TargetUrl}", 
            request.Method, request.Path, targetUrl);

        // Create the forwarded request
        var requestMessage = new HttpRequestMessage
        {
            Method = new HttpMethod(request.Method),
            RequestUri = new Uri(targetUrl)
        };

        // Copy headers (excluding some that shouldn't be forwarded)
        foreach (var header in request.Headers)
        {
            if (!ShouldSkipHeader(header.Key))
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        // Copy content for POST/PUT requests
        if (request.ContentLength > 0 && 
            (request.Method == "POST" || request.Method == "PUT" || request.Method == "PATCH"))
        {
            var content = new StreamContent(request.Body);
            
            // Copy content headers
            foreach (var header in request.Headers)
            {
                if (IsContentHeader(header.Key))
                {
                    content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }
            
            requestMessage.Content = content;
        }

        try
        {
            var response = await _httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead);
            
            _logger.LogDebug("Received response {StatusCode} from {TargetUrl}", 
                response.StatusCode, targetUrl);
                
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error forwarding request to {TargetUrl}", targetUrl);
            throw;
        }
    }

    private static bool ShouldSkipHeader(string headerName)
    {
        var headersToSkip = new[]
        {
            "host", "connection", "transfer-encoding", "upgrade", "proxy-connection",
            "content-length", "content-type", "content-encoding"
        };
        
        return headersToSkip.Contains(headerName.ToLowerInvariant());
    }

    private static bool IsContentHeader(string headerName)
    {
        var contentHeaders = new[]
        {
            "content-type", "content-length", "content-encoding", "content-language",
            "content-location", "content-range", "content-md5", "expires", "last-modified"
        };
        
        return contentHeaders.Contains(headerName.ToLowerInvariant());
    }
}