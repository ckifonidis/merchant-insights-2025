namespace MerchantInsightsProxy.Configuration;

public class OAuthConfiguration
{
    public bool Enabled { get; set; } = true;
    public string AuthorityUrl { get; set; } = "https://my.nbg.gr/identity";
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = "https://localhost:5443/signin-nbg/";
    public string Scope { get; set; } = "promotion-engine-api-v1 openid";
    
    // Computed URLs
    public string AuthUrl => $"{AuthorityUrl.TrimEnd('/')}/connect/authorize";
    public string TokenUrl => $"{AuthorityUrl.TrimEnd('/')}/connect/token";
    public string UserInfoUrl => $"{AuthorityUrl.TrimEnd('/')}/connect/userinfo";
}