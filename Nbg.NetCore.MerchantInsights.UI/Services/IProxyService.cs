namespace Nbg.NetCore.MerchantInsights.UI.Services;

public interface IProxyService
{
    Task<HttpResponseMessage> ForwardRequestAsync(HttpContext context, string targetUrl);
}